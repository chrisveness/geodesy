/*
 * @format
 */

declare module 'geodesy/latlon-ellipsoidal';

import { Datum, Datums, Ellipsoid, Ellipsoids, Dp } from './shared';
import Dms from './dms';
import Vector3d from './vector3d';

declare class LatLonEllipsoidal {
    _lat: number;
    _lon: number;
    _height: number;
    _datum: Datum;
    constructor(lat: number, lon: number, height?: number);
    get lat(): number;
    get latitude(): number;
    set lat(lat: number);
    set latitude(lat: number);
    get lon(): number;
    get lng(): number;
    get longitude(): number;
    set lon(lon: number);
    set lng(lon: number);
    set longitude(lon: number);
    get height(): number;
    set height(height: number);
    get datum(): Datum;
    set datum(datum: Datum);
    static get ellipsoids(): Ellipsoids;
    static get datums(): Datums;
    static parse(
        lat: number | string | object,
        lon?: number,
        height?: number,
    ): LatLonEllipsoidal;
    toCartesian(): Cartesian;
    equals(point: LatLonEllipsoidal): boolean;
    toString(format?: string, dp?: Dp, dpHeight?: number): string;
}

declare class Cartesian extends Vector3d {
    toLatLon(ellipsoid: Ellipsoid): LatLonEllipsoidal;
    toString(dp?: number): string;
}

export { LatLonEllipsoidal as default, Cartesian, Vector3d, Dms };
