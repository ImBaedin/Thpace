import Delaunator from "delaunator";
import interpolate from "color-interpolate";

// I guess there is an issue with rollup and we need to specify the '.ts'
// @ts-ignore
import { Coords, parseColor } from "./utils.ts";

interface Settings {
	/**
	 * @default 130
	 * @description Triangle size (px).
	 * */
	triangleSize?: number;
	/**
	 * @default 120
	 * @description Bleed amount over canvas edges (px).
	 * */
	bleed?: number;
	/**
	 * @default 60
	 * @description Noise used when calculating points (px).
	 * */
	noise?: number;
	/**
	 * @deprecated Use 'colors' setting.
	 * @default undefined
	 * @description Color in top left of screen (Hex code).
	 * */
	color1?: string | Array<number>;
	/**
	 * @deprecated Use 'colors' setting
	 * @default undefined
	 * @description Color in bottom Right of screen (Hex code).
	 * */
	color2?: string | Array<number>;
	/**
	 * @default ['rgba(11,135,147,1)', 'rgba(54,0,51,1)']
	 * @description Array of colors to use for the gradient.
	 * */
	colors?: Array<string>;
	/**
	 * @default 20
	 * @description How much the points should shift on the x-axis (px).
	 * */
	pointVariationX?: number;
	/** @default 35
	 * @description How much the points should shift on the y-axis (px).
	 *  */
	pointVariationY?: number;
	/**
	 * @default 7500
	 * @description How fast the points should complete a loop (ms).
	 * */
	pointAnimationSpeed?: number;
	/**
	 * @default 144
	 * @description Defines a maximum draw interval. -1 is no limit
	 * */
	maxFps?: number;
	/**
	 * @default undefined
	 * @description Overlay image (adds a nice texture). */
	image?: HTMLImageElement | undefined;
	/**
	 * @default .4
	 * @description Overlay image opacity. */
	imageOpacity?: number;
}

const defaultSettings: Settings = {
	triangleSize: 130,
	bleed: 120,
	noise: 60,
	colors: ["rgba(11,135,147,1)", "rgba(54,0,51,1)"],
	pointVariationX: 20,
	pointVariationY: 35,
	pointAnimationSpeed: 7500,
	maxFps: 144,
	image: undefined,
	imageOpacity: 0.4
};

/**
 * @description Use static method 'create' to create a thpace instance.
 * @example Thpace.create(canvas, settings});
 * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
 */
export default class Thpace {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	settings: Settings;
	width: number;
	height: number;
	triangles: Array<Array<any>>;
	particles: Array<Particle>;
	coordinateTable: { [key: string]: any };
	baseCoordinateTable: { [key: string]: any };
	delta: number;
	lastUpdate: number;
	lastDraw: number;
	frameCount: number;
	fps: number;

	/**
	 * Create an instance of thpace on your page.
	 * @param canvas - The canvas to turn into a thpace instance.
	 * @param settings - Optional object with settings to control the thpace instance
	 */
	static create(canvas: HTMLCanvasElement, settings?: Settings) {
		if (!canvas) {
			console.warn("Need a valid canvas element!");
			return;
		}

		return new Thpace(canvas, Object.assign({}, defaultSettings, settings));
	}

	constructor(canvas: HTMLCanvasElement, settings: Settings) {
		this.canvas = canvas;
		this.settings = settings;

		if (
			settings.color1 &&
			settings.color2 &&
			typeof settings.color1 === "string" &&
			typeof settings.color2 === "string"
		) {
			this.settings.colors = [
				getRGBA(settings.color1),
				getRGBA(settings.color2)
			];
		} else if (this.settings.colors) {
			this.settings.colors = this.settings.colors.map(color =>
				getRGBA(color)
			);
		}

		this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
		this.width = 0;
		this.height = 0;
		this.delta = performance.now();
		this.lastUpdate = performance.now();
		this.lastDraw = performance.now();
		this.frameCount = 0;
		this.fps = 0;

		this.triangles = [];
		this.particles = [];
		this.coordinateTable = {};
		this.baseCoordinateTable = {};

		window.addEventListener("resize", this.resize.bind(this));
		this.resize();
		this.animate();
		
		setInterval(()=>{
			this.fps = this.frameCount;
			this.frameCount = 0;
		}, 1000);
	}

