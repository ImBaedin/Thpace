#shader vertex
#define PI 3.1415926538

attribute vec2 aPoint;
attribute float aInterval;
attribute float aRadius;
attribute float aVariationX;
attribute float aVariationY;
attribute float aOpacity;

uniform float uTime;
uniform vec2 uResolution;

varying float vOpacity;

void main() {

	vec2 pos = aPoint;

	pos.x += sin(PI * 2.0 * uTime / aInterval) * aVariationX;
	pos.y += cos(PI * 2.0 * uTime / aInterval) * aVariationY;

	pos = pos / uResolution;
	pos = pos * 2.0;
	pos = pos - 1.0;

	gl_Position = vec4(pos * vec2(1, -1), 0, 1);

	gl_PointSize = aRadius * 2.0;

	vOpacity = aOpacity;
}

#shader fragment
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision mediump float;

uniform vec3 uColor;

varying float vOpacity;

void main() {
	float r = 0.0, delta = 0.0, alpha = 1.0;
	vec2 cxy = 2.0 * gl_PointCoord - 1.0;
	r = dot(cxy, cxy);
	#ifdef GL_OES_standard_derivatives
		delta = fwidth(r);
		alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
	#endif

	vec4 color = vec4(uColor, vOpacity);

	gl_FragColor = color * alpha;
}