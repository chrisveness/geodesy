/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vector-based ellipsoidal geodetic (latitude/longitude) functions   (c) Chris Veness 2015-2021  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vectors.html                                            */
/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-nvector-ellipsoidal                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLonEllipsoidal, { Cartesian, Vector3d, Dms } from './latlon-ellipsoidal.js';


/**
 * Tools for working with points on (ellipsoidal models of) the earth’s surface using a vector-based
 * approach using ‘n-vectors’ (rather than the more common spherical trigonometry).
 *
 * Based on Kenneth Gade’s ‘Non-singular Horizontal Position Representation’.
 *
 * Note that these formulations take x => 0°N,0°E, y => 0°N,90°E, z => 90°N (in order that n-vector
 * = cartesian vector at 0°N,0°E); Gade uses x => 90°N, y => 0°N,90°E, z => 0°N,0°E.
 *
 * @module latlon-nvector-ellipsoidal
 */


/* LatLon_NvectorEllipsoidal  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Latitude/longitude points on an ellipsoidal model earth augmented with methods for calculating
 * delta vectors between points, and converting to n-vectors.
 *
 * @extends LatLonEllipsoidal
 */
class LatLon_NvectorEllipsoidal extends LatLonEllipsoidal {

    /**
     * Calculates delta from ‘this’ point to supplied point.
     *
     * The delta is given as a north-east-down NED vector. Note that this is a linear delta,
     * unrelated to a geodesic on the ellipsoid.
     *
     * Points need not be defined on the same datum.
     *
     * @param   {LatLon} point - Point delta is to be determined to.
     * @returns {Ned} Delta from ‘this’ point to supplied point in local tangent plane of this point.
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const a = new LatLon(49.66618, 3.45063, 99);
     *   const b = new LatLon(48.88667, 2.37472, 64);
     *   const delta = a.deltaTo(b);   // [N:-86127,E:-78901,D:1104]
     *   const dist = delta.length;    // 116809.178 m
     *   const brng = delta.bearing;   // 222.493°
     *   const elev = delta.elevation; //  -0.5416°
     */
    deltaTo(point) {
        if (!(point instanceof LatLonEllipsoidal)) throw new TypeError(`invalid point ‘${point}’`);

        // get delta in cartesian frame
        const c1 = this.toCartesian();
        const c2 = point.toCartesian();
        const δc = c2.minus(c1);

        // get local (n-vector) coordinate frame
        const n1 = this.toNvector();
        const a = new Vector3d(0, 0, 1); // axis vector pointing to 90°N
        const d = n1.negate();           // down (pointing opposite to n-vector)
        const e = a.cross(n1).unit();    // east (pointing perpendicular to the plane)
        const n = e.cross(d);            // north (by right hand rule)

        // rotation matrix is built from n-vector coordinate frame axes (using row vectors)
        const r = [
            [ n.x, n.y, n.z ],
            [ e.x, e.y, e.z ],
            [ d.x, d.y, d.z ],
        ];

        // apply rotation to δc to get delta in n-vector reference frame
        const δn = new Cartesian(
            r[0][0]*δc.x + r[0][1]*δc.y + r[0][2]*δc.z,
            r[1][0]*δc.x + r[1][1]*δc.y + r[1][2]*δc.z,
            r[2][0]*δc.x + r[2][1]*δc.y + r[2][2]*δc.z,
        );

        return new Ned(δn.x, δn.y, δn.z);
    }


