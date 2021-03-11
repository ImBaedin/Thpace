import Delaunator from "delaunator";

// @ts-ignore
import triangleShader from './shaders/triangle.glsl';
import { initShaderProgram, parseShader, draw } from "./WebGL";

import ThpaceBase from "../ThpaceBase";
import { objectDiff, getRandomNumber, gradient } from '../../utils';
import { Settings } from '../../interfaces';
import { defaultParticleSettings, defaultSettings } from '../../defaultSettings';

export default class ThpaceGL extends ThpaceBase{

	gl: WebGLRenderingContext;
	triangleShaderProgram: WebGLProgram;

	verticeCount: number;

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

		// Get the webgl context for the canvas
		this.gl = <WebGLRenderingContext>canvas.getContext("webgl");

		// Parse and compile our triangle shader code
		let [vsSource, fsSource] = parseShader(triangleShader);
		this.triangleShaderProgram = initShaderProgram(this.gl, vsSource, fsSource);


		this.init();
		this.animate();
	}

	generateVertices(){
		const points = [];
		const noise = [];
		const colors = [];
		const vertices = [];

		const triangleSize = this.settings.triangleSize!;
		const bleed = this.settings.bleed!;

		for(let x = -bleed; x < this.dim.width + bleed; x+= triangleSize){
			for(let y = -bleed; y < this.dim.height + bleed; y += triangleSize){
				points.push([x,y]);
				noise.push([getRandomNumber(0,1), getRandomNumber(0,1)]);
			}
		}

		const indices = Delaunator.from(points).triangles;

		for(let i = 0; i < indices.length; i+=3){
			let p1 = points[indices[i]];
			let p2 = points[indices[i+1]];
			let p3 = points[indices[i+2]];

			let center = {
				x: (p1[0] + p2[0] + p3[0])/3,
				y: (p1[1] + p2[1] + p3[1])/3,
			};

			//@ts-ignore
			const color = gradient(center.x, center.y, this.dim.width, this.dim.height, this.settings.colors!, false).map(v=>{
				if(v>1) return v/255;
				return v;
			});
			
			colors.push(color);
			colors.push(color);
			colors.push(color);
		}
		
		for(let i = 0; i < indices.length; i++){
			vertices.push(points[indices[i]]);
		}

		//@ts-ignore
		this.setColorBuffer(colors);
		//@ts-ignore
		this.setVertexBuffer(vertices);

		this.verticeCount = vertices.length;
	}

	private setColorBuffer(data: [number, number, number, number][]){
		const gl = this.gl;

		const aColor = gl.getAttribLocation(this.triangleShaderProgram, "aColor");

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		//@ts-ignore
		const colors = new Float32Array(data.reduce((acc, val) => acc.concat(val), []));
		gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
		gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(aColor);
	}

	private setVertexBuffer(data: [number, number][]){
		const gl = this.gl;

		const aVertexPosition = gl.getAttribLocation(this.triangleShaderProgram, "aVertexPosition");

		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(aVertexPosition);
		//@ts-ignore
		const vertices = new Float32Array(data.reduce((acc, val) => acc.concat(val), []));
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
	}

	init(){
		this.stop();
		const gl = this.gl;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.useProgram(this.triangleShaderProgram);

		this.generateVertices();

		// We need to create and set some buffers and variables for the gpu to read from:

		// vertex buffer / color buffer
		this.generateVertices();

		// noiseBuffer

		// pointVariationX/Y buffer
		
		// animation offset
		const uAnimationOffset = gl.getUniformLocation(this.triangleShaderProgram, "uAnimationOffset");
		gl.uniform1f(uAnimationOffset, this.settings.animationOffset!);

		// resolution uniform
		const uResolution = gl.getUniformLocation(this.triangleShaderProgram, "uResolution");
		gl.uniform2f(uResolution, gl.canvas.width, gl.canvas.height);

		this.resume();
	}
	animate(){
		requestAnimationFrame(this.animate.bind(this));
		if(!this.animating) return;

		this.stats.begin();
		draw(this.gl, this.triangleShaderProgram, this.verticeCount);
		this.stats.end();
	}

	/**
	 * @description A function to update the Thpace settings. Will avoid re-defining the triangles if possible.
	 * @param newSettings 
	 */
	updateSettings(newSettings: Settings | object){
		// Get difference between current settings and new settings
		let diff: {[key: string]: any} = objectDiff(this.settings, newSettings);
		// @ts-ignore
		if(newSettings.force){
			diff = newSettings;
		}

		// Case: triangleSize - No way to avoid re-delaunating
		if(diff.triangleSize){
			this.settings.triangleSize = diff.triangleSize;
			this.setupPoints();
			this.delaunate();
		}
		
		// Case: bleed - More points need to be generated, so re-delaunate
		if(diff.bleed){
			this.settings.bleed = diff.bleed;
			this.setupPoints();
			this.delaunate();
		}

		// Case: noise - Noise generated can be stored as matrix. When noise is changed, go to all values and remap them on the new scale
		if(diff.noise){
			const noise = diff.noise;
			this.settings.noise = noise;
			if(noise > this.settings.triangleSize!){
				this.delaunate();
			}
		}

		// Case: colors - Smoothly interpolate between colors. Not sure how to do this if there is a different amount of colors
		if(diff.colors){
			if(Array.isArray(diff.colors)){
				this.settings.colors = diff.colors.map(c=> getRGBA(c));
			}

			this.triangles.forEach(t=>{
				t.updateColor();
			});
		}

		// Case: pointVariationX/Y - Seems trivial, however if we want it to be a smooth transition that's different
		if(diff.pointVariationX) this.settings.pointVariationX = diff.pointVariationX;
		if(diff.pointVariationY) this.settings.pointVariationY = diff.pointVariationY;

		// Case: pointAnimationSpeed - Also trivial
		if(diff.pointAnimationSpeed) this.settings.pointAnimationSpeed = diff.pointAnimationSpeed;

		// Case: maxFps - Yeah doesn't really matter, no case
		if(diff.maxFps) this.settings.maxFps = diff.maxFps;

		// Case: animationOffset - Trivial
		if(diff.animationOffset){
			this.settings.animationOffset = diff.animationOffset;

			const uAnimationOffset = this.gl.getUniformLocation(this.triangleShaderProgram, "uAnimationOffset");
			this.gl.uniform1f(uAnimationOffset, this.settings.animationOffset!);
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
			
		}
	}
}