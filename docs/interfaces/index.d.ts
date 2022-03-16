export interface ParticleSettings {
    /**
     * @default [2, 5]
     * @description Number of particles generated per 100x100px. Can be a specific number or an array that defines a range.
     */
    count?: number | Array<number>;
    /**
     * @default [5000, 10000]
     * @description Time to complete an iteration (ms). Can be a specific number or an array that defines a range.
     */
    interval?: number | Array<number>;
    /**
     * @default [1, 2]
     * @description Radius of the particles. Can be a specific number or an array that defines a range.
     */
    radius?: number | Array<number>;
    /**
     * @default [.1, .7]
     * @description Opacity of the particles. Can be a specific number or an array that defines a range.
     */
    opacity?: number | Array<number>;
    /**
     * @default '#ffffff';
     * @description Color of the particles (string).
     */
    color?: string;
    /**
     * @default [5, 15]
     * @description Variation of the particles on the x axis. Can be a specific number or an array that defines a range.
     */
    variationX?: number | Array<number>;
    /**
     * @default [2.5, 7.5]
     * @description Variation of the particles on the y axis. Can be a specific number or an array that defines a range.
     */
    variationY?: number | Array<number>;
}
export interface Settings {
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
    /**
     * @default 35
     * @description How much the points should shift on the y-axis (px).
     * */
    pointVariationY?: number;
    /**
     * @default 7500
     * @description How fast the points should complete a loop (ms).
     * */
    pointAnimationSpeed?: number;
    /**
     * @default -1
     * @description Maximum amount of re-renders per second. -1 for unlimited. (number).
     */
    maxFps?: number;
    /**
     * @default 250
     * @description The offset of the animation from left to right (number).
     */
    animationOffset?: number;
    /**
     * @deprecated It will work, but causes major slowdowns.
     * @default undefined
     * @description Overlay image (adds a nice texture). */
    image?: HTMLImageElement | undefined;
    /**
     * @deprecated It will work, but causes major slowdowns.
     * @default .4
     * @description Overlay image opacity.
     * */
    imageOpacity?: number;
    /**
     * @default true
     * @description Set to false to prevent Thpace from reacting to resize events
     */
    automaticResize?: boolean;
    /**
     * @default defaultParticleSettings
     * @description Settings for the floating particles.
     */
    particleSettings?: ParticleSettings;
}
/**
 * @description Interface for Thpace points
 * */
export interface Point {
    /** Initial x coordinate */
    initX: number;
    /** Initial y coordinate */
    initY: number;
    /** x coordinate */
    x: number;
    /** y coordinate */
    y: number;
    /** Noise for the x axis */
    xNoise: number;
    /** Noise for the y axis */
    yNoise: number;
}
export interface triangleVerticeData {
    colors: number[];
    noisedPoints: [number, number][];
    indices: Uint32Array;
    vertices: number[];
    noise: number[];
}
export interface particlePointData {
    points: number[];
    interval: number[];
    radius: number[];
    opacity: number[];
    variationX: number[];
    variationY: number[];
}
