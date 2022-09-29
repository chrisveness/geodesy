/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model                       (c) Chris Veness 2005-2022  */
/*                                                                                   MIT Licence  */
/* Core class for latlon-ellipsoidal-datum & latlon-ellipsoidal-referenceframe.                   */
/*                                                                                                */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-ellipsoidal                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import Dms      from './dms.js';
import Vector3d from './vector3d.js';


/**
 * A latitude/longitude point defines a geographic location on or above/below the earth’s surface,
 * measured in degrees from the equator & the International Reference Meridian and in metres above
 * the ellipsoid, and based on a given datum.
 *
 * As so much modern geodesy is based on WGS-84 (as used by GPS), this module includes WGS-84
 * ellipsoid parameters, and it has methods for converting geodetic (latitude/longitude) points to/from
 * geocentric cartesian points; the latlon-ellipsoidal-datum and latlon-ellipsoidal-referenceframe
 * modules provide transformation parameters for converting between historical datums and between
 * modern reference frames.
 *
 * This module is used for both trigonometric geodesy (eg latlon-ellipsoidal-vincenty) and n-vector
 * geodesy (eg latlon-nvector-ellipsoidal), and also for UTM/MGRS mapping.
 *
 * @module latlon-ellipsoidal
 */


/*
 * Ellipsoid parameters; exposed through static getter below.
 *
 * The only ellipsoid defined is WGS84, for use in utm/mgrs, vincenty, nvector.
 */
const ellipsoids = {
    WGS84: { a: 6378137, b: 6356752.314245, f: 1/298.257223563 },
};


/*
 * Datums; exposed through static getter below.
 *
 * The only datum defined is WGS84, for use in utm/mgrs, vincenty, nvector.
 */
const datums = {
    WGS84: { ellipsoid: ellipsoids.WGS84 },
};


// freeze static properties
Object.freeze(ellipsoids.WGS84);
Object.freeze(datums.WGS84);


/* LatLonEllipsoidal - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Latitude/longitude points on an ellipsoidal model earth, with ellipsoid parameters and methods
 * for converting points to/from cartesian (ECEF) coordinates.
 *
 * This is the core class, which will usually be used via LatLonEllipsoidal_Datum or
 * LatLonEllipsoidal_ReferenceFrame.
 */
class LatLonEllipsoidal {

    /**
     * Creates a geodetic latitude/longitude point on a (WGS84) ellipsoidal model earth.
     *
     * @param  {number} lat - Latitude (in degrees).
     * @param  {number} lon - Longitude (in degrees).
     * @param  {number} [height=0] - Height above ellipsoid in metres.
     * @throws {TypeError} Invalid lat/lon/height.
     *
     * @example
     *   import LatLon from '/js/geodesy/latlon-ellipsoidal.js';
     *   const p = new LatLon(51.47788, -0.00147, 17);
     */
    constructor(lat, lon, height=0) {
        if (isNaN(lat) || lat == null) throw new TypeError(`invalid lat ‘${lat}’`);
        if (isNaN(lon) || lon == null) throw new TypeError(`invalid lon ‘${lon}’`);
        if (isNaN(height) || height == null) throw new TypeError(`invalid height ‘${height}’`);

        this._lat = Dms.wrap90(Number(lat));
        this._lon = Dms.wrap180(Number(lon));
        this._height = Number(height);
    }


    /**
     * Latitude in degrees north from equator (including aliases lat, latitude): can be set as
     * numeric or hexagesimal (deg-min-sec); returned as numeric.
     */
    get lat()       { return this._lat; }
    get latitude()  { return this._lat; }
    set lat(lat) {
        this._lat = isNaN(lat) ? Dms.wrap90(Dms.parse(lat)) : Dms.wrap90(Number(lat));
        if (isNaN(this._lat)) throw new TypeError(`invalid lat ‘${lat}’`);
    }
    set latitude(lat) {
        this._lat = isNaN(lat) ? Dms.wrap90(Dms.parse(lat)) : Dms.wrap90(Number(lat));
        if (isNaN(this._lat)) throw new TypeError(`invalid latitude ‘${lat}’`);
    }

