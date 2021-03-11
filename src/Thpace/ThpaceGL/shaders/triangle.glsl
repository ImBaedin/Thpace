#shader vertex

attribute vec2 aVertexPosition;
attribute vec4 aColor;

uniform vec2 uResolution;
uniform float uAnimationOffset;
uniform float uTime;

varying vec4 vColor;

void main(){
	vec2 translate = aVertexPosition / uResolution;
	translate = translate * 2.0;
	translate = translate - 1.0;

	vColor = aColor;

	gl_Position = vec4(translate * vec2(1, -1), 0, 1);
}

#shader fragment
precision mediump float;

varying vec4 vColor;

void main(){
	gl_FragColor = vColor;
}