    /**
     * Calculates destination point using supplied delta from ‘this’ point.
     *
     * The delta is given as a north-east-down NED vector. Note that this is a linear delta,
     * unrelated to a geodesic on the ellipsoid.
     *
     * @param   {Ned}    delta - Delta from ‘this’ point to supplied point in local tangent plane of this point.
     * @returns {LatLon} Destination point.
     *
     * @example
     *   const a = new LatLon(49.66618, 3.45063, 99);
     *   const delta = Ned.fromDistanceBearingElevation(116809.178, 222.493, -0.5416); // [N:-86127,E:-78901,D:1104]
     *   const b = a.destinationPoint(delta);                                          // 48.8867°N, 002.3747°E
     */
    destinationPoint(delta) {
        if (!(delta instanceof Ned)) throw new TypeError('delta is not Ned object');

        // convert North-East-Down delta to standard x/y/z vector in coordinate frame of n-vector
        const δn = new Vector3d(delta.north, delta.east, delta.down);

        // get local (n-vector) coordinate frame
        const n1 = this.toNvector();
        const a = new Vector3d(0, 0, 1); // axis vector pointing to 90°N
        const d = n1.negate();           // down (pointing opposite to n-vector)
        const e = a.cross(n1).unit();    // east (pointing perpendicular to the plane)
        const n = e.cross(d);            // north (by right hand rule)

        // rotation matrix is built from n-vector coordinate frame axes (using column vectors)
        const r = [
            [ n.x, e.x, d.x ],
            [ n.y, e.y, d.y ],
            [ n.z, e.z, d.z ],
        ];

        // apply rotation to δn to get delta in cartesian (ECEF) coordinate reference frame
        const δc = new Cartesian(
            r[0][0]*δn.x + r[0][1]*δn.y + r[0][2]*δn.z,
            r[1][0]*δn.x + r[1][1]*δn.y + r[1][2]*δn.z,
            r[2][0]*δn.x + r[2][1]*δn.y + r[2][2]*δn.z,
        );

        // apply (cartesian) delta to c1 to obtain destination point as cartesian coordinate
        const c1 = this.toCartesian();              // convert this LatLon to Cartesian
        const v2 = c1.plus(δc);                     // the plus() gives us a plain vector,..
        const c2 = new Cartesian(v2.x, v2.y, v2.z); // ... need to convert it to Cartesian to get LatLon

        // return destination cartesian coordinate as latitude/longitude
        return c2.toLatLon();
    }


    /**
     * Converts ‘this’ lat/lon point to n-vector (normal to the earth's surface).
     *
     * @returns {Nvector} N-vector representing lat/lon point.
     *
     * @example
     *   const p = new LatLon(45, 45);
     *   const n = p.toNvector(); // [0.5000,0.5000,0.7071]
     */
    toNvector() { // note: replicated in LatLonNvectorSpherical
        const φ = this.lat.toRadians();
        const λ = this.lon.toRadians();

        const sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        const sinλ = Math.sin(λ), cosλ = Math.cos(λ);

        // right-handed vector: x -> 0°E,0°N; y -> 90°E,0°N, z -> 90°N
        const x = cosφ * cosλ;
        const y = cosφ * sinλ;
        const z = sinφ;

        return new NvectorEllipsoidal(x, y, z, this.h, this.datum);
    }


    /**
     * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
     * (x/y/z) coordinates.
     *
     * @returns {Cartesian} Cartesian point equivalent to lat/lon point, with x, y, z in metres from
     *   earth centre.
     */
    toCartesian() {
        const c = super.toCartesian();  // c is 'Cartesian'

        // return Cartesian_Nvector to have toNvector() available as method of exported LatLon
        return new Cartesian_Nvector(c.x, c.y, c.z);
    }

}


/* Nvector - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * An n-vector is a position representation using a (unit) vector normal to the Earth ellipsoid.
 * Unlike latitude/longitude points, n-vectors have no singularities or discontinuities.
 *
 * For many applications, n-vectors are more convenient to work with than other position
 * representations such as latitude/longitude, earth-centred earth-fixed (ECEF) vectors, UTM
 * coordinates, etc.
 *
 * @extends Vector3d
 */
class NvectorEllipsoidal extends Vector3d {

    // note commonality with latlon-nvector-spherical

    /**
     * Creates a 3d n-vector normal to the Earth's surface.
     *
     * @param {number} x - X component of n-vector (towards 0°N, 0°E).
     * @param {number} y - Y component of n-vector (towards 0°N, 90°E).
     * @param {number} z - Z component of n-vector (towards 90°N).
     * @param {number} [h=0] - Height above ellipsoid surface in metres.
     * @param {LatLon.datums} [datum=WGS84] - Datum this n-vector is defined within.
     */
    constructor(x, y, z, h=0, datum=LatLonEllipsoidal.datums.WGS84) {
        const u = new Vector3d(x, y, z).unit(); // n-vectors are always normalised

        super(u.x, u.y, u.z);

        this.h = Number(h);
        this.datum = datum;
    }


