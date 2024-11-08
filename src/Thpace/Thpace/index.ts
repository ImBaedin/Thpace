import Delaunator from 'delaunator';

import ThpaceBase from 'Thpace/ThpaceBase';

import { getRGBA, getRandomNumber, objectDiff, gradient, round, parseColor } from 'utils';
import { Point, Settings } from 'interfaces';
import { defaultParticleSettings, defaultSettings } from 'defaultSettings';

/**
 * @description Use static method 'create' to create a thpace instance.
 * @example Thpace.create(canvas, settings});
 * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
 */
export default class Thpace extends ThpaceBase {
	ctx: CanvasRenderingContext2D;
	animating: boolean = false;
	// @ts-ignore
	pattern: CanvasPattern;

	points: Array<Point>;
	triangles: Array<Triangle>;
	particles: Array<Particle>;

	lastDraw: number;
	/**
	 * Create an instance of thpace on your page.
	 * @param canvas - The canvas to turn into a thpace instance.
	 * @param settings - Optional object with settings to control the thpace instance
	 */
	static create(canvas: HTMLCanvasElement, settings?: Settings) {
		if (!canvas) {
			console.warn('Need a valid canvas element!');
			return;
		}

		if (settings)
			settings.particleSettings = Object.assign(
				{},
				defaultParticleSettings,
				settings.particleSettings,
			);
		return new Thpace(canvas, Object.assign({}, defaultSettings, settings));
	}

	constructor(canvas: HTMLCanvasElement, settings: Settings) {
		super(canvas, settings);

		this.points = [];
		this.triangles = [];
		this.particles = [];

		this.lastDraw = 0;

		this.ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

		if (this.settings.image) {
			this.pattern = this.ctx.createPattern(this.settings.image, 'repeat')!;
		}

		this.init();
		this.animate();
	}

	/**
	 * @description Internal function that plots the points on the graph,
	 * creates the triangles, and begins the animation.
	 */
	init() {
		this.stop();
		this.setupPoints();
		this.delaunate();
		this.particulate();
		this.resume();
	}

	private particulate() {
		this.particles = [];
		let count = this.settings.particleSettings!.count!;

		let screenSpace = (this.dim.height * this.dim.width) / (100 * 100);

		for (let i = 0; i < screenSpace; i++) {
			let toJ = Array.isArray(count) ? getRandomNumber(count[0], count[1], true) : count;
			for (let j = 0; j < toJ; j++) {
				this.particles.push(new Particle(this));
			}
		}
	}

	private setupPoints() {
		this.points = [];
		const triangleSize = this.settings.triangleSize!;
		const bleed = this.settings.bleed!;

		for (let x = -bleed; x < this.dim.width + bleed * 2; x += triangleSize) {
			for (let y = -bleed; y < this.dim.height + bleed * 2; y += triangleSize) {
				this.points.push({
					initX: x,
					initY: y,
					x,
					y,
					xNoise: getRandomNumber(-0.5, 0.5),
					yNoise: getRandomNumber(-0.5, 0.5),
				});
			}
		}
	}

	private delaunate() {
		// Responsible for populating 'triangles'
		const noise = this.settings.noise!;
		this.triangles = [];

		const pointsWithNoise = this.points.map((p) => {
			return [round(p.x + p.xNoise * noise, 14), round(p.y + p.yNoise * noise, 14)];
		});

		let triangles = Delaunator.from(pointsWithNoise).triangles;
		for (let i = 0; i < triangles.length; i += 3) {
			this.triangles.push(
				new Triangle(this, <Array<number>>(<unknown>triangles.slice(i, i + 3))),
			);
		}
	}

