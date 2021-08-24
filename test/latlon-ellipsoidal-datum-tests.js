/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - ellipsoidal datums                          (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Cartesian, Dms } from '../latlon-ellipsoidal-datum.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-ellipsoidal-datum', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('@examples', function() {
        test('constructor',        () => new LatLon(53.3444, -6.2577, 17, LatLon.datums.Irl1975).toString().should.equal('53.3444°N, 006.2577°W'));
        test('ellipsoids',         () => Object.keys(LatLon.ellipsoids).should.include('Airy1830'));
        test('datums',             () => Object.keys(LatLon.datums).should.include('OSGB36'));
        test('parse',              () => LatLon.parse('51.47736, 0.0000', 0, LatLon.datums.OSGB36).toString().should.equal('51.4774°N, 000.0000°E'));
        test('convertDatum',       () => new LatLon(51.47788, -0.00147).convertDatum(LatLon.datums.OSGB36).toString().should.equal('51.4774°N, 000.0001°E'));
        test('Cartesian.toLatLon', () => new Cartesian(4027893.924, 307041.993, 4919474.294).toLatLon().convertDatum(LatLon.datums.OSGB36).toString().should.equal('50.7971°N, 004.3612°E'));
    });

    describe('valid datum', function() {
        test('constructor', () => should.Throw(function() { new LatLon(0, 0, 0, null); }, TypeError, 'unrecognised datum ‘null’'));
        test('parse',       () => should.Throw(function() { LatLon.parse('0, 0', 0, null); }, TypeError, 'unrecognised datum ‘null’'));
    });

    describe('getter', function() {
        test('ellipsoid getter', () => LatLon.ellipsoids.should.have.property('WGS84'));
    });

    describe('convert datum (Greenwich)', function() {
        const greenwichWGS84 = new LatLon(51.47788, -0.00147); // default WGS84
        const greenwichOSGB36 = greenwichWGS84.convertDatum(LatLon.datums.OSGB36);
        // greenwichOSGB36.height = 0;
        test('convert WGS84 -> OSGB36', () => greenwichOSGB36.toString('d', 6).should.equal('51.477364°N, 000.000150°E')); // TODO: huh? should be 0°E? out by c. 10 metres / 0.5″! am I missing something?
        test('convert round-trip',      () => greenwichOSGB36.convertDatum(LatLon.datums.WGS84).toString('d', 5).should.equal('51.47788°N, 000.00147°W'));
        test('convert fails',           () => should.Throw(function() { new LatLon(51, 0).convertDatum(null); }, TypeError, 'unrecognised datum ‘null’'));
    });

    describe('convert datum (Petroleum Operations Notices)', function() {
        // https://www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#test-point-using-osgb-petroleum-transformation-parameters
        test('convert WGS84 -> OSGB36', () => new LatLon(53, 1, 50).convertDatum(LatLon.datums.OSGB36).toString('dms', 3, 2).should.equal('52°59′58.719″N, 001°00′06.490″E +3.99m'));
        // https://www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#test-point-using-common-offshore-transformation-parameters
        test('convert WGS84 -> ED50',   () => new LatLon(53, 1, 50).convertDatum(LatLon.datums.ED50).toString('dms', 3, 2).should.equal('53°00′02.887″N, 001°00′05.101″E +2.72m'));
        test('convert round-trip',      () => new LatLon(53, 1, 50).convertDatum(LatLon.datums.OSGB36).convertDatum(LatLon.datums.ED50).convertDatum(LatLon.datums.WGS84).toString('d', 4, 1).should.equal('53.0000°N, 001.0000°E +50.0m'));
    });

    describe('equals', function() {
        const p1 = new LatLon(51.47788, -0.00147, 1, LatLon.datums.WGS84);
        const p2 = new LatLon(51.47788, -0.00147, 1, LatLon.datums.WGS84);
        test('JS equals',       () => (p1 == p2).should.equal(false));
        test('LL equals',       () => p1.equals(p2).should.equal(true));
        test('LL neq (lat)',    () => p1.equals(new LatLon(0, -0.00147, 1, LatLon.datums.WGS84)).should.equal(false));
        test('LL neq (lon)',    () => p1.equals(new LatLon(51.47788, 0, 1, LatLon.datums.WGS84)).should.equal(false));
        test('LL neq (height)', () => p1.equals(new LatLon(51.47788, -0.00147, 99, LatLon.datums.WGS84)).should.equal(false));
        test('LL neq (datum)',  () => p1.equals(new LatLon(51.47788, -0.00147, 1, LatLon.datums.Irl1975)).should.be.false);
        test('equals (fail)',   () => should.Throw(function() { p1.equals(null); }, TypeError, 'invalid point ‘null’'));
    });

    describe('cartesian', function() {
        const p = LatLon.parse('45N, 45E');
        test('toCartesian', () => p.toCartesian().toString().should.equal('[3194419,3194419,4487348]'));
        const c = new Cartesian(3194419, 3194419, 4487348);
        test('toLatLon', () => c.toLatLon().toString().should.equal('45.0000°N, 045.0000°E'));
        test('toLatLon fail', () => should.Throw(function() { c.toLatLon('xx'); }, TypeError, 'unrecognised datum ‘xx’'));
    });
});
