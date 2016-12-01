/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-vectors                             (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai     = require('chai');  // BDD/TDD assertion library

var LatLon   = require('../npm.js').LatLonVectors;
var Vector3d = require('../npm.js').Vector3d;
var Dms      = require('../npm.js').Dms;

chai.should();
var test = it; // just an alias

describe('latlon-vectors', function() {
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
        test('midpoint',         function() { cambg.midpointTo(paris).toString('d').should.equal('50.5363°N, 001.2746°E'); });
        test('int.point',        function() { cambg.intermediatePointTo(paris, 0.25).toString('d').should.equal('51.3721°N, 000.7073°E'); });
        test('int.point-chord',  function() { cambg.intermediatePointOnChordTo(paris, 0.25).toString('d').should.equal('51.3723°N, 000.7072°E'); });

        var greenwich = new LatLon(51.4778, -0.0015), dist = 7794, brng = 300.7;
        test('dest’n',           function() { greenwich.destinationPoint(dist, brng).toString('d').should.equal('51.5135°N, 000.0983°W'); });

        var bradwell = new LatLon(53.3206, -1.7297);
        test('cross-track',      function() { new LatLon(53.2611, -0.7972).crossTrackDistanceTo(bradwell, new LatLon(53.1887,  0.1334)).toPrecision(4).should.equal('-307.5'); });

        test('cross-track p',    function() { LatLon(10, 1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+6'); });
        test('cross-track we',   function() { LatLon(10, 0).crossTrackDistanceTo(LatLon(0, 0), 90).toPrecision(4).should.equal('-1.112e+6'); });
        test('cross-track ew',   function() { LatLon(10, 0).crossTrackDistanceTo(LatLon(0, 0), 270).toPrecision(4).should.equal('1.112e+6'); });

        test('nearest point on segment 1',  function() { LatLon(51.0, 1.9).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).toString('d').should.equal('51.0004°N, 001.9000°E'); });
        test('nearest point on segment 1d', function() { LatLon(51.0, 1.9).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).distanceTo(LatLon(51.0, 1.9)).toPrecision(4).should.equal('42.71'); });
        test('nearest point on segment 2',  function() { LatLon(51.0, 2.1).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).toString('d').should.equal('51.0000°N, 002.0000°E'); });
        test('nearest point on segment JB', function() { LatLon(10, -140).nearestPointOnSegment(LatLon(0, 20), LatLon(0, 40)).toString('d').should.equal('00.0000°N, 020.0000°E'); });
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
        test('toward 1,1 N,E nearest',        function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 0), E).toString('d').should.equal('00.9998°N, 001.0000°E'); });
        test('toward 1,1 E,N nearest',        function() { LatLon.intersection(LatLon(1, 0), E, LatLon(0, 1), N).toString('d').should.equal('00.9998°N, 001.0000°E'); });
        test('toward 1,1 N,E antipodal',      function() { LatLon.intersection(LatLon(2, 1), N, LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('toward/away 1,1 N,W antipodal', function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('toward/away 1,1 W,N antipodal', function() { LatLon.intersection(LatLon(1, 0), W, LatLon(0, 1), N).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('toward/away 1,1 S,E antipodal', function() { LatLon.intersection(LatLon(0, 1), S, LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('toward/away 1,1 E,S antipodal', function() { LatLon.intersection(LatLon(1, 0), E, LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('away 1,1 S,W antipodal',        function() { LatLon.intersection(LatLon(0, 1), S, LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
        test('away 1,1 W,S antipodal',        function() { LatLon.intersection(LatLon(1, 0), W, LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });

        test('1E/90E N,E antipodal',          function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 90), E).toString('d').should.equal('00.0175°S, 179.0000°W'); });
        test('1E/90E N,E nearest',            function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 92), E).toString('d').should.equal('00.0175°N, 179.0000°W'); });

        test('brng+end 1a',                   function() { LatLon.intersection(LatLon(1, 0), LatLon(1, 3), LatLon(2, 2), S).toString('d').should.equal('01.0003°N, 002.0000°E'); });
        test('brng+end 1b',                   function() { LatLon.intersection(LatLon(2, 2), S, LatLon(1, 0), LatLon(1, 3)).toString('d').should.equal('01.0003°N, 002.0000°E'); });
        test('brng+end 2a',                   function() { LatLon.intersection(LatLon(1, 0), LatLon(1, 3), LatLon(2, 2), N).toString('d').should.equal('01.0003°S, 178.0000°W'); });
        test('brng+end 2b',                   function() { LatLon.intersection(LatLon(2, 2), N, LatLon(1, 0), LatLon(1, 3)).toString('d').should.equal('01.0003°S, 178.0000°W'); });

        test('end+end',                       function() { LatLon.intersection(LatLon(1, 1), LatLon(2, 2), LatLon(1, 4), LatLon(2, 3)).toString('d').should.equal('02.4994°N, 002.5000°E'); });

        var stn = LatLon(51.8853, 0.2545), cdg = LatLon(49.0034, 2.5735);
        test('stn-cdg-bxl',                   function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });
    });

    describe('polygonal', function() {
        var polyTriangle = [ new LatLon(1,1), new LatLon(2,1), new LatLon(1,2) ];
        var polySquareCw = [ new LatLon(1,1), new LatLon(2,1), new LatLon(2,2), new LatLon(1,2) ];
        var polySquareCcw = [ new LatLon(1,1), new LatLon(1,2), new LatLon(2,2), new LatLon(2,1) ];
        var polyQuadrant = [ new LatLon(0,0), new LatLon(0,90), new LatLon(90,0) ];
        var polyHemi = [ new LatLon(0,1), new LatLon(45,0), new LatLon(89,90), new LatLon(45,180), new LatLon(0,179), new LatLon(-45,180), new LatLon(-89,90), new LatLon(-45,0) ];
        var polyGc = [ new LatLon(10,0), new LatLon(10,90), new LatLon(0,45) ];
        var polyPole = [ new LatLon(89,0), new LatLon(89,120), new LatLon(89,-120) ];
        var polyPoleEdge = [ new LatLon(85,90), LatLon(85,0), new LatLon(85,-90) ];
        var polyConcave = [ new LatLon(1,1), new LatLon(5,1), new LatLon(5,3), new LatLon(1,3), new LatLon(3,2) ];
        test('triangle area',         function() { LatLon.areaOf(polyTriangle).toFixed(0).should.equal('6181527888'); });
        test('square cw area',        function() { LatLon.areaOf(polySquareCw).toFixed(0).should.equal('12360230987'); });
        test('square ccw area',       function() { LatLon.areaOf(polySquareCcw).toFixed(0).should.equal('12360230987'); });
        test('quadrant area',         function() { LatLon.areaOf(polyQuadrant).toFixed(1).should.equal((π*R*R/2).toFixed(1)); });
        test('hemisphere area',       function() { LatLon.areaOf(polyHemi).toFixed(0).should.equal('252198975941606'); }); // TODO: spherical gives 252684679676459 (0.2% error) - which is right?
        test('pole area',             function() { LatLon.areaOf(polyPole).toFixed(0).should.equal('16063139192'); });
        test('concave area',          function() { LatLon.areaOf(polyConcave).toFixed(0).should.equal('74042699236'); });
        test('hemisphere enclosed y', function() { new LatLon(22.5,0.59).enclosedBy(polyHemi).should.be.true; });
        test('hemisphere enclosed n', function() { new LatLon(22.5,0.58).enclosedBy(polyHemi).should.be.false; });
        test('gc enclosed y',         function() { new LatLon(14,45).enclosedBy(polyGc).should.be.true; });
        test('gc enclosed n',         function() { new LatLon(15,45).enclosedBy(polyGc).should.be.false; });
        test('pole enclosed',         function() { new LatLon(90,0).enclosedBy(polyPole).should.be.true; });
        test('polar edge enclosed',   function() { new LatLon(90,0).enclosedBy(polyPoleEdge).should.be.true; });
        test('concave enclosed y',    function() { new LatLon(4,2).enclosedBy(polyConcave).should.be.true; });
        test('concave enclosed n',    function() { new LatLon(2,2).enclosedBy(polyConcave).should.be.false; });
    });

    describe('misc', function() {
        test('equals true',  function() { LatLon(52.205, 0.119).equals(LatLon(52.205, 0.119)).should.be.true; });
        test('equals false', function() { LatLon(52.206, 0.119).equals(LatLon(52.205, 0.119)).should.be.false; });
    });

    describe('vectors', function() {
        test('ll to v',           function() { LatLon(45, 45).toVector().toString().should.equal('[0.500,0.500,0.707]'); });
        test('v to ll',           function() { Vector3d(0.500, 0.500, 0.707107).toLatLonS().toString('d').should.equal('45.0000°N, 045.0000°E'); });
        test('great circle',      function() { LatLon(53.3206, -1.7297).greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'); });
        test('gc from vector',    function() { LatLon(53.3206, -1.7297).toVector().greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'); });
    });
});
