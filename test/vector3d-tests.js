/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - vector3d                                    (c) Chris Veness 2019-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import Vector3d from '../vector3d.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}

describe('os-gridref', function() {
    const test = it;    // just an alias

    describe('Examples', function() {
        test('Constructor', () => new Vector3d(0.267, 0.535, 0.802).should.deep.equal({ x: 0.267, y: 0.535, z: 0.802 }));
    });

    describe('constructor fail', function() {
        test('texts', () => should.Throw(function() { new Vector3d('x', 'y', 'z'); }, TypeError, 'invalid vector [x,y,z]'));
    });

    describe('methods', function() {
        const v123 = new Vector3d(1, 2, 3);
        const v321 = new Vector3d(3, 2, 1);
        test('plus',         () => v123.plus(v321).should.deep.equal(new Vector3d(4, 4, 4)));
        test('minus',        () => v123.minus(v321).should.deep.equal(new Vector3d(-2, 0, 2)));
        test('times',        () => v123.times(2).should.deep.equal(new Vector3d(2, 4, 6)));
        test('times str',    () => v123.times('2').should.deep.equal(new Vector3d(2, 4, 6)));
        test('dividedBy',    () => v123.dividedBy(2).should.deep.equal(new Vector3d(0.5, 1, 1.5)));
        test('dot',          () => v123.dot(v321).should.equal(10));
        test('cross',        () => v123.cross(v321).should.deep.equal(new Vector3d(-4, 8, -4)));
        test('negate',       () => v123.negate().should.deep.equal(new Vector3d(-1, -2, -3)));
        test('length',       () => v123.length.should.equal(3.7416573867739413));
        test('unit',         () => v123.unit().toString().should.equal('[0.267,0.535,0.802]'));
        test('angleTo',      () => v123.angleTo(v321).toDegrees().toFixed(3).should.equal('44.415'));
        test('angleTo +',    () => v123.angleTo(v321, v123.cross(v321)).toDegrees().toFixed(3).should.equal('44.415'));
        test('angleTo -',    () => v123.angleTo(v321, v321.cross(v123)).toDegrees().toFixed(3).should.equal('-44.415'));
        test('angleTo 0',    () => v123.angleTo(v321, v123).toDegrees().toFixed(3).should.equal('44.415'));
        test('rotateAround', () => v123.rotateAround(new Vector3d(0, 0, 1), 90).toString().should.equal('[-0.535,0.267,0.802]'));
        test('toString',     () => v123.toString().should.equal('[1.000,2.000,3.000]'));
        test('toString',     () => v123.toString(6).should.equal('[1.000000,2.000000,3.000000]'));
    });

    describe('fails', function() {
        const v123 = new Vector3d(1, 2, 3);
        const v321 = new Vector3d(3, 2, 1);
        test('plus',         () => should.Throw(function() { v123.plus(1); }, TypeError, 'v is not Vector3d object'));
        test('minus',        () => should.Throw(function() { v123.minus(1); }, TypeError, 'v is not Vector3d object'));
        test('times',        () => should.Throw(function() { v123.times('x'); }, TypeError, 'invalid scalar value ‘x’'));
        test('dividedBy',    () => should.Throw(function() { v123.dividedBy('x'); }, TypeError, 'invalid scalar value ‘x’'));
        test('dot',          () => should.Throw(function() { v123.dot(1); }, TypeError, 'v is not Vector3d object'));
        test('cross',        () => should.Throw(function() { v123.cross(1); }, TypeError, 'v is not Vector3d object'));
        test('angleTo',      () => should.Throw(function() { v123.angleTo(1); }, TypeError, 'v is not Vector3d object'));
        test('angleTo',      () => should.Throw(function() { v123.angleTo(v321, 'x'); }, TypeError, 'n is not Vector3d object'));
        test('rotateAround', () => should.Throw(function() { v123.rotateAround(1); }, TypeError, 'axis is not Vector3d object'));
    });
});
