/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - os-gridref                                 (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai     = require('chai');  // BDD/TDD assertion library

var LatLon   = require('../npm.js').LatLonVectors;
var Vector3d = require('../npm.js').Vector3d;

chai.should();
var test = it; // just an alias

describe('latlon-vectors', function() {
    test('ll to v',           function() { LatLon(45, 45).toVector().toString().should.equal('[0.500,0.500,0.707]'); });
    test('v to ll',           function() { Vector3d(0.500, 0.500, 0.707107).toLatLonS().toString('d').should.equal('45.0000°N, 045.0000°E'); });
    test('great circle',      function() { LatLon(53.3206, -1.7297).greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'); });
    test('distance',          function() { LatLon(52.205, 0.119).distanceTo(LatLon(48.857, 2.351)).toPrecision(4).should.equal('4.043e+5'); });
    test('bearing',           function() { LatLon(52.205, 0.119).bearingTo(LatLon(48.857, 2.351)).toFixed(1).should.equal('156.2'); });
    test('bearing (reverse)', function() { LatLon(48.857, 2.351).bearingTo(LatLon(52.205, 0.119)).toFixed(1).should.equal('337.9'); });
    test('midpoint',          function() { LatLon(52.205, 0.119).midpointTo(LatLon(48.857, 2.351)).toString('d').should.equal('50.5363°N, 001.2746°E'); });
    test('destination',       function() { LatLon(51.4778, -0.0015).destinationPoint(7794, 300.7).toString('d').should.equal('51.5135°N, 000.0983°W'); });
    test('gc from vector',    function() { LatLon(53.3206, -1.7297).toVector().greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594]'); });

    var N = 0, E = 90, S = 180, W = 270;
    test('intersection toward 1,1 N,E nearest',        function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 0), E).toString('d').should.equal('00.9998°N, 001.0000°E'); });
    test('intersection toward 1,1 E,N nearest',        function() { LatLon.intersection(LatLon(1, 0), E, LatLon(0, 1), N).toString('d').should.equal('00.9998°N, 001.0000°E'); });
    test('intersection toward 1,1 N,E antipodal',      function() { LatLon.intersection(LatLon(2, 1), N, LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 N,W antipodal', function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 W,N antipodal', function() { LatLon.intersection(LatLon(1, 0), W, LatLon(0, 1), N).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 S,E antipodal', function() { LatLon.intersection(LatLon(0, 1), S, LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 E,S antipodal', function() { LatLon.intersection(LatLon(1, 0), E, LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection away 1,1 S,W antipodal',        function() { LatLon.intersection(LatLon(0, 1), S, LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection away 1,1 W,S antipodal',        function() { LatLon.intersection(LatLon(1, 0), W, LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });

    test('intersection 1E/90E N,E antipodal',          function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 90), E).toString('d').should.equal('00.0175°S, 179.0000°W'); });
    test('intersection 1E/90E N,E nearest',            function() { LatLon.intersection(LatLon(0, 1), N, LatLon(1, 92), E).toString('d').should.equal('00.0175°N, 179.0000°W'); });

    test('intersection brng+end 1a',                   function() { LatLon.intersection(LatLon(1, 0), LatLon(1, 3), LatLon(2, 2), S).toString('d').should.equal('01.0003°N, 002.0000°E'); });
    test('intersection brng+end 1b',                   function() { LatLon.intersection(LatLon(2, 2), S, LatLon(1, 0), LatLon(1, 3)).toString('d').should.equal('01.0003°N, 002.0000°E'); });
    test('intersection brng+end 2a',                   function() { LatLon.intersection(LatLon(1, 0), LatLon(1, 3), LatLon(2, 2), N).toString('d').should.equal('01.0003°S, 178.0000°W'); });
    test('intersection brng+end 2b',                   function() { LatLon.intersection(LatLon(2, 2), N, LatLon(1, 0), LatLon(1, 3)).toString('d').should.equal('01.0003°S, 178.0000°W'); });

    test('intersection end+end',                       function() { LatLon.intersection(LatLon(1, 1), LatLon(2, 2), LatLon(1, 4), LatLon(2, 3)).toString('d').should.equal('02.4994°N, 002.5000°E'); });

    var stn = LatLon(51.8853, 0.2545), cdg = LatLon(49.0034, 2.5735);
    test('intersection stn-cdg-bxl',                   function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });

    test('cross-track b', function() { LatLon(10, 0).crossTrackDistanceTo(LatLon(0, 0), 90).toPrecision(4).should.equal('-1.112e+6'); });
    test('cross-track p', function() { LatLon(10, 1).crossTrackDistanceTo(LatLon(0, 0), LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+6'); });
    test('cross-track -', function() { LatLon(10, 0).crossTrackDistanceTo(LatLon(0, 0), 270).toPrecision(4).should.equal('1.112e+6'); });

    test('nearest point on segment 1',  function() { LatLon(51.0, 1.9).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).toString('d').should.equal('51.0004°N, 001.9000°E'); });
    test('nearest point on segment 1d', function() { LatLon(51.0, 1.9).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).distanceTo(LatLon(51.0, 1.9)).toPrecision(4).should.equal('42.71'); });
    test('nearest point on segment 2',  function() { LatLon(51.0, 2.1).nearestPointOnSegment(LatLon(51.0, 1.0), LatLon(51.0, 2.0)).toString('d').should.equal('51.0000°N, 002.0000°E'); });

    var polyHemi = [new LatLon(0,1), new LatLon(45,0), new LatLon(89,90), new LatLon(45,180), new LatLon(0,179), new LatLon(-45,180), new LatLon(-89,90), new LatLon(-45,0)];
    var polyGc = [new LatLon(10,0), new LatLon(10,90), new LatLon(0,45)];
    var polyPole = [new LatLon(89,0), new LatLon(89,120), new LatLon(89,-120)];
    var polyPoleEdge = [new LatLon(85,90), LatLon(85,0), new LatLon(85,-90)];
    var polyConcave = [new LatLon(1,1), new LatLon(5,1), new LatLon(5,3), new LatLon(1,3), new LatLon(3,2)];
    test('hemisphere enclosed y', function() { new LatLon(22.5,0.59).enclosedBy(polyHemi).should.be.true; });
    test('hemisphere enclosed n', function() { new LatLon(22.5,0.58).enclosedBy(polyHemi).should.be.false; });
    test('gc enclosed y',         function() { new LatLon(14,45).enclosedBy(polyGc).should.be.true; });
    test('gc enclosed n',         function() { new LatLon(15,45).enclosedBy(polyGc).should.be.false; });
    test('pole enclosed',         function() { new LatLon(90,0).enclosedBy(polyPole).should.be.true; });
    test('polar edge enclosed',   function() { new LatLon(90,0).enclosedBy(polyPoleEdge).should.be.true; });
    test('concave enclosed y',    function() { new LatLon(4,2).enclosedBy(polyConcave).should.be.true; });
    test('concave enclosed n',    function() { new LatLon(2,2).enclosedBy(polyConcave).should.be.false; });

    test('equals true',  function() { LatLon(52.205, 0.119).equals(LatLon(52.205, 0.119)).should.be.true; });
    test('equals false', function() { LatLon(52.206, 0.119).equals(LatLon(52.205, 0.119)).should.be.false; });
});
