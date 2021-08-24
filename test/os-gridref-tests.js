/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - os-gridref                                  (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import OsGridRef, { LatLon, Dms } from '../osgridref.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}

describe('os-gridref', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('@examples', function() {
        test('Constructor',     () => new OsGridRef(651409, 313177).should.deep.equal({ easting: 651409, northing: 313177 }));
        test('toLatLon',        () => new OsGridRef(651409.903, 313177.270).toLatLon().toString('dms', 3).should.equal('52°39′28.723″N, 001°42′57.787″E'));
        test('toLatLon OSGB36', () => new OsGridRef(651409.903, 313177.270).toLatLon(LatLon.datums.OSGB36).toString('dms', 3).should.equal('52°39′27.253″N, 001°43′04.518″E'));
        test('parse',           () => OsGridRef.parse('TG 51409 13177').should.deep.equal({ easting: 651409, northing: 313177 }));
        test('toString',        () => new OsGridRef(651409, 313177).toString(8).should.equal('TG 5140 1317'));
        test('toString',        () => new OsGridRef(651409, 313177).toString(0).should.equal('651409,313177'));
    });

    describe('@examples LatLon', function() {
        test('toOsGrid', () => new LatLon(52.65798, 1.71605).toOsGrid().toString().should.equal('TG 51409 13177'));
        test('toOsGrid', () => new LatLon(52.65757, 1.71791, 0, LatLon.datums.OSGB36).toOsGrid().toString().should.equal('TG 51409 13177'));
    });

    describe('constructor fail', function() {
        test('Invalid northing', () => should.Throw(function() { new OsGridRef(0, 1301e3); }, Error, 'invalid northing ‘1301000’'));
        test('Invalid easting',  () => should.Throw(function() { new OsGridRef(701e3, 0); }, Error, 'invalid easting ‘701000’'));
        test('texts',            () => should.Throw(function() { new OsGridRef('e', 'n'); }, Error, 'invalid easting ‘e’'));
    });

    describe('parse fail', function() {
        test('text',                () => should.Throw(function() { OsGridRef.parse('Cambridge'); }, Error, 'invalid grid reference ‘Cambridge’'));
        test('outside range',       () => should.Throw(function() { OsGridRef.parse('AA 1 2'); }, Error, 'invalid grid reference ‘AA 1 2’'));
        test('unbalanced numerics', () => should.Throw(function() { OsGridRef.parse('SV 1 20'); }, Error, 'invalid grid reference ‘SV 1 20’'));
    });

    describe('toString fail', function() {
        test('1bad precision', () => should.Throw(function() { new OsGridRef(651409, 313177).toString(20); }, Error, 'invalid precision ‘20’'));
    });

    describe('Caister water tower', function() {
        // OS Guide to coordinate systems in Great Britain C.1, C.2; Caister water tower

        const osgb = LatLon.parse('52°39′27.2531″N, 1°43′4.5177″E', 0, LatLon.datums.OSGB36);
        const gridref = osgb.toOsGrid();
        test('C1 E',                () => gridref.easting.toFixed(3).should.equal('651409.903'));
        test('C1 N',                () => gridref.northing.toFixed(3).should.equal('313177.270'));
        const osgb2 = gridref.toLatLon(LatLon.datums.OSGB36);
        test('C1 round-trip',       () => osgb2.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'));

        const gridrefʹ = new OsGridRef(651409.903, 313177.270);
        const osgbʹ = gridrefʹ.toLatLon(LatLon.datums.OSGB36);
        test('C2',                  () => osgbʹ.toString('dms', 4).should.equal('52°39′27.2531″N, 001°43′04.5177″E'));
        const gridref2 = osgb.toOsGrid();
        test('C2 E round-trip',     () => gridref2.easting.toFixed(3).should.equal('651409.903'));
        test('C2 N round-trip',     () => gridref2.northing.toFixed(3).should.equal('313177.270'));

        test('parse 100km origin',  () => OsGridRef.parse('SU00').toString().should.equal('SU 00000 00000'));
        test('parse 100km origin',  () => OsGridRef.parse('SU 0 0').toString().should.equal('SU 00000 00000'));
        test('parse no whitespace', () => OsGridRef.parse('SU387148').toString().should.equal('SU 38700 14800'));
        test('parse 6-digit',       () => OsGridRef.parse('SU 387 148').toString().should.equal('SU 38700 14800'));
        test('parse 10-digit',      () => OsGridRef.parse('SU 38700 14800').toString().should.equal('SU 38700 14800'));
        test('parse numeric',       () => OsGridRef.parse('438700,114800').toString().should.equal('SU 38700 14800'));
    });

    describe('DG round-trip', function() {
        const dgGridRef = OsGridRef.parse('TQ 44359 80653');

        // round-tripping OSGB36 works perfectly
        const dgOsgb = dgGridRef.toLatLon(LatLon.datums.OSGB36);
        test('DG round-trip OSGB36', function () {
            dgGridRef.toString().should.equal(dgOsgb.toOsGrid().toString());
        });
        test('DG round-trip OSGB36 numeric', function () {
            dgOsgb.toOsGrid().toString(0).should.equal('544359,180653');
        });

        // reversing Helmert transform (OSGB->WGS->OSGB) introduces small error (≈ 3mm in UK), so WGS84
        // round-trip is not quite perfect: test needs to incorporate 3mm error to pass
        const dgWgs = dgGridRef.toLatLon(); // default is WGS84
        dgWgs.height = 0;
        test('DG round-trip WGS84 numeric', function () {
            dgWgs.toOsGrid().toString(0).should.equal('544358.997,180653');
        });
    });

    describe('extremities', function() {
        test('LE>', () => OsGridRef.parse('SW 34240 25290').toLatLon().toString().should.equal('50.0682°N, 005.7152°W'));
        test('LE<', () => new LatLon(50.0682, -5.7152).toOsGrid().toString().should.equal('SW 34240 25290'));
        test('NF>', () => OsGridRef.parse('TR 39859 69616').toLatLon().toString().should.equal('51.3749°N, 001.4451°E'));
        test('NF<', () => new LatLon(51.3749, 1.4451).toOsGrid().toString().should.equal('TR 39859 69616'));
        test('HP>', () => OsGridRef.parse('HY 45153 09450').toLatLon().toString().should.equal('58.9687°N, 002.9555°W'));
        test('HP<', () => new LatLon(58.9687, -2.9555).toOsGrid().toString().should.equal('HY 45153 09450'));
        test('RH>', () => OsGridRef.parse('HU 30497 83497').toLatLon().toString().should.equal('60.5339°N, 001.4461°W'));
        test('RH<', () => new LatLon(60.5339, -1.4461).toOsGrid().toString().should.equal('HU 30497 83497'));
    });

    describe('Extra-UK lat/lon fail', function() {
        test('0,0',    () => should.Throw(function() { new LatLon(0.00, 0.00).toOsGrid(); }, Error, 'invalid northing ‘-5527598.33’ from (-0.004833,0.000890).toOsGrid()'));
        test('Dublin', () => should.Throw(function() { new LatLon(53.35, 6.26).toOsGrid(); }, Error, 'invalid easting ‘949400.51’ from (53.349579,6.262431).toOsGrid()'));
    });
});
