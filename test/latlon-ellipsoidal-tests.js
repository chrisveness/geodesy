/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - ellipsoidal                                 (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Cartesian, Dms } from '../latlon-ellipsoidal.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-ellipsoidal', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('constructor', function() {
        test('@example',                () => new LatLon(51.47788, -0.00147, 17).toString('d', 4, 2).should.equal('51.4779°N, 000.0015°W +17.00m'));
        test('non-numeric lat fail',    () => should.Throw(function() { new LatLon('x', 0, 0); }, TypeError, 'invalid lat ‘x’'));
        test('non-numeric lon fail',    () => should.Throw(function() { new LatLon(0, 'x', 0); }, TypeError, 'invalid lon ‘x’'));
        test('non-numeric height fail', () => should.Throw(function() { new LatLon(0, 0, 'x'); }, TypeError, 'invalid height ‘x’'));
    });

    describe('parse', function() {
        test('@example p1',             () => LatLon.parse(51.47788, -0.00147).toString().should.equal('51.4779°N, 000.0015°W'));
        test('@example p2',             () => LatLon.parse('51°28′40″N, 000°00′05″W', 17).toString().should.equal('51.4778°N, 000.0014°W'));
        test('@example p3',             () => LatLon.parse({ lat: 52.205, lon: 0.119 }, 17).toString().should.equal('52.2050°N, 000.1190°E'));
        test('@example p4',             () => LatLon.parse({ lat: 52.205, lon: 0.119, height: 17 }).toString().should.equal('52.2050°N, 000.1190°E'));
        test('numeric lat, long',       () => LatLon.parse(51.47788, -0.00147).toString().should.equal('51.4779°N, 000.0015°W'));
        test('numeric lat, long, h',    () => LatLon.parse(51.47788, -0.00147, 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('string lat, long d',      () => LatLon.parse('51.47788', '-0.00147').toString().should.equal('51.4779°N, 000.0015°W'));
        test('string lat, long d, h',   () => LatLon.parse('51.47788', '-0.00147', '99').toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('string lat, long dm',     () => LatLon.parse('51°28.67′N, 000°00.09′E').toString('dm').should.equal('51°28.67′N, 000°00.09′E'));
        test('string lat, long dm, h',  () => LatLon.parse('51°28.67′N, 000°00.09′E', '99').toString('dm', 2, 0).should.equal('51°28.67′N, 000°00.09′E +99m'));
        test('string lat, long dms',    () => LatLon.parse('51°28′40″N, 000°00′05″E').toString('dms').should.equal('51°28′40″N, 000°00′05″E'));
        test('string lat, long dms, h', () => LatLon.parse('51°28′40″N, 000°00′05″E', '99').toString('dms', 0, 0).should.equal('51°28′40″N, 000°00′05″E +99m'));
        test('comma-separated',         () => LatLon.parse('51.47788, -0.00147').toString().should.equal('51.4779°N, 000.0015°W'));
        test('comma-separated, h',      () => LatLon.parse('51.47788, -0.00147', 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('comma-separated, h-str',  () => LatLon.parse('51.47788, -0.00147', '99').toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('{ lat, lon }',            () => LatLon.parse({ lat: 51.47788, lon: -0.00147 }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('{ lat, lon }, h',         () => LatLon.parse({ lat: 51.47788, lon: -0.00147 }, 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('{ "lat", "lon" }',        () => LatLon.parse({ lat: '51.47788', lon: '-0.00147' }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('{ "lat", "lon" }, h',     () => LatLon.parse({ lat: '51.47788', lon: '-0.00147' }, 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('{ lat, lng }',            () => LatLon.parse({ lat: 51.47788, lng: -0.00147 }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('{ lat, lng }, h',         () => LatLon.parse({ lat: 51.47788, lng: -0.00147 }, 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('{ lat, lon, h }',         () => LatLon.parse({ lat: 51.47788, lon: -0.00147, height: 99 }).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('{ lat’de, long’de }',     () => LatLon.parse({ latitude: 51.47788, longitude: -0.00147 }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('{ lat’de, long’de }, h',  () => LatLon.parse({ latitude: 51.47788, longitude: -0.00147 }, 99).toString('d', 4, 0).should.equal('51.4779°N, 000.0015°W +99m'));
        test('GeoJSON',                 () => LatLon.parse({ type: 'Point', coordinates: [ -0.00147, 51.47788 ] }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('GeoJSON w/h',             () => LatLon.parse({ type: 'Point', coordinates: [ -0.00147, 51.47788, 99 ] }).toString().should.equal('51.4779°N, 000.0015°W'));
        test('GeoJSON, h',              () => LatLon.parse({ type: 'Point', coordinates: [ -0.00147, 51.47788 ] }, 99).toString().should.equal('51.4779°N, 000.0015°W'));
    });

    describe('parse fail', function() {
        test('empty',                 () => should.Throw(function() { LatLon.parse(); }, TypeError, 'invalid (empty) point'));
        test('single arg num',        () => should.Throw(function() { LatLon.parse(1); }, TypeError, 'invalid point ‘1’'));
        test('single arg str',        () => should.Throw(function() { LatLon.parse('London'); }, TypeError, 'invalid point ‘London’'));
        test('single arg str + h',    () => should.Throw(function() { LatLon.parse('London', 99); }, TypeError, 'invalid point ‘London,99’'));
        test('invalid comma arg',     () => should.Throw(function() { LatLon.parse('London,UK'); }, TypeError, 'invalid point ‘London,UK’'));
        test('invalid comma arg + h', () => should.Throw(function() { LatLon.parse('London,UK', 99); }, TypeError, 'invalid point ‘London,UK’'));
        test('empty object',          () => should.Throw(function() { LatLon.parse({}); }, TypeError, 'invalid point ‘{}’'));
        test('invalid object 1',      () => should.Throw(function() { LatLon.parse({ y: 51.47788, x: -0.00147 }); }, TypeError, 'invalid point ‘{"y":51.47788,"x":-0.00147}’'));
        test('invalid object 2',      () => should.Throw(function() { LatLon.parse({ lat: 'y', lon: 'x' }); }, TypeError, 'invalid point ‘{"lat":"y","lon":"x"}’'));
        test('invalid lat,lon',       () => should.Throw(function() { LatLon.parse(null, null); }, TypeError, 'invalid point ‘,’'));
    });

    describe('toString', function() {
        test('default', () => new LatLon(1, -2).toString().should.equal('01.0000°N, 002.0000°W'));
        test('d',       () => new LatLon(1, -2).toString('d').should.equal('01.0000°N, 002.0000°W'));
        test('dm',      () => new LatLon(1, -2).toString('dm').should.equal('01°00.00′N, 002°00.00′W'));
        test('dms',     () => new LatLon(1, -2).toString('dms').should.equal('01°00′00″N, 002°00′00″W'));
        test('d,6',     () => new LatLon(1, -2).toString('d', 6).should.equal('01.000000°N, 002.000000°W'));
        test('dm,4',    () => new LatLon(1, -2).toString('dm', 4).should.equal('01°00.0000′N, 002°00.0000′W'));
        test('dms,2',   () => new LatLon(1, -2).toString('dms', 2).should.equal('01°00′00.00″N, 002°00′00.00″W'));
        test('d,6,2',   () => new LatLon(1, -2).toString('d', 6, 2).should.equal('01.000000°N, 002.000000°W +0.00m'));
        test('dm,4,2',  () => new LatLon(1, -2).toString('dm', 4, 2).should.equal('01°00.0000′N, 002°00.0000′W +0.00m'));
        test('dms,2,2', () => new LatLon(1, -2).toString('dms', 2, 2).should.equal('01°00′00.00″N, 002°00′00.00″W +0.00m'));
        test('d6+m',    () => new LatLon(1, -2, 99).toString('d', 6, 2).should.equal('01.000000°N, 002.000000°W +99.00m'));
        test('dm4+m',   () => new LatLon(1, -2, 99).toString('dm', 4, 2).should.equal('01°00.0000′N, 002°00.0000′W +99.00m'));
        test('dms2+m',  () => new LatLon(1, -2, 99).toString('dms', 2, 2).should.equal('01°00′00.00″N, 002°00′00.00″W +99.00m'));
        test('d6-m',    () => new LatLon(1, -2, -99).toString('d', 6, 2).should.equal('01.000000°N, 002.000000°W -99.00m'));
        test('dm4-m',   () => new LatLon(1, -2, -99).toString('dm', 4, 2).should.equal('01°00.0000′N, 002°00.0000′W -99.00m'));
        test('dms2-m',  () => new LatLon(1, -2, -99).toString('dms', 2, 2).should.equal('01°00′00.00″N, 002°00′00.00″W -99.00m'));
        test('n',       () => new LatLon(1, -2).toString('n').should.equal('1.0000, -2.0000'));
        test('n,6',     () => new LatLon(1, -2).toString('n', 6).should.equal('1.000000, -2.000000'));
        test('n,6,0',   () => new LatLon(1, -2).toString('n', 6, 0).should.equal('1.000000, -2.000000 +0m'));
        test('n,6,2',   () => new LatLon(1, -2).toString('n', 6, 2).should.equal('1.000000, -2.000000 +0.00m'));
        test('n,6,2+h', () => new LatLon(1, -2, 99).toString('n', 6, 2).should.equal('1.000000, -2.000000 +99.00m'));
        test('n,6,2-h', () => new LatLon(1, -2, -99).toString('n', 6, 2).should.equal('1.000000, -2.000000 -99.00m'));
    });

    describe('getters/setters', function() {
        const p = new LatLon(51.47788, -0.00147, 99);
        test('get lat',            () => p.lat.should.equal(51.47788));
        test('get latitude',       () => p.latitude.should.equal(51.47788));
        test('get lon',            () => p.lon.should.equal(-0.00147));
        test('get lng',            () => p.lng.should.equal(-0.00147));
        test('get longitude',      () => p.longitude.should.equal(-0.00147));
        test('get height',         () => p.height.should.equal(99));
        test('set lat',            () => { p.lat = 48.8584; p.lat.should.equal(48.8584); });
        test('set latitude',       () => { p.latitude = 48.8584; p.latitude.should.equal(48.8584); });
        test('set lon',            () => { p.lon = 2.2945; p.lon.should.equal(2.2945); });
        test('set lng',            () => { p.lng = 2.2945; p.lng.should.equal(2.2945); });
        test('set longitude',      () => { p.longitude = 2.2945; p.longitude.should.equal(2.2945); });
        test('set height',         () => { p.height = 9; p.height.should.equal(9); });
        test('get ellipsoids',     () => LatLon.ellipsoids.should.deep.equal({ WGS84: { a: 6378137, b: 6356752.314245, f: 1/298.257223563 } }));
        test('set lat fail',       () => should.Throw(function() { p.lat = 'x'; }, TypeError, 'invalid lat ‘x’'));
        test('set latitude fail',  () => should.Throw(function() { p.latitude = 'x'; }, TypeError, 'invalid latitude ‘x’'));
        test('set lon fail',       () => should.Throw(function() { p.lon = 'x'; }, TypeError, 'invalid lon ‘x’'));
        test('set lng fail',       () => should.Throw(function() { p.lng = 'x'; }, TypeError, 'invalid lng ‘x’'));
        test('set longitude fail', () => should.Throw(function() { p.longitude = 'x'; }, TypeError, 'invalid longitude ‘x’'));
        test('set height fail',    () => should.Throw(function() { p.height = 'x'; }, TypeError, 'invalid height ‘x’'));
    });

    describe('equals', function() {
        const p1 = new LatLon(51.47788, -0.00147);
        const p2 = new LatLon(51.47788, -0.00147);
        test('JS equals',   () => (p1 == p2).should.equal(false));
        test('LL equals',   () => (p1.equals(p2)).should.equal(true));
        test('LL neq lat',  () => (p1.equals(new LatLon(0, -0.00147))).should.equal(false));
        test('LL neq lon',  () => (p1.equals(new LatLon(51.47788, 0))).should.equal(false));
        test('LL neq h',    () => (p1.equals(new LatLon(51.47788, -0.00147, 99))).should.equal(false));
        test('equals fail', () => should.Throw(function() { p1.equals(null); }, TypeError, 'invalid point ‘null’'));
    });

    describe('cartesian', function() {
        const p = new LatLon(45, 45);
        test('toCartesian',          () => p.toCartesian().toString().should.equal('[3194419,3194419,4487348]'));
        const c = new Cartesian(3194419, 3194419, 4487348);
        test('toLatLon',             () => c.toLatLon().toString().should.equal('45.0000°N, 045.0000°E'));
        test('toLatLon w/ ellipse',  () => c.toLatLon(LatLon.datums.WGS84.ellipsoid).toString().should.equal('45.0000°N, 045.0000°E'));
        test('toLatLon fail (null)', () => should.Throw(function() { c.toLatLon(null); }, TypeError, 'invalid ellipsoid ‘null’'));
        test('toLatLon fail (str)',  () => should.Throw(function() { c.toLatLon('WGS84'); }, TypeError, 'invalid ellipsoid ‘WGS84’'));
    });
});
