/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vector-based spherical geodetic (latitude/longitude) functions     (c) Chris Veness 2011-2022  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vectors.html                                            */
/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-nvector-spherical                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import Vector3d from './vector3d.js';
import Dms      from './dms.js';

const π = Math.PI;


/**
 * Tools for working with points and paths on (a spherical model of) the earth’s surface using a
 * vector-based approach using ‘n-vectors’. In contrast to the more common spherical trigonometry,
 * a vector-based approach makes many calculations much simpler, and easier to follow.
 *
 * Based on Kenneth Gade’s ‘Non-singular Horizontal Position Representation’.
 *
 * Note that these formulations take x => 0°N,0°E, y => 0°N,90°E, z => 90°N; Gade uses x => 90°N,
 * y => 0°N,90°E, z => 0°N,0°E.
 *
 * Note also that on a spherical model earth, an n-vector is equivalent to a normalised version of
 * an (ECEF) cartesian coordinate.
 *
 * @module latlon-nvector-spherical
 */


/* LatLonNvectorSpherical - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Latitude/longitude points on an spherical model earth, and methods for calculating distances,
 * bearings, destinations, etc on great circle paths.
 */
class LatLonNvectorSpherical {

    /**
     * Creates a latitude/longitude point on the earth’s surface, using a spherical model earth.
     *
     * @param  {number} lat - Latitude (in degrees).
     * @param  {number} lon - Longitude (in degrees).
     * @throws {TypeError} Invalid lat/lon.
     *
     * @example
     *   import LatLon from '/js/geodesy/latlon-nvector-spherical.js';
     *   const p = new LatLon(52.205, 0.119);
     */
    constructor(lat, lon) {
        if (isNaN(lat)) throw new TypeError(`invalid lat ‘${lat}’`);
        if (isNaN(lon)) throw new TypeError(`invalid lon ‘${lon}’`);

        this._lat = Dms.wrap90(Number(lat));
        this._lon = Dms.wrap180(Number(lon));
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


    /** Conversion factors; 1000 * LatLon.metresToKm gives 1. */
    static get metresToKm()            { return 1/1000; }
    /** Conversion factors; 1000 * LatLon.metresToMiles gives 0.621371192237334. */
    static get metresToMiles()         { return 1/1609.344; }
    /** Conversion factors; 1000 * LatLon.metresToMiles gives 0.5399568034557236. */
    static get metresToNauticalMiles() { return 1/1852; }


    // TODO: is it worth LatLon.parse() for the n-vector version?


    /**
     * Converts ‘this’ latitude/longitude point to an n-vector (normal to earth's surface).
     *
     * @returns {Nvector} Normalised n-vector representing lat/lon point.
     *
     * @example
     *   const p = new LatLon(45, 45);
     *   const v = p.toNvector();      // [0.5000,0.5000,0.7071]
     */
    toNvector() { // note: replicated in LatLon_NvectorEllipsoidal
        const φ = this.lat.toRadians();
        const λ = this.lon.toRadians();

        const sinφ = Math.sin(φ), cosφ = Math.cos(φ);
        const sinλ = Math.sin(λ), cosλ = Math.cos(λ);

        // right-handed vector: x -> 0°E,0°N; y -> 90°E,0°N, z -> 90°N
        const x = cosφ * cosλ;
        const y = cosφ * sinλ;
        const z = sinφ;

        return new NvectorSpherical(x, y, z);
    }


    /**
     * Vector normal to great circle obtained by heading on given bearing from ‘this’ point.
     *
     * Direction of vector is such that initial bearing vector b = c × n, where n is an n-vector
     * representing ‘this’ (start) point.
     *
     * @private
     * @param   {number}   bearing - Compass bearing in degrees.
     * @returns {Vector3d} Normalised vector representing great circle.
     *
     * @example
     *   const p1 = new LatLon(53.3206, -1.7297);
     *   const gc = p1.greatCircle(96.0);         // [-0.794,0.129,0.594]
     */
    greatCircle(bearing) {
        const φ = this.lat.toRadians();
        const λ = this.lon.toRadians();
        const θ = Number(bearing).toRadians();

        const x =  Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
        const y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
        const z =  Math.cos(φ) * Math.sin(θ);

        return new Vector3d(x, y, z);
    }


    /**
     * Returns the distance on the surface of the sphere from ‘this’ point to destination point.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @param   {number}    [radius=6371e3] - Radius of earth (defaults to mean radius in metres).
     * @returns {number}    Distance between this point and destination point, in same units as radius.
     * @throws  {TypeError} Invalid point/radius.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const d = p1.distanceTo(p2);          // 404.3 km
     */
    distanceTo(point, radius=6371e3) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
        if (isNaN(radius)) throw new TypeError(`invalid radius ‘${radius}’`);

        const R = Number(radius);

        const n1 = this.toNvector();
        const n2 = point.toNvector();

        const sinθ = n1.cross(n2).length;
        const cosθ = n1.dot(n2);
        const δ = Math.atan2(sinθ, cosθ); // tanδ = |n₁×n₂| / n₁⋅n₂

        return δ * R;
    }


