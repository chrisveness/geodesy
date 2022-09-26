/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - latlon-ellipsoidal-vincenty                 (c) Chris Veness 2014-2022  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLon, { Dms } from '../latlon-ellipsoidal-vincenty.js';
import { datums }      from '../latlon-ellipsoidal-datum.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('latlon-ellipsoidal-vincenty', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    const circEquatorial = 40075016.686; // eslint-disable-line no-unused-vars
    const circMeridional = 40007862.918;

    describe('@examples', function() {
        test('distanceTo',          () => new LatLon(50.06632, -5.71475).distanceTo(new LatLon(58.64402, -3.07009)).toFixed(3).should.equal('969954.166'));
        test('initialBearingTo',    () => new LatLon(50.06632, -5.71475).initialBearingTo(new LatLon(58.64402, -3.07009)).toFixed(4).should.equal('9.1419'));
        test('finalBearingTo',      () => new LatLon(50.06632, -5.71475).finalBearingTo(new LatLon(58.64402, -3.07009)).toFixed(4).should.equal('11.2972'));
        test('destinationPoint',    () => new LatLon(-37.95103, 144.42487).destinationPoint(54972.271, 306.86816).toString().should.equal('37.6528°S, 143.9265°E'));
        test('finalBearingOn',      () => new LatLon(-37.95103, 144.42487).finalBearingOn(54972.271, 306.86816).toFixed(4).should.equal('307.1736'));
        test('intermediatePointTo', () => new LatLon(50.06632, -5.71475).intermediatePointTo(new LatLon(58.64402, -3.07009), 0.5).toString().should.equal('54.3639°N, 004.5304°W'));
    });

    describe('Rainsford (from TV Direct & Inverse Solutions)', function() {
        // Rainsford analysed errors in the order of the fifth digit of a second, and of the millimeter
        // TODO: some of these results exceed Rainsford's errors (if only marginally) - worth investigating?
        const a = { φ1: '55°45′00.00000″N', φ2: '33°26′00.00000″S', L: '108°13′00.00000″', s: '14110526.170', α1: '096°36′08.79960″', α2: '137°52′22.01454″' };
        const b = { φ1: '37°19′54.95367″N', φ2: '26°07′42.83946″N', L: '041°28′35.50729″', s:  '4085966.703', α1: '095°27′59.63089″', α2: '118°05′58.96161″' };
        const c = { φ1: '35°16′11.24862″N', φ2: '67°22′14.77638″N', L: '137°47′28.31435″', s:  '8084823.839', α1: '015°44′23.74850″', α2: '144°55′39.92147″' };
        const d = { φ1:  '1°00′00.00000″N', φ2: '00°59′53.83076″S', L: '179°17′48.02997″', s: '19960000.000', α1: '089°00′OO.00000″', α2: '091°00′06.11733″' };
        const e = { φ1: '01°00′00.00000″N', φ2: '01°01′15.18952″N', L: '179°46′17.84244″', s: '19780006.558', α1: '004°59′59.99995″', α2: '174°59′59.88481″' };
        // "The first example is on the Bessel Ellipsoid and the remaining ones are on the International"
        a.p1 = LatLon.parse(a.φ1, 0); a.p2 = LatLon.parse(a.φ2, a.L); a.p1.datum = datums.Potsdam; // using Bessel ellipsoid
        b.p1 = LatLon.parse(b.φ1, 0); b.p2 = LatLon.parse(b.φ2, b.L); b.p1.datum = datums.ED50;    // using Intl1924 ellipsoid
        c.p1 = LatLon.parse(c.φ1, 0); c.p2 = LatLon.parse(c.φ2, c.L); c.p1.datum = datums.ED50;    // using Intl1924 ellipsoid
        d.p1 = LatLon.parse(d.φ1, 0); d.p2 = LatLon.parse(d.φ2, d.L); d.p1.datum = datums.ED50;    // using Intl1924 ellipsoid
        e.p1 = LatLon.parse(e.φ1, 0); e.p2 = LatLon.parse(e.φ2, e.L); e.p1.datum = datums.ED50;    // using Intl1924 ellipsoid
        test('a direct dest',   () => a.p1.destinationPoint(a.s, Dms.parse(a.α1)).toString('dms', 5).should.equal('33°26′00.00001″S, 108°13′00.00001″E')); // δ0.00001″
        test('a inverse dist',  () => a.p1.distanceTo(a.p2).toFixed(3).should.equal(a.s));                                                                 // δ-
        test('a inverse brng1', () => Dms.toBrng(a.p1.initialBearingTo(a.p2), 'dms', 5).should.equal('096°36′08.79948″'));                                 // δ0.00012″
        test('a inverse brng2', () => Dms.toBrng(a.p1.finalBearingTo(a.p2), 'dms', 5).should.equal('137°52′22.01448″'));                                   // δ0.00006″
        test('b direct dest',   () => b.p1.destinationPoint(b.s, Dms.parse(b.α1)).toString('dms', 5).should.equal('26°07′42.83945″N, 041°28′35.50730″E')); // δ0.00001″
        test('b inverse dist',  () => b.p1.distanceTo(b.p2).toFixed(3).should.equal(b.s));                                                                 // δ-
        test('b inverse brng1', () => Dms.toBrng(b.p1.initialBearingTo(b.p2), 'dms', 5).should.equal('095°27′59.63076″'));                                 // δ0.00013″
        test('b inverse brng2', () => Dms.toBrng(b.p1.finalBearingTo(b.p2), 'dms', 5).should.equal('118°05′58.96176″'));                                   // δ0.00015″
        test('c direct dest',   () => c.p1.destinationPoint(c.s, Dms.parse(c.α1)).toString('dms', 5).should.equal('67°22′14.77636″N, 137°47′28.31438″E')); // δ0.00003″
        test('c inverse dist',  () => c.p1.distanceTo(c.p2).toFixed(3).should.equal('8084823.838'));                                                       // δ1mm
        test('c inverse brng1', () => Dms.toBrng(c.p1.initialBearingTo(c.p2), 'dms', 5).should.equal('015°44′23.74836″'));                                 // δ0.00014″
        test('c inverse brng2', () => Dms.toBrng(c.p1.finalBearingTo(c.p2), 'dms', 5).should.equal('144°55′39.92160″'));                                   // δ0.00013″
        test('d direct dest',   () => d.p1.destinationPoint(d.s, Dms.parse(d.α1)).toString('dms', 5).should.equal('00°59′53.83076″S, 179°17′48.02998″E')); // δ0.00001″
        test('d inverse dist',  () => d.p1.distanceTo(d.p2).toFixed(3).should.equal(d.s));                                                                 // δ-
        test('d inverse brng1', () => Dms.toBrng(d.p1.initialBearingTo(d.p2), 'dms', 5).should.equal('088°59′59.99892″'));                                 // δ0.00108″
        test('d inverse brng2', () => Dms.toBrng(d.p1.finalBearingTo(d.p2), 'dms', 5).should.equal('091°00′06.11820″'));                                   // δ0.00087″
        test('e direct dest',   () => e.p1.destinationPoint(e.s, Dms.parse(e.α1)).toString('dms', 5).should.equal('01°01′15.18955″N, 179°46′17.84244″E')); // δ0.00003″
        test('e inverse dist',  () => e.p1.distanceTo(e.p2).toFixed(3).should.equal('19780006.559'));                                                      // δ1mm
        test('e inverse brng1', () => Dms.toBrng(e.p1.initialBearingTo(e.p2), 'dms', 5).should.equal('005°00′00.00000″'));                                 // δ0.00005″
        test('e inverse brng2', () => Dms.toBrng(e.p1.finalBearingTo(e.p2), 'dms', 5).should.equal('174°59′59.88480″'));                                   // δ0.00001″
    });

    describe('UK', function() {
        const le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
        const dist = 969954.166, brngInit = 9.1418775, brngFinal = 11.2972204;
        test('inverse distance',          () => le.distanceTo(jog).should.equal(dist));
        test('inverse initial bearing',   () => le.initialBearingTo(jog).should.equal(brngInit));
        test('inverse final bearing',     () => le.finalBearingTo(jog).should.equal(brngFinal));
        test('direct destination',        () => le.destinationPoint(dist, brngInit).toString('d').should.equal(jog.toString('d')));
        test('direct final bearing',      () => le.finalBearingOn(dist, brngInit).should.equal(brngFinal));
        test('intermediate point 0',      () => le.intermediatePointTo(jog, 0).should.equal(le));
        test('intermediate point 1',      () => le.intermediatePointTo(jog, 1).should.equal(jog));
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

    describe('small dist (to 2mm)', function() {
        const p = new LatLon(0, 0);
        test('1e-5°', () => p.distanceTo(new LatLon(0.000010000, 0.000010000)).should.equal(1.569));
        test('1e-6°', () => p.distanceTo(new LatLon(0.000001000, 0.000001000)).should.equal(0.157));
        test('1e-7°', () => p.distanceTo(new LatLon(0.000000100, 0.000000100)).should.equal(0.016));
        test('1e-8°', () => p.distanceTo(new LatLon(0.000000010, 0.000000010)).should.equal(0.002));
        test('1e-9°', () => p.distanceTo(new LatLon(0.000000001, 0.000000001)).should.equal(0.000));
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
        test('destinationPoint (fail)', () => should.Throw(function() { le.destinationPoint(1, 0); }, RangeError, 'point must be on the surface of the ellipsoid'));
        test('finalBearingOn (fail)',   () => should.Throw(function() { le.finalBearingOn(1, 0); }, RangeError, 'point must be on the surface of the ellipsoid'));
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