	resize() {
		let p = this.canvas.parentElement;
		if (p) {
			this.canvas.width = p.clientWidth;
			this.canvas.height = p.clientHeight;
		}
		if (
			this.width !== this.canvas.width ||
			this.height !== this.canvas.height
		) {
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.generateTriangles();
			this.generateParticles();
		}
	}

	remove() {
		window.removeEventListener("resize", this.resize.bind(this));
	}

	generateTriangles() {
		let points: Array<any> = [];
		let coordinateTable: { [key: string]: any } = {};
		points.push([0, 0]);
		points.push([0, this.height]);
		points.push([this.width, 0]);
		points.push([this.width, this.height]);

		const bleed: number = this.settings.bleed!;
		const size: number = this.settings.triangleSize!;
		const noise: number = this.settings.noise!;
		const colors: Array<string> = this.settings.colors!;

		for (let i = 0 - bleed; i < this.width + bleed; i += size) {
			for (let j = 0 - bleed; j < this.height + bleed; j += size) {
				let x = i + getRandomInt(0, noise);
				let y = j + getRandomInt(0, noise);
				points.push([x, y]);
			}
		}

		const delaunay = Delaunator.from(points);
		const triangleList = delaunay.triangles;

		var coordinates = [];

		for (let i = 0; i < triangleList.length; i += 3) {
			let t: Array<any> = [
				points[triangleList[i]],
				points[triangleList[i + 1]],
				points[triangleList[i + 2]]
			];

			let coords = [];
			coords.push({ x: t[0][0], y: t[0][1] });
			coords.push({ x: t[1][0], y: t[1][1] });
			coords.push({ x: t[2][0], y: t[2][1] });

			t.push(
				gradient(getCenter(coords), this.width, this.height, colors)
			);

			coordinates.push(t);
		}

		let baseCoordinateTable: { [key: string]: any } = {};
		coordinates.forEach(t => {
			t.forEach(p => {
				let x = p[0];
				let y = p[1];

				if (!coordinateTable[x]) {
					coordinateTable[x] = {};
				}

				let per = x / this.width;

				coordinateTable[x][y] = 0;

				if (!baseCoordinateTable[x]) {
					baseCoordinateTable[x] = {};
				}
				baseCoordinateTable[x][y] = per * 2 * Math.PI;
			});
		});

		this.triangles = coordinates;
		this.coordinateTable = coordinateTable;
		this.baseCoordinateTable = baseCoordinateTable;
	}

	generateParticles() {
		let particles = [];
		for (let i = 0; i < 250; i++) {
			const pSet = {
				ctx: this.ctx,
				width: this.width,
				height: this.height
			};
			particles.push(new Particle(pSet));
		}
		this.particles = particles;
	}

	animate() {
		const now = performance.now();
		requestAnimationFrame(this.animate.bind(this));
		this.delta = now - this.lastUpdate;
		this.lastUpdate = now;
		this.animateCoordinateTable();

		const elapsed = now - this.lastDraw;
		const fpsInterval = 1000/this.settings.maxFps!;
	
		if (elapsed > fpsInterval) {
			this.lastDraw = now - (elapsed % fpsInterval);
			this.frameCount++;
			this.draw();
		}
	}
	
	draw(){
		const ctx = this.ctx;

		ctx.clearRect(0, 0, this.width, this.height);

		this.triangles.forEach(t => {
			ctx.beginPath();

			let coords: Array<Coords> = [];
			coords.push({ x: t[0][0], y: t[0][1] });
			coords.push({ x: t[1][0], y: t[1][1] });
			coords.push({ x: t[2][0], y: t[2][1] });

			const color = t[3];
			const style = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

			ctx.fillStyle = style;
			ctx.strokeStyle = style;

			ctx.globalAlpha = color[3];

			let dp = [0, 1, 2, 0];
			dp.forEach((el, ind) => {
				if (
					this.coordinateTable[coords[el].x] &&
					this.coordinateTable[coords[el].x][coords[el].y] !=
						undefined
				) {
					let c = { x: coords[el].x, y: coords[el].y };
					let change = this.coordinateTable[coords[el].x][
						coords[el].y
					];

					if (ind == 0) {
						ctx.moveTo(c.x + change.x, c.y + change.y);
					} else {
						ctx.lineTo(c.x + change.x, c.y + change.y);
					}
				}
			});

			ctx.fill();
			ctx.stroke();
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";
		});

		this.particles.forEach(p => {
			p.update();
		});

		this.particles.forEach(p => {
			p.draw();
		});

		if (this.settings.image) {
			const imageOpacity = this.settings.imageOpacity || 0;
			const pat = ctx.createPattern(this.settings.image, "repeat");
			if (pat) {
				ctx.globalAlpha = imageOpacity;
				ctx.fillStyle = pat;
				ctx.fillRect(0, 0, this.width, this.height);
				ctx.globalAlpha = 1;
			}
		}
	}

