
export function draw(gl: WebGLRenderingContext, program: WebGLProgram, verticeCount: number){

	// our shader needs the current time value for some calculations
	const uTime = gl.getUniformLocation(program, "uTime");
	gl.uniform1f(uTime, performance.now());

	gl.drawArrays(gl.TRIANGLES, 0, verticeCount);
}

export function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string){
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = <WebGLProgram>gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		gl.deleteProgram(shaderProgram);
		throw new Error(<string>gl.getProgramInfoLog(shaderProgram));
	}

	return shaderProgram;
}

export default function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader{
	const shader: WebGLShader = <WebGLShader>gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		const err = <string>gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(err);
	}

	return shader;
}

export function parseShader(shader: string): [string, string]{
	let lines = shader.split('\n');

	let source: [string[], string[]] = [[], []];

	let type: null|number = null;
	lines.forEach(l=>{
		if(l.includes('#shader')){
			if(l.includes('vertex')) type = 0;
			if(l.includes('fragment')) type = 1;
			return;
		}

		if(type !== null){
			source[type].push(l);
		}
	});

	//@ts-ignore
	return source.map((el: string[])=> el.join('\n'));
}