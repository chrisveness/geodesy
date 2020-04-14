/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - utm/mgrs                                    (c) Chris Veness 2014-2019  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* eslint-disable space-in-parens */

import Mgrs, { Utm, LatLon, Dms } from '../mgrs.js';

if (typeof window == 'undefined') { // node
    import('chai').then(chai => global.should = chai.should());
} else {                            // browser
    window.should = chai.should();
}

describe('utm/mgrs', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    // useful for manual checks: www.rcn.montana.edu/resources/converter.aspx

    describe('@examples UTM', function() {
        test('constructor', () => new Utm(31, 'N', 448251, 5411932).toString().should.equal('31 N 448251 5411932'));
        test('toLatLon',    () => new Utm(31, 'N', 448251.795, 5411932.678).toLatLon().toString().should.equal('48.8582°N, 002.2945°E'));
        test('parse',       () => Utm.parse('31 N 448251 5411932').toString().should.equal('31 N 448251 5411932'));
        test('toString',    () => new Utm('31', 'N', 448251, 5411932).toString(4).should.equal('31 N 448251.0000 5411932.0000'));
        test('README',      () => Utm.parse('48 N 377298.745 1483034.794').toLatLon().toUtm().toString(3).should.equal('48 N 377298.745 1483034.794'));
    });

    describe('@examples MGRS', function() {
        test('constructor',          () => new Mgrs(31, 'U', 'D', 'Q', 48251, 11932).toString().should.equal('31U DQ 48251 11932'));
        test('toUtm',                () => Mgrs.parse('31U DQ 48251 11932').toUtm().toString().should.equal('31 N 448251 5411932'));
        test('parse',                () => Mgrs.parse('31U DQ 48251 11932').toString().should.equal('31U DQ 48251 11932'));
        test('parse military-style', () => Mgrs.parse('31UDQ4825111932').toString().should.equal('31U DQ 48251 11932'));
    });

    describe('@examples LatLon', function() {
        test('toUtm', () => new LatLon(48.8582, 2.2945).toUtm().toString().should.equal('31 N 448252 5411933'));
    });

    describe('UTM constructor fail', function() {
        test('zone fail',       () => should.Throw(function() { new Utm(0, 'N', 0, 0); }, RangeError, 'invalid UTM zone ‘0’'));
        test('zone fail',       () => should.Throw(function() { new Utm(61, 'N', 0, 0); }, RangeError, 'invalid UTM zone ‘61’'));
        test('zone fail',       () => should.Throw(function() { new Utm(1.5, 'N', 0, 0); }, RangeError, 'invalid UTM zone ‘1.5’'));
        test('hemisphere fail', () => should.Throw(function() { new Utm(1, 'E', 0, 0); }, RangeError, 'invalid UTM hemisphere ‘E’'));
        test('easting fail',    () => should.Throw(function() { new Utm(1, 'N', 1001e3, 0); }, RangeError, 'invalid UTM easting ‘1001000’'));
        test('northing N fail', () => should.Throw(function() { new Utm(1, 'N', 0, 9329e3); }, RangeError, 'invalid UTM northing ‘9329000’'));
        test('northing S fail', () => should.Throw(function() { new Utm(1, 'S', 0, 1118e3); }, RangeError, 'invalid UTM northing ‘1118000’'));
    });

    describe('MGRS constructor fail', function() {
        test('bad zone',             () => should.Throw(function() { new Mgrs(0, 'C', 'A', 'A', 0, 0); }, RangeError, 'invalid MGRS zone ‘0’'));
        test('bad zone',             () => should.Throw(function() { new Mgrs(1.5, 'C', 'A', 'A', 0, 0); }, RangeError, 'invalid MGRS zone ‘1.5’'));
        test('bad band',             () => should.Throw(function() { new Mgrs(1, 'A', 'A', 'A', 0, 0); }, RangeError, 'invalid MGRS band ‘A’'));
        test('bad grid sq easting',  () => should.Throw(function() { new Mgrs(1, 'C', 'I', 'A', 0, 0); }, RangeError, 'invalid MGRS 100km grid square column ‘I’ for zone 1'));
        test('bad grid sq northing', () => should.Throw(function() { new Mgrs(1, 'C', 'A', 'I', 0, 0); }, RangeError, 'invalid MGRS 100km grid square row ‘I’'));
        test('invalid grid sq e',    () => should.Throw(function() { new Mgrs(2, 'C', 'A', 'A', 0, 0); }, RangeError, 'invalid MGRS 100km grid square column ‘A’ for zone 2'));
        test('bad easting',          () => should.Throw(function() { new Mgrs(1, 'C', 'A', 'A', 'x', 0); }, RangeError, 'invalid MGRS easting ‘x’'));
        test('bad northing',         () => should.Throw(function() { new Mgrs(1, 'C', 'A', 'A', 0, 'x'); }, RangeError, 'invalid MGRS northing ‘x’'));
        test('too far north',        () => should.Throw(function() { new Mgrs(1, 'C', 'A', 'A', 0, 'x'); }, RangeError, 'invalid MGRS northing ‘x’'));
        test('bad multiples',        () => should.Throw(function() { new Mgrs(1, 'A', 'A', 'I', 0, 0); }, RangeError, 'invalid MGRS band ‘A’, invalid MGRS 100km grid square row ‘I’'));
    });

    describe('UTM parse', function() {
        test('parse fail', () => should.Throw(function() { Utm.parse('Cambridge'); }, Error, 'invalid UTM coordinate ‘Cambridge’'));
    });

    describe('toString', function() {
        test('toString fail', () => should.Throw(function() { new Mgrs(1, 'C', 'A', 'A', 0, 0).toString(3); }, Error, 'invalid precision ‘3’'));
    });

    describe('MGRS parse', function() {
        test('parse fail 1', () => should.Throw(function() { Mgrs.parse(null); }, Error, 'invalid MGRS grid reference ‘null’'));
        test('parse fail 2', () => should.Throw(function() { Mgrs.parse('Cambridge'); }, Error, 'invalid MGRS grid reference ‘Cambridge’'));
        test('parse fail 3', () => should.Throw(function() { Mgrs.parse('New York'); }, Error, 'invalid MGRS grid reference ‘New York’'));
    });

    describe('latitude/longitude -> UTM', function() {
        test('0,0',                () => new LatLon( 0,  0).toUtm().toString(6).should.equal('31 N 166021.443081 0.000000'));
        test('1,1',                () => new LatLon( 1,  1).toUtm().toString(5).should.equal('31 N 277438.26352 110597.97252'));
        test('-1,-1',              () => new LatLon(-1, -1).toUtm().toString(5).should.equal('30 S 722561.73648 9889402.02748'));
        test('1,1 Z31',            () => new LatLon( 1,  1).toUtm(30).toString(5).should.equal('30 N 945396.68398 110801.83255'));
        test('eiffel tower',       () => new LatLon( 48.8583,   2.2945).toUtm().toString(3).should.equal('31 N 448251.898 5411943.794'));
        test('sidney o/h',         () => new LatLon(-33.857,  151.215 ).toUtm().toString(3).should.equal('56 S 334873.199 6252266.092'));
        test('white house',        () => new LatLon( 38.8977, -77.0365).toUtm().toString(3).should.equal('18 N 323394.296 4307395.634'));
        test('rio christ',         () => new LatLon(-22.9519, -43.2106).toUtm().toString(3).should.equal('23 S 683466.254 7460687.433'));
        test('bergen',             () => new LatLon( 60.39135,  5.3249).toUtm().toString(2).should.equal('32 N 297508.41 6700645.30'));
        test('bergen convergence', () => new LatLon( 60.39135,  5.3249).toUtm().convergence.should.equal(-3.196281440));
        test('bergen scale',       () => new LatLon( 60.39135,  5.3249).toUtm().scale.should.equal(    1.000102473211));
    });

    describe('UTM -> latitude/longitude', function() {
        test('0,0',                () => Utm.parse('31 N 166021.443081 0.000000').toLatLon().toString().should.equal(new LatLon(0, 0).toString()));
        test('1,1',                () => Utm.parse('31 N 277438.263521 110597.972524').toLatLon().toString().should.equal(new LatLon( 1,  1).toString()));
        test('-1,-1',              () => Utm.parse('30 S 722561.736479 9889402.027476').toLatLon().toString().should.equal(new LatLon(-1, -1).toString()));
        test('eiffel tower',       () => Utm.parse('31 N 448251.898 5411943.794').toLatLon().toString().should.equal(new LatLon( 48.8583,   2.2945).toString()));
        test('sidney o/h',         () => Utm.parse('56 S 334873.199 6252266.092').toLatLon().toString().should.equal(new LatLon(-33.857,  151.215 ).toString()));
        test('white house',        () => Utm.parse('18 N 323394.296 4307395.634').toLatLon().toString().should.equal(new LatLon( 38.8977, -77.0365).toString()));
        test('rio christ',         () => Utm.parse('23 S 683466.254 7460687.433').toLatLon().toString().should.equal(new LatLon(-22.9519, -43.2106).toString()));
        test('bergen',             () => Utm.parse('32 N 297508.410 6700645.296').toLatLon().toString().should.equal(new LatLon( 60.39135,  5.3249).toString()));
        test('bergen convergence', () => Utm.parse('32 N 297508.410 6700645.296').toLatLon().convergence.should.equal(-3.196281443));
        test('bergen scale',       () => Utm.parse('32 N 297508.410 6700645.296').toLatLon().scale.should.equal(    1.000102473212));
    });

    describe('UTM -> MGRS', function() {
        test('0,0',          () => Utm.parse('31 N 166021.443081 0.000000').toMgrs().toString().should.equal('31N AA 66021 00000'));
        test('1,1',          () => Utm.parse('31 N 277438.263521 110597.972524').toMgrs().toString().should.equal('31N BB 77438 10597'));
        test('-1,-1',        () => Utm.parse('30 S 722561.736479 9889402.027476').toMgrs().toString().should.equal('30M YD 22561 89402'));
        test('eiffel tower', () => Utm.parse('31 N 448251.898 5411943.794').toMgrs().toString().should.equal('31U DQ 48251 11943'));
        test('sidney o/h',   () => Utm.parse('56 S 334873.199 6252266.092').toMgrs().toString().should.equal('56H LH 34873 52266'));
        test('white house',  () => Utm.parse('18 N 323394.296 4307395.634').toMgrs().toString().should.equal('18S UJ 23394 07395'));
        test('rio christ',   () => Utm.parse('23 S 683466.254 7460687.433').toMgrs().toString().should.equal('23K PQ 83466 60687'));
        test('bergen',       () => Utm.parse('32 N 297508.410 6700645.296').toMgrs().toString().should.equal('32V KN 97508 00645'));
    });

    describe('MGRS -> UTM', function() {
        test('0,0',           () => Mgrs.parse('31N AA 66021 00000').toUtm().toString().should.equal('31 N 166021 0'));
        test('1,1',           () => Mgrs.parse('31N BB 77438 10597').toUtm().toString().should.equal('31 N 277438 110597'));
        test('-1,-1',         () => Mgrs.parse('30M YD 22561 89402').toUtm().toString().should.equal('30 S 722561 9889402'));
        test('eiffel tower',  () => Mgrs.parse('31U DQ 48251 11943').toUtm().toString().should.equal('31 N 448251 5411943'));
        test('sidney o/h',    () => Mgrs.parse('56H LH 34873 52266').toUtm().toString().should.equal('56 S 334873 6252266'));
        test('white house',   () => Mgrs.parse('18S UJ 23394 07395').toUtm().toString().should.equal('18 N 323394 4307395'));
        test('rio christ',    () => Mgrs.parse('23K PQ 83466 60687').toUtm().toString().should.equal('23 S 683466 7460687'));
        test('bergen',        () => Mgrs.parse('32V KN 97508 00645').toUtm().toString().should.equal('32 N 297508 6700645'));
        // forgiving parsing of 100km squares spanning bands
        test('01P ≡ UTM 01Q', () => Mgrs.parse('01P ET 00000 68935').toUtm().toString().should.equal('01 N 500000 1768935'));
        test('01Q ≡ UTM 01P', () => Mgrs.parse('01Q ET 00000 68935').toUtm().toString().should.equal('01 N 500000 1768935'));
        // use correct latitude band base northing [#73]
        test('nBand @ 3°',    () => Utm.parse('31 N 500000 7097014').toMgrs().toUtm().toString().should.equal('31 N 500000 7097014'));
    });

    describe('ED50 conversion', function() {
        const helmertturm = new Utm(33, 'N', 368381.402, 5805291.614, LatLon.datums.ED50); // epsg.io/23033
        const llED50 = helmertturm.toLatLon();
        const llWGS84 = llED50.convertDatum(LatLon.datums.WGS84);
        // TODO: no llWGS84.toUtm()!
        test('helmertturm ED50', () => llED50.toString('dms', 3).should.equal('52°22′51.446″N, 013°03′58.741″E')); // earth-info.nga.mil/GandG/coordsys/datums/datumorigins.html
        test('helmertturm WGS84', () => llWGS84.toString('dms', 3).should.equal('52°22′48.931″N, 013°03′54.824″E'));
    });

    describe('IBM coordconvert', function() {
        // https://www.ibm.com/developerworks/library/j-coordconvert/#listing7 (note UTM/MGRS confusion; UTM is rounded, MGRS is truncated; UPS not included)
        test('#01 UTM->LL',  () => Utm.parse('31 N 166021 0').toLatLon().toString().should.equal('00.0000°N, 000.0000°W'));
        test('#02 UTM->LL',  () => Utm.parse('30 N 808084 14385').toLatLon().toString().should.equal('00.1300°N, 000.2324°W'));
        test('#03 UTM->LL',  () => Utm.parse('34 S 683473 4942631').toLatLon().toString().should.equal('45.6456°S, 023.3545°E'));
        test('#04 UTM->LL',  () => Utm.parse('25 S 404859 8588690').toLatLon().toString().should.equal('12.7650°S, 033.8765°W'));
        test('#09 UTM->LL',  () => Utm.parse('08 N 453580 2594272').toLatLon().toString().should.equal('23.4578°N, 135.4545°W'));
        test('#10 UTM->LL',  () => Utm.parse('57 N 450793 8586116').toLatLon().toString().should.equal('77.3450°N, 156.9876°E'));
        test('#01 LL->UTM',  () => new LatLon(  0.0000,    0.0000).toUtm().toString().should.equal('31 N 166021 0'));
        test('#01 LL->MGRS', () => new LatLon(  0.0000,    0.0000).toUtm().toMgrs().toString().should.equal('31N AA 66021 00000'));
        test('#02 LL->UTM',  () => new LatLon(  0.1300,   -0.2324).toUtm().toString().should.equal('30 N 808084 14386'));
        test('#02 LL->MGRS', () => new LatLon(  0.1300,   -0.2324).toUtm().toMgrs().toString().should.equal('30N ZF 08084 14385'));
        test('#03 LL->UTM',  () => new LatLon(-45.6456,   23.3545).toUtm().toString().should.equal('34 S 683474 4942631'));
        test('#03 LL->MGRS', () => new LatLon(-45.6456,   23.3545).toUtm().toMgrs().toString().should.equal('34G FQ 83473 42631'));
        test('#04 LL->UTM',  () => new LatLon(-12.7650,  -33.8765).toUtm().toString().should.equal('25 S 404859 8588691'));
        test('#04 LL->MGRS', () => new LatLon(-12.7650,  -33.8765).toUtm().toMgrs().toString().should.equal('25L DF 04859 88691'));
        test('#09 LL->UTM',  () => new LatLon( 23.4578, -135.4545).toUtm().toString().should.equal('08 N 453580 2594273'));
        test('#09 LL->MGRS', () => new LatLon( 23.4578, -135.4545).toUtm().toMgrs().toString().should.equal('08Q ML 53580 94272'));
        test('#10 LL->UTM',  () => new LatLon( 77.3450,  156.9876).toUtm().toString().should.equal('57 N 450794 8586116'));
        test('#10 LL->MGRS', () => new LatLon( 77.3450,  156.9876).toUtm().toMgrs().toString().should.equal('57X VF 50793 86116'));
    });

    describe('varying resolution', function() {
        test('MGRS 4-digit -> UTM',    () => Mgrs.parse('12S TC 52 86').toUtm().toString().should.equal('12 N 252000 3786000'));
        test('MGRS 10-digit -> UTM',   () => Mgrs.parse('12S TC 52000 86000').toUtm().toString().should.equal('12 N 252000 3786000'));
        test('MGRS 10-digit+decimals', () => Mgrs.parse('12S TC 52000.123 86000.123').toUtm().toString(3).should.equal('12 N 252000.123 3786000.123'));
        test('MGRS truncate',          () => Mgrs.parse('12S TC 52999.999 86999.999').toString(6).should.equal('12S TC 529 869'));
        test('MGRS-UTM round',         () => Mgrs.parse('12S TC 52999.999 86999.999').toUtm().toString().should.equal('12 N 253000 3787000'));
    });

    describe('UTM fail', function() {
        test('zone fail', () => should.Throw(function() { new LatLon(85, 0).toUtm(); }, RangeError, 'latitude ‘85’ outside UTM limits'));
    });

    describe('Norway/Svalbard adjustment', function() {
        test('Norway 31->32',   () => new LatLon(60,  4).toUtm().zone.should.equal(32));
        test('Svalbard 32->31', () => new LatLon(75,  8).toUtm().zone.should.equal(31));
        test('Svalbard 32->33', () => new LatLon(75, 10).toUtm().zone.should.equal(33));
        test('Svalbard 34->33', () => new LatLon(75, 20).toUtm().zone.should.equal(33));
        test('Svalbard 34->35', () => new LatLon(75, 22).toUtm().zone.should.equal(35));
        test('Svalbard 36->35', () => new LatLon(75, 32).toUtm().zone.should.equal(35));
        test('Svalbard 36->37', () => new LatLon(75, 34).toUtm().zone.should.equal(37));
    });
});
