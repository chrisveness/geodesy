/*
 * @format
 */

export type Format = 'd' | 'dm' | 'dms';
export type Dp = 0 | 2 | 4;

export interface Plural<T> {
    [itemName: string]: T;
}

type Transform = [number, number, number, number, number, number, number];

export interface Datum {
    ellipsoid: Ellipsoid;
    transform: Transform;
}

export type Datums = Plural<Datum>;

export interface Ellipsoid {
    a: number;
    b: number;
    f: number;
}

export type Ellipsoids = Plural<Ellipsoid>;

export interface GeoJSON {
    type: string;
    coordinates: [number, number];
}

export type Polygon<T> = T[];