    /**
     * Returns the initial bearing from ‘this’ point to destination point.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @returns {number}    Initial bearing in degrees from north (0°..360°).
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const b1 = p1.initialBearingTo(p2);   // 156.2°
     */
    initialBearingTo(point) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
        if (this.equals(point)) return NaN; // coincident points

        const p1 = this.toNvector();
        const p2 = point.toNvector();

        const N = new NvectorSpherical(0, 0, 1); // n-vector representing north pole

        const c1 = p1.cross(p2); // great circle through p1 & p2
        const c2 = p1.cross(N);  // great circle through p1 & north pole

        const θ = c1.angleTo(c2, p1); // bearing is (signed) angle between c1 & c2

        return Dms.wrap360(θ.toDegrees()); // normalise to range 0..360°
    }


    /**
     * Returns final bearing arriving at destination point from ‘this’ point; the final bearing will
     * differ from the initial bearing by varying degrees according to distance and latitude.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @returns {number}    Final bearing in degrees from north (0°..360°).
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const b2 = p1.finalBearingTo(p2); // 157.9°
     */
    finalBearingTo(point) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);

        // get initial bearing from destination point to this point & reverse it by adding 180°
        return Dms.wrap360(point.initialBearingTo(this) + 180);
    }


    /**
     * Returns the midpoint between ‘this’ point and destination point.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @returns {LatLon}    Midpoint between this point and destination point.
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const pMid = p1.midpointTo(p2);       // 50.5363°N, 001.2746°E
     */
    midpointTo(point) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);

        const n1 = this.toNvector();
        const n2 = point.toNvector();

        const mid = n1.plus(n2);

        return new NvectorSpherical(mid.x, mid.y, mid.z).toLatLon();
    }


    /**
     * Returns the point at given fraction between ‘this’ point and given point.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @param   {number}    fraction - Fraction between the two points (0 = this point, 1 = specified point).
     * @returns {LatLon}    Intermediate point between this point and destination point.
     * @throws  {TypeError} Invalid point/fraction.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const pInt = p1.intermediatePointTo(p2, 0.25); // 51.3721°N, 000.7072°E
     */
    intermediatePointTo(point, fraction) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
        if (isNaN(fraction)) throw new TypeError(`invalid fraction ‘${fraction}’`);

        // angular distance between points; tanδ = |n₁×n₂| / n₁⋅n₂
        const n1 = this.toNvector();
        const n2 = point.toNvector();
        const sinθ = n1.cross(n2).length;
        const cosθ = n1.dot(n2);
        const δ = Math.atan2(sinθ, cosθ);

        // interpolated angular distance on straight line between points
        const δi = δ * Number(fraction);
        const sinδi = Math.sin(δi);
        const cosδi = Math.cos(δi);

        // direction vector (perpendicular to n1 in plane of n2)
        const d = n1.cross(n2).unit().cross(n1); // unit(n₁×n₂) × n₁

        // interpolated position
        const int = n1.times(cosδi).plus(d.times(sinδi)); // n₁⋅cosδᵢ + d⋅sinδᵢ

        return new NvectorSpherical(int.x, int.y, int.z).toLatLon();
    }


    /**
     * Returns the latitude/longitude point projected from the point at given fraction on a straight
     * line between between ‘this’ point and given point.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @param   {number}    fraction - Fraction between the two points (0 = this point, 1 = specified point).
     * @returns {LatLon}    Intermediate point between this point and destination point.
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const pInt = p1.intermediatePointTo(p2, 0.25); // 51.3723°N, 000.7072°E
     */
    intermediatePointOnChordTo(point, fraction) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);

        const n1 = this.toNvector();
        const n2 = point.toNvector();

        const int = n1.plus(n2.minus(n1).times(Number(fraction))); // n₁ + (n₂−n₁)·f ≡ n₁·(1-f) + n₂·f

        const n = new NvectorSpherical(int.x, int.y, int.z);

        return n.toLatLon();
    }


    /**
     * Returns the destination point from ‘this’ point having travelled the given distance on the
     * given initial bearing (bearing normally varies around path followed).
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Initial bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Destination point.
     *
     * @example
     *   const p1 = new LatLon(51.47788, -0.00147);
     *   const p2 = p1.destinationPoint(7794, 300.7); // 51.5136°N, 000.0983°W
     */
    destinationPoint(distance, bearing, radius=6371e3) {
        const n1 = this.toNvector();           // Gade's n_EA_E
        const δ = distance / radius;           // angular distance in radians
        const θ = Number(bearing).toRadians(); // initial bearing in radians

        const N = new NvectorSpherical(0, 0, 1);     // north pole

        const de = N.cross(n1).unit();               // east direction vector @ n1 (Gade's k_e_E)
        const dn = n1.cross(de);                     // north direction vector @ n1 (Gade's (k_n_E)

        const deSinθ = de.times(Math.sin(θ));
        const dnCosθ = dn.times(Math.cos(θ));

        const d = dnCosθ.plus(deSinθ);               // direction vector @ n1 (≡ C×n1; C = great circle)

        const x = n1.times(Math.cos(δ));             // component of n2 parallel to n1
        const y = d.times(Math.sin(δ));              // component of n2 perpendicular to n1

        const n2 = x.plus(y);                        // Gade's n_EB_E

        return new NvectorSpherical(n2.x, n2.y, n2.z).toLatLon();
    }


    /**
     * Returns the point of intersection of two paths each defined by point pairs or start point and bearing.
     *
     * @param   {LatLon}        path1start - Start point of first path.
     * @param   {LatLon|number} path1brngEnd - End point of first path or initial bearing from first start point.
     * @param   {LatLon}        path2start - Start point of second path.
     * @param   {LatLon|number} path2brngEnd - End point of second path or initial bearing from second start point.
     * @returns {LatLon}        Destination point (null if no unique intersection defined)
     * @throws  {TypeError}     Invalid parameter.
     *
     * @example
     *   const p1 = new LatLon(51.8853, 0.2545), brng1 = 108.55;
     *   const p2 = new LatLon(49.0034, 2.5735), brng2 =  32.44;
     *   const pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9076°N, 004.5086°E
     */
    static intersection(path1start, path1brngEnd, path2start, path2brngEnd) {
        if (!(path1start instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid path1start ‘${path1start}’`);
        if (!(path2start instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid path2start ‘${path2start}’`);
        if (!(path1brngEnd instanceof LatLonNvectorSpherical) && isNaN(path1brngEnd)) throw new TypeError(`invalid path1brngEnd ‘${path1brngEnd}’`);
        if (!(path2brngEnd instanceof LatLonNvectorSpherical) && isNaN(path2brngEnd)) throw new TypeError(`invalid path2brngEnd ‘${path2brngEnd}’`);

        if (path1start.equals(path2start)) return new LatLonNvectorSpherical(path1start.lat, path2start.lon); // coincident points

        // if c1 & c2 are great circles through start and end points (or defined by start point + bearing),
        // then candidate intersections are simply c1 × c2 & c2 × c1; most of the work is deciding correct
        // intersection point to select! if bearing is given, that determines which intersection, if both
        // paths are defined by start/end points, take closer intersection

        const p1 = path1start.toNvector();
        const p2 = path2start.toNvector();

        let c1 = null, c2 = null, path1def = null, path2def = null;
        // c1 & c2 are vectors defining great circles through start & end points; p × c gives initial bearing vector

        if (path1brngEnd instanceof LatLonNvectorSpherical) { // path 1 defined by endpoint
            c1 = p1.cross(path1brngEnd.toNvector());
            path1def = 'endpoint';
        } else {                              // path 1 defined by initial bearing
            c1 = path1start.greatCircle(path1brngEnd);
            path1def = 'bearing';
        }
        if (path2brngEnd instanceof LatLonNvectorSpherical) { // path 2 defined by endpoint
            c2 = p2.cross(path2brngEnd.toNvector());
            path2def = 'endpoint';
        } else {                              // path 2 defined by initial bearing
            c2 = path2start.greatCircle(path2brngEnd);
            path2def = 'bearing';
        }

        // there are two (antipodal) candidate intersection points; we have to choose which to return
        const i1 = c1.cross(c2);
        const i2 = c2.cross(c1);

        // TODO am I making heavy weather of this? is there a simpler way to do it?

        // selection of intersection point depends on how paths are defined (bearings or endpoints)
        let intersection = null, dir1 = null, dir2 = null;
        switch (path1def + '+' + path2def) {
            case 'bearing+bearing':
                // if c×p⋅i1 is +ve, the initial bearing is towards i1, otherwise towards antipodal i2
                dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
                dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1

                switch (dir1 + dir2) {
                    case  2: // dir1, dir2 both +ve, 1 & 2 both pointing to i1
                        intersection = i1;
                        break;
                    case -2: // dir1, dir2 both -ve, 1 & 2 both pointing to i2
                        intersection = i2;
                        break;
                    case  0: // dir1, dir2 opposite; intersection is at further-away intersection point
                        // take opposite intersection from mid-point of p1 & p2 [is this always true?]
                        intersection = p1.plus(p2).dot(i1) > 0 ? i2 : i1;
                        break;
                }
                break;
            case 'bearing+endpoint': // use bearing c1 × p1
                dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
                intersection = dir1 > 0 ? i1 : i2;
                break;
            case 'endpoint+bearing': // use bearing c2 × p2
                dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1
                intersection = dir2 > 0 ? i1 : i2;
                break;
            case 'endpoint+endpoint': // select nearest intersection to mid-point of all points
                const mid = p1.plus(p2).plus(path1brngEnd.toNvector()).plus(path2brngEnd.toNvector()); // eslint-disable-line no-case-declarations
                intersection = mid.dot(i1) > 0 ? i1 : i2;
                break;
        }

        return new NvectorSpherical(intersection.x, intersection.y, intersection.z).toLatLon();
    }


    /**
     * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point/bearing.
     *
     * @param   {LatLon}        pathStart - Start point of great circle path.
     * @param   {LatLon|number} pathBrngEnd - End point of great circle path or initial bearing from great circle start point.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number}        Distance to great circle (-ve if to left, +ve if to right of path).
     * @throws  {TypeError}     Invalid parameter.
     *
     * @example
     *   const pCurrent = new LatLon(53.2611, -0.7972);
     *
     *   const p1 = new LatLon(53.3206, -1.7297), brng = 96.0;
     *   const d = pCurrent.crossTrackDistanceTo(p1, brng); // Number(d.toPrecision(4)): -305.7
     *
     *   const p1 = new LatLon(53.3206, -1.7297), p2 = new LatLon(53.1887, 0.1334);
     *   const d = pCurrent.crossTrackDistanceTo(p1, p2);   // Number(d.toPrecision(4)): -307.5
     */
    crossTrackDistanceTo(pathStart, pathBrngEnd, radius=6371e3) {
        if (!(pathStart instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid pathStart ‘${pathStart}’`);
        if (!(pathBrngEnd instanceof LatLonNvectorSpherical || !isNaN(pathBrngEnd))) throw new TypeError(`invalid pathBrngEnd ‘${pathBrngEnd}’`);

        if (this.equals(pathStart)) return 0;

        const p = this.toNvector();
        const R = Number(radius);

        const gc = pathBrngEnd instanceof LatLonNvectorSpherical   // (note JavaScript is not good at method overloading)
            ? pathStart.toNvector().cross(pathBrngEnd.toNvector()) // great circle defined by two points
            : pathStart.greatCircle(pathBrngEnd);                  // great circle defined by point + bearing

        const α = gc.angleTo(p) - π/2; // angle between point & great-circle

        return α * R;
    }


    /**
     * Returns how far ‘this’ point is along a path from from start-point, heading on bearing or towards
     * end-point. That is, if a perpendicular is drawn from ‘this’ point to the (great circle) path, the
     * along-track distance is the distance from the start point to where the perpendicular crosses the
     * path.
     *
     * @param   {LatLon}        pathStart - Start point of great circle path.
     * @param   {LatLon|number} pathBrngEnd - End point of great circle path or initial bearing from great circle start point.
     * @param   {number}        [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number}        Distance along great circle to point nearest ‘this’ point.
     *
     * @example
     *   const pCurrent = new LatLon(53.2611, -0.7972);
     *   const p1 = new LatLon(53.3206, -1.7297);
     *   const p2 = new LatLon(53.1887,  0.1334);
     *   const d = pCurrent.alongTrackDistanceTo(p1, p2);  // 62.331 km
     */
    alongTrackDistanceTo(pathStart, pathBrngEnd, radius=6371e3) {
        if (!(pathStart instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid pathStart ‘${pathStart}’`);
        if (!(pathBrngEnd instanceof LatLonNvectorSpherical || !isNaN(pathBrngEnd))) throw new TypeError(`invalid pathBrngEnd ‘${pathBrngEnd}’`);

        const p = this.toNvector();
        const R = Number(radius);

        const gc = pathBrngEnd instanceof LatLonNvectorSpherical   // (note JavaScript is not good at method overloading)
            ? pathStart.toNvector().cross(pathBrngEnd.toNvector()) // great circle defined by two points
            : pathStart.greatCircle(pathBrngEnd);                  // great circle defined by point + bearing

        const pat = gc.cross(p).cross(gc); // along-track point c × p × c

        const α = pathStart.toNvector().angleTo(pat, gc); // angle between start point and along-track point

        return α * R;
    }


    /**
     * Returns closest point on great circle segment between point1 & point2 to ‘this’ point.
     *
     * If this point is ‘within’ the extent of the segment, the point is on the segment between point1 &
     * point2; otherwise, it is the closer of the endpoints defining the segment.
     *
     * @param   {LatLon} point1 - Start point of great circle segment.
     * @param   {LatLon} point2 - End point of great circle segment.
     * @returns {LatLon} Closest point on segment.
     *
     * @example
     *   const p1 = new LatLon(51.0, 1.0);
     *   const p2 = new LatLon(51.0, 2.0);
     *
     *   const p0 = new LatLon(51.0, 1.9);
     *   const p = p0.nearestPointOnSegment(p1, p2); // 51.0004°N, 001.9000°E
     *   const d = p.distanceTo(p);                  // 42.71 m
     *
     *   const p0 = new LatLon(51.0, 2.1);
     *   const p = p0.nearestPointOnSegment(p1, p2); // 51.0000°N, 002.0000°E
     */
    nearestPointOnSegment(point1, point2) {
        let p = null;

        if (this.isWithinExtent(point1, point2) && !point1.equals(point2)) {
            // closer to segment than to its endpoints, find closest point on segment
            const n0 = this.toNvector(), n1 = point1.toNvector(), n2 = point2.toNvector();
            const c1 = n1.cross(n2); // n1×n2 = vector representing great circle through p1, p2
            const c2 = n0.cross(c1); // n0×c1 = vector representing great circle through p0 normal to c1
            const n = c1.cross(c2);  // c2×c1 = nearest point on c1 to n0
            p = new NvectorSpherical(n.x, n.y, n.z).toLatLon();
        } else {
            // beyond segment extent, take closer endpoint
            const d1 = this.distanceTo(point1);
            const d2 = this.distanceTo(point2);
            const pCloser = d1<d2 ? point1 : point2;
            p = new LatLonNvectorSpherical(pCloser.lat, pCloser.lon);
        }

        return p;
    }


    /**
     * Returns whether this point is within the extent of a line segment joining point 1 & point 2.
     *
     * If this point is not on the great circle defined by point1 & point 2, returns whether it is
     * within the area bound by perpendiculars to the great circle at each point (in the same
     * hemisphere).
     *
     * @param   {LatLon}  point1 - First point defining segment.
     * @param   {LatLon}  point2 - Second point defining segment.
     * @returns {boolean} Whether this point is within extent of segment.
     *
     * @example
     *   const p1 = new LatLon(51, 1), p2 = new LatLon(52, 2);
     *   const within1 = new LatLon(52, 1).isWithinExtent(p1, p2); // true
     *   const within2 = new LatLon(51, 0).isWithinExtent(p1, p2); // false
     */
    isWithinExtent(point1, point2) {
        if (point1.equals(point2)) return this.equals(point1); // null segment

        const n0 = this.toNvector(), n1 = point1.toNvector(), n2 = point2.toNvector(); // n-vectors

        // get vectors representing p0->p1, p0->p2, p1->p2, p2->p1
        const δ10 = n0.minus(n1), δ12 = n2.minus(n1);
        const δ20 = n0.minus(n2), δ21 = n1.minus(n2);

        // dot product δ10⋅δ12 tells us if p0 is on p2 side of p1, similarly for δ20⋅δ21
        const extent1 = δ10.dot(δ12);
        const extent2 = δ20.dot(δ21);

        const isSameHemisphere = n0.dot(n1)>=0 && n0.dot(n2)>=0;

        return extent1>=0 && extent2>=0 && isSameHemisphere;
    }


    /**
     * Locates a point given two known locations and bearings from those locations.
     *
     * @param   {LatLon} point1 - First reference point.
     * @param   {number} bearing1 - Bearing (in degrees from north) from first reference point.
     * @param   {LatLon} point2 - Second reference point.
     * @param   {number} bearing2 - Bearing (in degrees from north) from second reference point.
     * @returns {LatLon} Triangulated point.
     *
     * @example
     *   const p1 = new LatLon(50.7175,1.65139), p2 = new LatLon(50.9250,1.7094);
     *   const p = LatLon.triangulate(p1, 333.3508, p2, 310.1414); // 51.1297°N, 001.3214°E
     */
    static triangulate(point1, bearing1, point2, bearing2) {
        const n1 = point1.toNvector(), θ1 = Number(bearing1).toRadians();
        const n2 = point2.toNvector(), θ2 = Number(bearing2).toRadians();

        const N = new NvectorSpherical(0, 0, 1); // north pole

        const de1 = N.cross(n1).unit();          // east vector @ n1
        const dn1 = n1.cross(de1);               // north vector @ n1
        const de1Sinθ = de1.times(Math.sin(θ1));
        const dn1Cosθ = dn1.times(Math.cos(θ1));
        const d1 = dn1Cosθ.plus(de1Sinθ);        // direction vector @ n1

        const c1 = n1.cross(d1);                 // great circle p1 + bearing1

        const de2 = N.cross(n2).unit();          // east vector @ n2
        const dn2 = n2.cross(de2);               // north vector @ n2
        const de2Sinθ = de2.times(Math.sin(θ2));
        const dn2Cosθ = dn2.times(Math.cos(θ2));
        const d2 = dn2Cosθ.plus(de2Sinθ);        // direction vector @ n2

        const c2 = n2.cross(d2);                 // great circle p2 + bearing2

        const ni = c1.cross(c2);                 // n-vector of intersection point

        return new NvectorSpherical(ni.x, ni.y, ni.z).toLatLon();
    }


    /**
     * Locates a latitude/longitude point at given distances from three other points.
     *
     * @param   {LatLon} point1 - First reference point.
     * @param   {number} distance1 - Distance to first reference point (same units as radius).
     * @param   {LatLon} point2 - Second reference point.
     * @param   {number} distance2 - Distance to second reference point (same units as radius).
     * @param   {LatLon} point3 - Third reference point.
     * @param   {number} distance3 - Distance to third reference point (same units as radius).
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Trilaterated point.
     *
     * @example
     *   LatLon.trilaterate(new LatLon(0, 0), 157e3, new LatLon(0, 1), 111e3, new LatLon(1, 0), 111e3); // 00.9985°N, 000.9986°E
     */
    static trilaterate(point1, distance1, point2, distance2, point3, distance3, radius=6371e3) {
        // from en.wikipedia.org/wiki/Trilateration

        const n1 = point1.toNvector(), δ1 = Number(distance1)/Number(radius);
        const n2 = point2.toNvector(), δ2 = Number(distance2)/Number(radius);
        const n3 = point3.toNvector(), δ3 = Number(distance3)/Number(radius);

        // the following uses x,y coordinate system with origin at n1, x axis n1->n2
        const eX = n2.minus(n1).unit();                        // unit vector in x direction n1->n2
        const i = eX.dot(n3.minus(n1));                        // signed magnitude of x component of n1->n3
        const eY = n3.minus(n1).minus(eX.times(i)).unit();     // unit vector in y direction
        const d = n2.minus(n1).length;                         // distance n1->n2
        const j = eY.dot(n3.minus(n1));                        // signed magnitude of y component of n1->n3
        const x = (δ1*δ1 - δ2*δ2 + d*d) / (2*d);               // x component of n1 -> intersection
        const y = (δ1*δ1 - δ3*δ3 + i*i + j*j) / (2*j) - x*i/j; // y component of n1 -> intersection
        // const eZ = eX.cross(eY);                            // unit vector perpendicular to plane
        // const z = Math.sqrt(δ1*δ1 - x*x - y*y);             // z will be NaN for no intersections

        if (!isFinite(x) || !isFinite(y)) return null; // coincident points?

        const n = n1.plus(eX.times(x)).plus(eY.times(y)); // note don't use z component; assume points at same height

        return new NvectorSpherical(n.x, n.y, n.z).toLatLon();
    }



    /**
     * Tests whether ‘this’ point is enclosed by the polygon defined by a set of points.
     *
     * @param   {LatLon[]} polygon - Ordered array of points defining vertices of polygon.
     * @returns {bool}     Whether this point is enclosed by polygon.
     *
     * @example
     *   const bounds = [ new LatLon(45,1), new LatLon(45,2), new LatLon(46,2), new LatLon(46,1) ];
     *   const p = new LatLon(45.1, 1.1);
     *   const inside = p.isEnclosedBy(bounds); // true
     */
    isEnclosedBy(polygon) {
        // this method uses angle summation test; on a plane, angles for an enclosed point will sum
        // to 360°, angles for an exterior point will sum to 0°. On a sphere, enclosed point angles
        // will sum to less than 360° (due to spherical excess), exterior point angles will be small
        // but non-zero. TODO: are any winding number optimisations applicable to spherical surface?

        if (!(polygon instanceof Array)) throw new TypeError(`isEnclosedBy: polygon must be Array (not ${classOf(polygon)})`);
        if (!(polygon[0] instanceof LatLonNvectorSpherical)) throw new TypeError(`isEnclosedBy: polygon must be Array of LatLon (not ${classOf(polygon[0])})`);
        if (polygon.length < 3) return false; // or throw?

        const nVertices = polygon.length;

        const p = this.toNvector();

        // get vectors from p to each vertex
        const vectorToVertex = [];
        for (let v=0; v<nVertices; v++) vectorToVertex[v] = p.minus(polygon[v].toNvector());
        vectorToVertex.push(vectorToVertex[0]);

        // sum subtended angles of each edge (using vector p to determine sign)
        let Σθ = 0;
        for (let v=0; v<nVertices; v++) {
            Σθ += vectorToVertex[v].angleTo(vectorToVertex[v+1], p);
        }

        return Math.abs(Σθ) > π;
    }


    /**
     * Calculates the area of a spherical polygon where the sides of the polygon are great circle
     * arcs joining the vertices.
     *
     * Uses Girard’s theorem: A = [Σθᵢ − (n−2)·π]·R²
     *
     * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon.
     * @param   {number}   [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number}   The area of the polygon in the same units as radius.
     *
     * @example
     *   const polygon = [ new LatLon(0,0), new LatLon(1,0), new LatLon(0,1) ];
     *   const area = LatLon.areaOf(polygon); // 6.18e9 m²
     */
    static areaOf(polygon, radius=6371e3) {
        const R = Number(radius);

        // get great-circle vector representing each segment
        const c = [];
        for (let v=0; v<polygon.length; v++) {
            if (polygon[v].equals(polygon[(v+1) % polygon.length])) continue; // ignore final vertex of closed polygon
            const i = polygon[v].toNvector();
            const j = polygon[(v+1) % polygon.length].toNvector();
            c.push(i.cross(j)); // great circle for segment v..v+1
        }

        const n = c.length; // number of segments (≡ distinct vertices)
        // sum interior angles; depending on whether polygon is cw or ccw, angle between edges is
        // π−α or π+α, where α is angle between great-circle vectors; so sum α, then take n·π − |Σα|
        // (cannot use Σ(π−|α|) as concave polygons would fail); use vector to 1st point as plane
        // normal for sign of α
        const n1 = polygon[0].toNvector();
        let Σα = 0;
        for (let v=0; v<n; v++) Σα += c[v].angleTo(c[(v+1) % n], n1);
        const Σθ = n*π - Math.abs(Σα);

        // note: angle between two sides of a spherical triangle is acos(c₁·c₂) where cₙ is the
        // plane normal vector to the great circle representing the triangle side - use this instead
        // of angleTo()?

        const E = Σθ - (n-2)*π; // spherical excess (in steradians)
        const A = E * R*R;      // area (in units of R²)

        return A;
    }


    /**
     * Calculates the centre of a spherical polygon where the sides of the polygon are great circle
     * arcs joining the vertices.
     *
     * Based on a ‘non-obvious application of Stokes’ theorem’ giving C = Σ[a×b / |a×b| ⋅ θab/2] for
     * each pair of consecutive vertices a, b; stackoverflow.com/questions/19897187#answer-38201499.
     *
     * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon.
     * @returns {LatLon}   Centre point of the polygon.
     *
     * @example
     *   const polygon = [ new LatLon(0, 0), new LatLon(1, 0), new LatLon(1, 1), new LatLon(0, 1) ];
     *   const centre = LatLon.centreOf(polygon); // 0.500°N, 0.500°E
     */
    static centreOf(polygon) {
        let centreV = new NvectorSpherical(0, 0, 0);
        for (let vertex=0; vertex<polygon.length; vertex++) {
            const a = polygon[vertex].toNvector();                      // current vertex
            const b = polygon[(vertex+1) % polygon.length].toNvector(); // next vertex
            const v = a.cross(b).unit().times(a.angleTo(b)/2);          // a×b / |a×b| ⋅ θab/2
            centreV = centreV.plus(v);
        }

        // if centreV is pointing in opposite direction to 1st vertex (depending on cw/ccw), negate it
        const θ = centreV.angleTo(polygon[0].toNvector());
        if (θ > π/2) centreV = centreV.negate();

        const centreP = new NvectorSpherical(centreV.x, centreV.y, centreV.z).toLatLon();

        return centreP;
    }
    static centerOf(polygon) { return LatLonNvectorSpherical.centreOf(polygon); } // for en-us American English


    /**
     * Returns point representing geographic mean of supplied points.
     *
     * @param   {LatLon[]} points - Array of points to be averaged.
     * @returns {LatLon}   Point at the geographic mean of the supplied points.
     *
     * @example
     *   const p = LatLon.meanOf([ new LatLon(1, 1), new LatLon(4, 2), new LatLon(1, 3) ]); // 02.0001°N, 002.0000°E
     */
    static meanOf(points) {
        let m = new NvectorSpherical(0, 0, 0); // null vector

        // add all vectors
        for (let p = 0; p < points.length; p++) {
            m = m.plus(points[p].toNvector());
        }
        // m is now geographic mean

        return new NvectorSpherical(m.x, m.y, m.z).toLatLon();
    }


    /**
     * Checks if another point is equal to ‘this’ point.
     *
     * @param   {LatLon}    point - Point to be compared against this point.
     * @returns {bool}      True if points have identical latitude and longitude values.
     * @throws  {TypeError} Invalid point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(52.205, 0.119);
     *   const equal = p1.equals(p2); // true
     */
    equals(point) {
        if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);

        if (Math.abs(this.lat - point.lat) > Number.EPSILON) return false;
        if (Math.abs(this.lon - point.lon) > Number.EPSILON) return false;

        return true;
    }


    /**
     * Converts ‘this’ point to a GeoJSON object.
     *
     * @returns {Object} this point as a GeoJSON ‘Point’ object.
     */
    toGeoJSON() {
        return { type: 'Point', coordinates: [ this.lon, this.lat ] };
    }


    /**
     * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
     * degrees+minutes+seconds.
     *
     * @param   {string} [format=d] - Format point as 'd', 'dm', 'dms', or 'n' for signed numeric.
     * @param   {number} [dp=4|2|0] - Number of decimal places to use: default 4 for d, 2 for dm, 0 for dms.
     * @returns {string} Comma-separated formatted latitude/longitude.
     *
     * @example
     *   const greenwich = new LatLon(51.47788, -0.00147);
     *   const d = greenwich.toString();                        // 51.4778°N, 000.0015°W
     *   const dms = greenwich.toString('dms', 2);              // 51°28′40.37″N, 000°00′05.29″W
     *   const [lat, lon] = greenwich.toString('n').split(','); // 51.4778, -0.0015
     */
    toString(format='d', dp=undefined) {
        // note: explicitly set dp to undefined for passing through to toLat/toLon
        if (![ 'd', 'dm', 'dms', 'n' ].includes(format)) throw new RangeError(`invalid format ‘${format}’`);

        if (format == 'n') { // signed numeric degrees
            if (dp == undefined) dp = 4;
            return `${this.lat.toFixed(dp)},${this.lon.toFixed(dp)}`;
        }
        const lat = Dms.toLat(this.lat, format, dp);
        const lon = Dms.toLon(this.lon, format, dp);
        return `${lat}, ${lon}`;
    }

}


