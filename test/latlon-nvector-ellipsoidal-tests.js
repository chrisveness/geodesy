/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - latlon-nvector-ellipsoidal                  (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Nvector, Cartesian, Ned, Dms } from '../latlon-nvector-ellipsoidal.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-nvector-ellipsoidal', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('@examples LatLon', function() {
        test('deltaTo',          () => new LatLon(49.66618, 3.45063, 99).deltaTo(new LatLon(48.88667, 2.37472, 64)).toString().should.equal('[N:-86127,E:-78901,D:1104]'));
        test('deltaTo l',        () => new LatLon(49.66618, 3.45063, 99).deltaTo(new LatLon(48.88667, 2.37472, 64)).length.toFixed(3).should.equal('116809.178'));
        test('deltaTo b',        () => new LatLon(49.66618, 3.45063, 99).deltaTo(new LatLon(48.88667, 2.37472, 64)).bearing.toFixed(3).should.equal('222.493'));
        test('deltaTo e',        () => new LatLon(49.66618, 3.45063, 99).deltaTo(new LatLon(48.88667, 2.37472, 64)).elevation.toFixed(4).should.equal('-0.5416'));
        test('destinationPoint', () => new LatLon(49.66618, 3.45063, 99).destinationPoint(Ned.fromDistanceBearingElevation(116809.178, 222.493, -0.5416)).toString().should.equal('48.8867°N, 002.3747°E'));
        test('toNvector',        () => new LatLon(45, 45).toNvector().toString(4).should.equal('[0.5000,0.5000,0.7071]'));
    });

    describe('@examples Nvector', function() {
        test('toLatLon',    () => new Nvector(0.5000, 0.5000, 0.707107).toLatLon().toString().should.equal('45.0000°N, 045.0000°E'));
        test('toCartesian', () => new Nvector(0.5000, 0.5000, 0.707107).toCartesian().toString().should.equal('[3194419,3194419,4487349]'));
        test('toString',    () => new Nvector(0.5000, 0.5000, 0.7071).toString().should.equal('[0.500,0.500,0.707]'));
        test('toString',    () => new Nvector(0.5000, 0.5000, 0.7071, 1).toString(6, 0).should.equal('[0.500002,0.500002,0.707103+1m]'));
    });

    describe('@examples Cartesian', function() {
        test('toNvector', () => new Cartesian(3980581, 97, 4966825).toNvector().toString(4).should.equal('[0.6228,0.0000,0.7824]'));
    });

    describe('@examples Ned', function() {
        test('constructor',                  () => new Ned(110569, 111297, 1936).toString().should.equal('[N:110569,E:111297,D:1936]'));
        test('fromDistanceBearingElevation', () => Ned.fromDistanceBearingElevation(116809.178, 222.493, -0.5416).toString().should.equal('[N:-86127,E:-78901,D:1104]'));
    });

    describe('lat/lon / n-vector / cartesian conversions', function() {
        describe('lat/lon => cartesian', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toCartesian().toString().should.equal('[6378137,0,0]'));
            test('0°N,90°E',    () => new LatLon(0, 90).toCartesian().toString().should.equal('[0,6378137,0]'));
            test('90°N',        () => new LatLon(90, 0).toCartesian().toString().should.equal('[0,0,6356752]'));
            test('45°N,45°E',   () => new LatLon(45, 45).toCartesian().toString().should.equal('[3194419,3194419,4487348]'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toCartesian().toString().should.equal('[3194419,-3194419,-4487348]'));
        });
        describe('cartesian => lat/lon', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toCartesian().toLatLon().toString().should.equal('00.0000°N, 000.0000°E'));
            test('0°N,90°E',    () => new LatLon(0, 90).toCartesian().toLatLon().toString().should.equal('00.0000°N, 090.0000°E'));
            test('90°N',        () => new LatLon(90, 0).toCartesian().toLatLon().toString().should.equal('90.0000°N, 000.0000°E'));
            test('45°N,45°E',   () => new LatLon(45, 45).toCartesian().toLatLon().toString().should.equal('45.0000°N, 045.0000°E'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toCartesian().toLatLon().toString().should.equal('45.0000°S, 045.0000°W'));
        });
        describe('lat/lon => n-vector', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toNvector().toString().should.equal('[1.000,0.000,0.000]'));
            test('0°N,90°E',    () => new LatLon(0, 90).toNvector().toString().should.equal('[0.000,1.000,0.000]'));
            test('90°N',        () => new LatLon(90, 0).toNvector().toString().should.equal('[0.000,0.000,1.000]'));
            test('45°N,45°E',   () => new LatLon(45, 45).toNvector().toString().should.equal('[0.500,0.500,0.707]'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toNvector().toString().should.equal('[0.500,-0.500,-0.707]'));
        });
        describe('n-vector => lat/lon', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toNvector().toLatLon().toString().should.equal('00.0000°N, 000.0000°E'));
            test('0°N,90°E',    () => new LatLon(0, 90).toNvector().toLatLon().toString().should.equal('00.0000°N, 090.0000°E'));
            test('90°N',        () => new LatLon(90, 0).toNvector().toLatLon().toString().should.equal('90.0000°N, 000.0000°E'));
            test('45°N,45°E',   () => new LatLon(45, 45).toNvector().toLatLon().toString().should.equal('45.0000°N, 045.0000°E'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toNvector().toLatLon().toString().should.equal('45.0000°S, 045.0000°W'));
        });
        describe('n-vector => cartesian', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toNvector().toCartesian().toString().should.equal('[6378137,0,0]'));
            test('0°N,90°E',    () => new LatLon(0, 90).toNvector().toCartesian().toString().should.equal('[0,6378137,0]'));
            test('90°N',        () => new LatLon(90, 0).toNvector().toCartesian().toString().should.equal('[0,0,6356752]'));
            test('45°N,45°E',   () => new LatLon(45, 45).toNvector().toCartesian().toString().should.equal('[3194419,3194419,4487348]'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toNvector().toCartesian().toString().should.equal('[3194419,-3194419,-4487348]'));
        });
        describe('cartesian => n-vector', function() {
            test('0°N,0°E',     () => new LatLon(0, 0).toCartesian().toNvector().toString().should.equal('[1.000,0.000,0.000]'));
            test('0°N,90°E',    () => new LatLon(0, 90).toCartesian().toNvector().toString().should.equal('[0.000,1.000,0.000]'));
            test('90°N',        () => new LatLon(90, 0).toCartesian().toNvector().toString().should.equal('[0.000,0.000,1.000]'));
            test('45°N,45°E',   () => new LatLon(45, 45).toCartesian().toNvector().toString().should.equal('[0.500,0.500,0.707]'));
            test('-45°N,-45°E', () => new LatLon(-45, -45).toCartesian().toNvector().toString().should.equal('[0.500,-0.500,-0.707]'));
        });
        describe('cartesian', function() {
            test('0°N,0°E',         () => new Nvector(1, 0, 0).toCartesian().toString().should.equal('[6378137,0,0]'));
            test('0°N,90°E',        () => new Nvector(0, 1, 0).toCartesian().toString().should.equal('[0,6378137,0]'));
            test('90°N',            () => new Nvector(0, 0, 1).toCartesian().toString().should.equal('[0,0,6356752]'));
            test('0°N,0°E @100m',   () => new Nvector(1, 0, 0, 100).toCartesian().toString().should.equal('[6378237,0,0]'));
            test('0°N,90°E @100m',  () => new Nvector(0, 1, 0, 100).toCartesian().toString().should.equal('[0,6378237,0]'));
            test('90°N @100m',      () => new Nvector(0, 0, 1, 100).toCartesian().toString().should.equal('[0,0,6356852]'));
            test('45°N,45°E',       () => new Nvector(0.5, 0.5, 0.7071).toCartesian().toString().should.equal('[3194434,3194434,4487327]'));
            test('45°N,45°E @100m', () => new Nvector(0.5, 0.5, 0.7071, 100).toCartesian().toString().should.equal('[3194484,3194484,4487398]'));
        });
        describe('toString', function() {
            test('default', () => new Nvector(1, 0, 0).toString().should.equal('[1.000,0.000,0.000]'));
            test('dp=2',    () => new Nvector(1, 0, 0).toString(2).should.equal('[1.00,0.00,0.00]'));
            test('dp=2,2',  () => new Nvector(1, 0, 0).toString(2, 2).should.equal('[1.00,0.00,0.00+0.00m]'));
            test('h+ve',    () => new Nvector(1, 0, 0, 1).toString(3, 2).should.equal('[1.000,0.000,0.000+1.00m]'));
            test('h-ve',    () => new Nvector(1, 0, 0, -1).toString(3, 2).should.equal('[1.000,0.000,0.000-1.00m]'));
        });
    });

    describe('deltaTo', function() {
        test('0°N,0°E -> 1°N,1°E',     () => new LatLon(0, 0).deltaTo(new LatLon(1,  1)).toString().should.equal('[N:110569,E:111297,D:1936]'));
        test('0°N,0°E -> 10°N,1°E',    () => new LatLon(0, 0).deltaTo(new LatLon(10,  1)).toString().should.equal('[N:1100249,E:109634,D:97221]'));
        test('0°N,0°E -> 1°N,10°E',    () => new LatLon(0, 0).deltaTo(new LatLon(1, 10)).toString().should.equal('[N:110569,E:1107384,D:97848]'));

        test('30°N,0°E -> 31°N,1°E',   () => new LatLon(30, 0).deltaTo(new LatLon(31,  1)).toString().should.equal('[N:111272,E:95499,D:1689]'));
        test('30°N,0°E -> 40°N,1°E',   () => new LatLon(30, 0).deltaTo(new LatLon(40,  1)).toString().should.equal('[N:1104162,E:85390,D:97241]'));
        test('30°N,0°E -> 31°N,10°E',  () => new LatLon(30, 0).deltaTo(new LatLon(31, 10)).toString().should.equal('[N:152421,E:950201,D:72962]'));

        test('0°N,30°E -> 1°N,31°E',   () => new LatLon(0, 30).deltaTo(new LatLon(1, 31)).toString().should.equal('[N:110569,E:111297,D:1936]'));
        test('0°N,30°E -> 10°N,31°E',  () => new LatLon(0, 30).deltaTo(new LatLon(10, 31)).toString().should.equal('[N:1100249,E:109634,D:97221]'));
        test('0°N,30°E -> 1°N,40°E',   () => new LatLon(0, 30).deltaTo(new LatLon(1, 40)).toString().should.equal('[N:110569,E:1107384,D:97848]'));

        test('30°N,30°E -> 31°N,31°E', () => new LatLon(30, 30).deltaTo(new LatLon(31, 31)).toString().should.equal('[N:111272,E:95499,D:1689]'));
        test('30°N,30°E -> 40°N,31°E', () => new LatLon(30, 30).deltaTo(new LatLon(40, 31)).toString().should.equal('[N:1104162,E:85390,D:97241]'));
        test('30°N,30°E -> 31°N,40°E', () => new LatLon(30, 30).deltaTo(new LatLon(31, 40)).toString().should.equal('[N:152421,E:950201,D:72962]'));

        test('89°N,0°E -> 90°N,0°E',   () => new LatLon(89, 0).deltaTo(new LatLon(90,  0)).toString().should.equal('[N:111688,E:0,D:975]'));
        test('90°N,0°E -> 89°N,0°E',   () => new LatLon(90, 0).deltaTo(new LatLon(89,  0)).toString().should.equal('[N:-111688,E:0,D:975]'));

        test('0°N,0°E -> 45°N,45°E',   () => new LatLon(0, 0).deltaTo(new LatLon(45, 45)).toString().should.equal('[N:4487348,E:3194419,D:3183718]'));

        const a = new LatLon(49.66618, 3.45063);
        const b = new LatLon(48.88667, 2.37472);
        const δ = a.deltaTo(b);
        test('example delta',          () => δ.toString().should.equal('[N:-86126,E:-78900,D:1069]'));
        test('example dist',           () => δ.length.toFixed(3).should.equal('116807.681'));
        test('example brng',           () => δ.bearing.toFixed(3).should.equal('222.493'));
        test('example elev',           () => δ.elevation.toFixed(4).should.equal('-0.5245'));

        test('from delta',             () => Ned.fromDistanceBearingElevation(δ.length, δ.bearing, δ.elevation).toString().should.equal('[N:-86126,E:-78900,D:1069]'));

        test('fail',                   () => should.Throw(function() { new LatLon(0, 0).deltaTo(null); }, TypeError, 'invalid point ‘null’'));
    });

    describe('destinationPoint', function() {
        test('0°N,0°E -> 1°N,1°E',     () => new LatLon(0, 0).destinationPoint(new Ned(110569, 111297, 1936)).toString().should.equal('01.0000°N, 001.0000°E'));
        test('0°N,0°E -> 10°N,1°E',    () => new LatLon(0, 0).destinationPoint(new Ned(1100249, 109634, 97221)).toString().should.equal('10.0000°N, 001.0000°E'));
        test('0°N,0°E -> 1°N,10°E',    () => new LatLon(0, 0).destinationPoint(new Ned(110569, 1107384, 97848)).toString().should.equal('01.0000°N, 010.0000°E'));

        test('30°N,0°E -> 31°N,1°E',   () => new LatLon(30, 0).destinationPoint(new Ned(111272, 95499, 1689)).toString().should.equal('31.0000°N, 001.0000°E'));
        test('30°N,0°E -> 40°N,1°E',   () => new LatLon(30, 0).destinationPoint(new Ned(1104162, 85390, 97241)).toString().should.equal('40.0000°N, 001.0000°E'));
        test('30°N,0°E -> 31°N,10°E',  () => new LatLon(30, 0).destinationPoint(new Ned(152421, 950201, 72962)).toString().should.equal('31.0000°N, 010.0000°E'));

        test('0°N,30°E -> 1°N,31°E',   () => new LatLon(0, 30).destinationPoint(new Ned(110569, 111297, 1936)).toString().should.equal('01.0000°N, 031.0000°E'));
        test('0°N,30°E -> 10°N,31°E',  () => new LatLon(0, 30).destinationPoint(new Ned(1100249, 109634, 97221)).toString().should.equal('10.0000°N, 031.0000°E'));
        test('0°N,30°E -> 1°N,40°E',   () => new LatLon(0, 30).destinationPoint(new Ned(110569, 1107384, 97848)).toString().should.equal('01.0000°N, 040.0000°E'));

        test('30°N,30°E -> 31°N,31°E', () => new LatLon(30, 30).destinationPoint(new Ned(111272, 95499, 1689)).toString().should.equal('31.0000°N, 031.0000°E'));
        test('30°N,30°E -> 40°N,31°E', () => new LatLon(30, 30).destinationPoint(new Ned(1104162, 85390, 97241)).toString().should.equal('40.0000°N, 031.0000°E'));
        test('30°N,30°E -> 31°N,40°E', () => new LatLon(30, 30).destinationPoint(new Ned(152421, 950201, 72962)).toString().should.equal('31.0000°N, 040.0000°E'));

        test('89°N,0°E -> 90°N,0°E',   () => new LatLon(89, 0).destinationPoint(new Ned(111688, 0, 975)).toString().should.equal('90.0000°N, 000.0000°E'));
        test('90°N,0°E -> 89°N,0°E',   () => new LatLon(90, 0).destinationPoint(new Ned(-111688, 0, 975)).toString().should.equal('89.0000°N, 000.0000°E'));

        test('0°N,0°E -> 45°N,45°E',   () => new LatLon(0, 0).destinationPoint(new Ned(4487348, 3194419, 3183718)).toString().should.equal('45.0000°N, 045.0000°E'));

        test('fail',                   () => should.Throw(function() { new LatLon(0, 0).destinationPoint(null); }, TypeError, 'delta is not Ned object'));
    });
});


