/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for conversions between (historical) datums          (c) Chris Veness 2005-2019  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-ellipsoidal-datum                  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


import LatLonEllipsoidal, { Cartesian, Dms } from './latlon-ellipsoidal.js';


/**
 * Historical geodetic datums: a latitude/longitude point defines a geographic location on or
 * above/below the  earth’s surface, measured in degrees from the equator & the International
 * Reference Meridian and metres above the ellipsoid, and based on a given datum. The datum is
 * based on a reference ellipsoid and tied to geodetic survey reference points.
 *
 * Modern geodesy is generally based on the WGS84 datum (as used for instance by GPS systems), but
 * previously various reference ellipsoids and datum references were used.
 *
 * This module extends the core latlon-ellipsoidal module to include ellipsoid parameters and datum
 * transformation parameters, and methods for converting between different (generally historical)
 * datums.
 *
 * It can be used for UK Ordnance Survey mapping (OS National Grid References are still based on the
 * otherwise historical OSGB36 datum), as well as for historical purposes.
 *
 * q.v. Ordnance Survey ‘A guide to coordinate systems in Great Britain’ Section 6,
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf, and also
 * www.ordnancesurvey.co.uk/blog/2014/12/2.
 *
 * @module latlon-ellipsoidal-datum
 */


/*
 * Ellipsoid parameters; exposed through static getter below.
 */
const ellipsoids = {
    WGS84:         { a: 6378137,     b: 6356752.314245, f: 1/298.257223563 },
    Airy1830:      { a: 6377563.396, b: 6356256.909,    f: 1/299.3249646   },
    AiryModified:  { a: 6377340.189, b: 6356034.448,    f: 1/299.3249646   },
    Bessel1841:    { a: 6377397.155, b: 6356078.962818, f: 1/299.1528128   },
    Clarke1866:    { a: 6378206.4,   b: 6356583.8,      f: 1/294.978698214 },
    Clarke1880IGN: { a: 6378249.2,   b: 6356515.0,      f: 1/293.466021294 },
    GRS80:         { a: 6378137,     b: 6356752.314140, f: 1/298.257222101 },
    Intl1924:      { a: 6378388,     b: 6356911.946,    f: 1/297           }, // aka Hayford
    WGS72:         { a: 6378135,     b: 6356750.5,      f: 1/298.26        },
};


/*
 * Datums; exposed through static getter below.
 */
const datums = {
    // transforms: t in metres, s in ppm, r in arcseconds              tx       ty        tz       s        rx        ry        rz
    ED50:       { ellipsoid: ellipsoids.Intl1924,      transform: [   89.5,    93.8,    123.1,    -1.2,     0.0,      0.0,      0.156    ] }, // epsg.io/1311
    // en.wikipedia.org/wiki/European_Terrestrial_Reference_System_1989
    Irl1975:    { ellipsoid: ellipsoids.AiryModified,  transform: [ -482.530, 130.596, -564.557,  -8.150,   1.042,    0.214,    0.631    ] }, // epsg.io/1954
    NAD27:      { ellipsoid: ellipsoids.Clarke1866,    transform: [    8,    -160,     -176,       0,       0,        0,        0        ] },
    NAD83:      { ellipsoid: ellipsoids.GRS80,         transform: [    0.9956, -1.9103,  -0.5215, -0.00062, 0.025915, 0.009426, 0.011599 ] },
    NTF:        { ellipsoid: ellipsoids.Clarke1880IGN, transform: [  168,      60,     -320,       0,       0,        0,        0        ] },
    OSGB36:     { ellipsoid: ellipsoids.Airy1830,      transform: [ -446.448, 125.157, -542.060,  20.4894, -0.1502,  -0.2470,  -0.8421   ] }, // epsg.io/1314
    Potsdam:    { ellipsoid: ellipsoids.Bessel1841,    transform: [ -582,    -105,     -414,      -8.3,     1.04,     0.35,    -3.08     ] },
    TokyoJapan: { ellipsoid: ellipsoids.Bessel1841,    transform: [  148,    -507,     -685,       0,       0,        0,        0        ] },
    WGS72:      { ellipsoid: ellipsoids.WGS72,         transform: [    0,       0,       -4.5,    -0.22,    0,        0,        0.554    ] },
    WGS84:      { ellipsoid: ellipsoids.WGS84,         transform: [    0.0,     0.0,      0.0,     0.0,     0.0,      0.0,      0.0      ] },
};
/* sources:
 * - ED50:       www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#pon-4
 * - Irl1975:    www.osi.ie/wp-content/uploads/2015/05/transformations_booklet.pdf
 * - NAD27:      en.wikipedia.org/wiki/Helmert_transformation
 * - NAD83:      www.uvm.edu/giv/resources/WGS84_NAD83.pdf [strictly, WGS84(G1150) -> NAD83(CORS96) @ epoch 1997.0]
 *               (note NAD83(1986) ≡ WGS84(Original); confluence.qps.nl/pages/viewpage.action?pageId=29855173)
 * - NTF:        Nouvelle Triangulation Francaise geodesie.ign.fr/contenu/fichiers/Changement_systeme_geodesique.pdf
 * - OSGB36:     www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
 * - Potsdam:    kartoweb.itc.nl/geometrics/Coordinate%20transformations/coordtrans.html
 * - TokyoJapan: www.geocachingtoolbox.com?page=datumEllipsoidDetails
 * - WGS72:      www.icao.int/safety/pbn/documentation/eurocontrol/eurocontrol wgs 84 implementation manual.pdf
 *
 * more transform parameters are available from earth-info.nga.mil/GandG/coordsys/datums/NATO_DT.pdf,
 * www.fieldenmaps.info/cconv/web/cconv_params.js
 */
