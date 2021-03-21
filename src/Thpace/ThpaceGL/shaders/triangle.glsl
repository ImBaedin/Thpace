#shader vertex
#define PI 3.1415926538

attribute vec2 aVertexPosition;
attribute vec2 aNoise;
attribute vec4 aColor;

uniform vec2 uResolution;
uniform float uAnimationOffset;
uniform float uTime;
uniform float uNoise;
uniform float uPointVariationX;
uniform float uPointVariationY;
uniform float uPointAnimationSpeed;

varying vec4 vColor;

void main(){
	float per = aVertexPosition[0] / uAnimationOffset;

	vec2 noise = aNoise * uNoise;

	float time = PI * 2.0 * uTime / uPointAnimationSpeed;
	
	float x = aVertexPosition[0] + sin(per + time) * uPointVariationX;
	float y = aVertexPosition[1] + cos(per + time) * uPointVariationY;

	vec2 translate = vec2(x,y);

	translate = translate + noise;
	translate = translate / uResolution;
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