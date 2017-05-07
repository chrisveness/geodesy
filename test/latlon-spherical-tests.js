/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-spherical                           (c) Chris Veness 2014-2017  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var should = require('chai').should();  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonSpherical;
var Dms    = require('../npm.js').Dms;

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
        test('distance err',     function() { cambg.distanceTo.bind(LatLon, 'here').should.throw(TypeError); });
        test('initial bearing',  function() { cambg.bearingTo(paris).toFixed(1).should.equal('156.2'); });
        test('final bearing',    function() { cambg.finalBearingTo(paris).toFixed(1).should.equal('157.9'); });
        test('initial brng err', function() { cambg.bearingTo.bind(LatLon, 999).should.throw(TypeError); });
        test('final brng err',   function() { cambg.finalBearingTo.bind(LatLon, 999).should.throw(TypeError); });
        test('midpoint',         function() { cambg.midpointTo(paris).toString('d').should.equal('50.5363°N, 001.2746°E'); });
        test('midpoint err',     function() { cambg.midpointTo.bind(LatLon, true).should.throw(TypeError); });
        test('int.point',        function() { cambg.intermediatePointTo(paris, 0.25).toString('d').should.equal('51.3721°N, 000.7073°E'); });
        test('int.point err',    function() { cambg.intermediatePointTo.bind(LatLon, 1, 0.5).should.throw(TypeError); });

        var greenwich = new LatLon(51.4778, -0.0015), dist = 7794, brng = 300.7;
        test('dest’n',           function() { greenwich.destinationPoint(dist, brng).toString('d').should.equal('51.5135°N, 000.0983°W'); });
        test('dest’n inc R',     function() { greenwich.destinationPoint(dist, brng, 6371e3).toString('d').should.equal('51.5135°N, 000.0983°W'); });

        var bradwell = new LatLon(53.3206, -1.7297);
        test('cross-track',      function() { new LatLon(53.2611, -0.7972).crossTrackDistanceTo(bradwell, new LatLon(53.1887,  0.1334)).toPrecision(4).should.equal('-307.5'); });
        test('along-track',      function() { new LatLon(53.2611, -0.7972).alongTrackDistanceTo(bradwell, new LatLon(53.1887,  0.1334)).toPrecision(4).should.equal('6.233e+4'); });

        test('cross-track NE',   function() { LatLon( 1,  1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'); });
        test('cross-track SE',   function() { LatLon(-1,  1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'); });
        test('cross-track SW?',  function() { LatLon(-1, -1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'); });
        test('cross-track NW?',  function() { LatLon( 1, -1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'); });

        test('along-track NE',   function() { LatLon( 1,  1).alongTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'); });
        test('along-track SE',   function() { LatLon(-1,  1).alongTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('1.112e+5'); });
        test('along-track SW',   function() { LatLon(-1, -1).alongTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'); });
        test('along-track NW',   function() { LatLon( 1, -1).alongTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+5'); });

        test('cross-track err',  function() { LatLon(1, 1).crossTrackDistanceTo.bind(LatLon, false, LatLon(0, 2)).should.throw(TypeError); });
        test('cross-track err',  function() { LatLon(1, 1).crossTrackDistanceTo.bind(LatLon, LatLon(0, 0), false).should.throw(TypeError); });

        test('Clairaut 0°',      function() { new LatLon(0,0).maxLatitude( 0).should.equal(90); });
        test('Clairaut 1°',      function() { new LatLon(0,0).maxLatitude( 1).should.equal(89); });
        test('Clairaut 90°',     function() { new LatLon(0,0).maxLatitude(90).should.equal(0); });

        var parallels = LatLon.crossingParallels(new LatLon(0,0), new LatLon(60,30), 30);
        test('parallels 1',      function() { new LatLon(30, parallels.lon1).toString().should.equal('30°00′00″N, 009°35′39″E'); });
        test('parallels 2',      function() { new LatLon(30, parallels.lon2).toString().should.equal('30°00′00″N, 170°24′21″E'); });
        test('parallels -',      function() { should.not.exist(LatLon.crossingParallels(new LatLon(0,0), new LatLon(10,60), 60)); });

    });

    describe('Ed Williams', function() {
        var lax = new LatLon(Dms.parseDMS('33° 57′N'), Dms.parseDMS('118° 24′W'));
        var jfk = new LatLon(Dms.parseDMS('40° 38′N'), Dms.parseDMS('073° 47′W'));
        test('distance nm',   function() { lax.distanceTo(jfk, 180*60/π).toPrecision(4).should.equal('2144'); });
        test('bearing',       function() { lax.bearingTo(jfk).toPrecision(2).should.equal('66'); });
        test('intermediate',  function() { lax.intermediatePointTo(jfk, 100/2144).toString('dm', 0).should.equal('34°37′N, 116°33′W'); });
        var d = new LatLon(Dms.parseDMS('34:30N'), Dms.parseDMS('116:30W'));
        test('cross-track',   function() { d.crossTrackDistanceTo(lax, jfk, 180*60/π).toPrecision(5).should.equal('7.4523'); });
        test('intermediate',  function() { lax.intermediatePointTo(jfk, 0.4).toString('dm', 3).should.equal('38°40.167′N, 101°37.570′W'); });
        var reo = new LatLon(Dms.parseDMS('42.600N'), Dms.parseDMS('117.866W'));
        var bke = new LatLon(Dms.parseDMS('44.840N'), Dms.parseDMS('117.806W'));
        test('intersection',  function() { LatLon.intersection(reo, 51, bke, 137).toString('d', 3).should.equal('43.572°N, 116.189°W'); });
    });

    describe('intersections', function() {
        var N = 0, E = 90, S = 180, W = 270;
        test('toward 1,1 N,E nearest', function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 0), E).toString('d').should.equal('00.9998°N, 001.0000°E'); });
        test('toward 1,1 E,N nearest', function() { LatLon.intersection(LatLon(1, 0), E, LatLon(0, 1), N).toString('d').should.equal('00.9998°N, 001.0000°E'); });
        test('away 1,1 S,W antipodal', function() { LatLon.intersection(LatLon(0, 1), S, LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('away 1,1 W,S antipodal', function() { LatLon.intersection(LatLon(1, 0), W, LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });

        test('1E/90E N,E nearest',     function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 92), E).toString('d').should.equal('00.0175°N, 179.0000°W'); });

        var stn = LatLon(51.8853, 0.2545), cdg = LatLon(49.0034, 2.5735);
        test('stn-cdg-bxl',            function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });

        test('bad point 1',            function() { LatLon.intersection.bind(LatLon, false, N, LatLon(1, 0), E).should.throw(TypeError); });
        test('bad point 2',            function() { LatLon.intersection.bind(LatLon, LatLon(0, 1), N, false, E).should.throw(TypeError); });
        test('coincident points',      function() { should.not.exist(LatLon.intersection(LatLon(0, 1), N, LatLon(0, 1), E)); });
    });

    describe('polygonal', function() {
        var polyTriangle  = [ new LatLon(1,1), new LatLon(2,1), new LatLon(1,2) ];
        var polySquareCw  = [ new LatLon(1,1), new LatLon(2,1), new LatLon(2,2), new LatLon(1,2) ];
        var polySquareCcw = [ new LatLon(1,1), new LatLon(1,2), new LatLon(2,2), new LatLon(2,1) ];
        var polyQuadrant  = [ new LatLon(0,0), new LatLon(0,90), new LatLon(90,0) ];
        var polyHemi      = [ new LatLon(0,1), new LatLon(45,0), new LatLon(89,90), new LatLon(45,180), new LatLon(0,179), new LatLon(-45,180), new LatLon(-89,90), new LatLon(-45,0) ];
        var polyPole      = [ new LatLon(89,0), new LatLon(89,120), new LatLon(89,-120) ];
        var polyConcave   = [ new LatLon(1,1), new LatLon(5,1), new LatLon(5,3), new LatLon(1,3), new LatLon(3,2) ];
        test('triangle area',        function() { LatLon.areaOf(polyTriangle).toFixed(0).should.equal('6181527888'); });
        test('triangle area radius', function() { LatLon.areaOf(polyTriangle, 6371e3).toFixed(0).should.equal('6181527888'); });
        test('triangle area closed', function() { LatLon.areaOf(polyTriangle.concat(polyTriangle[0])).toFixed(0).should.equal('6181527888'); });
        test('square cw area',       function() { LatLon.areaOf(polySquareCw).toFixed(0).should.equal('12360230987'); });
        test('square ccw area',      function() { LatLon.areaOf(polySquareCcw).toFixed(0).should.equal('12360230987'); });
        test('quadrant area',        function() { LatLon.areaOf(polyQuadrant).toFixed(1).should.equal((π*R*R/2).toFixed(1)); });
        test('hemisphere area',      function() { LatLon.areaOf(polyHemi).toFixed(0).should.equal('252684679676459'); }); // TODO: vectors gives 252198975941606 (0.2% error) - which is right?
        test('pole area',            function() { LatLon.areaOf(polyPole).toFixed(0).should.equal('16063139192'); });
        test('concave area',         function() { LatLon.areaOf(polyConcave).toFixed(0).should.equal('74042699236'); });
    });

    describe('rhumb lines', function() {
        var dov = new LatLon(51.127, 1.338), cal = new LatLon(50.964, 1.853);
        test('distance',              function() { dov.rhumbDistanceTo(cal).toPrecision(4).should.equal('4.031e+4'); });
        test('distance r',            function() { dov.rhumbDistanceTo(cal, 6371e3).toPrecision(4).should.equal('4.031e+4'); });
        test('distance dateline E-W', function() { new LatLon(1, -179).rhumbDistanceTo(new LatLon(1, 179)).toFixed(6).should.equal(new LatLon(1, 1).rhumbDistanceTo(new LatLon(1, -1)).toFixed(6)); });
        test('distance err',          function() { dov.rhumbDistanceTo.bind(LatLon, false).should.throw(TypeError); });
        test('bearing',               function() { dov.rhumbBearingTo(cal).toFixed(1).should.equal('116.7'); });
        test('bearing dateline',      function() { new LatLon(1, -179).rhumbBearingTo(new LatLon(1, 179)).should.equal(270); });
        test('bearing dateline',      function() { new LatLon(1, 179).rhumbBearingTo(new LatLon(1, -179)).should.equal(90); });
        test('bearing err',           function() { dov.rhumbBearingTo.bind(LatLon, false).should.throw(TypeError); });
        test('dest’n',                function() { dov.rhumbDestinationPoint(40310, 116.7).toString('d').should.equal('50.9641°N, 001.8531°E'); });
        test('dest’n',                function() { dov.rhumbDestinationPoint(40310, 116.7, 6371e3).toString('d').should.equal('50.9641°N, 001.8531°E'); });
        test('dest’n',                function() { new LatLon(1, 1).rhumbDestinationPoint(111178, 90).toString('d').should.equal('01.0000°N, 002.0000°E'); });
        test('midpoint',              function() { dov.rhumbMidpointTo(cal).toString('d').should.equal('51.0455°N, 001.5957°E'); });
        test('midpoint dateline',     function() { new LatLon(1, -179).rhumbMidpointTo(new LatLon(1, 178)).toString('d').should.equal('01.0000°N, 179.5000°E'); });
        test('midpoint err',          function() { dov.rhumbMidpointTo.bind(LatLon, false).should.throw(TypeError); });
    });

    describe('misc', function() {
        test('equals true',  function() { LatLon(52.205, 0.119).equals(LatLon(52.205, 0.119)).should.be.true; });
        test('equals false', function() { LatLon(52.206, 0.119).equals(LatLon(52.205, 0.119)).should.be.false; });
        test('equals error', function() { LatLon(52.206, 0.119).equals.bind(LatLon, false).should.throw(TypeError); });
    });

});
