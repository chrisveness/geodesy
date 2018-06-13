/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-vincenty                            (c) Chris Veness 2014-2018  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

require('chai').should();  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonEllipsoidal;
var Dms    = require('../npm.js').Dms;

var test = it; // just an alias

describe('latlon-vincenty', function() {
    describe('UK', function() {
        var le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
        var dist = 969954.166, brngInit = 9.1418775, brngFinal = 11.2972204;
        test('inverse distance',                     function() { le.distanceTo(jog).should.equal(dist); });
        test('inverse initial bearing',              function() { le.initialBearingTo(jog).should.equal(brngInit); });
        test('inverse final bearing',                function() { le.finalBearingTo(jog).should.equal(brngFinal); });
        test('direct destination',                   function() { le.destinationPoint(dist, brngInit).toString('d').should.equal(jog.toString('d')); });
        test('direct final bearing',                 function() { le.finalBearingOn(dist, brngInit).should.equal(brngFinal); });
    });

    describe('Geoscience Australia', function() {
        var flindersPeak = new LatLon(Dms.parseDMS('37°57′03.72030″S'), Dms.parseDMS('144°25′29.52440W″'));
        var buninyong    = new LatLon(Dms.parseDMS('37°39′10.15610″S'), Dms.parseDMS('143°55′35.38390W″'));
        var dist = 54972.271, azFwd = '306°52′05.37″', azRev = '127°10′25.07″';
        test('inverse distance',                     function() {            flindersPeak.distanceTo(buninyong).should.equal(dist); });
        test('inverse initial bearing',              function() { Dms.toBrng(flindersPeak.initialBearingTo(buninyong), 'dms', 2).should.equal(azFwd); });
        test('inverse final bearing',                function() { Dms.toBrng(flindersPeak.finalBearingTo(buninyong)-180, 'dms', 2).should.equal(azRev); });
        test('direct destination',                   function() {            flindersPeak.destinationPoint(dist, Dms.parseDMS(azFwd)).toString('d').should.equal(buninyong.toString('d')); });
        test('direct final brng',                    function() { Dms.toBrng(flindersPeak.finalBearingOn(dist, Dms.parseDMS(azFwd))-180, 'dms', 2).should.equal(azRev); });
    });

    describe('antipodal', function() {
        test('antipodal distance',                   function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.5)).should.equal(19936288.579); });
        test('antipodal convergence failure dist',   function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN; });
        test('antipodal convergence failure brng i', function() { new LatLon(0, 0).initialBearingTo(new LatLon(0.5, 179.7)).should.be.NaN; });
        test('antipodal convergence failure brng f', function() { new LatLon(0, 0).finalBearingTo(new LatLon(0.5, 179.7)).should.be.NaN; });
    });

    describe('coincident', function() {
        var le = new LatLon(50.06632, -5.71475);
        test('inverse coincident distance',          function() { le.distanceTo(le).should.equal(0); });
        test('inverse coincident initial bearing',   function() { le.initialBearingTo(le).should.be.NaN; });
        test('inverse coincident final bearing',     function() { le.finalBearingTo(le).should.be.NaN; });
        test('inverse equatorial distance',          function() { new LatLon(0,0).distanceTo(new LatLon(0,1)).should.equal(111319.491); });
        test('direct coincident destination',        function() { le.destinationPoint(0, 0).toString('d').should.equal(le.toString('d')); });
    });

    describe('antimeridian', function() {
        test('crossing antimeridian',                function() { new LatLon(30, 120).distanceTo(new LatLon(30, -120)).should.equal(10825924.089); });
    });

    describe('quadrants', function() {
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
});