    /**
     * Converts ‘this’ n-vector to latitude/longitude point.
     *
     * @returns {LatLon} Latitude/longitude point equivalent to this n-vector.
     *
     * @example
     *   const p = new Nvector(0.500000, 0.500000, 0.707107).toLatLon(); // 45.0000°N, 045.0000°E
     */
    toLatLon() {
        // tanφ = z / √(x²+y²), tanλ = y / x (same as spherical calculation)

        const { x, y, z } = this;

        const φ = Math.atan2(z, Math.sqrt(x*x + y*y));
        const λ = Math.atan2(y, x);

        return new LatLon_NvectorEllipsoidal(φ.toDegrees(), λ.toDegrees(), this.h, this.datum);
    }


    /**
     * Converts ‘this’ n-vector to cartesian coordinate.
     *
     * qv Gade 2010 ‘A Non-singular Horizontal Position Representation’ eqn 22
     *
     * @returns {Cartesian} Cartesian coordinate equivalent to this n-vector.
     *
     * @example
     *   const c = new Nvector(0.500000, 0.500000, 0.707107).toCartesian(); // [3194419,3194419,4487349]
     *   const p = c.toLatLon();                                            // 45.0000°N, 045.0000°E
     */
    toCartesian() {
        const { b, f } = this.datum.ellipsoid;
        const { x, y, z, h } = this;

        const m = (1-f) * (1-f); // (1−f)² = b²/a²
        const n = b / Math.sqrt(x*x/m + y*y/m + z*z);

        const xʹ = n * x / m + x*h;
        const yʹ = n * y / m + y*h;
        const zʹ = n * z     + z*h;

        return new Cartesian_Nvector(xʹ, yʹ, zʹ);
    }


    /**
     * Returns a string representation of ‘this’ (unit) n-vector. Height component is only shown if
     * dpHeight is specified.
     *
     * @param   {number} [dp=3] - Number of decimal places to display.
     * @param   {number} [dpHeight=null] - Number of decimal places to use for height; default is no height display.
     * @returns {string} Comma-separated x, y, z, h values.
     *
     * @example
     *   new Nvector(0.5000, 0.5000, 0.7071).toString();        // [0.500,0.500,0.707]
     *   new Nvector(0.5000, 0.5000, 0.7071, 1).toString(6, 0); // [0.500002,0.500002,0.707103+1m]
     */
    toString(dp=3, dpHeight=null) {
        const { x, y, z } = this;
        const h = `${this.h>=0 ? '+' : ''}${this.h.toFixed(dpHeight)}m`;

        return `[${x.toFixed(dp)},${y.toFixed(dp)},${z.toFixed(dp)}${dpHeight==null ? '' : h}]`;
    }

}


/* Cartesian  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Cartesian_Nvector extends Cartesian with method to convert cartesian coordinates to n-vectors.
 *
 * @extends Cartesian
 */
class Cartesian_Nvector extends Cartesian {


