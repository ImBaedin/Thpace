import Delaunator from "delaunator";

// @ts-ignore
import triangleShader from './shaders/triangle.glsl';
import particleShader from './shaders/particle.glsl';
import { initShaderProgram, parseShader, drawTriangles, drawParticles } from "./WebGL";

import ThpaceBase from "../ThpaceBase";
import { objectDiff, getRandomNumber, gradient, getRGBA, flattenArray, parseColor } from '../../utils';
import { particlePointData, Settings, triangleVerticeData } from '../../interfaces';
import { defaultParticleSettings, defaultSettings } from '../../defaultSettings';

export default class ThpaceGL extends ThpaceBase{

	gl: WebGLRenderingContext;
	triangleShaderProgram: WebGLProgram;
	particleShaderProgram: WebGLProgram;

	verticeCount: number;
	particleCount: number;

	triangleVerticeData: triangleVerticeData;
	particlePointData: particlePointData;

	lastDraw: number;

	/**
	 * @description Check if the browser has support for webgl
	 * @returns boolean
	 */
	static webglSupport() {
		try {
			const testCanvas = document.createElement("canvas");

			return (
				!!window.WebGLRenderingContext &&
				(testCanvas.getContext('webgl'))
			);
		} catch (e) {
			return false;
		}
	}

	/**
	 * @description Create an instance of thpace on your page.
	 * @param canvas - The canvas to turn into a thpace instance.
	 * @param settings - Optional object with settings to control the thpace instance
	 */
	 static create(canvas: HTMLCanvasElement, settings?: Settings) {
		if (!canvas) {
			console.warn("Need a valid canvas element!");
			return;
		}

		if(!this.webglSupport()){
			console.warn("Your browser does not support webgl :(");
			return;
		}

		if(settings) settings.particleSettings = Object.assign({}, defaultParticleSettings, settings.particleSettings);
		return new ThpaceGL(canvas, Object.assign({}, defaultSettings, settings));
	}

	constructor(canvas: HTMLCanvasElement, settings: Settings) {
		super(canvas, settings);

		this.verticeCount = 0;
		this.particleCount = 0;

		// Get the webgl context for the canvas
		this.gl = <WebGLRenderingContext>canvas.getContext("webgl");
		const gl = this.gl;
		gl.getExtension('GL_OES_standard_derivatives');
        gl.getExtension('OES_standard_derivatives');
    	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		
		// Parse and compile our triangle shader code
		let [vsSource, fsSource] = parseShader(triangleShader);
		this.triangleShaderProgram = initShaderProgram(this.gl, vsSource, fsSource);

		// Now the particle shader
		[vsSource, fsSource] = parseShader(particleShader);
		this.particleShaderProgram = initShaderProgram(this.gl, vsSource, fsSource);

		this.triangleVerticeData = {
			colors: [],
			noisedPoints: [],
			indices: new Uint32Array(),
			vertices: [],
			noise: [],
		};

		this.particlePointData = {
			points: [],
			interval: [],
			radius: [],
			opacity: [],
			variationX: [],
			variationY: [],
		};

		this.lastDraw = 0;

		this.init();
		this.animate();
	}

	generateVertices(){
		const noiseSetting = this.settings.noise!;

		const points = [];
		const noiseValues: number[] = [];
		const vertices = [];
		const noise = [];

		const triangleSize = this.settings.triangleSize!;
		const bleed = this.settings.bleed!;

		for(let x = -bleed; x < this.dim.width + (bleed*2); x+= triangleSize){
			for(let y = -bleed; y < this.dim.height + (bleed*2); y += triangleSize){
				points.push(x);
				points.push(y);
				noiseValues.push(getRandomNumber(-0.5,0.5));
				noiseValues.push(getRandomNumber(-0.5,0.5));
			}
		}

		const noisedPoints: [number, number][] = [];
		for(let i = 0; i < points.length; i+=2){
			noisedPoints.push([points[i] + (noiseValues[i] * noiseSetting), points[i+1] + (noiseValues[i+1] * noiseSetting)]);
		}
		this.triangleVerticeData.noisedPoints = noisedPoints;

		const indices = Delaunator.from(noisedPoints).triangles;
		this.triangleVerticeData.indices = indices;

		this.calculateColors();
		const colors = this.triangleVerticeData.colors;
		
		for(let i = 0; i < indices.length; i++){
			let xInd = indices[i]*2;
			let yInd = xInd+1;

			vertices.push(points[xInd]);
			vertices.push(points[yInd]);
			noise.push(noiseValues[xInd]);
			noise.push(noiseValues[yInd]);
		}

		this.triangleVerticeData.vertices = vertices;
		this.triangleVerticeData.noise = noise;

		this.verticeCount = vertices.length;
	}