/*
 * nvector.readthedocs.io/en/latest/src/overview.html#unit-tests
 */
describe('navlab nvector examples (ellipsoidal)', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('Example 1: A and B to delta', function() {
        const a = new LatLon(1, 2, 3); // defaults to WGS-84
        const b = new LatLon(4, 5, 6);
        const delta = a.deltaTo(b);   // [N:331730.863,E:332998.501,D:17398.304]
        const dist = delta.length;    // 470357.384 m
        const brng = delta.bearing;   // 45.109°
        const elev = delta.elevation; // -2.1198°
        test('dist', function() { delta.toString(3).should.equal('[N:331730.863,E:332998.501,D:17398.304]'); });
        test('dist', function() { dist.toFixed(3).should.equal('470357.384'); });
        test('brng', function() { brng.toFixed(3).should.equal('45.109'); });
        test('elev', function() { elev.toFixed(4).should.equal('-2.1198'); });
    });
    describe('Example 2: B and delta to C', function() {
        // const n = new Nvector(1, 2, 3, 400, LatLon.datums.WGS72); // [0.267,0.535,0.802,400.000]
        // const b = n.toLatLon();                                   // 53.301°N, 063.435°E +400.000m
        // const delta = new Ned(3000, 2000, 100);                   // [N:3000,E:2000,D:100]
        // const c = b.destinationPoint(delta);                      // 53.328°N, 063.465°E +299.138m
        // test('c', function() { c.toString('d', 3, 3).should.equal('53.328°N, 063.465°E +299.151m'); });
        // TODO: fails with h=301.019m - to do with yaw=10, pitch=20, roll=30?
    });
    describe('Example 3: ECEF-vector to geodetic latitude', function() {
        const c = new Cartesian(0.9*6371e3, -1.0*6371e3, 1.1*6371e3);
        const p = c.toLatLon(); // 39.379°N, 048.013°W +4702059.834m
        test('p', function() { p.toString('d', 3, 3).should.equal('39.379°N, 048.013°W +4702059.834m'); });
    });
    describe('Example 4: Geodetic latitude to ECEF-vector', function() {
        const p = new LatLon(1, 2, 3);
        const c = p.toCartesian(); // [6373290.277,222560.201,110568.827]
        test('c', function() { c.toString(3).should.equal('[6373290.277,222560.201,110568.827]'); });
    });
});
