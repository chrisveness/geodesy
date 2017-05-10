type format = 'd' | 'dm' | 'dms'
type datum = 'ED50'| 'Irl1975'| 'NAD27'| 'NAD83'| 'NTF'| 'OSGB36'| 'Potsdam'| 'TokyoJapan'| 'WGS72'| 'WGS84'
type hemisphere = 'N' | 'S'
type ellipsoid = 'WGS84' | 'GRS80' | 'Airy1830' | 'AiryModified' | 'Intl1924' | 'Bessel1841'
type transform = [number, number, number, number, number, number, number]
type LatLon = LatLonEllipsoidal

interface Datum {
  ellipsoid: Ellipsoid
  transform: [number, number, number, number, number, number, number]
}

interface Datums {
  ED50: Datum
  Irl1975: Datum
  NAD27: Datum
  NAD83: Datum
  NTF: Datum
  OSGB36: Datum
  Potsdam: Datum
  TokyoJapan: Datum
  WGS72: Datum
  WGS84: Datum
}

interface Ellipsoid {
  a: number
  b: number
  f: number
}

interface Ellipsoids {
  WGS84: Ellipsoid
  GRS80: Ellipsoid
  Airy1830: Ellipsoid
  AiryModified: Ellipsoid
  Intl1924: Ellipsoid
  Bessel1841: Ellipsoid
}

declare class Mgrs {
  zone: number
  band: string
  e100k: string
  n100k: string
  easting: number
  northing: number
  datum: datum
  latBands: string
  e100kLetters: string
  n100kLetters: string
  constructor(
    zone: number,
    band: string,
    e100k: string,
    n100k: string,
    easting: number,
    northing: number,
    datum?: datum
  )
  static parse(mgrsGridRef: string): Mgrs
  toUtm(): Utm
  toString(digits?: 2 | 4 | 6 | 8 | 10): string
}

declare class Utm {
  zone: number
  hemisphere: hemisphere
  easting: number
  northing: number
  datum: Datum
  convergence: number
  scale: number
  constructor(
    zone: number,
    hemisphere: hemisphere,
    easting: number,
    northing: number,
    datum?: datum,
    convergence?: number,
    scale?: number
  );
  static parse(utmCoord: string, datum?: datum): Utm
  toLatLonE(): LatLon
  toMgrs(): Mgrs
  toString(digits?: number): string
}

declare namespace Dms {
  export let separator: string
}

declare class Dms {
  static parseDMS(dmsStr: string): number;
  static toDMS(deg: number, format?: format, dp?: 0 | 2 | 4): string;
  static toLat(deg: number, format?: format, dp?: 0 | 2 | 4): string;
  static toLon(deg: number, format?: format, dp?: 0 | 2 | 4): string;
  static toBrng(deg: number, format?: format, dp?: 0 | 2 | 4): string;
  static compassPoint(bearing: number, precision?: 1 | 2 | 3): string;
}

declare class Vector3d {
  x: number
  y: number
  z: number
  constructor(x: number, y: number, z: number)
  plus(v: Vector3d): Vector3d
  minus(v: Vector3d): Vector3d
  times(x: number): Vector3d
  dividedBy(x: number): Vector3d
  dot(v: Vector3d): number
  cross(v: Vector3d): Vector3d
  negate(): Vector3d
  length(): number
  unit(): Vector3d
  angleTo(v: Vector3d, n?: Vector3d): number
  rotateAround(axis: Vector3d, theta: number): Vector3d
  toString(precision?: number): string
  toLatLonE(datum: Datum): LatLon
  applyTransform(t: Array<number>): Vector3d
}

declare class OsGridRef {
  easting: number;
  northing: number;
  constructor(easting: number, northing: number);
  static latLonToOsGrid(p: LatLon): OsGridRef;
  static osGridToLatLon(gridref: OsGridRef, datum?: Datum): LatLon;
  static parse(gridref: string): OsGridRef;
  toString(digits?: number): string;
}

declare class LatLonEllipsoidal {
  lat: number
  lon: number
  datum: Datum
  constructor(lat: number, lon: number, datum?: Datum);
  toUtm(): Utm
  convertDatum(toDatum: Datum): LatLon
  toCartesian(): Vector3d
  toString(format?: format, dp?: 0 | 2 | 4): string;
  static datum: Datums
  static ellipsoid: Ellipsoids
}

export {
  Mgrs,
  Utm,
  Dms,
  Vector3d,
  OsGridRef,
  LatLonEllipsoidal
}