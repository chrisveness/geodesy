/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - latlon-ellipsoidal-vincenty                 (c) Chris Veness 2014-2019  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Dms } from '../latlon-ellipsoidal-vincenty.js';
import { datums }      from '../latlon-ellipsoidal-datum.js';

if (typeof window == 'undefined') { // node
    import('chai').then(chai => { global.should = chai.should(); });
} else {                           // browser
    chai.should();
}


describe('latlon-ellipsoidal-vincenty', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    const circEquatorial = 40075016.686; // eslint-disable-line no-unused-vars
    const circMeridional = 40007862.918;

    describe('UK', function() {
        const le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
        const dist = 969954.166, brngInit = 9.1418775, brngFinal = 11.2972204;
        test('inverse distance',          () => le.distanceTo(jog).should.equal(dist));
        test('inverse initial bearing',   () => le.initialBearingTo(jog).should.equal(brngInit));
        test('inverse final bearing',     () => le.finalBearingTo(jog).should.equal(brngFinal));
        test('direct destination',        () => le.destinationPoint(dist, brngInit).toString('d').should.equal(jog.toString('d')));
        test('direct final bearing',      () => le.finalBearingOn(dist, brngInit).should.equal(brngFinal));
        test('inverse distance (fail)',   () => should.Throw(function() { le.distanceTo(null); }, TypeError, 'invalid point ‘null’'));
        test('inverse init brng (fail)',  () => should.Throw(function() { le.initialBearingTo(null); }, TypeError, 'invalid point ‘null’'));
        test('inverse final brng (fail)', () => should.Throw(function() { le.finalBearingTo(null); }, TypeError, 'invalid point ‘null’'));
    });

    describe('Geoscience Australia', function() {
        const flindersPeak = LatLon.parse('37°57′03.72030″S, 144°25′29.52440W″');
        const buninyong    = LatLon.parse('37°39′10.15610″S, 143°55′35.38390W″');
        const dist = 54972.271, azFwd = '306°52′05.37″', azRev = '127°10′25.07″';
        test('inverse distance',        () =>            flindersPeak.distanceTo(buninyong).should.equal(dist));
        test('inverse initial bearing', () => Dms.toBrng(flindersPeak.initialBearingTo(buninyong), 'dms', 2).should.equal(azFwd));
        test('inverse final bearing',   () => Dms.toBrng(flindersPeak.finalBearingTo(buninyong)-180, 'dms', 2).should.equal(azRev));
        test('direct destination',      () =>            flindersPeak.destinationPoint(dist, Dms.parse(azFwd)).toString('d').should.equal(buninyong.toString('d')));
        test('direct final brng',       () => Dms.toBrng(flindersPeak.finalBearingOn(dist, Dms.parse(azFwd))-180, 'dms', 2).should.equal(azRev));
    });

    describe('antipodal', function() {
        test('near-antipodal distance',              () => new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.5)).should.equal(19936288.579));
        test('antipodal convergence failure dist',   () => new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN);
        test('antipodal convergence failure brng i', () => new LatLon(0, 0).initialBearingTo(new LatLon(0.5, 179.7)).should.be.NaN);
        test('antipodal convergence failure brng f', () => new LatLon(0, 0).finalBearingTo(new LatLon(0.5, 179.7)).should.be.NaN);
        test('antipodal distance equatorial',        () => new LatLon(0, 0).distanceTo(new LatLon(0, 180)).should.equal(circMeridional/2));
        test('antipodal brng equatorial',            () => new LatLon(0, 0).initialBearingTo(new LatLon(0, 180)).should.equal(0));
        test('antipodal distance meridional',        () => new LatLon(90, 0).distanceTo(new LatLon(-90, 0)).should.equal(circMeridional/2));
        test('antipodal brng meridional',            () => new LatLon(90, 0).initialBearingTo(new LatLon(-90, 0)).should.equal(0));
    });

    describe('coincident', function() {
        const le = new LatLon(50.06632, -5.71475);
        test('inverse coincident distance',        () => le.distanceTo(le).should.equal(0));
        test('inverse coincident initial bearing', () => le.initialBearingTo(le).should.be.NaN);
        test('inverse coincident final bearing',   () => le.finalBearingTo(le).should.be.NaN);
        test('inverse equatorial distance',        () => new LatLon(0, 0).distanceTo(new LatLon(0, 1)).should.equal(111319.491));
        test('direct coincident destination',      () => le.destinationPoint(0, 0).toString('d', 6).should.equal(le.toString('d', 6)));
    });

    describe('antimeridian', function() {
        test('crossing antimeridian', () => new LatLon(30, 120).distanceTo(new LatLon(30, -120)).should.equal(10825924.089));
    });

    describe('quadrants', function() {
        /* eslint-disable space-in-parens, comma-spacing */
        test('Q1 a', () => new LatLon( 30, 30).distanceTo(new LatLon( 60, 60)).should.equal(4015703.021));
        test('Q1 b', () => new LatLon( 60, 60).distanceTo(new LatLon( 30, 30)).should.equal(4015703.021));
        test('Q1 c', () => new LatLon( 30, 60).distanceTo(new LatLon( 60, 30)).should.equal(4015703.021));
        test('Q1 d', () => new LatLon( 60, 30).distanceTo(new LatLon( 30, 60)).should.equal(4015703.021));
        test('Q2 a', () => new LatLon( 30,-30).distanceTo(new LatLon( 60,-60)).should.equal(4015703.021));
        test('Q2 b', () => new LatLon( 60,-60).distanceTo(new LatLon( 30,-30)).should.equal(4015703.021));
        test('Q2 c', () => new LatLon( 30,-60).distanceTo(new LatLon( 60,-30)).should.equal(4015703.021));
        test('Q2 d', () => new LatLon( 60,-30).distanceTo(new LatLon( 30,-60)).should.equal(4015703.021));
        test('Q3 a', () => new LatLon(-30,-30).distanceTo(new LatLon(-60,-60)).should.equal(4015703.021));
        test('Q3 b', () => new LatLon(-60,-60).distanceTo(new LatLon(-30,-30)).should.equal(4015703.021));
        test('Q3 c', () => new LatLon(-30,-60).distanceTo(new LatLon(-60,-30)).should.equal(4015703.021));
        test('Q3 d', () => new LatLon(-60,-30).distanceTo(new LatLon(-30,-60)).should.equal(4015703.021));
        test('Q4 a', () => new LatLon(-30, 30).distanceTo(new LatLon(-60, 60)).should.equal(4015703.021));
        test('Q4 b', () => new LatLon(-60, 60).distanceTo(new LatLon(-30, 30)).should.equal(4015703.021));
        test('Q4 c', () => new LatLon(-30, 60).distanceTo(new LatLon(-60, 30)).should.equal(4015703.021));
        test('Q4 d', () => new LatLon(-60, 30).distanceTo(new LatLon(-30, 60)).should.equal(4015703.021));
    });

    describe('surface only', function() {
        const le = new LatLon(50.06632, -5.71475, 1), jog = new LatLon(58.64402, -3.07009);
        test('distanceTo (fail)',       () => should.Throw(function() { le.distanceTo(jog); }, RangeError, 'point must be on the surface of the ellipsoid'));
        test('initialBearingTo (fail)', () => should.Throw(function() { le.initialBearingTo(jog); }, RangeError, 'point must be on the surface of the ellipsoid'));
        test('finalBearingTo (fail)',   () => should.Throw(function() { le.finalBearingTo(jog); }, RangeError, 'point must be on the surface of the ellipsoid'));
        test('destinationPoint (fail)', () => should.Throw(function() { le.destinationPoint(0, 0); }, RangeError, 'point must be on the surface of the ellipsoid'));
        test('finalBearingOn (fail)',   () => should.Throw(function() { le.finalBearingOn(0, 0); }, RangeError, 'point must be on the surface of the ellipsoid'));
    });

    describe('convergence', function() {
        test('vincenty antipodal λ > π',       () => new LatLon(0.0, 0.0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN);
        test('vincenty antipodal convergence', () => new LatLon(5.0, 0.0).distanceTo(new LatLon(-5.1, 179.4)).should.be.NaN);
    });

    describe('direct returns LatLonEllipsoidal_Vincenty object', function() {
        const p1 = new LatLon(1, 1);
        const p2 = p1.destinationPoint(1, 0);
        test('dest pt has distanceTo() method', () => p2.distanceTo(p1).should.equal(1));
    });

    describe('OSGB36 datum using Airy1830 ellipsoid', function() {
        const le = new LatLon(50.065716, -5.713824);  // in OSGB-36
        const jog = new LatLon(58.644399, -3.068521); // in OSGB-36
        le.datum = datums.OSGB36; // source point determines ellipsoid to use
        const dist = 969982.014; // 27.848m more than on WGS-84 ellipsoid; Airy1830 has a smaller flattening, hence larger distance at higher latitudes
        const brngInit = 9.1428517;
        test('inverse distance', () => le.distanceTo(jog).should.equal(dist));
        test('inverse bearing', () => le.initialBearingTo(jog).should.equal(brngInit));
        test('direct destination', () => le.destinationPoint(dist, brngInit).toString('d', 6).should.equal('58.644399°N, 003.068521°W'));
    });

    describe('constructor with strings', function() {
        test('distanceTo d', () => new LatLon('52.205', '0.119').distanceTo(new LatLon('48.857', '2.351')).should.equal(404607.806));
    });

});
