import ThpaceBase from 'Thpace/ThpaceBase';
import { Point, Settings } from 'interfaces';
/**
 * @description Use static method 'create' to create a thpace instance.
 * @example Thpace.create(canvas, settings});
 * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
 */
export default class Thpace extends ThpaceBase {
    ctx: CanvasRenderingContext2D;
    animating: boolean;
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
    static create(canvas: HTMLCanvasElement, settings?: Settings): Thpace | undefined;
    constructor(canvas: HTMLCanvasElement, settings: Settings);
    /**
     * @description Internal function that plots the points on the graph,
     * creates the triangles, and begins the animation.
     */
    init(): void;
    private particulate;
    private setupPoints;
    private delaunate;
    /**
     * @description A function to update the Thpace settings. Will avoid re-defining the triangles if possible.
     * @param newSettings
     */
    updateSettings(newSettings: Settings | object): void;
    updatePoints(): void;
    stop(): void;
    resume(): void;
    animate(): void;
}
declare class Triangle {
    parent: Thpace;
    points: Array<number>;
    color: string;
    constructor(parent: Thpace, points: Array<number>);
    updateColor(): void;
    getPoints(): Point[];
    lines(): void;
    stroke(): void;
    fill(): void;
    draw(): void;
}
declare class Particle {
    parent: Thpace;
    color: string;
    x: number;
    y: number;
    opacity: number;
    radius: any;
    interval: any;
    variationX: any;
    variationY: any;
    constructor(parent: Thpace);
    updateSettings(newSettings: any): void;
    shape(): void;
    stroke(): void;
    fill(): void;
    draw(): void;
}
export {};
