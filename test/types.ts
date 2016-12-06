import { Mgrs, Utm } from '../index'

/**
 * MGRS
 */
const mgrs = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932)
mgrs.band
mgrs.datum
mgrs.e100k
mgrs.e100kLetters
mgrs.easting
mgrs.latBands
mgrs.n100k
mgrs.n100kLetters
mgrs.northing
mgrs.toString()
mgrs.toUtm()
mgrs.zone

// Static Functions
Mgrs.parse('31U DQ 48251 11932')

/**
 * UTM
 */
const utm = new Utm(31, 'N', 448251, 5411932)
utm.convergence
utm.datum
utm.easting
utm.hemisphere
utm.northing
utm.scale
utm.toLatLonE()
utm.toMgrs()
utm.toString()

// Static Functions
Utm.parse('31 N 448251 5411932')
