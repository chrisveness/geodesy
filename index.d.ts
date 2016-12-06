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
  )
  static parse(utmCoord: string, datum?: datum): Utm
  toLatLonE(): LatLon
  toMgrs(): Mgrs
  toString(digits?: number): string
}

declare class LatLon {
  toUtm(): Utm
}

export {
  Mgrs,
  Utm
}