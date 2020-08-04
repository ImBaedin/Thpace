import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';


const extensions = [".js", ".jsx", ".ts", ".tsx"];
const name = "Thpace";

const config = (file, plugins) => ({
	input: './src/index.ts',
    output: {
        name,
        format: 'umd',
		file,
    },
    plugins
});

export default [
    config('thpace.js', [resolve({ extensions }), commonjs(), babel({ extensions, include: ["src/**/*"] })]),
	config('thpace.min.js', [terser(), resolve({ extensions }), commonjs(), babel({ extensions, include: ["src/**/*"] })]),
    config('./docs/thpace.min.js', [terser(), resolve({ extensions }), commonjs(), babel({ extensions, include: ["src/**/*"] })])
];