	/**
	 * @description A function to update the Thpace settings. Will avoid re-defining the triangles if possible.
	 * @param newSettings
	 */
	updateSettings(newSettings: Settings | object) {
		// Get difference between current settings and new settings
		let diff: { [key: string]: any } = objectDiff(this.settings, newSettings);
		// @ts-ignore
		if (newSettings.force) {
			diff = newSettings;
		}

		// Case: triangleSize - No way to avoid re-delaunating
		if (diff.triangleSize) {
			this.settings.triangleSize = diff.triangleSize;
			this.setupPoints();
			this.delaunate();
		}

		// Case: bleed - More points need to be generated, so re-delaunate
		if (diff.bleed) {
			this.settings.bleed = diff.bleed;
			this.setupPoints();
			this.delaunate();
		}

		// Case: noise - Noise generated can be stored as matrix. When noise is changed, go to all values and remap them on the new scale
		if (diff.noise) {
			const noise = diff.noise;
			this.settings.noise = noise;
			if (noise > this.settings.triangleSize!) {
				this.delaunate();
			}
		}

		// Case: colors - Smoothly interpolate between colors. Not sure how to do this if there is a different amount of colors
		if (diff.colors) {
			if (Array.isArray(diff.colors)) {
				this.settings.colors = diff.colors.map((c) => getRGBA(c));
			}

			this.triangles.forEach((t) => {
				t.updateColor();
			});
		}

		// Case: pointVariationX/Y - Seems trivial, however if we want it to be a smooth transition that's different
		if (diff.pointVariationX) this.settings.pointVariationX = diff.pointVariationX;
		if (diff.pointVariationY) this.settings.pointVariationY = diff.pointVariationY;

		// Case: pointAnimationSpeed - Also trivial
		if (diff.pointAnimationSpeed) this.settings.pointAnimationSpeed = diff.pointAnimationSpeed;

		// Case: maxFps - Yeah doesn't really matter, no case
		if (diff.maxFps) this.settings.maxFps = diff.maxFps;

		// Case: animationOffset - Trivial
		if (diff.animationOffset) this.settings.animationOffset = diff.animationOffset;

		// Case: image - Trivial, can't be smooth
		if (diff.image) {
			this.settings.image = diff.image;
			this.pattern = this.ctx.createPattern(this.settings.image!, 'repeat')!;
		}

		// Case: imageOpacity - trivial
		if (diff.imageOpacity) this.settings.imageOpacity = diff.imageOpacity;

		// Case: automaticResize - trivial
		if (diff.automaticResize !== undefined) {
			this.settings.automaticResize = diff.automaticResize;
			if (diff.automaticResize) {
				window.addEventListener('resize', this.resize);
			} else {
				window.removeEventListener('resize', this.resize);
			}
		}

		// Now for the particles
		// Case: particleSettings
		if (diff.particleSettings) {
			diff = diff.particleSettings;
			this.settings.particleSettings = Object.assign(
				{},
				this.settings.particleSettings!,
				diff,
			);
			this.particles.forEach((p) => {
				p.updateSettings(diff);
			});

			if (diff.count) {
				this.particulate();
			}
		}
	}

	updatePoints() {
		const animationOffset = this.settings.animationOffset!;
		const pointVariationX = this.settings.pointVariationX!;
		const pointVariationY = this.settings.pointVariationY!;
		const pointAnimationSpeed = this.settings.pointAnimationSpeed!;

		const time = (Math.PI * 2 * performance.now()) / pointAnimationSpeed;

		this.points = this.points.map((p) => {
			let per = p.initX / animationOffset;
			p.x = p.initX + Math.sin(per + time) * pointVariationX!;
			p.y = p.initY + Math.cos(per + time) * pointVariationY!;
			return p;
		});
	}

	stop() {
		if (this.animating) this.animating = false;
	}

	resume() {
		if (!this.animating) this.animating = true;
	}

	animate() {
		const now = performance.now();
		requestAnimationFrame(this.animate.bind(this));
		if (!this.animating) return;

		const elapsed = now - this.lastDraw;
		const fpsInterval = 1000 / this.settings.maxFps!;

		if (elapsed < fpsInterval) return;
		this.lastDraw = now - (elapsed % fpsInterval);

		this.stats.begin();

		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.dim.width, this.dim.height);

		this.timings.triangles.start();
		this.triangles.forEach((t) => {
			t.draw();
		});
		this.timings.triangles.end();

		this.timings.particles.start();
		this.particles.forEach((p) => {
			p.draw();
		});
		this.timings.particles.end();

		if (this.pattern) {
			ctx.globalAlpha = this.settings.imageOpacity!;
			ctx.fillStyle = this.pattern;
			ctx.fillRect(0, 0, this.dim.width, this.dim.height);
			ctx.globalAlpha = 1;
		}

