/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - ellipsoidal reference frames                (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Cartesian, Dms } from '../latlon-ellipsoidal-referenceframe.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-ellipsoidal-referenceframe', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('constructor', function() {
        test('TRF',            () => new LatLon(0, 0, 0, LatLon.referenceFrames.ITRF2014, 2000.0).toString().should.equal('00.0000°N, 000.0000°E'));
        test('bad TRF fail',   () => should.Throw(function() { new LatLon(0, 0, 0, null); }, TypeError, 'unrecognised reference frame'));
        test('bad epoch fail', () => should.Throw(function() { new LatLon(0, 0, 0, LatLon.referenceFrames.ITRF2014, 'xxx'); }, TypeError, 'invalid epoch ’xxx’'));
    });

    describe('@examples', function() {
        test('constructor',                     () => new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2000).toString().should.equal('51.4779°N, 000.0015°W'));
        test('parse p1',                        () => LatLon.parse(51.47788, -0.00147, 17, LatLon.referenceFrames.ETRF2000).toString().should.equal('51.4779°N, 000.0015°W'));
        test('parse p2',                        () => LatLon.parse('51.47788, -0.00147', 17, LatLon.referenceFrames.ETRF2000).toString().should.equal('51.4779°N, 000.0015°W'));
        test('parse p3',                        () => LatLon.parse({ lat: 52.205, lon: 0.119 }, 17, LatLon.referenceFrames.ETRF2000).toString().should.equal('52.2050°N, 000.1190°E'));
        const pItrf = new LatLon(51.47788000, -0.00147000, 0, LatLon.referenceFrames.ITRF2000);
        test('convertReferenceFrame',           () => pItrf.convertReferenceFrame(LatLon.referenceFrames.ETRF2000).toString('d', 8).should.equal('51.47787826°N, 000.00147125°W'));
        test('toString 1',                      () => new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2014).toString().should.equal('51.4779°N, 000.0015°W'));
        test('toString 2',                      () => new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2014).toString('dms').should.equal('51°28′40″N, 000°00′05″W'));
        test('toString 3',                      () => new LatLon(51.47788, -0.00147, 42, LatLon.referenceFrames.ITRF2014).toString('dms', 0, 0).should.equal('51°28′40″N, 000°00′05″W +42m'));
        test('Cartesian.toLatLon',              () => new Cartesian(4027893.924, 307041.993, 4919474.294, LatLon.referenceFrames.ITRF2000).toLatLon().toString().should.equal('50.7978°N, 004.3592°E'));
        test('Cartesian.convertReferenceFrame', () => new Cartesian(3980574.247, -102.127, 4966830.065, LatLon.referenceFrames.ITRF2000).convertReferenceFrame(LatLon.referenceFrames.ETRF2000).toString(3).should.equal('[3980574.395,-102.214,4966829.941](ETRF2000@1997.0)'));
    });

    describe('parse', function() {
        test('parse lat+lon',       () => LatLon.parse(51.47788, -0.00147, 17, LatLon.referenceFrames.ITRF2000).toString('d', 4, null, true).should.equal('51.4779°N, 000.0015°W (ITRF2000)'));
        test('parse lat+lon+epoch', () => LatLon.parse(51.47788, -0.00147, 17, LatLon.referenceFrames.ITRF2000, 2012.0).toString('d', 4, null, true).should.equal('51.4779°N, 000.0015°W (ITRF2000@2012.0)'));
        test('parse latlon',        () => LatLon.parse('51.47788, -0.00147', 17, LatLon.referenceFrames.ITRF2000).toString('d', 4, null, true).should.equal('51.4779°N, 000.0015°W (ITRF2000)'));
        test('parse latlon+epoch',  () => LatLon.parse('51.47788, -0.00147', 17, LatLon.referenceFrames.ITRF2000, 2012.0).toString('d', 4, null, true).should.equal('51.4779°N, 000.0015°W (ITRF2000@2012.0)'));
    });

    describe('getters/setters', function() {
        test('referenceFrame',      () => new LatLon(0, 0).referenceFrame.name.should.equal('ITRF2014'));
        test('epoch',               () => new LatLon(0, 0).epoch.should.equal(2010.0));
        test('ellipsoids',          () => Object.keys(LatLon.ellipsoids).join().should.equal('WGS84,GRS80'));
        test('referenceFrames',     () => Object.keys(LatLon.referenceFrames).should.include('ITRF2014'));
        test('transformParameters', () => Object.keys(LatLon.transformParameters).should.include('ITRF2014→ITRF2008'));
    });

    describe('parse fail', function() {
        test('empty', () => should.Throw(function() { LatLon.parse(); }, TypeError, 'invalid (empty) point'));
        test('l,l bad TRF', () => should.Throw(function() { LatLon.parse(0, 0, 0, 0); }, TypeError, 'unrecognised reference frame'));
        test('l,l bad TRF', () => should.Throw(function() { LatLon.parse(0, 0, 0, null); }, TypeError, 'unrecognised reference frame'));
        test('l/l bad TRF', () => should.Throw(function() { LatLon.parse('0, 0', 0, 0); }, TypeError, 'unrecognised reference frame'));
        test('l/l bad TRF', () => should.Throw(function() { LatLon.parse('0, 0', 0, null); }, TypeError, 'unrecognised reference frame'));
    });

    describe('convertReferenceFrame fail', function() {
        test('no TRF', () => should.Throw(function() { new LatLon(0, 0).convertReferenceFrame('ITRF2014'); }, TypeError, 'unrecognised reference frame'));
        test('no TRF', () => should.Throw(function() { new Cartesian(1, 2, 3).convertReferenceFrame('ITRF2014'); }, TypeError, 'unrecognised reference frame'));
    });

    describe('Cartesian constructor fail', function() {
        test('empty', () => should.Throw(function() { new Cartesian(4027893.924, 307041.993, 4919474.294, 'ITRF2000'); }, Error, 'unrecognised reference frame'));
        test('empty', () => should.Throw(function() { new Cartesian(4027893.924, 307041.993, 4919474.294, LatLon.referenceFrames.ITRF2000, 'last year'); }, Error, 'invalid epoch ’last year’'));
    });

    describe('Cartesian setter fail', function() {
        test('bad TRF',   () => should.Throw(function() { new Cartesian(1, 2, 3).referenceFrame = 'ITRF2014'; }, TypeError, 'unrecognised reference frame'));
        test('bad epoch', () => should.Throw(function() { new Cartesian(1, 2, 3).epoch = 'last year'; }, TypeError, 'invalid epoch ’last year’'));
    });

    describe('Cartesian.toLatLon fail', function() {
        test('empty', () => should.Throw(function() { new Cartesian(4027893.924, 307041.993, 4919474.294).toLatLon(null); }, Error, 'cartesian reference frame not defined'));
    });

    describe('convertReferenceFrame', function() {
        test('geod no-op', () => new LatLon(0, 0, 0, LatLon.referenceFrames.ITRF2000).convertReferenceFrame(LatLon.referenceFrames.ITRF2000).toString().should.equal('00.0000°N, 000.0000°E'));
        test('cart no-op', () => new Cartesian(1, 2, 3, LatLon.referenceFrames.ITRF2000).convertReferenceFrame(LatLon.referenceFrames.ITRF2000).toString().should.equal('[1,2,3](ITRF2000)'));
        test('chained conversion round-trip', () => {
            const nad83 = new LatLon(0, 0, 0, LatLon.referenceFrames.NAD83);
            const itrf2014 = nad83.convertReferenceFrame(LatLon.referenceFrames.ITRF2014); // goes via ITRF2000
            itrf2014.convertReferenceFrame(LatLon.referenceFrames.NAD83).toString('d', 8).should.equal('00.00000000°N, 000.00000000°W');
        });
    });

    describe('Dawson & Woods 2010', function() { // ITRF to GDA94 coordinate transformations, John Dawson and Alex Woods, Journal of Applied Geodesy 4 (2010)
        const itrf2005 = LatLon.parse('23°40′12.41482″S, 133°53′7.86712″E', 603.2562, LatLon.referenceFrames.ITRF2005, 2010.4559);
        const gda94 = itrf2005.convertReferenceFrame(LatLon.referenceFrames.GDA94, 2010.4559);
        test('Appendix A cartesian', () => gda94.toCartesian().toString(4).should.equal('[-4052051.7614,4212836.1945,-2545106.0146](GDA94@2010.4559)'));
        test('Appendix A geodetic',  () => gda94.toString('dms', 5, 4, true).should.equal('23°40′12.44582″S, 133°53′07.84795″E +603.3361m (GDA94@2010.4559)'));
        // note variations in final decimal for gda94ˣ, gda94ᶻ, gda94ᵠ – difference in rounding and/or Cartesian.toLatLon()?
        const itrf2005ʹ = gda94.convertReferenceFrame(LatLon.referenceFrames.ITRF2005, 2010.4559);
        test('Appendix A roundtrip', () => itrf2005ʹ.toString('dms', 5, 4, true).should.equal('23°40′12.41482″S, 133°53′07.86712″E +603.2562m (ITRF2005@2010.4559)'));
    });

    describe('Proj4 Onsala observatory', function() { // https://github.com/OSGeo/proj.4/blob/2aaf53/test/gie/more_builtins.gie#L357
        const cITRF2000 = new Cartesian(3370658.37800, 711877.31400, 5349787.08600, LatLon.referenceFrames.ITRF2000, 2017.0);
        test('from GNSStrans', () => cITRF2000.convertReferenceFrame(LatLon.referenceFrames.ITRF93, 2017.0).toString(5).should.equal('[3370658.18892,711877.42369,5349787.12430](ITRF93@2017.0)'));
        // accurate to within 0.02mm
    });

    describe('NGS Data Sheet Meades Ranch', function() { // https://www.ngs.noaa.gov/cgi-bin/ds_mark.prl?PidBox=kg0640
        const nad83_2011 = LatLon.parse('39 13 26.71220(N), 098 32 31.74540(W)', 573.961, LatLon.referenceFrames.NAD83, 2010.0);
        test('cartesian', () => nad83_2011.toCartesian().toString(3).should.equal('[-734972.563,4893188.492,4011982.811](NAD83@2010.0)'));
    });

    describe('EUREF Permanent Network', function() { // epncb.oma.be/_productsservices/coord_trans (tutorial)
        test('Ex1: ITRF2005(2007.0)->ITRF91(2007.0)', function() {
            const orbITRF2005 = new Cartesian(4027894.006, 307045.600, 4919474.910, LatLon.referenceFrames.ITRF2005, 2007.0);
            const orbITRF91 = orbITRF2005.convertReferenceFrame(LatLon.referenceFrames.ITRF91);
            orbITRF91.toString(4).should.equal('[4027894.0444,307045.6209,4919474.8613](ITRF91@2007.0)');
        });
        test('Ex2: ITRF2005(2007.0)->ITRF91(1999.0)', function() {
            const orbITRF2005 = new Cartesian(4027894.006, 307045.600, 4919474.910, LatLon.referenceFrames.ITRF2005, 2007.0);
            const orbITRF91 = orbITRF2005.convertReferenceFrame(LatLon.referenceFrames.ITRF91);
            orbITRF91.toString(4).should.equal('[4027894.0444,307045.6209,4919474.8613](ITRF91@2007.0)');
        });
        test('Ex4: ITRF2000(2012.0)->ETRF2000(2012.0)', function() {
            const orbITRF2000 = new Cartesian(4027894.006, 307045.600, 4919474.910, LatLon.referenceFrames.ITRF2000, 2012.0);
            const orbETRF2000 = orbITRF2000.convertReferenceFrame(LatLon.referenceFrames.ETRF2000);
            orbETRF2000.toString(4).should.equal('[4027894.3559,307045.2508,4919474.6447](ETRF2000@2012.0)');
        });
        test('Ex5: ITRF2014(2012.0)->ETRF2000(2012.0)', function() {
            const orbITRF2014 = new Cartesian(4027894.006, 307045.600, 4919474.910, LatLon.referenceFrames.ITRF2014, 2012.0);
            const orbETRF2000 = orbITRF2014.convertReferenceFrame(LatLon.referenceFrames.ETRF2000);
            orbETRF2000.toString(4).should.equal('[4027894.3662,307045.2530,4919474.6263](ETRF2000@2012.0)');
        });
    });

});
