import Stats from 'stats.js';

import { getRGBA } from "../utils";
import { Settings } from '../interfaces';

export default abstract class ThpaceBase {
	canvas: HTMLCanvasElement;
	settings: Settings;
	animating: boolean = false;

	dim: { width: number, height: number };

	stats: Stats;
	timings: {[key: string]: Timings};

	constructor(canvas: HTMLCanvasElement, settings: Settings) {
		this.resize = this.resize.bind(this);
		
		this.canvas = canvas;
		this.settings = settings;

		this.dim = { width: 0, height: 0 };

		this.stats = new Stats();
		this.timings = {
			triangles: new Timings(),
			particles: new Timings()
		}

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

		if(settings.automaticResize){
			window.addEventListener("resize", this.resize);
		}
		this.resize(null, false);
	}

	debug(){
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );
	}

	resize(event: UIEvent|null = null, reInit = true) {
		let p = this.canvas.parentElement;
		if (p) {
			this.canvas.width = p.clientWidth;
			this.canvas.height = p.clientHeight;
		}
		if (
			this.dim.width !== this.canvas.width ||
			this.dim.height !== this.canvas.height
		) {
			this.dim.width = this.canvas.width;
			this.dim.height = this.canvas.height;
			if(reInit) this.init();
		}
	}


	/**
	 * @description This method will be called on resize by default. Set up the triangles and begin the animation here.
	 */
	abstract init(): void;

	/**
	 * @description This method will be called when the user wants to update a setting.
	 */
	abstract updateSettings(newSettings: Settings | object): void;

	stop(){
		if(this.animating) this.animating = false;
	}

	resume(){
		if(!this.animating) this.animating = true;
	}

	/**
	 * @description The main loop function. Should call itself using `requestAnimationFrame()`. All rendering and update work goes in here.
	 */
	abstract animate(): void;
}

export class Timings{
	min: number = Infinity;
	max: number = 0;
	current: number = 0;

	curTime: number = 0;
	set(value:number){
		if(value < this.min) this.min = value;
		if(value > this.max) this.max = value;
		this.current = value;
	}
	start(){
		this.curTime = performance.now();
	}
	end(){
		this.set(performance.now() - this.curTime);
	}
}