		this.updatePoints();
		this.stats.end();
	}
}

class Triangle {
	parent: Thpace;
	points: Array<number>;
	color: string = '';

	constructor(parent: Thpace, points: Array<number>) {
		this.parent = parent;
		this.points = points;

		this.updateColor();
	}

	updateColor() {
		const noise = this.parent.settings.noise!;
		let pointList = this.getPoints();
		let center = { x: 0, y: 0 };
		for (let i = 0; i < pointList.length; i++) {
			let p = pointList[i];
			center.x += p.x + p.xNoise * noise;
			center.y += p.y + p.yNoise * noise;
		}
		center.x = center.x / 3;
		center.y = center.y / 3;

		//@ts-ignore
		this.color = gradient(
			center.x,
			center.y,
			this.parent.dim.width,
			this.parent.dim.height,
			this.parent.settings.colors!,
		);
	}

	getPoints() {
		let points: Array<Point> = [];
		for (let i = 0; i < this.points.length; i++) {
			points.push(this.parent.points[this.points[i]]);
		}
		return points;
	}

	lines() {
		const ctx = this.parent.ctx;
		const noise = this.parent.settings.noise!;
		let points: Array<Point> = this.getPoints();

		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 1;
		ctx.beginPath();
		points.forEach((p, ind) => {
			let x = p.x + p.xNoise * noise;
			let y = p.y + p.yNoise * noise;
			if (ind === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.closePath();
	}

	stroke() {
		this.lines();
		this.parent.ctx.stroke();
	}

	fill() {
		this.lines();
		this.parent.ctx.fill();
	}

	draw() {
		this.lines();
		this.parent.ctx.fill();
		this.parent.ctx.stroke();
	}
}

class Particle {
	parent: Thpace;
	color!: string;
	x: number;
	y: number;
	opacity: number = 0;

	radius: any;
	interval: any;
	variationX: any;
	variationY: any;

	constructor(parent: Thpace) {
		this.parent = parent;

		const dim = this.parent.dim;

		this.x = getRandomNumber(0, dim.width);
		this.y = getRandomNumber(0, dim.height);

		this.updateSettings(this.parent.settings.particleSettings!);
	}

	updateSettings(newSettings: any) {
		if (newSettings.color || newSettings.opacity) {
			const color = parseColor(this.parent.settings.particleSettings!.color!);
			let opacity: any = newSettings.opacity
				? this.parent.settings.particleSettings!.opacity!
				: this.opacity;
			if (Array.isArray(opacity)) opacity = getRandomNumber(opacity[0], opacity[1]);
			this.opacity = opacity;

			this.color = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
		}

		if (newSettings.radius) {
			const radius = newSettings.radius;
			this.radius = radius;
			if (Array.isArray(radius)) this.radius = getRandomNumber(radius[0], radius[1]);
		}

		if (newSettings.interval) {
			const interval = newSettings.interval;
			this.interval = interval;
			if (Array.isArray(interval)) this.interval = getRandomNumber(interval[0], interval[1]);
		}

		if (newSettings.variationX) {
			const variationX = newSettings.variationX;
			this.variationX = variationX;
			if (Array.isArray(variationX))
				this.variationX = getRandomNumber(variationX[0], variationX[1]);
		}

		if (newSettings.variationY) {
			const variationY = newSettings.variationY;
			this.variationY = variationY;
			if (Array.isArray(variationY))
				this.variationY = getRandomNumber(variationY[0], variationY[1]);
		}
	}

	shape() {
		const ctx = this.parent.ctx;

		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;

		const x =
			this.x + Math.sin((Math.PI * 2 * performance.now()) / this.interval) * this.variationX!;
		const y =
			this.y + Math.cos((Math.PI * 2 * performance.now()) / this.interval) * this.variationY!;

		ctx.arc(x, y, this.radius, 0, Math.PI * 2);
	}

	stroke() {
		this.shape();
		this.parent.ctx.stroke();
	}

	fill() {
		this.shape();
		this.parent.ctx.fill();
	}

	draw() {
		this.shape();
		this.parent.ctx.fill();
	}
}
