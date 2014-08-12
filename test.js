/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness                                                   (c) Chris Veness 2014  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict'

var test = require('tape');

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLon                                                                                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('inverse', function(assert) {
    var LatLon = require('./latlon.js');

    var cambg = LatLon(52.205, 0.119), paris = LatLon(48.857, 2.351);
    assert.equal(cambg.distanceTo(paris).toPrecision(4), '404.3', 'distance');
    assert.equal(cambg.bearingTo(paris).toFixed(1), '156.2', 'initial bearing');
    assert.equal(cambg.finalBearingTo(paris).toFixed(1), '157.9', 'final bearing');
    assert.equal(cambg.midpointTo(paris).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.end();
});

test('direct', function(assert) {
    var LatLon = require('./latlon.js');

    var bradwell = LatLon(51.4778, -0.0015), brng = 300.7, dist = 7.794;
    assert.equal(bradwell.destinationPoint(brng, dist).toString('d'), '51.5135°N, 000.0983°W', 'dest’n');
    assert.end();
});

test('intersection', function(assert) {
    var LatLon = require('./latlon.js');

    var stn = LatLon(51.8853, 0.2545);
    var cdg = LatLon(49.0034, 2.5735);
    assert.equal(LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'dest’n');
    assert.end();
});

test('rhumb', function(assert) {
    var LatLon = require('./latlon.js');

    var dov = LatLon(51.127, 1.338), cal = LatLon(50.964, 1.853);
    assert.equal(dov.rhumbDistanceTo(cal).toPrecision(4), '40.31', 'distance');
    assert.equal(dov.rhumbBearingTo(cal).toFixed(1), '116.7', 'bearing');
    assert.equal(dov.rhumbDestinationPoint(116.7, 40.31).toString('d'), '50.9641°N, 001.8531°E', 'dest’n');
    assert.equal(dov.rhumbMidpointTo(cal).toString('d'), '51.0455°N, 001.5957°E', 'midpoint');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonE / Vincenty                                                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('ellipsoid', function(assert) {
    var LatLonE = require('./latlon-ellipsoid.js');
    // merge vincenty methods into LatLonE
    var V = require('./latlon-vincenty.js');
    for (var prop in V) LatLonE[prop] = V[prop];

    var greenwichWGS84 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
    assert.equal(greenwichWGS84.convertDatum(LatLonE.datum.OSGB36).toString('d'), '51.4773°N, 000.0000°E', 'convert WGS84 -> OSGB36');

    var le = new LatLonE(50.06632, -5.71475), jog = new LatLonE(58.64402, -3.07009);
    assert.equal(le.distanceTo(jog).toFixed(3), '969954.166', 'vincenty inverse distance');
    assert.equal(le.initialBearingTo(jog).toFixed(4), '9.1419', 'vincenty inverse initial bearing');
    assert.equal(le.finalBearingTo(jog).toFixed(4), '11.2972', 'vincenty inverse final bearing');

    var flindersPeak = LatLonE(-37.95103, 144.42487);
    var buninyong = LatLonE(-37.6528, 143.9265);
    assert.equal(flindersPeak.destinationPoint(306.86816, 54972.271).toString('d'), '37.6528°S, 143.9265°E', 'vincenty direct destination');
    assert.equal(flindersPeak.finalBearingOn(306.86816, 54972.271).toFixed(4), '307.1736', 'vincenty direct final brng');
    assert.equal(LatLonE(0, 0).distanceTo(LatLonE(0.5, 179.5)), 19936288.579, 'vincenty antipodal distance');

    assert.true(isNaN(LatLonE(0, 0).distanceTo(LatLonE(0.5, 179.7))), 'vincenty antipodal convergence failure');

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* OsGridRef                                                                                      */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('os-gridref', function(assert) {
    var LatLonE = require('./latlon-ellipsoid.js');
    var OsGridRef = require('./osgridref.js');

    var osgb = LatLonE(52.65757, 1.71791, LatLonE.datum.OSGB36);
    assert.equal(OsGridRef.latLonToOsGrid(osgb).toString(), 'TG 51409 13177', 'll -> grid (txt)');
    assert.equal(OsGridRef.osGridToLatLon(OsGridRef(651409, 313177)).toString(), '52°39′27″N, 001°43′04″E', 'grid (num) -> ll');
    assert.deepEqual(OsGridRef.parse('TG 51409 13177'), OsGridRef(651409, 313177), 'parse grid (txt) -> grid (num)');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geohash                                                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('geohash', function(assert) {
    var Geohash = require('./geohash.js');

    assert.equal(Geohash.encode(57.648, 10.410, 6), 'u4pruy', 'encode Jutland');
    assert.deepEqual(Geohash.decode('u4pruy'), { lat: 57.648, lon: 10.410 }, 'decode Jutland');
    assert.equal(Geohash.encode(-25.38262, -49.26561, 8), '6gkzwgjz', 'encode Curitiba');
    assert.deepEqual(Geohash.decode('6gkzwgjz'), { lat: -25.38262, lon: -49.26561 }, 'decode Curitiba');
    assert.deepEqual(Geohash.neighbours('ezzz'), { n:'gbpb', ne:'u000', e:'spbp', se:'spbn', s:'ezzy', sw:'ezzw', w:'ezzx', nw:'gbp8' }, 'neighbours');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonV                                                                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('latlon-vectors', function(assert) {
    var LatLonV = require('./latlon-vectors.js');
    var Vector3d = require('./vector3d.js');

    assert.equal(LatLonV(45, 45).toVector().toString(), '[0.500,0.500,0.707]', 'll to v');
    assert.equal(Vector3d(0.500, 0.500, 0.707107).toLatLon().toString('d'), '45.0000°N, 045.0000°E', 'v to ll');
    assert.equal(LatLonV(53.3206, -1.7297).greatCircle(96.0).toString(), '[-0.794,0.129,0.594]', 'great circle');
    assert.equal(LatLonV(52.205, 0.119).distanceTo(LatLonV(48.857, 2.351)).toPrecision(4), '404.3', 'distance');
    assert.equal(LatLonV(52.205, 0.119).bearingTo(LatLonV(48.857, 2.351)).toFixed(1), '156.2', 'bearing');
    assert.equal(LatLonV(48.857, 2.351).bearingTo(LatLonV(52.205, 0.119)).toFixed(1), '337.9', 'bearing (reverse)');
    assert.equal(LatLonV(52.205, 0.119).midpointTo(LatLonV(48.857, 2.351)).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.equal(LatLonV(51.4778, -0.0015).destinationPoint(300.7, 7.794).toString('d'), '51.5135°N, 000.0983°W', 'destination');
    var stn = LatLonV(51.8853, 0.2545);
    var cdg = LatLonV(49.0034, 2.5735);
    assert.equal(LatLonV.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'intersection');
    var here = new LatLonV(53.1611, -0.7972);
    var start = new LatLonV(53.3206, -1.7297);
    assert.equal(LatLonV(10,0).crossTrackDistanceTo(LatLonV(0,0), 90).toPrecision(4), '-1112', 'cross-track b');
    assert.equal(LatLonV(10,1).crossTrackDistanceTo(LatLonV(0,0), LatLonV(0,2)).toPrecision(4), '-1112', 'cross-track p');
    assert.equal(LatLonV(10,0).crossTrackDistanceTo(LatLonV(0,0), 270).toPrecision(4), '1112', 'cross-track -');
    var bounds = [ new LatLonV(45,1), new LatLonV(45,2), new LatLonV(46,2), new LatLonV(46,1) ];
    assert.true(LatLonV(45.1, 1.1).enclosedBy(bounds), 'enclosed in');
    assert.false(LatLonV(46.1, 1.1).enclosedBy(bounds), 'enclosed out');
    assert.true(LatLonV(52.205, 0.119).equals(LatLonV(52.205, 0.119)), 'equals');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geo                                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('geo', function(assert) {
    var LatLon = require('./latlon.js');
    var Geo = require('./geo.js');

    assert.equal(LatLon(51.521470, -0.138833).toString('d', 6), '51.521470°N, 000.138833°W', 'toString d');
    assert.equal(LatLon(51.521470, -0.138833).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'toString dms');
    assert.equal(LatLon(Geo.parseDMS('51.521470°N'), Geo.parseDMS('000.138833°W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse d');
    assert.equal(LatLon(Geo.parseDMS('51°31′17.29″N'), Geo.parseDMS('000°08′19.80″W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse dms');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
