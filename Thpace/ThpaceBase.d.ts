import Stats from 'stats.js';
import { Settings } from '../interfaces';
export default abstract class ThpaceBase {
    canvas: HTMLCanvasElement;
    settings: Settings;
    animating: boolean;
    dim: {
        width: number;
        height: number;
    };
    stats: Stats;
    timings: {
        [key: string]: Timings;
    };
    constructor(canvas: HTMLCanvasElement, settings: Settings);
    debug(): void;
    resize(event?: UIEvent | null, reInit?: boolean): void;
    /**
     * @description This method will be called on resize by default. Set up the triangles and begin the animation here.
     */
    abstract init(): void;
    /**
     * @description This method will be called when the user wants to update a setting.
     */
    abstract updateSettings(newSettings: Settings | object): void;
    stop(): void;
    resume(): void;
    /**
     * @description The main loop function. Should call itself using `requestAnimationFrame()`. All rendering and update work goes in here.
     */
    abstract animate(): void;
}
export declare class Timings {
    min: number;
    max: number;
    current: number;
    curTime: number;
    set(value: number): void;
    start(): void;
    end(): void;
}
