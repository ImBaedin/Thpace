
#  Thpace

Thpace is a pretty canvas creation of mine. It makes a space animation out of triangles.

[Example](https://www.braedin.com/Thpace/)

# Usage
You can install Thpace through NPM as a module, or through a CDN
## NPM
`yarn add thpace`
 \- or -
 `npm install thpace`
 
## CDN
`https://unpkg.com/thpace` Will get you the minified build
Then, you can import:
```html
<script src="https://unpkg.com/thpace"></script>
```

##  Ok but like what code do I write to use it?

```js
import Thpace from 'thpace';
// or
const Thpace = require('thpace');
// or, if you used the CDN, skip those

const canvas = document.querySelector('#make-me-cool');

const settings = {
	colors: ['#4CB1EF',  '#424959',  '#FF4B44'],
	triangleSize: 100
};

Thpace.create(canvas, settings);
```

  

#  Some Info

##  Settings
|Setting|Accepts|Default|Description|
|--|--|--|--|
|`triangleSize`|number|`130`|Triangle size (px)|
|`bleed`|number|`120`|Bleed amount over canvas edges (px)|
|`noise`|number|`60`|Noise used when calculating points (px)|
|`colors`|Array\<string>|`['rgba(11,135,147,1)', 'rgba(54,0,51,1)']`|Array of colors to use for the gradient|
|`pointVariationX`|number|`20`|How much the points should shift on the x-axis (px)|
|`pointVariationY`|number|`35`|How much the points should shift on the y-axis (px)|
|`pointAnimationSpeed`|number|`7500`|How fast the points should complete a loop (ms)|
|`image`|HTMLImageElement|`undefined`|Overlay image (adds a nice texture)|
|`imageOpacity`|number|`.4`|Overlay image opacity|