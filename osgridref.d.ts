/*
 * @format
 */

declare module 'geodesy/osgridref';

import { Datum } from './shared';

import LatLonEllipsoidal, { Dms } from './latlon-ellipsoidal-datum.js';

declare class OsGridRef {
    easting: number;
    northing: number;
    constructor(easting: number, northing: number);
    toLatLon(datum?: Datum): LatLon_OsGridRef;
    static parse(gridref: string): OsGridRef;
    toString(digits?: number): string;
}

declare class LatLon_OsGridRef extends LatLonEllipsoidal {
    toOsGrid(): OsGridRef;
}

export { OsGridRef as default, LatLon_OsGridRef as LatLon, Dms };
