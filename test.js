/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness                                              (c) Chris Veness 2014-2015  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict'

var test = require('tape');

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLon                                                                                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('inverse', function(assert) {
    var LatLon = require('./npm.js').LatLonSpherical;

    var cambg = LatLon(52.205, 0.119), paris = LatLon(48.857, 2.351);
    assert.equal(cambg.distanceTo(paris).toPrecision(4), '4.043e+5', 'distance');
    assert.equal(cambg.distanceTo(paris, 3959).toPrecision(4), '251.2', 'distance (miles)');
    assert.equal(cambg.bearingTo(paris).toFixed(1), '156.2', 'initial bearing');
    assert.equal(cambg.finalBearingTo(paris).toFixed(1), '157.9', 'final bearing');
    assert.equal(cambg.midpointTo(paris).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.end();
});

test('direct', function(assert) {
    var LatLon = require('./npm.js').LatLonSpherical;

    var bradwell = LatLon(51.4778, -0.0015), dist = 7794, brng = 300.7;
    assert.equal(bradwell.destinationPoint(dist, brng).toString('d'), '51.5135°N, 000.0983°W', 'dest’n');
    assert.end();
});

test('intersection', function(assert) {
    var LatLon = require('./npm.js').LatLonSpherical;

    var stn = LatLon(51.8853, 0.2545);
    var cdg = LatLon(49.0034, 2.5735);
    assert.equal(LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'dest’n');
    assert.end();
});

test('rhumb', function(assert) {
    var LatLon = require('./npm.js').LatLonSpherical;

    var dov = LatLon(51.127, 1.338), cal = LatLon(50.964, 1.853);
    assert.equal(dov.rhumbDistanceTo(cal).toPrecision(4), '4.031e+4', 'distance');
    assert.equal(dov.rhumbBearingTo(cal).toFixed(1), '116.7', 'bearing');
    assert.equal(dov.rhumbDestinationPoint(40310, 116.7).toString('d'), '50.9641°N, 001.8531°E', 'dest’n');
    assert.equal(dov.rhumbMidpointTo(cal).toString('d'), '51.0455°N, 001.5957°E', 'midpoint');
    assert.end();
});

test('compass-point', function(assert) {
    var Dms = require('./npm.js').Dms;

    assert.equal(Dms.compassPoint(1), 'N',        '1 -> N');
    assert.equal(Dms.compassPoint(0), 'N',        '0 -> N');
    assert.equal(Dms.compassPoint(-1), 'N',       '-1 -> N');
    assert.equal(Dms.compassPoint(359), 'N',      '359 -> N');
    assert.equal(Dms.compassPoint(24), 'NNE',     '24 -> NNE');
    assert.equal(Dms.compassPoint(24, 1), 'N',    '24:1 -> N');
    assert.equal(Dms.compassPoint(24, 2), 'NE',   '24:2 -> NE');
    assert.equal(Dms.compassPoint(24, 3), 'NNE',  '24:3 -> NNE');
    assert.equal(Dms.compassPoint(226), 'SW',     '226 -> SW');
    assert.equal(Dms.compassPoint(226, 1), 'W',   '226:1 -> W');
    assert.equal(Dms.compassPoint(226, 2), 'SW',  '226:2 -> SW');
    assert.equal(Dms.compassPoint(226, 3), 'SW',  '226:3 -> SW');
    assert.equal(Dms.compassPoint(237), 'WSW',    '237 -> WSW');
    assert.equal(Dms.compassPoint(237, 1), 'W',   '237:1 -> W');
    assert.equal(Dms.compassPoint(237, 2), 'SW',  '237:2 -> SW');
    assert.equal(Dms.compassPoint(237, 3), 'WSW', '237:3 -> WSW');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonEllipsoidal / Vincenty                                                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('ellipsoid', function(assert) {
    var LatLon = require('./npm.js').LatLonEllipsoidal;

    var greenwichWGS84 = new LatLon(51.4778, -0.0016); // default WGS84
    var greenwichOSGB36 = greenwichWGS84.convertDatum(LatLon.datum.OSGB36);
    assert.equal(greenwichOSGB36.toString('d'), '51.4773°N, 000.0000°E', 'convert WGS84 -> OSGB36');
    assert.equal(greenwichOSGB36.convertDatum(LatLon.datum.WGS84).toString('d'), '51.4778°N, 000.0016°W', 'convert OSGB36 -> WGS84');

    var le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
    assert.equal(le.distanceTo(jog).toFixed(3), '969954.166', 'vincenty inverse distance');
    assert.equal(le.initialBearingTo(jog).toFixed(4), '9.1419', 'vincenty inverse initial bearing');
    assert.equal(le.finalBearingTo(jog).toFixed(4), '11.2972', 'vincenty inverse final bearing');

    var flindersPeak = LatLon(-37.95103, 144.42487);
    var buninyong = LatLon(-37.6528, 143.9265);
    assert.equal(flindersPeak.destinationPoint(54972.271, 306.86816).toString('d'), '37.6528°S, 143.9265°E', 'vincenty direct destination');
    assert.equal(flindersPeak.finalBearingOn(306.86816, 54972.271).toFixed(4), '307.1736', 'vincenty direct final brng');
    assert.equal(LatLon(0, 0).distanceTo(LatLon(0.5, 179.5)), 19936288.579, 'vincenty antipodal distance');

    assert.true(isNaN(LatLon(0, 0).distanceTo(LatLon(0.5, 179.7))), 'vincenty antipodal convergence failure');

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* OsGridRef                                                                                      */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('os-gridref', function(assert) {
    var LatLon = require('./npm.js').LatLonEllipsoidal;
    var OsGridRef = require('./npm.js').OsGridRef;
    var Dms = require('./npm.js').Dms;

    // OS Guide to coordinate systems in Great Britain C.1, C.2; Caister water tower

    var osgb = LatLon(Dms.parseDMS('52°39′27.2531″N'), Dms.parseDMS('1°43′4.5177″E'), LatLon.datum.OSGB36);
    var gridref = OsGridRef.latLonToOsGrid(osgb);
    assert.equal(gridref.easting.toFixed(3), '651409.903', 'C1 E');
    assert.equal(gridref.northing.toFixed(3), '313177.270', 'C1 N');
    var osgb2 = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
    assert.equal(osgb2.toString('dms', 4), '52°39′27.2531″N, 001°43′04.5177″E', 'C1 round-trip');

    var gridref = OsGridRef(651409.903, 313177.270);
    var osgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
    assert.equal(osgb.toString('dms', 4), '52°39′27.2531″N, 001°43′04.5177″E', 'C2');
    var gridref2 = OsGridRef.latLonToOsGrid(osgb);
    assert.equal(gridref2.easting.toFixed(3), '651409.903', 'C2 E round-trip');
    assert.equal(gridref2.northing.toFixed(3), '313177.270', 'C2 N round-trip');

    // DG round-trip

    var dgRef1 = OsGridRef.parse('TQ 44359 80653');
    var osgb = OsGridRef.osGridToLatLon(dgRef1, LatLon.datum.OSGB36); // gridref to osgb36
    var dgRef2 = OsGridRef.latLonToOsGrid(osgb);
    assert.equal(dgRef1.toString(), dgRef2.toString(), 'DG round-trip OSGB');

    var dgRef1 = OsGridRef.parse('TQ 44359 80653');
    var wgs84 = OsGridRef.osGridToLatLon(dgRef1, LatLon.datum.WGS84); // gridref to wgs84
    var dgRef2 = OsGridRef.latLonToOsGrid(osgb);
    assert.equal(dgRef1.toString(), dgRef2.toString(), 'DG round-trip WGS84');

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* LatLonVectors                                                                                  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('latlon-vectors', function(assert) {
    var LatLon = require('./npm.js').LatLonVectors;
    var Vector3d = require('./npm.js').Vector3d;

    assert.equal(LatLon(45, 45).toVector().toString(), '[0.500,0.500,0.707]', 'll to v');
    assert.equal(Vector3d(0.500, 0.500, 0.707107).toLatLonS().toString('d'), '45.0000°N, 045.0000°E', 'v to ll');
    assert.equal(LatLon(53.3206, -1.7297).greatCircle(96.0).toString(), '[-0.794,0.129,0.594]', 'great circle');
    assert.equal(LatLon(52.205, 0.119).distanceTo(LatLon(48.857, 2.351)).toPrecision(4), '4.043e+5', 'distance');
    assert.equal(LatLon(52.205, 0.119).bearingTo(LatLon(48.857, 2.351)).toFixed(1), '156.2', 'bearing');
    assert.equal(LatLon(48.857, 2.351).bearingTo(LatLon(52.205, 0.119)).toFixed(1), '337.9', 'bearing (reverse)');
    assert.equal(LatLon(52.205, 0.119).midpointTo(LatLon(48.857, 2.351)).toString('d'), '50.5363°N, 001.2746°E', 'midpoint');
    assert.equal(LatLon(51.4778, -0.0015).destinationPoint(7794, 300.7).toString('d'), '51.5135°N, 000.0983°W', 'destination');
    var stn = LatLon(51.8853, 0.2545);
    var cdg = LatLon(49.0034, 2.5735);
    assert.equal(LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d'), '50.9078°N, 004.5084°E', 'intersection');
    var here = new LatLon(53.1611, -0.7972);
    var start = new LatLon(53.3206, -1.7297);
    assert.equal(LatLon(10,0).crossTrackDistanceTo(LatLon(0,0), 90).toPrecision(4), '-1.112e+6', 'cross-track b');
    assert.equal(LatLon(10,1).crossTrackDistanceTo(LatLon(0,0), LatLon(0,2)).toPrecision(4), '-1.112e+6', 'cross-track p');
    assert.equal(LatLon(10,0).crossTrackDistanceTo(LatLon(0,0), 270).toPrecision(4), '1.112e+6', 'cross-track -');
    var bounds = [ new LatLon(45,1), new LatLon(45,2), new LatLon(46,2), new LatLon(46,1) ];
    assert.true(LatLon(45.1, 1.1).enclosedBy(bounds), 'enclosed in');
    assert.false(LatLon(46.1, 1.1).enclosedBy(bounds), 'enclosed out');
    assert.true(LatLon(52.205, 0.119).equals(LatLon(52.205, 0.119)), 'equals');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Dms                                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('dms', function(assert) {
    var LatLon = require('./npm.js').LatLonSpherical;
    var Dms = require('./npm.js').Dms;

    assert.equal(LatLon(51.521470, -0.138833).toString('d', 6), '51.521470°N, 000.138833°W', 'toString d');
    assert.equal(LatLon(51.521470, -0.138833).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'toString dms');
    assert.equal(LatLon(Dms.parseDMS('51.521470°N'), Dms.parseDMS('000.138833°W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse d');
    assert.equal(LatLon(Dms.parseDMS('51°31′17.29″N'), Dms.parseDMS('000°08′19.80″W')).toString('dms', 2), '51°31′17.29″N, 000°08′19.80″W', 'parse dms');
    assert.equal(Dms.parseDMS('0.0°'), 0, 'parse 0°');
    assert.equal(Dms.toDMS(0, 'd'), '000.0000°', 'output 000.0000°');
    assert.equal(Dms.parseDMS('0°'), 0, 'parse 0°');
    assert.equal(Dms.toDMS(0, 'd',0), '000°', 'output 000°');
    assert.equal(Dms.parseDMS('000°00′00″'), 0, 'parse 000°00′00″');
    assert.equal(Dms.toDMS(0), '000°00′00″', 'output 000°00′00″');
    assert.equal(Dms.parseDMS('000°00′00.0″'), 0, 'parse 000°00′00.0″');
    assert.equal(Dms.toDMS(0,'dms',2), '000°00′00.00″', 'output 000°00′00.00″');

    // assorted variations on DMS including whitespace, different d/m/s symbols (ordinal, ascii/typo quotes)
    var variations = [
        '45.76260',
        '45.76260 ',
        '45.76260°',
        '45°45.756′',
        '45° 45.756′',
        '45 45.756',
        '45°45′45.36″',
        '45º45\'45.36"',
        '45°45’45.36”',
        '45 45 45.36 ',
        '45° 45′ 45.36″',
        '45º 45\' 45.36"',
        '45° 45’ 45.36”'
    ];
    for (var v in variations) assert.equal(Dms.parseDMS(variations[v]),      45.76260, 'parse dms variations '+variations[v]);
    for (var v in variations) assert.equal(Dms.parseDMS('-'+variations[v]), -45.76260, 'parse dms variations '+'-'+variations[v]);
    for (var v in variations) assert.equal(Dms.parseDMS(variations[v]+'N'),  45.76260, 'parse dms variations '+variations[v]+'N');
    for (var v in variations) assert.equal(Dms.parseDMS(variations[v]+'S'), -45.76260, 'parse dms variations '+variations[v]+'S');
    for (var v in variations) assert.equal(Dms.parseDMS(variations[v]+'E'),  45.76260, 'parse dms variations '+variations[v]+'E');
    for (var v in variations) assert.equal(Dms.parseDMS(variations[v]+'W'), -45.76260, 'parse dms variations '+variations[v]+'W');
    assert.equal(Dms.parseDMS(' 45°45′45.36″ '), 45.76260, 'parse dms variations '+' ws before+after ');
    // output formats
    assert.equal(Dms.toDMS(45.76260),           '045°45′45″',    'output dms ');
    assert.equal(Dms.toDMS(45.76260, 'd'),      '045.7626°',     'output dms '+'d');
    assert.equal(Dms.toDMS(45.76260, 'dm'),     '045°45.76′',    'output dms '+'dm');
    assert.equal(Dms.toDMS(45.76260, 'dms'),    '045°45′45″',    'output dms '+'dms');
    assert.equal(Dms.toDMS(45.76260, 'd', 6),   '045.762600°',   'output dms '+'dm,6');
    assert.equal(Dms.toDMS(45.76260, 'dm', 4),  '045°45.7560′',  'output dms '+'dm,4');
    assert.equal(Dms.toDMS(45.76260, 'dms', 2), '045°45′45.36″', 'output dms '+'dms,2');
    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Utm                                                                                            */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

test('utm', function(assert) {
    var LatLon = require('./npm.js').LatLonEllipsoidal;
    var Utm = require('./npm.js').Utm;
    var Mgrs = require('./npm.js').Mgrs;

    // http://www.rcn.montana.edu/resources/converter.aspx

    // latitude/longitude -> UTM
    assert.equal(LatLon( 0,  0).toUtm().toString(6), '31 N 166021.443081 0.000000', 'LL->UTM 0,0');
    assert.equal(LatLon( 1,  1).toUtm().toString(6), '31 N 277438.263521 110597.972524', 'LL->UTM 1,1');
    assert.equal(LatLon(-1, -1).toUtm().toString(6), '30 S 722561.736479 9889402.027476', 'LL->UTM -1,-1');
    assert.equal(LatLon( 48.8583,   2.2945).toUtm().toString(3), '31 N 448251.898 5411943.794', 'LL->UTM eiffel tower');
    assert.equal(LatLon(-33.857 , 151.215 ).toUtm().toString(3), '56 S 334873.199 6252266.092', 'LL->UTM sidney o/h');
    assert.equal(LatLon( 38.8977, -77.0365).toUtm().toString(3), '18 N 323394.296 4307395.634', 'LL->UTM white house');
    assert.equal(LatLon(-22.9519, -43.2106).toUtm().toString(3), '23 S 683466.254 7460687.433', 'LL->UTM rio christ');
    assert.equal(LatLon( 60.39135,  5.3249).toUtm().toString(3), '32 N 297508.410 6700645.296', 'LL->UTM bergen');
    assert.equal(LatLon( 60.39135,  5.3249).toUtm().convergence, -3.196281440, 'LL->UTM bergen convergence');
    assert.equal(LatLon( 60.39135,  5.3249).toUtm().scale,     1.000102473211, 'LL->UTM bergen scale');

    // UTM -> latitude/longitude
    assert.equal(Utm.parse('31 N 166021.443081 0.000000').toLatLonE().toString(), LatLon(0, 0).toString(), 'UTM->LL 0,0');
    assert.equal(Utm.parse('31 N 277438.263521 110597.972524').toLatLonE().toString(), LatLon( 1,  1).toString(), 'UTM->LL 1,1');
    assert.equal(Utm.parse('30 S 722561.736479 9889402.027476').toLatLonE().toString(), LatLon(-1, -1).toString(), 'UTM->LL -1,-1');
    assert.equal(Utm.parse('31 N 448251.898 5411943.794').toLatLonE().toString(), LatLon( 48.8583,   2.2945).toString(), 'UTM->LL eiffel tower');
    assert.equal(Utm.parse('56 S 334873.199 6252266.092').toLatLonE().toString(), LatLon(-33.857 , 151.215 ).toString(), 'UTM->LL sidney o/h');
    assert.equal(Utm.parse('18 N 323394.296 4307395.634').toLatLonE().toString(), LatLon( 38.8977, -77.0365).toString(), 'UTM->LL white house');
    assert.equal(Utm.parse('23 S 683466.254 7460687.433').toLatLonE().toString(), LatLon(-22.9519, -43.2106).toString(), 'UTM->LL rio christ');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLonE().toString(), LatLon( 60.39135,  5.3249).toString(), 'UTM->LL bergen');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLonE().convergence, -3.196281443, 'UTM->LL bergen convergence');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toLatLonE().scale,     1.000102473212, 'UTM->LL bergen scale');

    // UTM -> MGRS
    assert.equal(Utm.parse('31 N 166021.443081 0.000000').toMgrs().toString(), '31N AA 66021 00000', 'UTM->MGRS 0,0');
    assert.equal(Utm.parse('31 N 277438.263521 110597.972524').toMgrs().toString(), '31N BB 77438 10597', 'UTM->MGRS 1,1');
    assert.equal(Utm.parse('30 S 722561.736479 9889402.027476').toMgrs().toString(), '30M YD 22561 89402', 'UTM->MGRS -1,-1');
    assert.equal(Utm.parse('31 N 448251.898 5411943.794').toMgrs().toString(), '31U DQ 48251 11943', 'UTM->MGRS eiffel tower');
    assert.equal(Utm.parse('56 S 334873.199 6252266.092').toMgrs().toString(), '56H LH 34873 52266', 'UTM->MGRS sidney o/h');
    assert.equal(Utm.parse('18 N 323394.296 4307395.634').toMgrs().toString(), '18S UJ 23394 07395', 'UTM->MGRS white house');
    assert.equal(Utm.parse('23 S 683466.254 7460687.433').toMgrs().toString(), '23K PQ 83466 60687', 'UTM->MGRS rio christ');
    assert.equal(Utm.parse('32 N 297508.410 6700645.296').toMgrs().toString(), '32V KN 97508 00645', 'UTM->MGRS bergen');

    // MGRS -> UTM
    assert.equal(Mgrs.parse('31N AA 66021 00000').toUtm().toString(), '31 N 166021 0', 'MGRS->UTM 0,0');
    assert.equal(Mgrs.parse('31N BB 77438 10597').toUtm().toString(), '31 N 277438 110597', 'MGRS->UTM 1,1');
    assert.equal(Mgrs.parse('30M YD 22561 89402').toUtm().toString(), '30 S 722561 9889402', 'MGRS->UTM -1,-1');
    assert.equal(Mgrs.parse('31U DQ 48251 11943').toUtm().toString(), '31 N 448251 5411943', 'MGRS->UTM eiffel tower');
    assert.equal(Mgrs.parse('56H LH 34873 52266').toUtm().toString(), '56 S 334873 6252266', 'MGRS->UTM sidney o/h');
    assert.equal(Mgrs.parse('18S UJ 23394 07395').toUtm().toString(), '18 N 323394 4307395', 'MGRS->UTM white house');
    assert.equal(Mgrs.parse('23K PQ 83466 60687').toUtm().toString(), '23 S 683466 7460687', 'MGRS->UTM rio christ');
    assert.equal(Mgrs.parse('32V KN 97508 00645').toUtm().toString(), '32 N 297508 6700645', 'MGRS->UTM bergen');

    /* http://www.ibm.com/developerworks/library/j-coordconvert/
     ( 0.0000    0.0000  )     "31 N 166021 0"
     ( 0.1300   -0.2324  )     "30 N 808084 14385"
     (-45.6456   23.3545 )     "34 G 683473 4942631"
     (-12.7650  -33.8765 )     "25 L 404859 8588690"
     (-80.5434  -170.6540)     "02 C 506346 1057742"
     ( 90.0000   177.0000)     "60 Z 500000 9997964"
     (-90.0000  -177.0000)     "01 A 500000 2035"
     ( 90.0000    3.0000 )     "31 Z 500000 9997964"
     ( 23.4578  -135.4545)     "08 Q 453580 2594272"
     ( 77.3450   156.9876)     "57 X 450793 8586116"
     (-89.3454  -48.9306 )     "22 A 502639 75072"
     */

    assert.end();
});

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
