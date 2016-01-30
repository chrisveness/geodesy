/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-vincenty                            (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai = require('chai');  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonEllipsoidal;

chai.should();
var test = it; // just an alias

describe('latlon-vincenty', function() {
    var le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
    test('vincenty inverse distance',              function() { le.distanceTo(jog).toFixed(3).should.equal('969954.166'); });
    test('vincenty inverse initial bearing',       function() { le.initialBearingTo(jog).toFixed(4).should.equal('9.1419'); });
    test('vincenty inverse final bearing',         function() { le.finalBearingTo(jog).toFixed(4).should.equal('11.2972'); });

    var flindersPeak = new LatLon(-37.95103, 144.42487);
    var buninyong = new LatLon(-37.6528, 143.9265);
    test('vincenty direct destination',            function() { flindersPeak.destinationPoint(54972.271, 306.86816).toString('d').should.equal(buninyong.toString('d')); });
    test('vincenty direct final brng',             function() { flindersPeak.finalBearingOn(54972.271, 306.86816).toFixed(4).should.equal('307.1736'); });
    test('vincenty antipodal distance',            function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.5)).should.equal(19936288.579); });

    test('vincenty antipodal convergence failure', function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN; });
});