    /**
     * Converts ‘this’ cartesian coordinate to an n-vector.
     *
     * qv Gade 2010 ‘A Non-singular Horizontal Position Representation’ eqn 23
     *
     * @param   {LatLon.datums} [datum=WGS84] - Datum to use for conversion.
     * @returns {Nvector} N-vector equivalent to this cartesian coordinate.
     *
     * @example
     *   const c = new Cartesian(3980581, 97, 4966825);
     *   const n = c.toNvector(); // { x: 0.6228, y: 0.0000, z: 0.7824, h: 0.0000 }
     */
    toNvector(datum=LatLonEllipsoidal.datums.WGS84) {
        const { a, f } = datum.ellipsoid;
        const { x, y, z } = this;

        const e2 = 2*f - f*f; // e² = 1st eccentricity squared ≡ (a²-b²)/a²
        const e4 = e2*e2;     // e⁴

        const p = (x*x + y*y) / (a*a);
        const q = z*z * (1-e2) / (a*a);
        const r = (p + q - e4) / 6;
        const s = (e4*p*q) / (4*r*r*r);
        const t = Math.cbrt(1 + s + Math.sqrt(2*s+s*s));
        const u = r * (1 + t + 1/t);
        const v = Math.sqrt(u*u + e4*q);
        const w = e2 * (u + v - q) / (2*v);
        const k = Math.sqrt(u + v + w*w) - w;
        const d = k * Math.sqrt(x*x + y*y) / (k + e2);

        const tmp = 1 / Math.sqrt(d*d + z*z);
        const xʹ = tmp * k/(k+e2) * x;
        const yʹ = tmp * k/(k+e2) * y;
        const zʹ = tmp * z;
        const h = (k + e2 - 1)/k * Math.sqrt(d*d + z*z);

        const n = new NvectorEllipsoidal(xʹ, yʹ, zʹ, h, datum);

        return n;
    }

}


/* Ned  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * North-east-down (NED), also known as local tangent plane (LTP), is a vector in the local
 * coordinate frame of a body.
 */
class Ned {

    /**
     * Creates North-East-Down vector.
     *
     * @param {number} north - North component in metres.
     * @param {number} east - East component in metres.
     * @param {number} down - Down component (normal to the surface of the ellipsoid) in metres.
     *
     * @example
     *   import { Ned } from '/js/geodesy/latlon-nvector-ellipsoidal.js';
     *   const delta = new Ned(110569, 111297, 1936); // [N:110569,E:111297,D:1936]
     */
    constructor(north, east, down) {
        this.north = north;
        this.east = east;
        this.down = down;
    }


    /**
     * Length of NED vector.
     *
     * @returns {number} Length of NED vector in metres.
     */
    get length() {
        const { north, east, down } = this;

        return Math.sqrt(north*north + east*east + down*down);
    }


    /**
     * Bearing of NED vector.
     *
     * @returns {number} Bearing of NED vector in degrees from north.
     */
    get bearing() {
        const θ = Math.atan2(this.east, this.north);

        return Dms.wrap360(θ.toDegrees()); // normalise to range 0..360°
    }


    /**
     * Elevation of NED vector.
     *
     * @returns {number} Elevation of NED vector in degrees from horizontal (ie tangent to ellipsoid surface).
     */
    get elevation() {
        const α = Math.asin(this.down/this.length);

        return -α.toDegrees();
    }


    /**
     * Creates North-East-Down vector from distance, bearing, & elevation (in local coordinate system).
     *
     * @param   {number} dist - Length of NED vector in metres.
     * @param   {number} brng - Bearing (in degrees from north) of NED vector .
     * @param   {number} elev - Elevation (in degrees from local coordinate frame horizontal) of NED vector.
     * @returns {Ned} North-East-Down vector equivalent to distance, bearing, elevation.
     *
     * @example
     *   const delta = Ned.fromDistanceBearingElevation(116809.178, 222.493, -0.5416); // [N:-86127,E:-78901,D:1104]
     */
    static fromDistanceBearingElevation(dist, brng, elev) {
        const θ = Number(brng).toRadians();
        const α = Number(elev).toRadians();
        dist = Number(dist);

        const sinθ = Math.sin(θ), cosθ = Math.cos(θ);
        const sinα = Math.sin(α), cosα = Math.cos(α);

        const n = cosθ * dist*cosα;
        const e = sinθ * dist*cosα;
        const d = -sinα * dist;

        return new Ned(n, e, d);
    }


    /**
     * Returns a string representation of ‘this’ NED vector.
     *
     * @param   {number} [dp=0] - Number of decimal places to display.
     * @returns {string} Comma-separated (labelled) n, e, d values.
     */
    toString(dp=0) {
        return `[N:${this.north.toFixed(dp)},E:${this.east.toFixed(dp)},D:${this.down.toFixed(dp)}]`;
    }

}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { LatLon_NvectorEllipsoidal as default, NvectorEllipsoidal as Nvector, Cartesian_Nvector as Cartesian, Ned, Dms };
