import Delaunator from 'delaunator';

/** Interface for a simple 2d coordinate */
interface Coords {
	/** x coordinate */
	x: number,
	/** y coordinate */
	y: number
}

interface Settings {
	/** Triangle size (px). */
	triangleSize?: number,
	/** Bleed amount over edges (px).*/
	bleed?: number,
	/** Noise used when calculating points (px). */
	noise?: number,
	/** Color in top left of screen (Hex code). */
	color1?: string,
	/** Color in bottom Right of screen (Hex code). */
	color2?: string,
	/** How much the points should shift on the x-axis (px). */
	pointVariationX?: number,
	/** How much the points should shift on the y-axis (px). */
	pointVariationY?: number,
	/** How fast the points should complete a loop (ms). */
	pointAnimationSpeed?: number,
	/** Overlay image (adds a nice texture). */
	image?: HTMLImageElement|undefined,
	/** Overlay image opacity. */
	imageOpacity?: number,
}

const defaultSettings:Settings = {
	triangleSize: 130,
	bleed: 120,
	noise: 60,
	color1: '#0b8793',
	color2: '#360033',
	pointVariationX: 20,
	pointVariationY: 35,
	pointAnimationSpeed: 7500,
	image: undefined,
	imageOpacity: .4,
}

/**
 * Use static method 'create' to create a thpace instance.
 */
export default class Thpace{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	settings: Settings;
	width: number;
	height: number;
	triangles: Array<Array<any>>;
	particles: Array<Particle>;
	coordinateTable: {[key: string]: any};
	baseCoordinateTable: {[key: string]: any};
	delta: number;
	lastUpdate: number;

	/**
	 * Create an instance of thpace on your page.
	 * @param canvas - The canvas to turn into a thpace instance.
	 * @param settings - Optional object with settings to control the thpace instance
	 */
	static create(canvas: HTMLCanvasElement, settings?: Settings){
		if(!canvas){
			console.warn('Need a valid canvas element!');
			return;
		}
		return new Thpace(canvas, Object.assign({}, defaultSettings, settings));
	}

	constructor(canvas: HTMLCanvasElement, settings: Settings){
		this.canvas = canvas;
		this.settings = settings;
		this.ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
		this.width = 0;
		this.height = 0;
		this.delta = performance.now();
		this.lastUpdate = performance.now();

		this.triangles = [];
        this.particles = [];
        this.coordinateTable = {};
        this.baseCoordinateTable = {};

		window.addEventListener('resize', this.resize.bind(this));
		this.resize();
		this.animate();
	}

	resize(){
		let p = this.canvas.parentElement;
		if(p){
			this.canvas.width = p.clientWidth;
			this.canvas.height = p.clientHeight;
		}
		if(this.width !== this.canvas.width || this.height !== this.canvas.height){
			this.width = this.canvas.width;
        	this.height = this.canvas.height;
			this.generateTriangles();
        	this.generateParticles();
		}

	}

	remove(){
		window.removeEventListener('resize', this.resize.bind(this));
	}

	generateTriangles(){
		let points: Array<any> = [];
        let coordinateTable: {[key: string]: any} = {};
        points.push([0, 0]);
        points.push([0, this.height]);
        points.push([this.width, 0]);
        points.push([this.width, this.height]);

        const bleed: number = this.settings.bleed || 0;
        const size: number = this.settings.triangleSize || 0;
		const noise: number = this.settings.noise || 0;
		const color1: string = this.settings.color1 || '';
		const color2: string = this.settings.color2 || '';

        for (let i = 0 - bleed; i < this.width + bleed; i += size) {
            for (let j = 0 - bleed; j < this.height + bleed; j += size) {
                let x = i + getRandomInt(0, noise);
                let y = j + getRandomInt(0, noise);
                points.push([x,y]);
            }
        }


        const delaunay = Delaunator.from(points);
        const triangleList = delaunay.triangles

        var coordinates = [];

        for (let i = 0; i < triangleList.length; i += 3) {
            let t: Array<any> = [
                points[triangleList[i]],
                points[triangleList[i + 1]],
                points[triangleList[i + 2]],
            
            ];

            let coords = [];
            coords.push({x: t[0][0], y: t[0][1]});
            coords.push({x: t[1][0], y: t[1][1]});
            coords.push({x: t[2][0], y: t[2][1]});

            let color = gradient(getCenter(coords), this.width, this.height, color1, color2);

            t.push(color);
            coordinates.push(t);
        }

        let baseCoordinateTable: {[key: string]: any} = {};
        coordinates.forEach(t=>{
            t.forEach(p=>{
                let x = p[0];
                let y = p[1];

                if(!coordinateTable[x]){
                    coordinateTable[x] = {};
                }

                let per = x/this.width;

                coordinateTable[x][y] = 0;

                if(!baseCoordinateTable[x]){
                    baseCoordinateTable[x] = {};
                }
                baseCoordinateTable[x][y] = per*2*Math.PI;
            });
        });

        this.triangles = coordinates;
        this.coordinateTable = coordinateTable;
        this.baseCoordinateTable = baseCoordinateTable;
	}

