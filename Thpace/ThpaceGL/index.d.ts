import ThpaceBase from '../ThpaceBase';
import { particlePointData, Settings, triangleVerticeData } from 'interfaces';
export default class ThpaceGL extends ThpaceBase {
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
    static webglSupport(): false | WebGLRenderingContext | null;
    /**
     * @description Create an instance of thpace on your page.
     * @param canvas - The canvas to turn into a thpace instance.
     * @param settings - Optional object with settings to control the thpace instance
     */
    static create(canvas: HTMLCanvasElement, settings?: Settings): ThpaceGL | undefined;
    constructor(canvas: HTMLCanvasElement, settings: Settings);
    generateVertices(): void;
    particulate(): void;
    private calculateColors;
    private setBuffer;
    init(): void;
    bindTriangleBuffers(): void;
    bindParticleBuffers(): void;
    animate(): void;
    /**
     * @description A function to update the Thpace settings. Will avoid re-defining the triangles if possible.
     * @param newSettings
     */
    updateSettings(newSettings: Settings | object): void;
}