	particulate(){
		const dim = this.dim;

		const settings = this.settings.particleSettings!;

		let newData: particlePointData = {
			points: [],
			interval: [],
			radius: [],
			variationX: [],
			variationY: [],
			opacity: []
		}

		let count = this.settings.particleSettings!.count!;

		let screenSpace = (this.dim.height * this.dim.width) / (100 * 100);

		for(let i = 0; i < screenSpace; i++){
			let toJ = count;
			if(Array.isArray(count)) toJ = getRandomNumber(count[0], count[1], true);
			for(let j = 0; j < toJ; j++){
				newData.points.push(getRandomNumber(0, dim.width), getRandomNumber(0, dim.height));

				let interval = settings.interval!;
				if(Array.isArray(interval)) interval = getRandomNumber(interval[0], interval[1]);
				newData.interval.push(interval);

				let radius = settings.radius!;
				if(Array.isArray(radius)) radius = getRandomNumber(radius[0], radius[1]);
				newData.radius.push(radius);

				let variationX = settings.variationX!;
				if(Array.isArray(variationX)) variationX = getRandomNumber(variationX[0], variationX[1]);
				newData.variationX.push(variationX);

				let variationY = settings.variationY!;
				if(Array.isArray(variationY)) variationY = getRandomNumber(variationY[0], variationY[1]);
				newData.variationY.push(variationY);

				let opacity = settings.opacity!;
				if(Array.isArray(opacity)) opacity = getRandomNumber(opacity[0], opacity[1]);
				newData.opacity.push(opacity);
			}
		}

		this.particlePointData = newData;
		this.particleCount = newData.points.length/2;
	}

	private calculateColors(){
		const {indices, noisedPoints} = this.triangleVerticeData;

		const colors: number[] = []; 
		for(let i = 0; i < indices.length; i+=3){
			let p1 = noisedPoints[indices[i]];
			let p2 = noisedPoints[indices[i+1]];
			let p3 = noisedPoints[indices[i+2]];

			let center = {
				x: (p1[0] + p2[0] + p3[0])/3,
				y: (p1[1] + p2[1] + p3[1])/3,
			};

			//@ts-ignore
			const color = gradient(center.x, center.y, this.dim.width, this.dim.height, this.settings.colors!, false).map((v, ind)=>{
				if((ind+1) % 4 !== 0) return v/255;
				return v;
			});

			for(let j = 0; j < 3; j++){
				color.forEach((c: number)=>{
					colors.push(c);
				});
			}
		}
		this.triangleVerticeData.colors = colors;
	}

