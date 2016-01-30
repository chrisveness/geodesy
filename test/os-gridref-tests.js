/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - os-gridref                                 (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai      = require('chai');  // BDD/TDD assertion library

var LatLon    = require('../npm.js').LatLonEllipsoidal;
var OsGridRef = require('../npm.js').OsGridRef;
var Dms       = require('../npm.js').Dms;

chai.should();
var test = it; // just an alias

describe('os-gridref', function() {
    var osgb=null, gridref=null;

    // OS Guide to coordinate systems in Great Britain C.1, C.2; Caister water tower

    osgb = new LatLon(Dms.parseDMS('52°39′27.2531″N'), Dms.parseDMS('1°43′4.5177″E'), LatLon.datum.OSGB36);
    gridref = OsGridRef.latLonToOsGrid(osgb);
    test('C1 E',                         function() { gridref.easting.toFixed(3).should.equal('651409.903'); });
    test('C1 N',                         function() { gridref.northing.toFixed(3).should.equal('313177.270'); });
    var osgb2 = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
    test('C1 round-trip',                function() { osgb2.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'); });

    gridref = new OsGridRef(651409.903, 313177.270);
    osgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
    test('C2',                           function() { osgb.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'); });
    var gridref2 = OsGridRef.latLonToOsGrid(osgb);
    test('C2 E round-trip',              function() { gridref2.easting.toFixed(3).should.equal('651409.903'); });
    test('C2 N round-trip',              function() { gridref2.northing.toFixed(3).should.equal('313177.270'); });

    test('parse 100km origin',           function() { OsGridRef.parse('SU00').toString().should.equal('SU 00000 00000'); });
    test('parse 100km origin',           function() { OsGridRef.parse('SU 0 0').toString().should.equal('SU 00000 00000'); });
    test('parse no whitespace',          function() { OsGridRef.parse('SU387148').toString().should.equal('SU 38700 14800'); });
    test('parse 6-digit',                function() { OsGridRef.parse('SU 387 148').toString().should.equal('SU 38700 14800'); });
    test('parse 10-digit',               function() { OsGridRef.parse('SU 38700 14800').toString().should.equal('SU 38700 14800'); });
    test('parse numeric',                function() { OsGridRef.parse('438700,114800').toString().should.equal('SU 38700 14800'); });

    var greenwichWGS84 = LatLon(51.4778, -0.0016); // default WGS84
    var greenwichOSGB36 = greenwichWGS84.convertDatum(LatLon.datum.OSGB36);
    test('convert WGS84 -> OSGB36',      function() { greenwichOSGB36.toString('d').should.equal('51.4773°N, 000.0000°E'); });
    test('convert OSGB36 -> WGS84',      function() { greenwichOSGB36.convertDatum(LatLon.datum.WGS84).toString('d').should.equal('51.4778°N, 000.0016°W'); });

    // DG round-trip

    var dgGridRef = OsGridRef.parse('TQ 44359 80653');

    // round-tripping OSGB36 works perfectly
    var dgOsgb = OsGridRef.osGridToLatLon(dgGridRef, LatLon.datum.OSGB36);
    test('DG round-trip OSGB36',         function() { dgGridRef.toString().should.equal( OsGridRef.latLonToOsGrid(dgOsgb).toString()); });
    test('DG round-trip OSGB36 numeric', function() { OsGridRef.latLonToOsGrid(dgOsgb).toString(0).should.equal('544359,180653'); });

    // reversing Helmert transform (OSGB->WGS->OSGB) introduces small error (≈ 3mm in UK), so WGS84
    // round-trip is not quite perfect: test needs to incorporate 3mm error to pass
    var dgWgs = OsGridRef.osGridToLatLon(dgGridRef); // default is WGS84
    test('DG round-trip WGS84 numeric',  function() { OsGridRef.latLonToOsGrid(dgWgs).toString(0).should.equal('544358.997,180653'); });
});
