export declare function drawTriangles(gl: WebGLRenderingContext, program: WebGLProgram, bindBuffers: Function, verticeCount: number): void;
export declare function drawParticles(gl: WebGLRenderingContext, program: WebGLProgram, bindBuffers: Function, particleCount: number): void;
export declare function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram;
export default function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader;
export declare function parseShader(shader: string): [string, string];
