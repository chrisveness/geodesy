/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - latlon-spherical                            (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Dms } from '../latlon-spherical.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-spherical', function() {
    const test = it; // just an alias
    const R = 6371e3;
    const π = Math.PI;
    const ε = Number.EPSILON;

    Dms.separator = ''; // tests are easier without any DMS separator

    describe('@examples', function() {
        test('constructor',           () => new LatLon(52.205, 0.119).toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p1',              () => LatLon.parse(52.205, 0.119).toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p2',              () => LatLon.parse('52.205', '0.119').toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p3',              () => LatLon.parse('52.205, 0.119').toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p4',              () => LatLon.parse('52°12′18.0″N', '000°07′08.4″E').toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p5',              () => LatLon.parse('52°12′18.0″N, 000°07′08.4″E').toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p6',              () => LatLon.parse({ lat: 52.205, lon: 0.119 }).toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p7',              () => LatLon.parse({ lat: '52°12′18.0″N', lng: '000°07′08.4″E' }).toString().should.equal('52.2050°N, 000.1190°E'));
        test('parse p8',              () => LatLon.parse({ type: 'Point', coordinates: [ 0.119, 52.205 ] }).toString().should.equal('52.2050°N, 000.1190°E'));
        test('distanceTo d',          () => new LatLon(52.205, 0.119).distanceTo(new LatLon(48.857, 2.351)).toFixed().should.equal('404279'));
        test('distanceTo m',          () => new LatLon(52.205, 0.119).distanceTo(new LatLon(48.857, 2.351), 3959).toFixed(1).should.equal('251.2'));
        test('initialBearingTo',      () => new LatLon(52.205, 0.119).initialBearingTo(new LatLon(48.857, 2.351)).toFixed(1).should.equal('156.2'));
        test('finalBearingTo',        () => new LatLon(52.205, 0.119).finalBearingTo(new LatLon(48.857, 2.351)).toFixed(1).should.equal('157.9'));
        test('midpointTo',            () => new LatLon(52.205, 0.119).midpointTo(new LatLon(48.857, 2.351)).toString().should.equal('50.5363°N, 001.2746°E'));
        test('intermediatePointTo',   () => new LatLon(52.205, 0.119).intermediatePointTo(new LatLon(48.857, 2.351), 0.25).toString().should.equal('51.3721°N, 000.7073°E'));
        test('destinationPoint',      () => new LatLon(51.47788, -0.00147).destinationPoint(7794, 300.7).toString().should.equal('51.5136°N, 000.0983°W'));
        test('intersection',          () => LatLon.intersection(new LatLon(51.8853, 0.2545), 108.547, new LatLon(49.0034, 2.5735), 32.435).toString().should.equal('50.9078°N, 004.5084°E'));
        test('crossTrackDistanceTo',  () => new LatLon(53.2611, -0.7972).crossTrackDistanceTo(new LatLon(53.3206, -1.7297), new LatLon(53.1887, 0.1334)).toFixed(1).should.equal('-307.5'));
        test('alongTrackDistanceTo',  () => new LatLon(53.2611, -0.7972).alongTrackDistanceTo(new LatLon(53.3206, -1.7297), new LatLon(53.1887, 0.1334)).toFixed().should.equal('62331'));
        test('rhumbDistanceTo',       () => new LatLon(51.127, 1.338).rhumbDistanceTo(new LatLon(50.964, 1.853)).toFixed().should.equal('40308'));
        test('rhumbBearingTo',        () => new LatLon(51.127, 1.338).rhumbBearingTo(new LatLon(50.964, 1.853)).toFixed(1).should.equal('116.7'));
        test('rhumbDestinationPoint', () => new LatLon(51.127, 1.338).rhumbDestinationPoint(40300, 116.7).toString().should.equal('50.9642°N, 001.8530°E'));
        test('rhumbMidpointTo',       () => new LatLon(51.127, 1.338).rhumbMidpointTo(new LatLon(50.964, 1.853)).toString().should.equal('51.0455°N, 001.5957°E'));
        test('areaOf',                () => LatLon.areaOf([ new LatLon(0, 0), new LatLon(1, 0), new LatLon(0, 1) ]).toExponential(2).should.equal('6.18e+9'));
        test('equals',                () => new LatLon(52.205, 0.119).equals(new LatLon(52.205, 0.119)).should.be.true);
        const greenwich = new LatLon(51.47788, -0.00147);
        test('toString d',            () => greenwich.toString().should.equal('51.4779°N, 000.0015°W'));
        test('toString dms',          () => greenwich.toString('dms', 2).should.equal('51°28′40.37″N, 000°00′05.29″W'));
        test('toString lat,lon',      () => greenwich.toString('n').split(',').should.deep.equal([ '51.4779', '-0.0015' ]));
    });

    describe('constructor with strings', function() {
        test('distanceTo d',  () => new LatLon('52.205', '0.119').distanceTo(new LatLon('48.857', '2.351')).toFixed().should.equal('404279'));
    });

    describe('constructor fail', function() {
        test('non-numeric lat fail', () => should.Throw(function() { new LatLon('x', 0, 0); }, TypeError, 'invalid lat ‘x’'));
        test('non-numeric lon fail', () => should.Throw(function() { new LatLon(0, 'x', 0); }, TypeError, 'invalid lon ‘x’'));
    });

    describe('parse fail', function() {
        test('empty',             () => should.Throw(function() { LatLon.parse(); }, TypeError, 'invalid (empty) point'));
        test('single arg num',    () => should.Throw(function() { LatLon.parse(1); }, TypeError, 'invalid point ‘1’'));
        test('invalid comma arg', () => should.Throw(function() { LatLon.parse('cam', 'bridge'); }, TypeError, 'invalid point ‘cam,bridge’'));
        test('single arg str',    () => should.Throw(function() { LatLon.parse('cambridge'); }, TypeError, 'invalid point ‘cambridge’'));
        test('invalid object 1',  () => should.Throw(function() { LatLon.parse({ y: 51.47788, x: -0.00147 }); }, TypeError, 'invalid point ‘{"y":51.47788,"x":-0.00147}’'));
        test('invalid object 2',  () => should.Throw(function() { LatLon.parse({ lat: 'y', lon: 'x' }); }, TypeError, 'invalid point ‘{"lat":"y","lon":"x"}’'));
        test('null 1',            () => should.Throw(function() { LatLon.parse(null); }, TypeError, 'invalid (null) point'));
        test('null 2',            () => should.Throw(function() { LatLon.parse(null, null); }, TypeError, 'invalid (null) point'));
        test('null 3',            () => should.Throw(function() { LatLon.parse(1.23, null); }, TypeError, 'invalid (null) point'));
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

    describe('alternate point formats', function() {
        const cambg = LatLon.parse({ lat: 52.205, lon: 0.119 });
        test('distance {lat,lon}',            () => cambg.distanceTo({ lat: 48.857, lon: 2.351 }).toPrecision(4).should.equal('4.043e+5'));
        test('distance {lat,lng}',            () => cambg.distanceTo({ lat: 48.857, lng: 2.351 }).toPrecision(4).should.equal('4.043e+5'));
        test('distance {latitude,longitude}', () => cambg.distanceTo({ latitude: 48.857, longitude: 2.351 }).toPrecision(4).should.equal('4.043e+5'));
        test('distance GeoJSON',              () => cambg.distanceTo({ type: 'Point', coordinates: [ 2.351, 48.857 ] }).toPrecision(4).should.equal('4.043e+5'));
        test('distance {x,y} fails',          () => should.Throw(function() { cambg.distanceTo(({ x: 48.857, y: 2.351 })); }, TypeError, 'invalid point ‘{"x":48.857,"y":2.351}’'));
        test('distance "d"',                  () => cambg.distanceTo('48.857, 2.351').toPrecision(4).should.equal('4.043e+5'));
        test('distance "dms"',                () => cambg.distanceTo('48°51′25.2″N, 002°21′03.6″E').toPrecision(4).should.equal('4.043e+5'));
        test('object (fail)',                 () => should.Throw(function() { cambg.distanceTo({ x: 48.857, y: 2.351 }); }, TypeError, 'invalid point ‘{"x":48.857,"y":2.351}’'));
        test('string (fail)',                 () => should.Throw(function() { cambg.distanceTo('paris'); }, TypeError, 'invalid point ‘paris’'));
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
        const greenwich = new LatLon(51.47788, -0.00147), dist = 7794, brng = 300.7;
        test('destination',        () => greenwich.destinationPoint(dist, brng).toString().should.equal('51.5136°N, 000.0983°W'));
        test('destination r',      () => greenwich.destinationPoint(dist, brng, 6371e3).toString().should.equal('51.5136°N, 000.0983°W'));
    });

    describe('dist/brng/dest fails', function() {
        const cambg = new LatLon(52.205, 0.119), paris = new LatLon(48.857, 2.351);
        test('distance (fail p)',  () => should.Throw(function() { cambg.distanceTo({}); }, TypeError, 'invalid point ‘{}’'));
        test('distance (fail p)',  () => should.Throw(function() { cambg.distanceTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('distance (fail r)',  () => should.Throw(function() { cambg.distanceTo(paris, 'xxx'); }, TypeError, 'invalid radius ‘xxx’'));
        test('init brng (fail)',   () => should.Throw(function() { cambg.initialBearingTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('final brng (fail)',  () => should.Throw(function() { cambg.finalBearingTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('midpoint (fail)',    () => should.Throw(function() { cambg.midpointTo('paris'); }, TypeError, 'invalid point ‘paris’'));
        test('int.point (fail)',   () => should.Throw(function() { cambg.intermediatePointTo('paris', 0.5); }, TypeError, 'invalid point ‘paris’'));
        test('dest’n (fail dist)', () => should.Throw(function() { cambg.destinationPoint('far away', 0); }, TypeError, 'invalid distance ‘far away’'));
        test('dest’n (fail brng)', () => should.Throw(function() { cambg.destinationPoint(99, 'over there'); }, TypeError, 'invalid bearing ‘over there’'));
        test('dest’n (fail rad)',  () => should.Throw(function() { cambg.destinationPoint(99, 0, 'huge'); }, TypeError, 'invalid radius ‘huge’'));
    });

    describe('intersection', function() {
        const N = 0, E = 90, S = 180, W = 270;
        test('toward 1,1 N,E nearest',        () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), E).toString().should.equal('00.9998°N, 001.0000°E'));
        test('toward 1,1 E,N nearest',        () => LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), N).toString().should.equal('00.9998°N, 001.0000°E'));
        test('toward 1,1 N,E antipodal',      () => should.equal(LatLon.intersection(new LatLon(2, 1), N, new LatLon(1, 0), E), null));
        test('toward/away 1,1 N,W antipodal', () => should.equal(LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), W), null));
        test('toward/away 1,1 W,N antipodal', () => should.equal(LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), N), null));
        test('toward/away 1,1 S,E antipodal', () => should.equal(LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), E), null));
        test('toward/away 1,1 E,S antipodal', () => should.equal(LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), S), null));
        test('away 1,1 S,W antipodal',        () => LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), W).toString().should.equal('00.9998°S, 179.0000°W'));
        test('away 1,1 W,S antipodal',        () => LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), S).toString().should.equal('00.9998°S, 179.0000°W'));

        test('1E/90E N,E antipodal',          () => should.equal(LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 90), E), null));
        test('1E/90E N,E nearest',            () => LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 92), E).toString().should.equal('00.0175°N, 179.0000°W'));

        test('brng+end 1a',                   () => should.Throw(function() { LatLon.intersection(new LatLon(1, 0), new LatLon(1, 3), new LatLon(2, 2), S); }, TypeError, 'invalid brng1 ‘01.0000°N, 003.0000°E’'));
        test('brng+end 1b',                   () => should.Throw(function() { LatLon.intersection(new LatLon(2, 2), S, new LatLon(1, 0), new LatLon(1, 3)); }, TypeError, 'invalid brng2 ‘01.0000°N, 003.0000°E’'));

        test('coincident',                    () => LatLon.intersection(new LatLon(1, 1), N, new LatLon(1, 1), E).toString().should.equal('01.0000°N, 001.0000°E'));

        const stn = new LatLon(51.8853, 0.2545), cdg = new LatLon(49.0034, 2.5735);
        test('stn-cdg-bxl',                   () => LatLon.intersection(stn, 108.547, cdg, 32.435).toString().should.equal('50.9078°N, 004.5084°E'));

        test('bad point 1',                   () => should.Throw(function() { LatLon.intersection(false, N, new LatLon(1, 0), E); }, TypeError, 'invalid point ‘false’'));
        test('bad point 2',                   () => should.Throw(function() { LatLon.intersection(new LatLon(0, 1), N, false, E); }, TypeError, 'invalid point ‘false’'));
        test('int’n (fail 1)',                () => should.Throw(function() { LatLon.intersection(null, 'n', null, 's'); }, TypeError, 'invalid (null) point'));
        test('int’n (fail 2)',                () => should.Throw(function() { LatLon.intersection(stn, 'n', null, 's'); }, TypeError, 'invalid (null) point'));
        test('int’n (fail 3)',                () => should.Throw(function() { LatLon.intersection(stn, 'n', cdg, 's'); }, TypeError, 'invalid brng1 ‘n’'));
        test('int’n (fail 4)',                () => should.Throw(function() { LatLon.intersection(stn, 0, cdg, 's'); }, TypeError, 'invalid brng2 ‘s’'));
        test('rounding errors',               () => LatLon.intersection(new LatLon(51, 0), 120, new LatLon(50, 0), 60).toString().should.equal('50.4921°N, 001.3612°E'));
        test('rounding: φ3 requires clamp #71', () => LatLon.intersection(new LatLon(-77.6966041375563, 18.2812500000000), 179.99999999999994, new LatLon(89, 180), 180).toString().should.equal('90.0000°S, 163.9902°W'));
    });

    describe('cross-track / along-track', function() {
        test('cross-track p',      () => new LatLon(10, 1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+6'));

        const bradwell = new LatLon(53.3206, -1.7297), dunham = new LatLon(53.2611, -0.7972), partney = new LatLon(53.1887,  0.1334);
        test('cross-track',        () => dunham.crossTrackDistanceTo(bradwell, partney).toPrecision(4).should.equal('-307.5'));
        test('cross-track (fail)', () => should.Throw(function() { new LatLon(10, 1).crossTrackDistanceTo(null, new LatLon(0, 2)); }, TypeError, 'invalid (null) point'));
        test('cross-track (fail)', () => should.Throw(function() { new LatLon(10, 1).crossTrackDistanceTo(new LatLon(0, 0), null); }, TypeError, 'invalid (null) point'));
        test('along-track',        () => dunham.alongTrackDistanceTo(bradwell, partney).toPrecision(4).should.equal('6.233e+4'));

        test('cross-track NE',       () => new LatLon(1, 1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'));
        test('cross-track SE',       () => new LatLon(-1,  1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('cross-track SW?',      () => new LatLon(-1, -1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('cross-track NW?',      () => new LatLon( 1, -1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5')); // eslint-disable-line space-in-parens

        test('along-track NE',       () => new LatLon( 1,  1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5')); // eslint-disable-line space-in-parens
        test('along-track SE',       () => new LatLon(-1,  1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'));
        test('along-track SW',       () => new LatLon(-1, -1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'));
        test('along-track NW',       () => new LatLon( 1, -1).alongTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5')); // eslint-disable-line space-in-parens

        test('cross-track coinc',    () => new LatLon(10, 0).crossTrackDistanceTo(new LatLon(10, 0), new LatLon(0, 2)).should.equal(0));
        test('along-track coinc',    () => new LatLon(10, 0).alongTrackDistanceTo(new LatLon(10, 0), new LatLon(0, 2)).should.equal(0));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).crossTrackDistanceTo(null, 0); }, TypeError, 'invalid (null) point'));
        test('cross-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).crossTrackDistanceTo(new LatLon(0, 0), 'x'); }, TypeError, 'invalid point ‘x’'));
        test('along-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).alongTrackDistanceTo(null, 0); }, TypeError, 'invalid (null) point'));
        test('along-track (fail)',   () => should.Throw(function() { new LatLon(0, 0).alongTrackDistanceTo(new LatLon(0, 0), 'x'); }, TypeError, 'invalid point ‘x’'));
    });

    describe('misc', function() {
        test('Clairaut 0°',        () => new LatLon(0, 0).maxLatitude(0).should.equal(90));
        test('Clairaut 1°',        () => new LatLon(0, 0).maxLatitude(1).should.equal(89));
        test('Clairaut 90°',       () => new LatLon(0, 0).maxLatitude(90).should.equal(0));

        const parallels = LatLon.crossingParallels(new LatLon(0, 0), new LatLon(60, 30), 30);
        test('parallels 1',        () => new LatLon(30, parallels.lon1).toString('dms').should.equal('30°00′00″N, 009°35′39″E'));
        test('parallels 2',        () => new LatLon(30, parallels.lon2).toString('dms').should.equal('30°00′00″N, 170°24′21″E'));
        test('parallels -',        () => should.equal(LatLon.crossingParallels(new LatLon(0, 0), new LatLon(10, 60), 60), null));
        test('parallels coinc',    () => should.equal(LatLon.crossingParallels(new LatLon(0, 0), new LatLon(0, 0), 0), null));
    });

    describe('area (polygon-based)', function() {
        const polyTriangle = [ new LatLon(1, 1), new LatLon(2, 1), new LatLon(1, 2) ];
        const polySquareCw = [ new LatLon(1, 1), new LatLon(2, 1), new LatLon(2, 2), new LatLon(1, 2) ];
        const polySquareCcw = [ new LatLon(1, 1), new LatLon(1, 2), new LatLon(2, 2), new LatLon(2, 1) ];
        const polyOctant = [ new LatLon(0, ε), new LatLon(90, 0), new LatLon(0, 90-ε) ];
        const polyOctantS = [ new LatLon(-ε, ε), new LatLon(90, 0), new LatLon(-ε, 90-ε) ];
        const polyQuadrant = [ new LatLon(ε, ε), new LatLon(90, ε), new LatLon(ε, 180-ε), new LatLon(ε, 90) ];
        const polyHemiE = [ new LatLon(ε, ε), new LatLon(90-ε, 0), new LatLon(90-ε, 180), new LatLon(ε, 180), new LatLon(-ε, 180), new LatLon(-90+ε, 180), new LatLon(-90+ε, 0), new LatLon(-ε, ε) ];
        const polyPole = [ new LatLon(89, 0), new LatLon(89, 120), new LatLon(89, -120) ];
        const polyConcave = [ new LatLon(1, 1), new LatLon(5, 1), new LatLon(5, 3), new LatLon(1, 3), new LatLon(3, 2) ];

        test('triangle area',        () => LatLon.areaOf(polyTriangle).toFixed(0).should.equal('6181527888'));
        test('triangle area radius', () => LatLon.areaOf(polyTriangle, 6371e3).toFixed(0).should.equal('6181527888'));
        test('triangle area closed', () => LatLon.areaOf(polyTriangle.concat(polyTriangle[0])).toFixed(0).should.equal('6181527888'));
        test('square cw area',       () => LatLon.areaOf(polySquareCw).toFixed(0).should.equal('12360230987'));
        test('square ccw area',      () => LatLon.areaOf(polySquareCcw).toFixed(0).should.equal('12360230987'));
        test('octant area',          () => LatLon.areaOf(polyOctant).toFixed(1).should.equal((π*R*R/2).toFixed(1)));
        test('super-octant area',    () => LatLon.areaOf(polyOctantS).toFixed(1).should.equal((π*R*R/2).toFixed(1)));
        test('quadrant area',        () => LatLon.areaOf(polyQuadrant).should.equal(π*R*R));
        test('hemisphere area',      () => LatLon.areaOf(polyHemiE).toFixed(1).should.equal((2*π*R*R).toFixed(1)));
        test('pole area',            () => LatLon.areaOf(polyPole).toFixed(0).should.equal('16063139192'));
        test('concave area',         () => LatLon.areaOf(polyConcave).toFixed(0).should.equal('74042699236'));
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

    describe('rhumb lines', function() {
        const dov = new LatLon(51.127, 1.338), cal = new LatLon(50.964, 1.853);
        test('distance',              () => dov.rhumbDistanceTo(cal).toPrecision(4).should.equal('4.031e+4'));
        test('distance r',            () => dov.rhumbDistanceTo(cal, 6371e3).toPrecision(4).should.equal('4.031e+4'));
        test('dist E-W (Δψ < 10⁻¹²)', () => new LatLon(1, -1).rhumbDistanceTo(new LatLon(1, 1)).toPrecision(4).should.equal('2.224e+5'));
        test('dist @ -90° (Δψ → ∞)',  () => new LatLon(-90, 0).rhumbDistanceTo(new LatLon(0, 0)).toPrecision(4).should.equal('1.001e+7'));
        test('distance dateline E-W', () => new LatLon(1, -179).rhumbDistanceTo(new LatLon(1, 179)).toFixed(6).should.equal(new LatLon(1, 1).rhumbDistanceTo(new LatLon(1, -1)).toFixed(6)));
        test('distance err',          () => should.Throw(function() { dov.rhumbDistanceTo(false); }, TypeError, 'invalid point ‘false’'));
        test('bearing',               () => dov.rhumbBearingTo(cal).toFixed(1).should.equal('116.7'));
        test('bearing dateline',      () => new LatLon(1, -179).rhumbBearingTo(new LatLon(1, 179)).should.equal(270));
        test('bearing dateline',      () => new LatLon(1, 179).rhumbBearingTo(new LatLon(1, -179)).should.equal(90));
        test('bearing coincident',    () => dov.rhumbBearingTo(dov).should.be.NaN);
        test('bearing err',           () => should.Throw(function() { dov.rhumbBearingTo(false); }, TypeError, 'invalid point ‘false’'));
        test('dest’n',                () => dov.rhumbDestinationPoint(40310, 116.7).toString().should.equal('50.9641°N, 001.8531°E'));
        test('dest’n',                () => dov.rhumbDestinationPoint(40310, 116.7, 6371e3).toString().should.equal('50.9641°N, 001.8531°E'));
        test('dest’n',                () => new LatLon(1, 1).rhumbDestinationPoint(111178, 90).toString().should.equal('01.0000°N, 002.0000°E'));
        test('dest’n dateline',       () => new LatLon(1, 179).rhumbDestinationPoint(222356, 90).toString().should.equal('01.0000°N, 179.0000°W'));
        test('dest’n dateline',       () => new LatLon(1, -179).rhumbDestinationPoint(222356, 270).toString().should.equal('01.0000°N, 179.0000°E'));
        test('midpoint',              () => dov.rhumbMidpointTo(cal).toString().should.equal('51.0455°N, 001.5957°E'));
        test('midpoint dateline',     () => new LatLon(1, -179).rhumbMidpointTo(new LatLon(1, 178)).toString().should.equal('01.0000°N, 179.5000°E'));
        test('midpoint err',          () => should.Throw(function() { dov.rhumbMidpointTo(false); }, TypeError, 'invalid point ‘false’'));
    });

    describe('misc', function() {
        test('equals true',   () => new LatLon(52.205, 0.119).equals(new LatLon(52.205, 0.119)).should.be.true);
        test('equals false',  () => new LatLon(52.206, 0.119).equals(new LatLon(52.205, 0.119)).should.be.false);
        test('equals (fail)', () => should.Throw(function() { new LatLon(52.205, 0.119).equals('cambg'); }, TypeError, 'invalid point ‘cambg’'));
        test('toGeoJSON',     () => new LatLon(52.205, 0.119).toGeoJSON().should.deep.equal({ type: 'Point', coordinates: [ 0.119, 52.205 ] }));
    });

});