	private setBuffer(program: WebGLProgram, attribName: string, data: number[], size: number){
		const gl = this.gl;

		const attrib = gl.getAttribLocation(program, attribName);
		if(attrib < 0){
			console.log(`Unable to find: ${attribName}`)
		}
		
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		
		const noise = new Float32Array(data);
		
		gl.bufferData(gl.ARRAY_BUFFER, noise, gl.STATIC_DRAW);
		gl.vertexAttribPointer(attrib, size, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(attrib);
	}

	init(){
		this.stop();
		const gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// We need to create and set some buffers and variables for the gpu to read from:

		// start with triangles
		gl.useProgram(this.triangleShaderProgram);

		// vertex buffer / color buffer / noiseBuffer
		this.generateVertices();

		// pointVariationX/Y uniform
		const uPointVariationX = gl.getUniformLocation(this.triangleShaderProgram, "uPointVariationX");
		gl.uniform1f(uPointVariationX, this.settings.pointVariationX!);
		const uPointVariationY = gl.getUniformLocation(this.triangleShaderProgram, "uPointVariationY");
		gl.uniform1f(uPointVariationY, this.settings.pointVariationY!);

		// pointAnimationSpeed uniform
		const uPointAnimationSpeed = gl.getUniformLocation(this.triangleShaderProgram, "uPointAnimationSpeed");
		gl.uniform1f(uPointAnimationSpeed, this.settings.pointAnimationSpeed!);

		// noise uniform
		const uNoise = gl.getUniformLocation(this.triangleShaderProgram, "uNoise");
		gl.uniform1f(uNoise, this.settings.noise!);
		
		// animation offset
		const uAnimationOffset = gl.getUniformLocation(this.triangleShaderProgram, "uAnimationOffset");
		gl.uniform1f(uAnimationOffset, this.settings.animationOffset!);


		// Now the particles:
		gl.useProgram(this.particleShaderProgram);

		// generate the particles
		this.particulate();

		// particle color:
		const uColor = gl.getUniformLocation(this.particleShaderProgram, "uColor");
		const c = parseColor(this.settings.particleSettings?.color!);
		gl.uniform3f(uColor, c[0], c[1], c[2]);


		this.resume();
	}

	bindTriangleBuffers(){
		this.setBuffer(this.triangleShaderProgram, 'aColor', this.triangleVerticeData.colors, 4);
		this.setBuffer(this.triangleShaderProgram, 'aVertexPosition', this.triangleVerticeData.vertices, 2);
		this.setBuffer(this.triangleShaderProgram, 'aNoise', this.triangleVerticeData.noise, 2);
	}

	bindParticleBuffers(){
		this.setBuffer(this.particleShaderProgram, 'aPoint', this.particlePointData.points, 2);
		this.setBuffer(this.particleShaderProgram, 'aInterval', this.particlePointData.interval, 1);
		this.setBuffer(this.particleShaderProgram, 'aRadius', this.particlePointData.radius, 1);
		this.setBuffer(this.particleShaderProgram, 'aVariationX', this.particlePointData.variationX, 1);
		this.setBuffer(this.particleShaderProgram, 'aVariationY', this.particlePointData.variationY, 1);
		this.setBuffer(this.particleShaderProgram, 'aOpacity', this.particlePointData.opacity, 1);
	}

	animate(){
		const gl = this.gl;
		const now = performance.now();
		requestAnimationFrame(this.animate.bind(this));
		if(!this.animating) return;

		const elapsed = now - this.lastDraw;
		const fpsInterval = 1000 / this.settings.maxFps!;

		if(elapsed < fpsInterval) return;
		this.lastDraw = now - (elapsed % fpsInterval);

		this.stats.begin();
		drawTriangles(this.gl, this.triangleShaderProgram, this.bindTriangleBuffers.bind(this), this.verticeCount);
		drawParticles(this.gl, this.particleShaderProgram, this.bindParticleBuffers.bind(this), this.particleCount);
		this.stats.end();
	}

	/**
	 * @description A function to update the Thpace settings. Will avoid re-defining the triangles if possible.
	 * @param newSettings 
	 */
	updateSettings(newSettings: Settings | object){
		const gl = this.gl;

		// Get difference between current settings and new settings
		let diff: {[key: string]: any} = objectDiff(this.settings, newSettings);
		// @ts-ignore
		if(newSettings.force){
			diff = newSettings;
		}

		// Case: triangleSize - No way to avoid re-delaunating
		if(diff.triangleSize){
			this.settings.triangleSize = diff.triangleSize;
			this.generateVertices();
		}
		
		// Case: bleed - More points need to be generated, so re-delaunate
		if(diff.bleed){
			this.settings.bleed = diff.bleed;
			this.generateVertices();
		}

		// Case: noise - Noise generated can be stored as matrix. When noise is changed, go to all values and remap them on the new scale
		if(diff.noise){
			const noise = diff.noise;
			this.settings.noise = noise;

			const uNoise = gl.getUniformLocation(this.triangleShaderProgram, "uNoise");
			gl.uniform1f(uNoise, this.settings.noise!);

			if(noise > this.settings.triangleSize!){
				this.generateVertices();
			}
		}

		// Case: colors - Smoothly interpolate between colors. Not sure how to do this if there is a different amount of colors
		if(diff.colors){
			if(Array.isArray(diff.colors)){
				this.settings.colors = diff.colors.map(c=> getRGBA(c));
			}
			
			this.calculateColors();
			this.setBuffer(this.triangleShaderProgram, 'aColor', this.triangleVerticeData.colors, 4);
		}

		// Case: pointVariationX/Y - Seems trivial, however if we want it to be a smooth transition that's different
		if(diff.pointVariationX){
			this.settings.pointVariationX = diff.pointVariationX;

			const uPointVariationX = gl.getUniformLocation(this.triangleShaderProgram, "uPointVariationX");
			gl.uniform1f(uPointVariationX, this.settings.pointVariationX!);
		}
		if(diff.pointVariationY){
			this.settings.pointVariationY = diff.pointVariationY;

			const uPointVariationY = gl.getUniformLocation(this.triangleShaderProgram, "uPointVariationY");
			gl.uniform1f(uPointVariationY, this.settings.pointVariationY!);
		}

		// Case: pointAnimationSpeed - Also trivial
		if(diff.pointAnimationSpeed){
			this.settings.pointAnimationSpeed = diff.pointAnimationSpeed;

			const uPointAnimationSpeed = gl.getUniformLocation(this.triangleShaderProgram, "uPointAnimationSpeed");
			gl.uniform1f(uPointAnimationSpeed, this.settings.pointAnimationSpeed!);
		}

		// Case: maxFps - Yeah doesn't really matter, no case
		if(diff.maxFps) this.settings.maxFps = diff.maxFps;

		// Case: animationOffset - Trivial
		if(diff.animationOffset){
			this.settings.animationOffset = diff.animationOffset;

			const uAnimationOffset = gl.getUniformLocation(this.triangleShaderProgram, "uAnimationOffset");
			gl.uniform1f(uAnimationOffset, this.settings.animationOffset!);
		}

		// Case: image - Trivial, can't be smooth
		if(diff.image){
			this.settings.image = diff.image;
		}
		
		// Case: imageOpacity - trivial
		if(diff.imageOpacity){
			this.settings.imageOpacity = diff.imageOpacity;
		}

		// Case: automaticResize - trivial
		if(diff.automaticResize !== undefined){
			this.settings.automaticResize = diff.automaticResize;
			if(diff.automaticResize){
				window.addEventListener("resize", this.resize);
			}
			else{
				window.removeEventListener("resize", this.resize);
			}
		}

		// Now for the particles
		// Case: particleSettings
		if(diff.particleSettings){
			diff = diff.particleSettings;
			this.settings.particleSettings = Object.assign({}, this.settings.particleSettings!, diff);
			this.particulate();
		}
	}
}