    /**
     * Longitude in degrees east from international reference meridian (including aliases lon, lng,
     * longitude): can be set as numeric or hexagesimal (deg-min-sec); returned as numeric.
     */
    get lon()       { return this._lon; }
    get lng()       { return this._lon; }
    get longitude() { return this._lon; }
    set lon(lon) {
        this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(Number(lon));
        if (isNaN(this._lon)) throw new TypeError(`invalid lon ‘${lon}’`);
    }
    set lng(lon) {
        this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(Number(lon));
        if (isNaN(this._lon)) throw new TypeError(`invalid lng ‘${lon}’`);
    }
    set longitude(lon) {
        this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(Number(lon));
        if (isNaN(this._lon)) throw new TypeError(`invalid longitude ‘${lon}’`);
    }

    /**
     * Height in metres above ellipsoid.
     */
    get height()       { return this._height; }
    set height(height) { this._height = Number(height); if (isNaN(this._height)) throw new TypeError(`invalid height ‘${height}’`); }


    /**
     * Datum.
     *
     * Note this is replicated within LatLonEllipsoidal in order that a LatLonEllipsoidal object can
     * be monkey-patched to look like a LatLonEllipsoidal_Datum, for Vincenty calculations on
     * different ellipsoids.
     *
     * @private
     */
    get datum()      { return this._datum; }
    set datum(datum) { this._datum = datum; }


    /**
     * Ellipsoids with their parameters; this module only defines WGS84 parameters a = 6378137, b =
     * 6356752.314245, f = 1/298.257223563.
     *
     * @example
     *   const a = LatLon.ellipsoids.WGS84.a; // 6378137
     */
    static get ellipsoids() {
        return ellipsoids;
    }

    /**
     * Datums; this module only defines WGS84 datum, hence no datum transformations.
     *
     * @example
     *   const a = LatLon.datums.WGS84.ellipsoid.a; // 6377563.396
     */
    static get datums() {
        return datums;
    }


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
     * @param   {number|string|Object} lat|latlon - Latitude (in degrees), or comma-separated lat/lon, or lat/lon object.
     * @param   {number}               [lon]      - Longitude (in degrees).
     * @param   {number}               [height=0] - Height above ellipsoid in metres.
     * @returns {LatLon} Latitude/longitude point on WGS84 ellipsoidal model earth.
     * @throws  {TypeError} Invalid coordinate.
     *
     * @example
     *   const p1 = LatLon.parse(51.47788, -0.00147);              // numeric pair
     *   const p2 = LatLon.parse('51°28′40″N, 000°00′05″W', 17);   // dms string + height
     *   const p3 = LatLon.parse({ lat: 52.205, lon: 0.119 }, 17); // { lat, lon } object numeric + height
     */
    static parse(...args) {
        if (args.length == 0) throw new TypeError('invalid (empty) point');

        let lat=undefined, lon=undefined, height=undefined;

        // single { lat, lon } object
        if (typeof args[0]=='object' && (args.length==1 || !isNaN(parseFloat(args[1])))) {
            const ll = args[0];
            if (ll.type == 'Point' && Array.isArray(ll.coordinates)) { // GeoJSON
                [ lon, lat, height ] = ll.coordinates;
                height = height || 0;
            } else { // regular { lat, lon } object
                if (ll.latitude  != undefined) lat = ll.latitude;
                if (ll.lat       != undefined) lat = ll.lat;
                if (ll.longitude != undefined) lon = ll.longitude;
                if (ll.lng       != undefined) lon = ll.lng;
                if (ll.lon       != undefined) lon = ll.lon;
                if (ll.height    != undefined) height = ll.height;
                lat = Dms.wrap90(Dms.parse(lat));
                lon = Dms.wrap180(Dms.parse(lon));
            }
            if (args[1] != undefined) height = args[1];
            if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${JSON.stringify(args[0])}’`);
        }

        // single comma-separated lat/lon
        if (typeof args[0] == 'string' && args[0].split(',').length == 2) {
            [ lat, lon ] = args[0].split(',');
            lat = Dms.wrap90(Dms.parse(lat));
            lon = Dms.wrap180(Dms.parse(lon));
            height = args[1] || 0;
            if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args[0]}’`);
        }

