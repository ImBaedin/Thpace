import { Settings, ParticleSettings } from '../interfaces';

export const defaultParticleSettings: ParticleSettings = {
	count: [2, 5],
	interval: [5000, 10000],
	radius: [1, 2],
	opacity: [0.1, 0.7],
	color: '#ffffff',
	variationX: [5, 15],
	variationY: [2.5, 7.5],
};

export const defaultSettings: Settings = {
	triangleSize: 130,
	bleed: 120,
	noise: 60,
	colors: ['rgba(11,135,147,1)', 'rgba(54,0,51,1)'],
	pointVariationX: 20,
	pointVariationY: 35,
	pointAnimationSpeed: 7500,
	maxFps: 144,
	animationOffset: 250,
	image: undefined,
	imageOpacity: 0.4,
	automaticResize: true,
	particleSettings: defaultParticleSettings,
};
