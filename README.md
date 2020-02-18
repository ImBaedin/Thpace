# Thpace
Thpace is a pretty canvas creation of mine. It makes a space animation out of triangles.

There is one dependency.  
Delaunator: `https://unpkg.com/delaunator@2.0.0/delaunator.min.js`

[Example](https://www.braedin.com/Thpace/)


## HTML
```
<body>
...
<container>
    <canvas id="thpace"></canvas>
</container>
...
<script src="https://unpkg.com/delaunator@2.0.0/delaunator.min.js"></script>
<script src="./js/Thpace.js"></script>
</body>
```

## Javascript
```
const canvas = document.getElementById('thpace');

const settings = {
    color1: '#43C6AC',
    color2: '#191654'
};

const backboi = Thpace.create(canvas, settings);
```

# Some Info
## Settings
<table class="table table-bordered">
    <thead>
        <tr>
            <th>Setting</th>
            <th>Accepts</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>triangleSize</code></td>
            <td>Number (Any)</td>
            <td><code>130</code></td>
            <td>Size of each triangle</td>
        </tr>
        <tr>
            <td><code>bleed</code></td>
            <td>Number (Any)</td>
            <td><code>95</code></td>
            <td>How far over the edges should the generated triangles go.</td>
        </tr>
        <tr>
            <td><code>noise</code></td>
            <td>Number (Any)</td>
            <td><code>60</code></td>
            <td>How much the edges of triangles should vary.</td>
        </tr>
        <tr>
            <td><code>color1</code></td>
            <td>String (Form of '#******')</td>
            <td><code>'#360033'</code></td>
            <td>Color at the top left of the canvas.</td>
        </tr>
        <tr>
            <td><code>color2</code></td>
            <td>String (Form of '#******')</td>
            <td><code>'#0b8793'</code></td>
            <td>Color at the bottom right of the canvas.</td>
        </tr>
        <tr>
            <td><code>pointVariationX</code></td>
            <td>Number (any)</td>
            <td><code>20</code></td>
            <td>Variation of the points X.</td>
        </tr>
        <tr>
            <td><code>pointVariationY</code></td>
            <td>Number (Any)</td>
            <td><code>35</code></td>
            <td>Variation of the points Y.</td>
        </tr>
        <tr>
            <td><code>pointAnimationSpeed</code></td>
            <td>Number (Any)</td>
            <td><code>7500</code></td>
            <td>Speed at which the points move (full cycle in ms).</td>
        </tr>
        <tr>
            <td><code>image</code></td>
            <td>Image</td>
            <td><code>false</code></td>
            <td>Image for the canvas to repeat over itself.</td>
        </tr>
        <tr>
            <td><code>imageOpacity</code></td>
            <td>Decimal (0-1)</td>
            <td><code>.4</code></td>
            <td>Opacity of the image that is drawn.</td>
        </tr>
    </tbody>
</table>