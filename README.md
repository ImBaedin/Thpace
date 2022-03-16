# Thpace

Thpace is a pretty canvas creation of mine. It makes a space animation out of triangles.

[Example](https://www.braedin.com/Thpace/)

# Usage

You can install Thpace through NPM as a module, or through a CDN

## NPM

`yarn add thpace` \- or - `npm install thpace`

## CDN

`https://unpkg.com/thpace` Will get you the minified build

Then, you can import:

```html
<script src="https://unpkg.com/thpace"></script>
```

## Ok but like what code do I write to use it?

```js
import { ThpaceGL } from 'thpace';
// or
const { ThpaceGL } = require('thpace');
// or, if you used the CDN, skip those

const canvas = document.querySelector('#make-me-cool');

const settings = {
	colors: ['#4CB1EF', '#424959', '#FF4B44'],
	triangleSize: 100,
};

ThpaceGL.create(canvas, settings);
```

# Some Info

## Settings

| Setting | Accepts | Default | Description |
| --- | --- | --- | --- |
| `triangleSize` | number | `130` | Triangle size (px) |
| `bleed` | number | `120` | Bleed amount over canvas edges (px) |
| `noise` | number | `60` | Noise used when calculating points (px) |
| `colors` | Array\<string> | `['rgba(11,135,147,1)', 'rgba(54,0,51,1)']` | Array of colors to use for the gradient |
| `pointVariationX` | number | `20` | How much the points should shift on the x-axis (px) |
| `pointVariationY` | number | `35` | How much the points should shift on the y-axis (px) |
| `pointAnimationSpeed` | number | `7500` | How fast the points should complete a loop (ms) |
| `animationOffset` | number | `250` | Interval on the x-axis for the animation offset (px) |
| `maxFps` | number | `144` | Limit how many frames are drawn per second |
| `automaticResize` | boolean | `true` | Set to false to prevent Thpace from reacting to resize events |
| `particleSettings` | ParticleSettings | `{}` | Settings for the particles |

### Particle Settings

| Setting | Accepts | Default | Description |
| --- | --- | --- | --- |
| `count` | number \|\| `[min, max]` | `[2, 5]` | How many particles should be generated per 100 pixels |
| `interval` | number \|\| `[min, max]` | `[5000, 10000]` | Interval for a particle to complete it's animation (ms) |
| `radius` | number \|\| `[min, max]` | `[1, 2]` | Particle radius (px) |
| `opacity` | number \|\| `[min, max]` | `[.1, .7]` | Particle opacity |
| `variationX` | number \|\| `[min, max]` | `[5, 15]` | Variation in the particle animation on the x-axis (px) |
| `variationY` | number \|\| `[min, max]` | `[2.5, 7.5]` | Variation in the particle animation on the y-axis (px) |
| `color` | string | `#ffffff` | Color of the particles |