/* note:
 * - ETRS89 reference frames are coincident with WGS-84 at epoch 1989.0 (ie null transform) at the one metre level.
 */


// freeze static properties
Object.keys(ellipsoids).forEach(e => Object.freeze(ellipsoids[e]));
Object.keys(datums).forEach(d => { Object.freeze(datums[d]); Object.freeze(datums[d].transform); });


/* LatLon - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Latitude/longitude points on an ellipsoidal model earth, with ellipsoid parameters and methods
 * for converting between datums and to geocentric (ECEF) cartesian coordinates.
 *
 * @extends LatLonEllipsoidal
 */
class LatLonEllipsoidal_Datum extends LatLonEllipsoidal {

    /**
     * Creates a geodetic latitude/longitude point on an ellipsoidal model earth using given datum.
     *
     * @param {number} lat - Latitude (in degrees).
     * @param {number} lon - Longitude (in degrees).
     * @param {number} [height=0] - Height above ellipsoid in metres.
     * @param {LatLon.datums} datum - Datum this point is defined within.
     *
     * @example
     *   import LatLon from '/js/geodesy/latlon-ellipsoidal-datum.js';
     *   const p = new LatLon(53.3444, -6.2577, 17, LatLon.datums.Irl1975);
     */
    constructor(lat, lon, height=0, datum=datums.WGS84) {
        if (!datum || datum.transform==undefined) throw new TypeError(`Unrecognised datum ‘${datum}’`);

        super(lat, lon, height);

        this._datum = datum;
    }


    /**
     * Datum this point is defined within.
     */
    get datum() {
        return this._datum;
    }


    /**
     * Ellipsoids with their parameters; semi-major axis (a), semi-minor axis (b), and flattening (f).
     *
     * Flattening f = (a−b)/a; at least one of these parameters is derived from defining constants.
     *
     * @example
     *   const a = LatLon.ellipsoids.Airy1830.a; // 6377563.396
     */
    static get ellipsoids() {
        return ellipsoids;
    }


    /**
     * Datums; with associated ellipsoid, and Helmert transform parameters to convert from WGS-84
     * into given datum.
     *
     * Note that precision of various datums will vary, and WGS-84 (original) is not defined to be
     * accurate to better than ±1 metre. No transformation should be assumed to be accurate to
     * better than a metre, for many datums somewhat less.
     *
     * This is a small sample of commoner datums from a large set of historical datums. I will add
     * new datums on request.
     *
     * @example
     *   const a = LatLon.datums.OSGB36.ellipsoid.a;                    // 6377563.396
     *   const tx = LatLon.datums.OSGB36.transform;                     // [ tx, ty, tz, s, rx, ry, rz ]
     *   const availableDatums = Object.keys(LatLon.datums).join(', '); // ED50, Irl1975, NAD27, ...
     */
    static get datums() {
        return datums;
    }


    // note instance datum getter/setters are in LatLonEllipsoidal


    /**
     * Parses a latitude/longitude point from a variety of formats.
     *
     * Latitude & longitude (in degrees) can be supplied as two separate parameters, as a single
     * comma-separated lat/lon string, or as a single object with { lat, lon } or GeoJSON properties.
     *
     * The latitude/longitude values may be numeric or strings; they may be signed decimal or
     * deg-min-sec (hexagesimal) suffixed by compass direction (NSEW); a variety of separators are
     * accepted. Examples -3.62, '3 37 12W', '3°37′12″W'.
     *
     * Thousands/decimal separators must be comma/dot; use Dms.fromLocale to convert locale-specific
     * thousands/decimal separators.
     *
     * @param   {number|string|Object} lat|latlon - Geodetic Latitude (in degrees) or comma-separated lat/lon or lat/lon object.
     * @param   {number}               [lon] - Longitude in degrees.
     * @param   {number}               [height=0] - Height above ellipsoid in metres.
     * @param   {LatLon.datums}        [datum=LatLon.datums.WGS84] - Datum this point is defined within.
     * @returns {LatLon} Latitude/longitude point on ellipsoidal model earth using given datum.
     * @throws  {TypeError} Unrecognised datum.
     *
     * @example
     *   const p = LatLon.parse('51.47736, 0.0000', 0, LatLon.datums.OSGB36);
     */
    static parse(...args) {
        let datum = datums.WGS84;

        // if the last argument is a datum, use that, otherwise use default WGS-84
        if (args.length==4 || (args.length==3 && typeof args[2] == 'object')) datum = args.pop();

        if (!datum || datum.transform==undefined) throw new TypeError(`Unrecognised datum ‘${datum}’`);

        const point = super.parse(...args);

        point._datum = datum;

        return point;
    }


