/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-spherical                           (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai = require('chai');  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonSpherical;
var Dms    = require('../npm.js').Dms;

chai.should();
var test = it; // just an alias

describe('latlon-spherical', function() {
    var R = 6371e3;
    var π = Math.PI;

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
        test('int.point',        function() { cambg.intermediatePointTo(paris, 0.25).toString('d').should.equal('51.3721°N, 000.7073°E'); });

        var greenwich = new LatLon(51.4778, -0.0015), dist = 7794, brng = 300.7;
        test('dest’n',           function() { greenwich.destinationPoint(dist, brng).toString('d').should.equal('51.5135°N, 000.0983°W'); });

        var stn = new LatLon(51.8853, 0.2545), cdg = new LatLon(49.0034, 2.5735);
        test('intersec’n',       function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });

        var bradwell = new LatLon(53.3206, -1.7297);
        test('cross-track',      function() { new LatLon(53.2611, -0.7972).crossTrackDistanceTo(bradwell, new LatLon(53.1887,  0.1334)).toPrecision(4).should.equal('-307.5'); });

        test('Clairaut 0°',      function() { new LatLon(0,0).maxLatitude( 0).should.equal(90); });
        test('Clairaut 1°',      function() { new LatLon(0,0).maxLatitude( 1).should.equal(89); });
        test('Clairaut 90°',     function() { new LatLon(0,0).maxLatitude(90).should.equal(0); });

        var parallels = LatLon.crossingParallels(new LatLon(0,0), new LatLon(60,30), 30);
        test('parallels 1',      function() { new LatLon(30, parallels.lon1).toString().should.equal('30°00′00″N, 009°35′39″E'); });
        test('parallels 2',      function() { new LatLon(30, parallels.lon2).toString().should.equal('30°00′00″N, 170°24′21″E'); });

        var lax = new LatLon(Dms.parseDMS('33° 57′N'), Dms.parseDMS('118° 24′W'));
        var jfk = new LatLon(Dms.parseDMS('40° 38′N'), Dms.parseDMS('073° 47′W'));
        test('EW distance nm',   function() { lax.distanceTo(jfk, 180*60/π).toPrecision(4).should.equal('2144'); });
        test('EW bearing',       function() { lax.bearingTo(jfk).toPrecision(2).should.equal('66'); });
        test('EW intermediate',  function() { lax.intermediatePointTo(jfk, 100/2144).toString('dm', 0).should.equal('34°37′N, 116°33′W'); });
        var d = new LatLon(Dms.parseDMS('34:30N'), Dms.parseDMS('116:30W'));
        test('EW cross-track',   function() { d.crossTrackDistanceTo(lax, jfk, 180*60/π).toPrecision(5).should.equal('7.4523'); });
        test('EW along-track',   function() { d.alongTrackDistanceTo(lax, jfk, 180*60/π).toPrecision(5).should.equal('99.588'); });
        test('EW intermediate',  function() { lax.intermediatePointTo(jfk, 0.4).toString('dm', 3).should.equal('38°40.167′N, 101°37.570′W'); });
        var reo = new LatLon(Dms.parseDMS('42.600N'), Dms.parseDMS('117.866W'));
        var bke = new LatLon(Dms.parseDMS('44.840N'), Dms.parseDMS('117.806W'));
        test('EW intersection',  function() { LatLon.intersection(reo, 51, bke, 137).toString('d', 3).should.equal('43.572°N, 116.189°W'); });
    });

    describe('area', function() {
        var polyTriangle = [new LatLon(1,1), new LatLon(2,1), new LatLon(1,2)];
        var polySquareCw = [new LatLon(1,1), new LatLon(2,1), new LatLon(2,2), new LatLon(1,2)];
        var polySquareCcw = [new LatLon(1,1), new LatLon(1,2), new LatLon(2,2), new LatLon(2,1)];
        var polyQuadrant = [new LatLon(0,1e-99), new LatLon(0,180), new LatLon(90,0)];
        var polyHemi = [new LatLon(0,1), new LatLon(45,0), new LatLon(89,90), new LatLon(45,180), new LatLon(0,179), new LatLon(-45,180), new LatLon(-89,90), new LatLon(-45,0)];
        var polyPole = [new LatLon(89,0), new LatLon(89,120), new LatLon(89,-120)];
        var polyConcave = [new LatLon(1,1), new LatLon(5,1), new LatLon(5,3), new LatLon(1,3), new LatLon(3,2)];
        test('triangle area',    function() { LatLon.areaOf(polyTriangle).toFixed(0).should.equal('6181527888'); });
        test('square cw area',   function() { LatLon.areaOf(polySquareCw).toFixed(0).should.equal('12360230987'); });
        test('square ccw area',  function() { LatLon.areaOf(polySquareCcw).toFixed(0).should.equal('12360230987'); });
        test('quadrant area',    function() { LatLon.areaOf(polyQuadrant).should.equal(Math.PI*R*R); });
        test('hemisphere area',  function() { LatLon.areaOf(polyHemi).toFixed(0).should.equal('252684679676459'); });
        test('pole area',        function() { LatLon.areaOf(polyPole).toFixed(0).should.equal('16063139192'); });
        test('concave area',     function() { LatLon.areaOf(polyConcave).toFixed(0).should.equal('74042699236'); });
    });

    describe('rhumb lines', function() {
        var dov = new LatLon(51.127, 1.338), cal = new LatLon(50.964, 1.853);
        test('distance',         function() { dov.rhumbDistanceTo(cal).toPrecision(4).should.equal('4.031e+4'); });
        test('bearing',          function() { dov.rhumbBearingTo(cal).toFixed(1).should.equal('116.7'); });
        test('dest’n',           function() { dov.rhumbDestinationPoint(40310, 116.7).toString('d').should.equal('50.9641°N, 001.8531°E'); });
        test('midpoint',         function() { dov.rhumbMidpointTo(cal).toString('d').should.equal('51.0455°N, 001.5957°E'); });
    });

});
