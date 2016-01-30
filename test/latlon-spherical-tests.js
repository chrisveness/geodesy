/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-spherical                           (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai = require('chai');  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonSpherical;

chai.should();
var test = it; // just an alias

describe('latlon-spherical', function() {

    describe('formatting', function() {
        test('toString d',       function() { new LatLon(51.521470, -0.138833).toString('d', 6).should.equal('51.521470°N, 000.138833°W'); });
        test('toString dms',     function() { new LatLon(51.521470, -0.138833).toString('dms', 2).should.equal('51°31′17.29″N, 000°08′19.80″W'); });
    });

    describe('geodesics', function() {
        var cambg = new LatLon(52.205, 0.119), paris = new LatLon(48.857, 2.351);
        test('distance',         function() { cambg.distanceTo(paris).toPrecision(4).should.equal('4.043e+5'); });
        test('distance (miles)', function() { cambg.distanceTo(paris, 3959).toPrecision(4).should.equal('251.2'); });
        test('initial bearing',  function() { cambg.bearingTo(paris).toFixed(1).should.equal('156.2'); });
        test('final bearing',    function() { cambg.finalBearingTo(paris).toFixed(1).should.equal('157.9'); });
        test('midpoint',         function() { cambg.midpointTo(paris).toString('d').should.equal('50.5363°N, 001.2746°E'); });

        var bradwell = new LatLon(51.4778, -0.0015), dist = 7794, brng = 300.7;
        test('dest’n',           function() { bradwell.destinationPoint(dist, brng).toString('d').should.equal('51.5135°N, 000.0983°W'); });

        var stn = new LatLon(51.8853, 0.2545), cdg = new LatLon(49.0034, 2.5735);
        test('intersec’n',       function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });

        test('Clairaut 0°',      function() { new LatLon(0,0).maxLatitude( 0).should.equal(90); });
        test('Clairaut 1°',      function() { new LatLon(0,0).maxLatitude( 1).should.equal(89); });
        test('Clairaut 90°',     function() { new LatLon(0,0).maxLatitude(90).should.equal(0); });

        var parallels = LatLon.crossingParallels(new LatLon(0,0), new LatLon(60,30), 30);
        test('parallels 1',      function() { new LatLon(30, parallels.lon1).toString().should.equal('30°00′00″N, 009°35′39″E'); });
        test('parallels 2',      function() { new LatLon(30, parallels.lon2).toString().should.equal('30°00′00″N, 170°24′21″E'); });
    });

    describe('rhumb lines', function() {
        var dov = new LatLon(51.127, 1.338), cal = new LatLon(50.964, 1.853);
        test('distance',         function() { dov.rhumbDistanceTo(cal).toPrecision(4).should.equal('4.031e+4'); });
        test('bearing',          function() { dov.rhumbBearingTo(cal).toFixed(1).should.equal('116.7'); });
        test('dest’n',           function() { dov.rhumbDestinationPoint(40310, 116.7).toString('d').should.equal('50.9641°N, 001.8531°E'); });
        test('midpoint',         function() { dov.rhumbMidpointTo(cal).toString('d').should.equal('51.0455°N, 001.5957°E'); });
    });

});
