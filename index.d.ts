type datum = 'ED50'| 'Irl1975'| 'NAD27'| 'NAD83'| 'NTF'| 'OSGB36'| 'Potsdam'| 'TokyoJapan'| 'WGS72'| 'WGS84'
type hemisphere = 'N' | 'S'

interface Datum {
  ellipsoid: any
  transform: [number, number, number, number, number, number, number]
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
  toString(digits?: number): string
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
  static toDMS(deg: number, format?: 'd' | 'dm' | 'dms', dp?: 0 | 2 | 4): string;
  static toLat(deg: number, format?: 'd' | 'dm' | 'dms', dp?: 0 | 2 | 4): string;
  static toLon(deg: number, format?: 'd' | 'dm' | 'dms', dp?: 0 | 2 | 4): string;
  static toBrng(deg: number, format?: 'd' | 'dm' | 'dms', dp?: 0 | 2 | 4): string;
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
}

declare class LatLon {
  toUtm(): Utm
}

export {
  Mgrs,
  Utm,
  Dms,
  Vector3d,
}