	generateParticles(){
		let particles = [];
        for(let i = 0; i < 250; i++){
            const pSet = {
                ctx: this.ctx,
                width: this.width,
                height: this.height
            }
            particles.push(new Particle(pSet));
        }
        this.particles = particles;
	}

	animate() {
        const ctx = this.ctx;

        ctx.clearRect(0,0,this.width, this.height);

        this.triangles.forEach((t) => {
            ctx.beginPath();

            let coords: Array<Coords> = [];
            coords.push({x: t[0][0], y: t[0][1]});
            coords.push({x: t[1][0], y: t[1][1]});
            coords.push({x: t[2][0], y: t[2][1]});

            let color = t[3];

            ctx.fillStyle = color;
            ctx.strokeStyle = color;

            let dp = [0,1,2,0];
            dp.forEach((el, ind)=>{
                if(this.coordinateTable[coords[el].x] && this.coordinateTable[coords[el].x][coords[el].y] != undefined){


                    let c = {x:coords[el].x, y:coords[el].y};
                    let change = this.coordinateTable[coords[el].x][coords[el].y];


                    if(ind == 0){
                        ctx.moveTo(c.x+change.x, c.y+change.y);
                    }
                    else{
                        ctx.lineTo(c.x+change.x, c.y+change.y);
                    }
                }
            });

            ctx.fill();
            ctx.stroke();
        });


        this.particles.forEach(p=>{
            p.update();
        });

        this.particles.forEach(p=>{
            p.draw();
        });

        if(this.settings.image){
			const imageOpacity = this.settings.imageOpacity || 0;
			const pat = ctx.createPattern(this.settings.image, 'repeat');
			if(pat){
				ctx.globalAlpha = imageOpacity;
				ctx.fillStyle = pat;
				ctx.fillRect(0,0, this.width, this.height);
				ctx.globalAlpha = 1;
			}
        }

		this.animateCoordinateTable();
		this.delta = performance.now() - this.lastUpdate;
		this.lastUpdate = performance.now();
        requestAnimationFrame(this.animate.bind(this));
	}
	
	animateCoordinateTable(){
		const pointAnimationSpeed = this.settings.pointAnimationSpeed || 0;
		const pointVariationX = this.settings.pointVariationX || 0;
		const pointVariationY = this.settings.pointVariationY || 0;

        Object.keys(this.coordinateTable).forEach(x=>{
            Object.keys(this.coordinateTable[x]).forEach(y=>{
				this.baseCoordinateTable[x][y] += this.delta / (pointAnimationSpeed / 1.5) * 4; // Don't ask

                const changeX = (Math.cos(this.baseCoordinateTable[x][y])*pointVariationX);
                const changeY = (Math.sin(this.baseCoordinateTable[x][y])*pointVariationY);

                this.coordinateTable[x][y] = {
                    x: changeX,
                    y: changeY
                };
            });
        });
    }
}

interface ParticleSettings {
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number
}

class Particle{
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	ox: number;
	oy: number;
	interval: number;
	limit: number;
	opacity: number;
	r: number;

	constructor(settings: ParticleSettings){
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
    update(){
        this.x = this.ox+(Math.cos(performance.now()/this.interval)*this.limit);
        this.y = this.oy+((Math.sin(performance.now()/this.interval)*this.limit)/2);
    }

    draw(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        this.ctx.fillStyle = 'rgba(255,255,255, '+this.opacity+')';
        this.ctx.fill();
    }
}

function gradient(coords: Coords, width: number, height: number, color1: string, color2: string) {
    let x = coords.x;
    let y = coords.y;
    let per = 0;
    per = (x / width);
    let per2 = 0;
    per2 = (y/height);
    per = (per2 + per)/2;
    if(per > 1){
        per = 1;
    }
    else if(per < 0){
        per = 0;
    }
    let hex = function (x: number) {
		let xs = x.toString(16);
        return (xs.length == 1) ? '0' + xs : xs;
    };
    let r = Math.ceil(parseInt(color2.substring(1, 3), 16) * per + parseInt(color1.substring(1, 3), 16) * (1 - per));
    let g = Math.ceil(parseInt(color2.substring(3, 5), 16) * per + parseInt(color1.substring(3, 5), 16) * (1 - per));
    let b = Math.ceil(parseInt(color2.substring(5, 7), 16) * per + parseInt(color1.substring(5, 7), 16) * (1 - per));
    let middle = "#" + hex(r) + hex(g) + hex(b);
    return middle;
}


function getCenter(coords: Array<Coords>) {
	var sumX = 0;
    var sumY = 0;
	
    coords.forEach(p => {
		sumX += p.x;
        sumY += p.y;
    });
	
    return { x: sumX / coords.length, y: sumY / coords.length }
}

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number) {
    return (Math.random() * (max - min) + min);
}