        // regular (lat, lon) arguments
        if (lat==undefined && lon==undefined) {
            [ lat, lon ] = args;
            lat = Dms.wrap90(Dms.parse(lat));
            lon = Dms.wrap180(Dms.parse(lon));
            height = args[2] || 0;
            if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args.toString()}’`);
        }

        return new this(lat, lon, height); // 'new this' as may return subclassed types
    }


    /**
     * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric)
     * cartesian (x/y/z) coordinates.
     *
     * @returns {Cartesian} Cartesian point equivalent to lat/lon point, with x, y, z in metres from
     *   earth centre.
     */
    toCartesian() {
        // x = (ν+h)⋅cosφ⋅cosλ, y = (ν+h)⋅cosφ⋅sinλ, z = (ν⋅(1-e²)+h)⋅sinφ
        // where ν = a/√(1−e²⋅sinφ⋅sinφ), e² = (a²-b²)/a² or (better conditioned) 2⋅f-f²
        const ellipsoid = this.datum
            ? this.datum.ellipsoid
            : this.referenceFrame ? this.referenceFrame.ellipsoid : ellipsoids.WGS84;

        const φ = this.lat.toRadians();
        const λ = this.lon.toRadians();
        const h = this.height;
        const { a, f } = ellipsoid;

        const sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        const sinλ = Math.sin(λ), cosλ = Math.cos(λ);

        const eSq = 2*f - f*f;                      // 1st eccentricity squared ≡ (a²-b²)/a²
        const ν = a / Math.sqrt(1 - eSq*sinφ*sinφ); // radius of curvature in prime vertical

        const x = (ν+h) * cosφ * cosλ;
        const y = (ν+h) * cosφ * sinλ;
        const z = (ν*(1-eSq)+h) * sinφ;

        return new Cartesian(x, y, z);
    }


    /**
     * Checks if another point is equal to ‘this’ point.
     *
     * @param   {LatLon} point - Point to be compared against this point.
     * @returns {bool} True if points have identical latitude, longitude, height, and datum/referenceFrame.
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(52.205, 0.119);
     *   const equal = p1.equals(p2); // true
     */
    equals(point) {
        if (!(point instanceof LatLonEllipsoidal)) throw new TypeError(`invalid point ‘${point}’`);

        if (Math.abs(this.lat - point.lat) > Number.EPSILON) return false;
        if (Math.abs(this.lon - point.lon) > Number.EPSILON) return false;
        if (Math.abs(this.height - point.height) > Number.EPSILON) return false;
        if (this.datum != point.datum) return false;
        if (this.referenceFrame != point.referenceFrame) return false;
        if (this.epoch != point.epoch) return false;

        return true;
    }


    /**
     * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
     * degrees+minutes+seconds.
     *
     * @param   {string} [format=d] - Format point as 'd', 'dm', 'dms', or 'n' for signed numeric.
     * @param   {number} [dp=4|2|0] - Number of decimal places to use: default 4 for d, 2 for dm, 0 for dms.
     * @param   {number} [dpHeight=null] - Number of decimal places to use for height; default is no height display.
     * @returns {string} Comma-separated formatted latitude/longitude.
     * @throws  {RangeError} Invalid format.
     *
     * @example
     *   const greenwich = new LatLon(51.47788, -0.00147, 46);
     *   const d = greenwich.toString();                        // 51.4779°N, 000.0015°W
     *   const dms = greenwich.toString('dms', 2);              // 51°28′40″N, 000°00′05″W
     *   const [lat, lon] = greenwich.toString('n').split(','); // 51.4779, -0.0015
     *   const dmsh = greenwich.toString('dms', 0, 0);          // 51°28′40″N, 000°00′06″W +46m
     */
    toString(format='d', dp=undefined, dpHeight=null) {
        // note: explicitly set dp to undefined for passing through to toLat/toLon
        if (![ 'd', 'dm', 'dms', 'n' ].includes(format)) throw new RangeError(`invalid format ‘${format}’`);

        const height = (this.height>=0 ? ' +' : ' ') + this.height.toFixed(dpHeight) + 'm';
        if (format == 'n') { // signed numeric degrees
            if (dp == undefined) dp = 4;
            const lat = this.lat.toFixed(dp);
            const lon = this.lon.toFixed(dp);
            return `${lat}, ${lon}${dpHeight==null ? '' : height}`;
        }

        const lat = Dms.toLat(this.lat, format, dp);
        const lon = Dms.toLon(this.lon, format, dp);

        return `${lat}, ${lon}${dpHeight==null ? '' : height}`;
    }

}


/* Cartesian  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * ECEF (earth-centered earth-fixed) geocentric cartesian coordinates.
 *
 * @extends Vector3d
 */
class Cartesian extends Vector3d {

    /**
     * Creates cartesian coordinate representing ECEF (earth-centric earth-fixed) point.
     *
     * @param {number} x - X coordinate in metres (=> 0°N,0°E).
     * @param {number} y - Y coordinate in metres (=> 0°N,90°E).
     * @param {number} z - Z coordinate in metres (=> 90°N).
     *
     * @example
     *   import { Cartesian } from '/js/geodesy/latlon-ellipsoidal.js';
     *   const coord = new Cartesian(3980581.210, -111.159, 4966824.522);
     */
    constructor(x, y, z) {
        super(x, y, z); // arguably redundant constructor, but specifies units & axes
    }


    /**
     * Converts ‘this’ (geocentric) cartesian (x/y/z) coordinate to (geodetic) latitude/longitude
     * point on specified ellipsoid.
     *
     * Uses Bowring’s (1985) formulation for μm precision in concise form; ‘The accuracy of geodetic
     * latitude and height equations’, B R Bowring, Survey Review vol 28, 218, Oct 1985.
     *
     * @param   {LatLon.ellipsoids} [ellipsoid=WGS84] - Ellipsoid to use when converting point.
     * @returns {LatLon} Latitude/longitude point defined by cartesian coordinates, on given ellipsoid.
     * @throws  {TypeError} Invalid ellipsoid.
     *
     * @example
     *   const c = new Cartesian(4027893.924, 307041.993, 4919474.294);
     *   const p = c.toLatLon(); // 50.7978°N, 004.3592°E
     */
    toLatLon(ellipsoid=ellipsoids.WGS84) {
        // note ellipsoid is available as a parameter for when toLatLon gets subclassed to
        // Ellipsoidal_Datum / Ellipsoidal_Referenceframe.
        if (!ellipsoid || !ellipsoid.a) throw new TypeError(`invalid ellipsoid ‘${ellipsoid}’`);

        const { x, y, z } = this;
        const { a, b, f } = ellipsoid;

        const e2 = 2*f - f*f;           // 1st eccentricity squared ≡ (a²−b²)/a²
        const ε2 = e2 / (1-e2);         // 2nd eccentricity squared ≡ (a²−b²)/b²
        const p = Math.sqrt(x*x + y*y); // distance from minor axis
        const R = Math.sqrt(p*p + z*z); // polar radius

        // parametric latitude (Bowring eqn.17, replacing tanβ = z·a / p·b)
        const tanβ = (b*z)/(a*p) * (1+ε2*b/R);
        const sinβ = tanβ / Math.sqrt(1+tanβ*tanβ);
        const cosβ = sinβ / tanβ;

        // geodetic latitude (Bowring eqn.18: tanφ = z+ε²⋅b⋅sin³β / p−e²⋅cos³β)
        const φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2*b*sinβ*sinβ*sinβ, p - e2*a*cosβ*cosβ*cosβ);

        // longitude
        const λ = Math.atan2(y, x);

        // height above ellipsoid (Bowring eqn.7)
        const sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        const ν = a / Math.sqrt(1-e2*sinφ*sinφ); // length of the normal terminated by the minor axis
        const h = p*cosφ + z*sinφ - (a*a/ν);

        const point = new LatLonEllipsoidal(φ.toDegrees(), λ.toDegrees(), h);

        return point;
    }


    /**
     * Returns a string representation of ‘this’ cartesian point.
     *
     * @param   {number} [dp=0] - Number of decimal places to use.
     * @returns {string} Comma-separated latitude/longitude.
     */
    toString(dp=0) {
        const x = this.x.toFixed(dp), y = this.y.toFixed(dp), z = this.z.toFixed(dp);
        return `[${x},${y},${z}]`;
    }

}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { LatLonEllipsoidal as default, Cartesian, Vector3d, Dms };
