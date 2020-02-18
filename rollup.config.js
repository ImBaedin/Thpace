import babel from "rollup-plugin-babel";
import {terser} from 'rollup-plugin-terser';
import Delaunator from 'delaunator';


const extensions = [".js", ".jsx", ".ts", ".tsx"];
const name = "Thpace";

const config = (file, plugins) => ({
	input: './src/index.ts',
	external: [
		'delaunator'
	],
    output: {
        name,
        format: 'umd',
		file,
		globals: {
			'delaunator': 'Delaunator'
		}
    },
    plugins
});

export default [
    config('thpace.js', [babel({ extensions, include: ["src/**/*"] })]),
    config('thpace.min.js', [terser(), babel({ extensions, include: ["src/**/*"] })])
];