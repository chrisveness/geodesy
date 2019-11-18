declare module 'geodesy'

type format = 'd' | 'dm' | 'dms'
type datum = 'ED50'| 'Irl1975'| 'NAD27'| 'NAD83'| 'NTF'| 'OSGB36'| 'Potsdam'| 'TokyoJapan'| 'WGS72'| 'WGS84'
type hemisphere = 'N' | 'S'
type ellipsoid = 'WGS84' | 'GRS80' | 'Airy1830' | 'AiryModified' | 'Intl1924' | 'Bessel1841'
type transform = [number, number, number, number, number, number, number]
type LatLon = LatLonEllipsoidal
type dp = 0 | 2 | 4
type precision = 1 | 2 | 3

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
  convergence: number|null
  scale: number|null
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
  toLatLon(): LatLon
  toString(digits?: number): string
}

declare class Dms {
  get separator(): string
  set separator(char: string)
  static parse(dms: string|number): number;
  static toDms(deg: number, format?: format, dp?: dp): string;
  static toLat(deg: number, format?: format, dp?: dp): string;
  static toLon(deg: number, format?: format, dp?: dp): string;
  static toBrng(deg: number, format?: format, dp?: dp): string;
  static fromLocale(str: string): string;
  static toLocale(str: string): string;
  static compassPoint(bearing: number, precision?: precision): string;
  static wrap360(degrees: number): string;
  static wrap90(degrees: number): string;
}

declare class Vector3d {
  x: number
  y: number
  z: number
  constructor(x: number, y: number, z: number)
  get length(): number
  plus(v: Vector3d): Vector3d
  minus(v: Vector3d): Vector3d
  times(x: number): Vector3d
  dividedBy(x: number): Vector3d
  dot(v: Vector3d): number
  cross(v: Vector3d): Vector3d
  negate(): Vector3d
  unit(): Vector3d
  angleTo(v: Vector3d, n?: Vector3d): number
  rotateAround(axis: Vector3d, theta: number): Vector3d
  toString(precision?: number): string
}

declare class OsGridRef {
  easting: number;
  northing: number;
  constructor(easting: number, northing: number);
  toLatLon(datum: Datum): LatLon
  static parse(gridref: string): OsGridRef;
  toString(digits?: number): string;
}

declare class LatLonEllipsoidal {
  _lat: number
  _lon: number
  _height: number
  _datum: Datum
  constructor(lat: number, lon: number, height?: number);
  get lat(): number
  get latitude(): number
  set lat(lat: number)
  set latitude(lat: number)
  get lon(): number
  get lng(): number
  get longitude(): number
  set lon(lon: number)
  set lng(lon: number)
  set longitude(lon: number)
  get height(): number
  set height(height: number)
  get datum(): Datum
  set datum(datum: Datum)
  static get ellipsoids(): Ellipsoids
  static get datums(): Datums
  static parse(lat: number|string|object, lon?: number, height?: number): LatLon
  toCartesian(): Cartesian
  equals(point: LatLon): boolean
  toString(format?: string, dp?: dp, dpHeight?: number): string
}

declare class Cartesian extends Vector3d {
  toLatLon(ellipsoid: Ellipsoid): LatLon
  toString(dp?: number): string
}

export {
  Mgrs,
  Utm,
  Dms,
  Vector3d,
  OsGridRef,
  LatLonEllipsoidal,
  Cartesian
}
