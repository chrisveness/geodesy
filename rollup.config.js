import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
	// browser-friendly UMD build
	{
		input: 'npm.js',
		output: {
			exports: 'default, LatLonSpherical, LatLonEllipsoidal, LatLonVectors, Vector3d, Utm, Mgrs, OsGridRef, Dms',
			name: 'geodesy',
			file: 'dist/geodesy.js',
			format: 'umd'
		},
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	}
];
