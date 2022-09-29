/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - latlon-nvector-spherical                    (c) Chris Veness 2014-2022  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Nvector, Dms } from '../latlon-nvector-spherical.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-nvector-spherical', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator
    const R = 6371e3;
    const π = Math.PI;
    const ε = Number.EPSILON;

    describe('@examples', function() { // correctness of jsdoc examples
        test('constructor',                 () => new LatLon(52.205, 0.119).toString().should.equal('52.2050°N, 000.1190°E'));
        test('toNvector',                   () => new LatLon(45, 45).toNvector().toString().should.equal('[0.500,0.500,0.707]'));
        test('greatCircle',                 () => new LatLon(53.3206, -1.7297).greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'));
        test('distanceTo',                  () => new LatLon(52.205, 0.119).distanceTo(new LatLon(48.857, 2.351)).toFixed().should.equal('404279'));
        test('initialBearingTo',            () => new LatLon(52.205, 0.119).initialBearingTo(new LatLon(48.857, 2.351)).toFixed(1).should.equal('156.2'));
        test('finalBearingTo',              () => new LatLon(52.205, 0.119).finalBearingTo(new LatLon(48.857, 2.351)).toFixed(1).should.equal('157.9'));
        test('midpointTo',                  () => new LatLon(52.205, 0.119).midpointTo(new LatLon(48.857, 2.351)).toString().should.equal('50.5363°N, 001.2746°E'));
        test('intermediatePointTo',         () => new LatLon(52.205, 0.119).intermediatePointTo(new LatLon(48.857, 2.351), 0.25).toString().should.equal('51.3721°N, 000.7073°E'));
        test('intermediatePointOnChordTo',  () => new LatLon(52.205, 0.119).intermediatePointOnChordTo(new LatLon(48.857, 2.351), 0.25).toString().should.equal('51.3723°N, 000.7072°E'));
        test('destinationPoint',            () => new LatLon(51.47788, -0.00147).destinationPoint(7794, 300.7).toString().should.equal('51.5136°N, 000.0983°W'));
        test('intersection',                () => LatLon.intersection(new LatLon(51.8853, 0.2545), 108.547, new LatLon(49.0034, 2.5735), 32.435).toString().should.equal('50.9078°N, 004.5084°E'));
        test('crossTrackDistanceTo',        () => new LatLon(53.2611, -0.7972).crossTrackDistanceTo(new LatLon(53.3206, -1.7297), new LatLon(53.1887, 0.1334)).toFixed(1).should.equal('-307.5'));
        test('alongTrackDistanceTo',        () => new LatLon(53.2611, -0.7972).alongTrackDistanceTo(new LatLon(53.3206, -1.7297), new LatLon(53.1887, 0.1334)).toFixed().should.equal('62331'));
        test('nearestPointOnSegment 1',     () => new LatLon(51.0, 1.9).nearestPointOnSegment(new LatLon(51.0, 1.0), new LatLon(51.0, 2.0)).toString().should.equal('51.0004°N, 001.9000°E'));
        test('nearestPointOnSegment 2',     () => new LatLon(51.0, 2.1).nearestPointOnSegment(new LatLon(51.0, 1.0), new LatLon(51.0, 2.0)).toString().should.equal('51.0000°N, 002.0000°E'));
        test('isWithinExtent t',            () => new LatLon(52, 1).isWithinExtent(new LatLon(51, 1), new LatLon(52, 2)).should.be.true);
        test('isWithinExtent f',            () => new LatLon(51, 0).isWithinExtent(new LatLon(51, 1), new LatLon(52, 2)).should.be.false);
        test('triangulate',                 () => LatLon.triangulate(new LatLon(50.7175, 1.65139), 333.3508, new LatLon(50.9250, 1.7094), 310.1414).toString().should.equal('51.1297°N, 001.3214°E'));
        test('trilaterate',                 () => LatLon.trilaterate(new LatLon(0, 0), 157e3, new LatLon(0, 1), 111e3, new LatLon(1, 0), 111e3).toString().should.equal('00.9985°N, 000.9986°E'));
        const bounds = [ new LatLon(45, 1), new LatLon(45, 2), new LatLon(46, 2), new LatLon(46, 1) ];
        test('isEnclosedBy',                () => new LatLon(45.1, 1.1).isEnclosedBy(bounds).should.be.true);
        test('areaOf',                      () => LatLon.areaOf([ new LatLon(0, 0), new LatLon(1, 0), new LatLon(0, 1) ]).toExponential(2).should.equal('6.18e+9'));
        test('centreOf',                    () => LatLon.centreOf([ new LatLon(0, 0), new LatLon(1, 0), new LatLon(1, 1), new LatLon(0, 1) ]).toString().should.equal('00.5000°N, 000.5000°E'));
        test('meanOf',                      () => LatLon.meanOf([ new LatLon(1, 1), new LatLon(4, 2), new LatLon(1, 3) ]).toString().should.equal('02.0001°N, 002.0000°E'));
        test('equals',                      () => new LatLon(52.205, 0.119).equals(new LatLon(52.205, 0.119)).should.be.true);
        const greenwich = new LatLon(51.47788, -0.00147);
        test('toString d',                  () => greenwich.toString().should.equal('51.4779°N, 000.0015°W'));
        test('toString dms',                () => greenwich.toString('dms', 2).should.equal('51°28′40.37″N, 000°00′05.29″W'));
        test('toString lat,lon',            () => greenwich.toString('n').split(',').should.deep.equal([ '51.4779', '-0.0015' ]));
    });

    describe('@examples (NvectorSpherical)', function() {
        test('constructor/toString', () => new Nvector(0.5000, 0.5000, 0.7071).toString().should.equal('[0.500,0.500,0.707]'));
        test('toLatLon',             () => new Nvector(0.5000, 0.5000, 0.7071).toLatLon().toString('d', 1).should.equal('45.0°N, 045.0°E'));
    });

    describe('constructor with strings', function() {
        test('distanceTo d',  () => new LatLon('52.205', '0.119').distanceTo(new LatLon('48.857', '2.351')).toFixed().should.equal('404279'));
    });

    describe('constructor fail', function() {
        test('non-numeric lat fail', () => should.Throw(function() { new LatLon('x', 0, 0); }, TypeError, 'invalid lat ‘x’'));
        test('non-numeric lon fail', () => should.Throw(function() { new LatLon(0, 'x', 0); }, TypeError, 'invalid lon ‘x’'));
    });

    describe('getters/setters', function() {
        const camb = new LatLon(0, 0);
        camb.lat = camb.latitude = '52° 12′ 18″ N';
        camb.lon = camb.lng = camb.longitude = '000° 07′ 08″ E';
        test('lat',                   () => camb.lat.should.equal(52.205));
        test('latitude',              () => camb.latitude.should.equal(52.205));
        test('lon',                   () => camb.lon.should.equal(0.119));
        test('lng',                   () => camb.lng.should.equal(0.119));
        test('longitude',             () => camb.longitude.should.equal(0.119));
        camb.lat = camb.latitude = 52.205;
        camb.lon = camb.lng = camb.longitude = 0.119;
        test('lat',                   () => camb.lat.should.equal(52.205));
        test('latitude',              () => camb.latitude.should.equal(52.205));
        test('lon',                   () => camb.lon.should.equal(0.119));
        test('lng',                   () => camb.lng.should.equal(0.119));
        test('longitude',             () => camb.longitude.should.equal(0.119));
        test('metresToKm',            () => (1/LatLon.metresToKm).should.equal(1000));
        test('metresToMiles',         () => (1/LatLon.metresToMiles).should.equal(1609.344));
        test('metresToNauticalMiles', () => (1/LatLon.metresToNauticalMiles).should.equal(1852));
    });

    describe('setters (fail)', function() {
        const camb = new LatLon(0, 0);
        test('lat',       () => should.Throw(function() { camb.lat = 'xxx'; }, TypeError, 'invalid lat ‘xxx’'));
        test('latitude',  () => should.Throw(function() { camb.latitude = 'xxx'; }, TypeError, 'invalid latitude ‘xxx’'));
        test('lon',       () => should.Throw(function() { camb.lon = 'xxx'; }, TypeError, 'invalid lon ‘xxx’'));
        test('lgn',       () => should.Throw(function() { camb.lng = 'xxx'; }, TypeError, 'invalid lng ‘xxx’'));
        test('longitude', () => should.Throw(function() { camb.longitude = 'xxx'; }, TypeError, 'invalid longitude ‘xxx’'));
    });

    describe('toString', function() {
        const btTower = new LatLon(51.521470, -0.138833);
        test('default', () => btTower.toString().should.equal('51.5215°N, 000.1388°W'));
        test('d,6',     () => btTower.toString('d', 6).should.equal('51.521470°N, 000.138833°W'));
        test('dm,4',    () => btTower.toString('dm', 4).should.equal('51°31.2882′N, 000°08.3300′W'));
        test('dms,2',   () => btTower.toString('dms', 2).should.equal('51°31′17.29″N, 000°08′19.80″W'));
        test('n',       () => btTower.toString('n').should.equal('51.5215,-0.1388'));
        test('n,6',     () => btTower.toString('n', 6).should.equal('51.521470,-0.138833'));
        test('bad fmt', () => should.Throw(function() { btTower.toString('x', 6); }, RangeError, 'invalid format ‘x’'));
    });

    describe('great circle', function() {
        test('great circle',      () => new LatLon(53.3206, -1.7297).greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'));
        test('gc from vector',    () => new LatLon(53.3206, -1.7297).toNvector().greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'));
    });

    describe('dist/brng/dest', function() {
        const cambg = new LatLon(52.205, 0.119), paris = new LatLon(48.857, 2.351);
        test('distance',           () => cambg.distanceTo(paris).toPrecision(4).should.equal('4.043e+5'));
        test('distance (miles)',   () => cambg.distanceTo(paris, 3959).toPrecision(4).should.equal('251.2'));
        test('initial bearing',    () => cambg.initialBearingTo(paris).toFixed(1).should.equal('156.2'));
        test('final bearing',      () => cambg.finalBearingTo(paris).toFixed(1).should.equal('157.9'));
        test('initial brng coinc', () => cambg.initialBearingTo(cambg).should.be.NaN);
        test('final brng coinc',   () => cambg.finalBearingTo(cambg).should.be.NaN);
        test('bearing (reverse)',  () => paris.initialBearingTo(cambg).toFixed(1).should.equal('337.9'));
        test('midpoint',           () => cambg.midpointTo(paris).toString().should.equal('50.5363°N, 001.2746°E'));
        test('int.point',          () => cambg.intermediatePointTo(paris, 0.25).toString().should.equal('51.3721°N, 000.7073°E'));
        test('int.point coinc',    () => cambg.intermediatePointTo(cambg, 0.25).toString().should.equal('52.2050°N, 000.1190°E'));
        test('int.pt',             () => new LatLon(90, 0).intermediatePointTo(new LatLon(0, 90), 0.75).toString().should.equal('22.5000°N, 090.0000°E'));
        test('int.pt chord',       () => new LatLon(90, 0).intermediatePointOnChordTo(new LatLon(0, 90), 0.75).toString().should.equal('18.4349°N, 090.0000°E'));
        const greenwich = new LatLon(51.47788, -0.00147), dist = 7794, brng = 300.7;
        test('destination',        () => greenwich.destinationPoint(dist, brng).toString().should.equal('51.5136°N, 000.0983°W'));
        test('destination r',      () => greenwich.destinationPoint(dist, brng, 6371e3).toString().should.equal('51.5136°N, 000.0983°W'));
    });

    describe('dist/brng/dest fails', function() {
        const cambg = new LatLon(52.205, 0.119), paris = new LatLon(48.857, 2.351);
        test('distance (fail p)',   () => should.Throw(function() { cambg.distanceTo({}); }, TypeError, 'invalid point ‘[object Object]’'));
        test('distance (fail p)',   () => should.Throw(function() { cambg.distanceTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('distance (fail r)',   () => should.Throw(function() { cambg.distanceTo(paris, 'xxx'); }, TypeError, 'invalid radius ‘xxx’'));
        test('init brng (fail)',    () => should.Throw(function() { cambg.initialBearingTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('final brng (fail)',   () => should.Throw(function() { cambg.finalBearingTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('midpoint (fail)',     () => should.Throw(function() { cambg.midpointTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('int.point (fail)',    () => should.Throw(function() { cambg.intermediatePointTo('paris', 0.5); }, TypeError, 'invalid point ‘paris’'));
        test('int.point.ch (fail)', () => should.Throw(function() { cambg.intermediatePointOnChordTo('paris', 0.5); }, TypeError, 'invalid point ‘paris’'));
    });

    describe('intersection', function() {
        const N = 0, E = 90, S = 180, W = 270;
        test('toward 1,1 N,E nearest',        () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), E).toString().should.equal('00.9998°N, 001.0000°E'));
        test('toward 1,1 E,N nearest',        () => LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), N).toString().should.equal('00.9998°N, 001.0000°E'));
        test('toward 1,1 N,E antipodal',      () => LatLon.intersection(new LatLon(2, 1), N, new LatLon(1, 0), E).toString().should.equal('00.9998°S, 179.0000°W'));
        test('toward/away 1,1 N,W antipodal', () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), W).toString().should.equal('00.9998°S, 179.0000°W'));
        test('toward/away 1,1 W,N antipodal', () => LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), N).toString().should.equal('00.9998°S, 179.0000°W'));
        test('toward/away 1,1 S,E antipodal', () => LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), E).toString().should.equal('00.9998°S, 179.0000°W'));
        test('toward/away 1,1 E,S antipodal', () => LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), S).toString().should.equal('00.9998°S, 179.0000°W'));
        test('away 1,1 S,W antipodal',        () => LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), W).toString().should.equal('00.9998°S, 179.0000°W'));
        test('away 1,1 W,S antipodal',        () => LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), S).toString().should.equal('00.9998°S, 179.0000°W'));

        test('1E/90E N,E antipodal',          () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 90), E).toString().should.equal('00.0175°S, 179.0000°W'));
        test('1E/90E N,E nearest',            () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 92), E).toString().should.equal('00.0175°N, 179.0000°W'));

        test('brng+end 1a',                   () => LatLon.intersection(new LatLon(1, 0), new LatLon(1, 3), new LatLon(2, 2), S).toString().should.equal('01.0003°N, 002.0000°E'));
        test('brng+end 1b',                   () => LatLon.intersection(new LatLon(2, 2), S, new LatLon(1, 0), new LatLon(1, 3)).toString().should.equal('01.0003°N, 002.0000°E'));
        test('brng+end 2a',                   () => LatLon.intersection(new LatLon(1, 0), new LatLon(1, 3), new LatLon(2, 2), N).toString().should.equal('01.0003°S, 178.0000°W'));
        test('brng+end 2b',                   () => LatLon.intersection(new LatLon(2, 2), N, new LatLon(1, 0), new LatLon(1, 3)).toString().should.equal('01.0003°S, 178.0000°W'));

        test('end+end',                       () => LatLon.intersection(new LatLon(1, 1), new LatLon(2, 2), new LatLon(1, 4), new LatLon(2, 3)).toString().should.equal('02.4994°N, 002.5000°E'));

        test('coincident',                    () => LatLon.intersection(new LatLon(1, 1), N, new LatLon(1, 1), E).toString().should.equal('01.0000°N, 001.0000°E'));

        const stn = new LatLon(51.8853, 0.2545), cdg = new LatLon(49.0034, 2.5735);
        test('stn-cdg-bxl',                   () => LatLon.intersection(stn, 108.547, cdg, 32.435).toString().should.equal('50.9078°N, 004.5084°E'));

        test('bad point 1',                   () => should.Throw(function() { LatLon.intersection(false, N, new LatLon(1, 0), E); }, TypeError, 'invalid path1start ‘false’'));
        test('bad point 2',                   () => should.Throw(function() { LatLon.intersection(new LatLon(0, 1), N, false, E); }, TypeError, 'invalid path2start ‘false’'));
        test('int’n (fail 1)',                () => should.Throw(function() { LatLon.intersection(null, 'n', null, 's'); }, TypeError, 'invalid path1start ‘null’'));
        test('int’n (fail 2)',                () => should.Throw(function() { LatLon.intersection(stn, 'n', null, 's'); }, TypeError, 'invalid path2start ‘null’'));
        test('int’n (fail 3)',                () => should.Throw(function() { LatLon.intersection(stn, 'n', cdg, 's'); }, TypeError, 'invalid path1brngEnd ‘n’'));
        test('int’n (fail 4)',                () => should.Throw(function() { LatLon.intersection(stn, 0, cdg, 's'); }, TypeError, 'invalid path2brngEnd ‘s’'));
        test('rounding errors',               () => LatLon.intersection(new LatLon(51, 0), 120, new LatLon(50, 0), 60).toString().should.equal('50.4921°N, 001.3612°E'));
    });

    describe('cross-track / along-track', function() {
        test('cross-track end-p',   () => new LatLon(10, 1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+6'));
        test('cross-track brng',    () => new LatLon(10, 0).crossTrackDistanceTo(new LatLon(0, 0), 90).toPrecision(4).should.equal('-1.112e+6'));
        test('cross-track -',       () => new LatLon(10, 0).crossTrackDistanceTo(new LatLon(0, 0), 270).toPrecision(4).should.equal('1.112e+6'));

        const bradwell = new LatLon(53.3206, -1.7297), dunham = new LatLon(53.2611, -0.7972), partney = new LatLon(53.1887,  0.1334);
        test('cross-track',          () => dunham.crossTrackDistanceTo(bradwell, partney).toPrecision(4).should.equal('-307.5'));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(10, 1).crossTrackDistanceTo(null, new LatLon(0, 2)); }, TypeError, 'invalid pathStart ‘null’'));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(10, 1).crossTrackDistanceTo(new LatLon(0, 0), 'x'); }, TypeError, 'invalid pathBrngEnd ‘x’'));
        test('along-track end-p',    () => dunham.alongTrackDistanceTo(bradwell, partney).toPrecision(4).should.equal('6.233e+4'));
        test('along-track brng',     () => dunham.alongTrackDistanceTo(bradwell, 96.0).toPrecision(4).should.equal('6.233e+4'));

        test('cross-track NE',       () => new LatLon(1, 1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'));
        test('cross-track SE',       () => new LatLon(-1,  1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('cross-track SW?',      () => new LatLon(-1, -1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('cross-track NW?',      () => new LatLon( 1, -1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5')); // eslint-disable-line space-in-parens
        test('along-track NE',       () => new LatLon( 1,  1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5')); // eslint-disable-line space-in-parens
        test('along-track SE',       () => new LatLon(-1,  1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('along-track SW',       () => new LatLon(-1, -1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'));
        test('along-track NW',       () => new LatLon( 1, -1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5')); // eslint-disable-line space-in-parens

        test('cross-track brng w-e', () => new LatLon(1, 0).crossTrackDistanceTo(new LatLon(0, 0), 90).toPrecision(4).should.equal('-1.112e+5'));
        test('cross-track brng e-w', () => new LatLon(1, 0).crossTrackDistanceTo(new LatLon(0, 0), 270).toPrecision(4).should.equal('1.112e+5'));

        test('cross-track coinc',    () => new LatLon(10, 0).crossTrackDistanceTo(new LatLon(10, 0), 0).should.equal(0));
        test('along-track coinc',    () => new LatLon(10, 0).crossTrackDistanceTo(new LatLon(10, 0), 0).should.equal(0));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).crossTrackDistanceTo(null, 0); }, TypeError, 'invalid pathStart ‘null’'));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).crossTrackDistanceTo(new LatLon(0, 0), 'x'); }, TypeError, 'invalid pathBrngEnd ‘x’'));
        test('along-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).alongTrackDistanceTo(null, 0); }, TypeError, 'invalid pathStart ‘null’'));
        test('along-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).alongTrackDistanceTo(new LatLon(0, 0), 'x'); }, TypeError, 'invalid pathBrngEnd ‘x’'));
    });

    describe('nearest point', function() {
        test('nearestPointOnSegment antip', () => new LatLon(10, -140).nearestPointOnSegment(new LatLon(0, 20), new LatLon(0, 40)).toString().should.equal('00.0000°N, 020.0000°E'));
    });

    describe('within extent', function() {
        test('isWithinExtent coincident',   () => new LatLon(51, 0).isWithinExtent(new LatLon(51, 1), new LatLon(51, 1)).should.be.false);
    });

    describe('triangulate', function() {
        // TODO
    });

    describe('trilaterate', function() { // http://gis.stackexchange.com/a/415/41129
        const p1 = new LatLon(37.418436, -121.963477), d1 = 265.710701754;
        const p2 = new LatLon(37.417243, -121.961889), d2 = 234.592423446;
        const p3 = new LatLon(37.418692, -121.960194), d3 = 54.8954278262;
        test('gis.stackexchange', () => LatLon.trilaterate(p1, d1, p2, d2, p3, d3).toString('d', 6).should.equal('37.419078°N, 121.960579°W'));
        test('coincident', () => should.equal(LatLon.trilaterate(p1, d1, p1, d2, p1, d3), null));
    });

    describe('area / centre / enclosed (polygon-based)', function() {
        const polyTriangle = [ new LatLon(1, 1), new LatLon(2, 1), new LatLon(1, 2) ];
        const polySquare = [ new LatLon(1, 1), new LatLon(2, 1), new LatLon(2, 2), new LatLon(1, 2) ];
        const polySquareClosed = [ new LatLon(1, 1), new LatLon(2, 1), new LatLon(2, 2), new LatLon(1, 2), new LatLon(1, 1) ];
        const polyOctant = [ new LatLon(0, ε), new LatLon(90, 0), new LatLon(0, 90-ε) ];
        const polyOctantS = [ new LatLon(-ε, ε), new LatLon(90, 0), new LatLon(-ε, 90-ε) ];
        const polyQuadrantNE = [ new LatLon(ε, ε), new LatLon(90, ε), new LatLon(ε, 180-ε), new LatLon(ε, 90) ];
        const polyHemiE = [ new LatLon(ε, ε), new LatLon(90-ε, 0), new LatLon(90-ε, 180), new LatLon(ε, 180), new LatLon(-ε, 180), new LatLon(-90+ε, 180), new LatLon(-90+ε, 0), new LatLon(-ε, ε) ];
        const polyGc = [ new LatLon(10, 0), new LatLon(10, 90), new LatLon(0, 45) ];
        const polyPole = [ new LatLon(89, 0), new LatLon(89, 120), new LatLon(89, -120) ];
        const polyPoleEdge = [ new LatLon(85, 90), new LatLon(85, 0), new LatLon(85, -90) ];
        const polyConcave = [ new LatLon(1, 1), new LatLon(5, 1), new LatLon(5, 3), new LatLon(1, 3), new LatLon(3, 2) ];
        const polySlice = [ new LatLon(ε, 0), new LatLon(90-ε, 0.5), new LatLon(ε, 1) ];

        test('triangle area',         () => LatLon.areaOf(polyTriangle).toFixed(0).should.equal('6181527888'));
        test('triangle area radius',  () => LatLon.areaOf(polyTriangle, 6371e3).toFixed(0).should.equal('6181527888'));
        test('triangle area closed',  () => LatLon.areaOf(polyTriangle.concat(polyTriangle[0])).toFixed(0).should.equal('6181527888'));
        test('square cw area',        () => LatLon.areaOf(polySquare).toFixed(0).should.equal('12360230987'));
        test('square ccw area',       () => LatLon.areaOf(polySquare.reverse()).toFixed(0).should.equal('12360230987'));
        test('octant area',           () => LatLon.areaOf(polyOctant).should.equal(π*R*R/2));
        test('super-octant area',     () => LatLon.areaOf(polyOctantS).should.equal(π*R*R/2));
        // TODO: fails: test('quadrant area', () => LatLon.areaOf(polyQuadrantNE).should.equal(π*R*R));
        test('hemisphere area',       () => LatLon.areaOf(polyHemiE).toFixed(1).should.equal((2*π*R*R).toFixed(1)));
        test('pole area',             () => LatLon.areaOf(polyPole).toFixed(0).should.equal('16063139192'));
        test('concave area cw',       () => LatLon.areaOf(polyConcave).toFixed(0).should.equal('74042699236'));
        test('concave area ccw',      () => LatLon.areaOf(polyConcave.reverse()).toFixed(0).should.equal('74042699236'));

        test('centreOf triangle',     () => LatLon.centreOf(polyTriangle).toString().should.equal('01.3334°N, 001.3334°E'));
        test('centerOf (en-us)',      () => LatLon.centerOf(polyTriangle).toString().should.equal('01.3334°N, 001.3334°E'));
        test('centreOf square cw',    () => LatLon.centreOf(polySquare).toString().should.equal('01.5000°N, 001.5000°E'));
        test('centreOf square ccw',   () => LatLon.centreOf(polySquare.reverse()).toString().should.equal('01.5000°N, 001.5000°E'));
        test('centreOf slice',        () => LatLon.centreOf(polySlice).toString().should.equal('32.4820°N, 000.5000°E'));
        test('centreOf octant',       () => LatLon.centreOf(polyOctant).toString().should.equal('35.2644°N, 045.0000°E'));
        test('centreOf quadrant',     () => LatLon.centreOf(polyQuadrantNE).toString().should.equal('45.0000°N, 090.0000°E'));

        test('square enclosed y',     () => new LatLon(1.5, 1.5).isEnclosedBy(polySquare).should.be.true);
        test('square enclosed n',     () => new LatLon(2.5, 2.5).isEnclosedBy(polySquare).should.be.false);
        test('square enclosed C y',   () => new LatLon(1.5, 1.5).isEnclosedBy(polySquareClosed).should.be.true);
        test('square enclosed C n',   () => new LatLon(2.5, 2.5).isEnclosedBy(polySquareClosed).should.be.false);
        test('hemisphere enclosed y', () => new LatLon(45, 1).isEnclosedBy(polyHemiE).should.be.true);
        // TODO: fails: test('hemisphere enclosed n', () => new LatLon(45, -1).isEnclosedBy(polyHemiE).should.be.false);
        test('gc enclosed y',         () => new LatLon(14, 45).isEnclosedBy(polyGc).should.be.true);
        test('gc enclosed n',         () => new LatLon(15, 45).isEnclosedBy(polyGc).should.be.false);
        test('pole enclosed',         () => new LatLon(90, 0).isEnclosedBy(polyPole).should.be.true);
        test('polar edge enclosed',   () => new LatLon(90, 0).isEnclosedBy(polyPoleEdge).should.be.true);
        test('concave enclosed y',    () => new LatLon(4, 2).isEnclosedBy(polyConcave).should.be.true);
        test('concave enclosed n',    () => new LatLon(2, 2).isEnclosedBy(polyConcave).should.be.false);
        test('enclosed (fail 1)',     () => should.Throw(function() { new LatLon(1, 1).isEnclosedBy('a string'); }, TypeError, 'isEnclosedBy: polygon must be Array (not String)'));
        test('enclosed (fail 2)',     () => should.Throw(function() { new LatLon(1, 1).isEnclosedBy([ 'a string' ]); }, TypeError, 'isEnclosedBy: polygon must be Array of LatLon (not String)'));
        test('enclosed by line',      () => new LatLon(1, 1).isEnclosedBy([ new LatLon(1, 1), new LatLon(2, 2) ]).should.be.false);
    });

    describe('Ed Williams', function() { // www.edwilliams.org/avform.htm
        const lax = new LatLon(Dms.parse('33° 57′N'), Dms.parse('118° 24′W'));
        const jfk = new LatLon(Dms.parse('40° 38′N'), Dms.parse('073° 47′W'));
        const r = 180*60/π; // earth radius in nautical miles
        test('distance nm',   () => lax.distanceTo(jfk, r).toPrecision(4).should.equal('2144'));
        test('bearing',       () => lax.initialBearingTo(jfk).toPrecision(2).should.equal('66'));
        test('intermediate',  () => lax.intermediatePointTo(jfk, 100/2144).toString('dm', 0).should.equal('34°37′N, 116°33′W'));
        const d = new LatLon(Dms.parse('34:30N'), Dms.parse('116:30W'));
        test('cross-track',   () => d.crossTrackDistanceTo(lax, jfk, r).toPrecision(5).should.equal('7.4523'));
        test('along-track',   () => d.alongTrackDistanceTo(lax, jfk, r).toPrecision(5).should.equal('99.588'));
        test('intermediate',  () => lax.intermediatePointTo(jfk, 0.4).toString('dm', 3).should.equal('38°40.167′N, 101°37.570′W'));
        const reo = new LatLon(Dms.parse('42.600N'), Dms.parse('117.866W'));
        const bke = new LatLon(Dms.parse('44.840N'), Dms.parse('117.806W'));
        test('intersection',  () => LatLon.intersection(reo, 51, bke, 137).toString('d', 3).should.equal('43.572°N, 116.189°W'));
    });

    describe('misc', function() {
        test('equals true',  () => new LatLon(52.205, 0.119).equals(new LatLon(52.205, 0.119)).should.be.true);
        test('equals false', () => new LatLon(52.206, 0.119).equals(new LatLon(52.205, 0.119)).should.be.false);
        test('equals (fail)', () => should.Throw(function() { new LatLon(52.205, 0.119).equals('cambg'); }, TypeError, 'invalid point ‘cambg’'));
        test('toGeoJSON',    () => new LatLon(52.205, 0.119).toGeoJSON().should.deep.equal({ type: 'Point', coordinates: [ 0.119, 52.205 ] }));
    });
});


/*
 * nvector.readthedocs.io/en/latest/src/overview.html#unit-tests
 */
describe('navlab nvector examples (spherical)', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('Example 5: Surface distance', function() {
        const a = new LatLon(88, 0);
        const b = new LatLon(89, -170);
        const dist = a.distanceTo(b); // 332.5 km
        test('dist', function() { dist.toFixed().should.equal('332456'); });
    });
    describe('Example 6: Interpolated position', function() {
        const a = new LatLon(89, 0);
        const b = new LatLon(89, 180);
        const i = a.intermediatePointOnChordTo(b, (16-10)/(20-10));
        test('int', function() { i.toString('d', 7).should.equal('89.7999805°N, 180.0000000°E'); });
    });
    describe('Example 7: Mean position', function() {
        const points = [
            new LatLon(90,   0),
            new LatLon(60,  10),
            new LatLon(50, -20),
        ];
        const mean = LatLon.meanOf(points); // 67.2362°N, 006.9175°W
        test('mean', function() { mean.toString().should.equal('67.2362°N, 006.9175°W'); });
    });
    describe('Example 8: A and azimuth/distance to B', function() {
        const a = new LatLon(80, -90);
        const b = a.destinationPoint(1000, 200); // 79.9915°N, 090.0177°W
        test('destination', function() { b.toString().should.equal('79.9915°N, 090.0177°W'); });
    });
    describe('Example 9: Intersection of two paths', function() {
        const a1 = new LatLon(10, 20);
        const a2 = new LatLon(30, 40);
        const b1 = new LatLon(50, 60);
        const b2 = new LatLon(70, 80);
        const c = LatLon.intersection(a1, a2, b1, b2); // 40.3186°N, 055.9019°E
        test('intersection', function() { c.toString().should.equal('40.3186°N, 055.9019°E'); });
    });
    describe('Example 10: Cross track distance', function() {
        const a1 = new LatLon(0, 0);
        const a2 = new LatLon(10, 0);
        const b = new LatLon(1, 0.1);
        const c = b.crossTrackDistanceTo(a1, a2); // 11.12 km
        test('intersection', function() { c.toFixed().should.equal('11118'); });
    });
});