/* Nvector - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * An n-vector is a (unit) vector normal to the Earth's surface (a non-singular position
 * representation).
 *
 * For many applications, n-vectors are more convenient to work with than other position
 * representations such as latitude/longitude, UTM coordinates, etc.
 *
 * On a spherical model earth, an n-vector is equivalent to a (normalised) earth-centred earth-fixed
 * (ECEF) vector.
 *
 * @extends Vector3d
 */
class NvectorSpherical extends Vector3d {

    // note commonality with latlon-nvector-ellipsoidal

    /**
     * Creates a 3d n-vector normal to the Earth’s surface.
     *
     * @param {number} x - X component of n-vector (towards 0°N, 0°E).
     * @param {number} y - Y component of n-vector (towards 0°N, 90°E).
     * @param {number} z - Z component of n-vector (towards 90°N).
     *
     * @example
     *   import { Nvector } from '/js/geodesy/latlon-nvector-spherical.js';
     *   const n = new Nvector(0.5000, 0.5000, 0.7071);
     */
    constructor(x, y, z) {
        const u = new Vector3d(x, y, z).unit(); // n-vectors are always normalised

        super(u.x, u.y, u.z);
    }


    /**
     * Converts ‘this’ n-vector to latitude/longitude point.
     *
     * @returns  {LatLon} Latitude/longitude point vector points to.
     *
     * @example
     *   const n = new Nvector(0.5000, 0.5000, 0.7071);
     *   const p = n.toLatLon(); // 45.0°N, 045.0°E
     */
    toLatLon() {
        // tanφ = z / √(x²+y²), tanλ = y / x (same as ellipsoidal calculation)

        const x = this.x, y = this.y, z = this.z;

        const φ = Math.atan2(z, Math.sqrt(x*x + y*y));
        const λ = Math.atan2(y, x);

        return new LatLonNvectorSpherical(φ.toDegrees(), λ.toDegrees());
    }


