import { Mgrs, Utm, Dms, Vector3d } from '../'

/**
 * Mgrs
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
 * Utm
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

/**
 * Dms
 */

Dms.separator = '\u202f'

// Static Functions
Dms.parseDMS('51° 28′ 40.12″ N')

Dms.toDMS(45)
Dms.toDMS(45, 'dm')
Dms.toDMS(45, 'd', 2)
Dms.toDMS(45, 'dms', 4)

Dms.toLat(45)
Dms.toLat(45, 'dm')
Dms.toLat(45, 'd', 2)
Dms.toLat(45, 'dms', 4)

Dms.toLon(45)
Dms.toLon(45, 'dm')
Dms.toLon(45, 'd', 2)
Dms.toLon(45, 'dms', 4)

Dms.toBrng(90)
Dms.toBrng(90, 'dm')
Dms.toBrng(90, 'd', 2)
Dms.toBrng(90, 'dms', 4)

Dms.compassPoint(180)
Dms.compassPoint(180, 1)
Dms.compassPoint(180, 2)
Dms.compassPoint(180, 3)

/**
 * Vector3d
 */
const v1 = new Vector3d(4, 23, 13)
const v2 = new Vector3d(5, 42, 33)
const v3 = new Vector3d(8, 12, 43)

v1.cross(v2).dot(v3)