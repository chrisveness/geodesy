/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-vincenty                            (c) Chris Veness 2014-2017  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

require('chai').should();  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonEllipsoidal;

var test = it; // just an alias

describe('latlon-vincenty', function() {
    var le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
    test('inverse distance',                     function() { le.distanceTo(jog).toFixed(3).should.equal('969954.166'); });
    test('inverse initial bearing',              function() { le.initialBearingTo(jog).toFixed(4).should.equal('9.1419'); });
    test('inverse final bearing',                function() { le.finalBearingTo(jog).toFixed(4).should.equal('11.2972'); });

    var flindersPeak = new LatLon(-37.95103, 144.42487);
    var buninyong = new LatLon(-37.6528, 143.9265);
    test('direct destination',                   function() { flindersPeak.destinationPoint(54972.271, 306.86816).toString('d').should.equal(buninyong.toString('d')); });
    test('direct final brng',                    function() { flindersPeak.finalBearingOn(54972.271, 306.86816).toFixed(4).should.equal('307.1736'); });
    test('antipodal distance',                   function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.5)).should.equal(19936288.579); });

    test('antipodal convergence failure dist',   function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN; });
    test('antipodal convergence failure brng i', function() { new LatLon(0, 0).initialBearingTo(new LatLon(0.5, 179.7)).should.be.NaN; });
    test('antipodal convergence failure brng f', function() { new LatLon(0, 0).finalBearingTo(new LatLon(0.5, 179.7)).should.be.NaN; });

    test('inverse coincident distance',          function() { le.distanceTo(le).should.equal(0); });
    test('inverse coincident initial bearing',   function() { le.initialBearingTo(le).should.be.NaN; });
    test('inverse coincident final bearing',     function() { le.finalBearingTo(le).should.be.NaN; });
    test('inverse equatorial distance',          function() { new LatLon(0,0).distanceTo(new LatLon(0,1)).should.equal(111319.491); });
    test('direct coincident destination',        function() { le.destinationPoint(0, 0).toString('d').should.equal(le.toString('d')); });

    test('Q1 a', function() { new LatLon( 30, 30).distanceTo(new LatLon( 60, 60)).should.equal(4015703.021); });
    test('Q1 b', function() { new LatLon( 60, 60).distanceTo(new LatLon( 30, 30)).should.equal(4015703.021); });
    test('Q1 c', function() { new LatLon( 30, 60).distanceTo(new LatLon( 60, 30)).should.equal(4015703.021); });
    test('Q1 d', function() { new LatLon( 60, 30).distanceTo(new LatLon( 30, 60)).should.equal(4015703.021); });
    test('Q2 a', function() { new LatLon( 30,-30).distanceTo(new LatLon( 60,-60)).should.equal(4015703.021); });
    test('Q2 b', function() { new LatLon( 60,-60).distanceTo(new LatLon( 30,-30)).should.equal(4015703.021); });
    test('Q2 c', function() { new LatLon( 30,-60).distanceTo(new LatLon( 60,-30)).should.equal(4015703.021); });
    test('Q2 d', function() { new LatLon( 60,-30).distanceTo(new LatLon( 30,-60)).should.equal(4015703.021); });
    test('Q3 a', function() { new LatLon(-30,-30).distanceTo(new LatLon(-60,-60)).should.equal(4015703.021); });
    test('Q3 b', function() { new LatLon(-60,-60).distanceTo(new LatLon(-30,-30)).should.equal(4015703.021); });
    test('Q3 c', function() { new LatLon(-30,-60).distanceTo(new LatLon(-60,-30)).should.equal(4015703.021); });
    test('Q3 d', function() { new LatLon(-60,-30).distanceTo(new LatLon(-30,-60)).should.equal(4015703.021); });
    test('Q4 a', function() { new LatLon(-30, 30).distanceTo(new LatLon(-60, 60)).should.equal(4015703.021); });
    test('Q4 b', function() { new LatLon(-60, 60).distanceTo(new LatLon(-30, 30)).should.equal(4015703.021); });
    test('Q4 c', function() { new LatLon(-30, 60).distanceTo(new LatLon(-60, 30)).should.equal(4015703.021); });
    test('Q4 d', function() { new LatLon(-60, 30).distanceTo(new LatLon(-30, 60)).should.equal(4015703.021); });
});
