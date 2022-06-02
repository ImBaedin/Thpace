import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { string } from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const name = 'window';

const config = (file, plugins, format = 'umd') => ({
	input: './src/index.ts',
	output: {
		name,
		format,
		file,
		extend: true,
	},
	plugins,
});

export default [
	config('thpace.js', [
		string({ include: '**/*.glsl' }),
		resolve({ extensions }),
		commonjs(),
		typescript({ useTsconfigDeclarationDir: true }),
		babel({ extensions, include: ['src/**/*'] }),
	]),
	config('thpace.min.js', [
		terser(),
		string({ include: '**/*.glsl' }),
		resolve({ extensions }),
		commonjs(),
		typescript({ useTsconfigDeclarationDir: true }),
		babel({ extensions, include: ['src/**/*'] }),
	]),
	config('./docs/thpace.min.js', [
		terser(),
		string({ include: '**/*.glsl' }),
		resolve({ extensions }),
		commonjs(),
		typescript({ useTsconfigDeclarationDir: true }),
		babel({ extensions, include: ['src/**/*'] }),
	]),
	config(
		'./lib/index.js',
		[
			terser(),
			string({ include: '**/*.glsl' }),
			resolve({ extensions }),
			commonjs(),
			typescript({ useTsconfigDeclarationDir: true }),
			babel({ extensions, include: ['src/**/*'] }),
		],
		'esm',
	),
];