    /**
     * Converts ‘this’ lat/lon coordinate to new coordinate system.
     *
     * @param   {LatLon.datums} toDatum - Datum this coordinate is to be converted to.
     * @returns {LatLon} This point converted to new datum.
     * @throws  {TypeError} Unrecognised datum.
     *
     * @example
     *   const pWGS84 = new LatLon(51.47788, -0.00147, 0, LatLon.datums.WGS84);
     *   const pOSGB = pWGS84.convertDatum(LatLon.datums.OSGB36); // 51.4773°N, 000.0001°E
     */
    convertDatum(toDatum) {
        if (toDatum == undefined || toDatum.transform == undefined) throw new TypeError('Unrecognised datum');

        let oldLatLon = this;
        let transform = null;

        if (oldLatLon.datum == datums.WGS84) {
            // converting from WGS 84
            transform = toDatum.transform;
        }
        if (toDatum == datums.WGS84) {
            // converting to WGS 84; use inverse transform
            transform = oldLatLon.datum.transform.map(p => -p);
        }
        if (transform == null) {
            // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
            oldLatLon = this.convertDatum(datums.WGS84);
            transform = toDatum.transform;
        }

        const oldCartesian = oldLatLon.toCartesian();                // convert geodetic to cartesian...
        const newCartesian = oldCartesian.applyTransform(transform); // ...apply transform...
        const newLatLon = newCartesian.toLatLon(toDatum);            // ...and convert cartesian to geodetic

        return newLatLon;
    }


    /**
     * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
     * (x/y/z) coordinates.
     *
     * @returns {Cartesian} Cartesian point equivalent to lat/lon point, with x, y, z in metres from
     *   earth centre.
     */
    toCartesian() {
        const cartesian = super.toCartesian();
        const cartesianDatums = new Cartesian_Datum(cartesian.x, cartesian.y, cartesian.z);
        return cartesianDatums;
    }

}


/* Cartesian  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Converts geocentric ECEF (earth-centered earth-fixed) cartesian coordinates to latitude/longitude points,
 * applies Helmert transformations.
 *
 * @extends Cartesian
 */
class Cartesian_Datum extends Cartesian {

    /**
     * Converts ‘this’ (geocentric) cartesian (x/y/z) coordinate to (geodetic) latitude/longitude
     * point on specified datum.
     *
     * Shadow of Cartesian.toLatLon(), returning LatLon augmented with LatLonEllipsoidal_Datum methods
     * convertDatum, toCartesian, etc.
     *
     * @param   {LatLon.datums} [datum=LatLon.datums.WGS84] - Datum to use when converting point.
     * @returns {LatLon} Latitude/longitude point defined by cartesian coordinates, in given datum.
     *
     * @example
     *   const c = new Cartesian(4027893.924, 307041.993, 4919474.294)
     *   const p = c.toLatLon().convertDatum(LatLon.datums.OSGB36); // 50.7971°N, 004.3612°E
     */
    toLatLon(datum=datums.WGS84) {
        if (!datum) throw new TypeError('Unrecognised datum');
        const latLon = super.toLatLon(datum.ellipsoid);
        return new LatLonEllipsoidal_Datum(latLon.lat, latLon.lon, latLon.height, datum);
    }


    /**
     * Applies Helmert 7-parameter transformation to ‘this’ coordinate using transform parameters t.
     *
     * This is used in converting datums (geodetic->cartesian, apply transform, cartesian->geodetic).
     *
     * @private
     * @param   {number[]} t - Transformation to apply to this coordinate.
     * @returns {Cartesian} Transformed point.
     */
    applyTransform(t)   {
        // this point
        const { x: x1, y: y1, z: z1 } = this;

        // transform parameters
        const tx = t[0];                    // x-shift in metres
        const ty = t[1];                    // y-shift in metres
        const tz = t[2];                    // z-shift in metres
        const s  = t[3]/1e6 + 1;            // scale: normalise parts-per-million to (s+1)
        const rx = (t[4]/3600).toRadians(); // x-rotation: normalise arcseconds to radians
        const ry = (t[5]/3600).toRadians(); // y-rotation: normalise arcseconds to radians
        const rz = (t[6]/3600).toRadians(); // z-rotation: normalise arcseconds to radians

        // apply transform
        const x2 = tx + x1*s  - y1*rz + z1*ry;
        const y2 = ty + x1*rz + y1*s  - z1*rx;
        const z2 = tz - x1*ry + y1*rx + z1*s;

        return new Cartesian_Datum(x2, y2, z2);
    }
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { LatLonEllipsoidal_Datum as default, Cartesian_Datum as Cartesian, datums, Dms };
