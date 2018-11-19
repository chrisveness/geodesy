/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - os-gridref                                 (c) Chris Veness 2014-2017  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

require('chai').should();  // BDD/TDD assertion library

var LatLon    = require('../npm.js').LatLonEllipsoidal;
var OsGridRef = require('../npm.js').OsGridRef;
var Dms       = require('../npm.js').Dms;

var test = it; // just an alias

describe('os-gridref', function() {

    // OS Guide to coordinate systems in Great Britain C.1, C.2; Caister water tower

    const osgb_in = new LatLon(Dms.parseDMS('52°39′27.2531″N'), Dms.parseDMS('1°43′4.5177″E'), LatLon.datum.OSGB36);
    const gridref_out = OsGridRef.latLonToOsGrid(osgb_in);
    test('C1 E',                         function() { gridref_out.easting.toFixed(3).should.equal('651409.903'); });
    test('C1 N',                         function() { gridref_out.northing.toFixed(3).should.equal('313177.270'); });
    const osgb2 = OsGridRef.osGridToLatLon(gridref_out, LatLon.datum.OSGB36);
    test('C1 round-trip',                function() { osgb2.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'); });

    const gridref_in = new OsGridRef(651409.903, 313177.270);
    const osgb_out = OsGridRef.osGridToLatLon(gridref_in, LatLon.datum.OSGB36);
    test('C2',                           function() { osgb_out.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'); });
    const gridref2 = OsGridRef.latLonToOsGrid(osgb_out);
    test('C2 E round-trip',              function() { gridref2.easting.toFixed(3).should.equal('651409.903'); });
    test('C2 N round-trip',              function() { gridref2.northing.toFixed(3).should.equal('313177.270'); });

    test('parse 100km origin',           function() { OsGridRef.parse('SU00').toString().should.equal('SU 00000 00000'); });
    test('parse 100km origin',           function() { OsGridRef.parse('SU 0 0').toString().should.equal('SU 00000 00000'); });
    test('parse no whitespace',          function() { OsGridRef.parse('SU387148').toString().should.equal('SU 38700 14800'); });
    test('parse 6-digit',                function() { OsGridRef.parse('SU 387 148').toString().should.equal('SU 38700 14800'); });
    test('parse 10-digit',               function() { OsGridRef.parse('SU 38700 14800').toString().should.equal('SU 38700 14800'); });
    test('parse numeric',                function() { OsGridRef.parse('438700,114800').toString().should.equal('SU 38700 14800'); });

    const greenwichWGS84 = LatLon(51.4778, -0.0016); // default WGS84
    const greenwichOSGB36 = greenwichWGS84.convertDatum(LatLon.datum.OSGB36);
    test('convert WGS84 -> OSGB36',      function() { greenwichOSGB36.toString('d').should.equal('51.4773°N, 000.0000°E'); });
    test('convert OSGB36 -> WGS84',      function() { greenwichOSGB36.convertDatum(LatLon.datum.WGS84).toString('d').should.equal('51.4778°N, 000.0016°W'); });

    // limits
    test('SW regular', function() { new OsGridRef(     0,       0).toString().should.equal('SV 00000 00000'); });
    test('NE regular', function() { new OsGridRef(699999, 1299999).toString().should.equal('JM 99999 99999'); });
    test('SW numeric', function() { new OsGridRef(     0,       0).toString('0').should.equal('000000,000000'); });
    test('NW numeric', function() { new OsGridRef(699999, 1299999).toString('0').should.equal('699999,1299999'); }); // note 7-digit N

    // DG round-trip

    const dgGridRef = OsGridRef.parse('TQ 44359 80653');

    // round-tripping OSGB36 works perfectly
    const dgOsgb = OsGridRef.osGridToLatLon(dgGridRef, LatLon.datum.OSGB36);
    test('DG round-trip OSGB36',         function() { dgGridRef.toString().should.equal( OsGridRef.latLonToOsGrid(dgOsgb).toString()); });
    test('DG round-trip OSGB36 numeric', function() { OsGridRef.latLonToOsGrid(dgOsgb).toString(0).should.equal('544359,180653'); });

    // reversing Helmert transform (OSGB->WGS->OSGB) introduces small error (≈ 3mm in UK), so WGS84
    // round-trip is not quite perfect: test needs to incorporate 3mm error to pass
    const dgWgs = OsGridRef.osGridToLatLon(dgGridRef); // default is WGS84
    test('DG round-trip WGS84 numeric',  function() { OsGridRef.latLonToOsGrid(dgWgs).toString(0).should.equal('544358.997,180653'); });
});


describe('os-gridref-ci', function() {

    // Co-ordinates from Jersey and Guernsey Address data 
    const coords = [
        {'name':'St. Aubin’s Promenade',    'E':'37514.0',  'N':'66008.0', 'lat':'49.1890997628', 'lon':'-2.16910447719','grid':'JE' },
        {'name':'Government House Jersey',  'E':'42965.9',  'N':'66644.5', 'lat':'49.1948209152', 'lon':'-2.09430726701','grid':'JE' },
        {'name':'Sark Medical Centre',      'E':'51184.6',  'N':'42758.1', 'lat':'49.4348714082', 'lon':'-2.35897378892','grid':'GY' },
        {'name':'Government House Guernsey','E':'37504.9',  'N':'44630.5', 'lat':'49.4516470415', 'lon':'-2.54761956752','grid':'GY' }
    ];
    const grids = {'JE': OsGridRef.projection.NewJTM,'GY': OsGridRef.projection.Guernsey_Grid}
    for (const place of coords) {
        const osgb = new LatLon(place.lat, place.lon);
        const gridref = OsGridRef.latLonToOsGrid(osgb, grids[place.grid]);
        test(place.name+' E', function() {gridref.easting.toFixed(1).should.equal(place.E); });
        test(place.name+' N', function() {gridref.northing.toFixed(1).should.equal(place.N); });
       
        const osgb2 = OsGridRef.osGridToLatLon(gridref);
        test(place.name+' round-trip lat', function() { Dms.toDMS(osgb2.lat,'dms', 3).should.equal(Dms.toDMS(osgb.lat,'dms', 3)); });
        test(place.name+' round-trip lon', function() { Dms.toDMS(osgb2.lon,'dms', 3).should.equal(Dms.toDMS(osgb.lon,'dms', 3)); });

        const gridref2 = new OsGridRef(place.E, place.N,  grids[place.grid]);
        const osgb3 = OsGridRef.osGridToLatLon(gridref2);
        test(place.name+' lat', function() { Dms.toDMS(osgb3.lat,'dms', 2).should.equal(Dms.toDMS(osgb.lat,'dms', 2)); });
        test(place.name+' lon', function() { Dms.toDMS(osgb3.lon,'dms', 2).should.equal(Dms.toDMS(osgb.lon,'dms', 2)); });
        const gridref3 = OsGridRef.latLonToOsGrid(osgb3, grids[place.grid]);
        test(place.name+' E round-trip', function() { gridref3.easting.toFixed(1).should.equal(place.E); });
        test(place.name+' N round-trip', function() { gridref3.northing.toFixed(1).should.equal(place.N); });
    }

});