    /**
     * Vector normal to great circle obtained by heading on given bearing from point given by
     * ‘this’ n-vector.
     *
     * Direction of vector is such that initial bearing vector b = c × n, where n is an n-vector
     * representing ‘this’ (start) point.
     *
     * @private
     * @param   {number}   bearing - Compass bearing in degrees.
     * @returns {Vector3d} Normalised vector representing great circle.
     *
     * @example
     *   const n1 = new LatLon(53.3206, -1.7297).toNvector();
     *   const gc = n1.greatCircle(96.0); // [-0.794,0.129,0.594]
     */
    greatCircle(bearing) {
        const θ = Number(bearing).toRadians();

        const N = new Vector3d(0, 0, 1); // n-vector representing north pole
        const e = N.cross(this);         // easting
        const n = this.cross(e);         // northing
        const eʹ = e.times(Math.cos(θ)/e.length);
        const nʹ = n.times(Math.sin(θ)/n.length);
        const c = nʹ.minus(eʹ);

        return c;
    }


    /**
     * Returns a string representation of ‘this’ n-vector.
     *
     * @param   {number} [dp=3] - Number of decimal places to display.
     * @returns {string} Comma-separated x, y, z, h values.
     *
     * @example
     *   const v = new Nvector(0.5000, 0.5000, 0.7071).toString(); // [0.500,0.500,0.707]
     */
    toString(dp=3) {
        const x = this.x.toFixed(dp);
        const y = this.y.toFixed(dp);
        const z = this.z.toFixed(dp);

        return `[${x},${y},${z}]`;
    }

}


/**
 * Return class of supplied argument; javascriptweblog.wordpress.com/2011/08/08.
 *
 * @param   {any} thing - Object whose class is to be determined.
 * @returns {string} Class of supplied object.
 */
function classOf(thing) {
    return ({}).toString.call(thing).match(/\s([a-zA-Z0-9]+)/)[1];
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { LatLonNvectorSpherical as default, NvectorSpherical as Nvector, Dms };