	animateCoordinateTable() {
		const pointAnimationSpeed = this.settings.pointAnimationSpeed || 0;
		const pointVariationX = this.settings.pointVariationX || 0;
		const pointVariationY = this.settings.pointVariationY || 0;

		Object.keys(this.coordinateTable).forEach(x => {
			Object.keys(this.coordinateTable[x]).forEach(y => {
				this.baseCoordinateTable[x][y] +=
					(this.delta / (pointAnimationSpeed / 1.5)) * 4; // Don't ask

				const changeX =
					Math.cos(this.baseCoordinateTable[x][y]) * pointVariationX;
				const changeY =
					Math.sin(this.baseCoordinateTable[x][y]) * pointVariationY;

				this.coordinateTable[x][y] = {
					x: changeX,
					y: changeY
				};
			});
		});
	}
}

interface TriangleSettings{
	ctx: CanvasRenderingContext2D;
	points: Array<Coords>;
	color: string;
}

class Triangle {
	constructor(settings: TriangleSettings){

	}
}

interface ParticleSettings {
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
}

class Particle {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	ox: number;
	oy: number;
	interval: number;
	limit: number;
	opacity: number;
	r: number;

	constructor(settings: ParticleSettings) {
		this.ctx = settings.ctx;
		this.x = getRandomInt(0, settings.width);
		this.y = getRandomInt(0, settings.height);
		this.ox = this.x;
		this.oy = this.y;

		this.interval = getRandomInt(1000, 5000);
		this.limit = getRandomInt(5, 15);
		this.opacity = getRandomFloat(0.1, 0.7);
		this.r = getRandomFloat(1, 2);
	}
	update() {
		this.x =
			this.ox + Math.cos(performance.now() / this.interval) * this.limit;
		this.y =
			this.oy +
			(Math.sin(performance.now() / this.interval) * this.limit) / 2;
	}

	draw() {
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		this.ctx.fillStyle = "rgba(255,255,255, " + this.opacity + ")";
		this.ctx.fill();
	}
}

const rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;
const rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}|.*)\)/;
function gradient(
	coords: Coords,
	width: number,
	height: number,
	colors: Array<string>
): Array<number> {
	let x = coords.x;
	let y = coords.y;
	let per = 0;
	per = x / width;
	let per2 = 0;
	per2 = y / height;
	per = (per2 + per) / 2;
	if (per > 1) {
		per = 1;
	} else if (per < 0) {
		per = 0;
	}

	const color = interpolate(colors)(per);
	let match;

	if (color.match(rgb)) {
		match = color
			.match(rgb)!
			.slice(1, 4)
			.map(num => parseInt(num));
		return [match[0], match[1], match[2], 1];
	} else if (color.match(rgba)) {
		match = color
			.match(rgba)!
			.slice(1, 5)
			.map(num => parseFloat(num));
		return [match[0], match[1], match[2], match[3]];
	} else {
		return [0, 0, 0, 0];
	}
}

function getCenter(coords: Array<Coords>) {
	var sumX = 0;
	var sumY = 0;

	coords.forEach(p => {
		sumX += p.x;
		sumY += p.y;
	});

	return { x: sumX / coords.length, y: sumY / coords.length };
}

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

function getRGBA(color: string): string {
	if (!color) {
		console.warn(`Incorrect color: ${color}`);
		return "rgba(0,0,0,0)";
	}

	return `rgba(${parseColor(color).join(",")})`;
}
