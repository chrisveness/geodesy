/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Vector-based geodetic (latitude/longitude) functions              (c) Chris Veness 2011-2014  */
/*                                                                                   MIT Licence  */
/*  These functions work with                                                                     */
/*   a) geodesic (polar) latitude/longitude points on the earth's surface (in degrees)            */
/*   b) 3D vectors used as n-vectors representing points on the surface of the earth's surface,   */
/*      or vectors normal to the plane of a great circle                                          */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = require('./vector3d.js'); // CommonJS (Node.js)
if (typeof module!='undefined' && module.exports) var Geo = require('./geo.js'); // CommonJS (Node.js)


/**
 * Creates a LatLonV point on spherical model earth.
 *
 * @classdesc Tools for working with points and paths on (a spherical model of) the earth’s surface
 *     using a vector-based approach using ‘n-vectors’ (rather than the more common spherical
 *     trigonometry; a vector-based approach makes most calculations much simpler, and easier to
 *     follow, compared with trigonometric equivalents).
 * @requires Geo
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} [height=0] - Height above mean-sea-level in kilometres.
 * @param {number} [radius=6371] - Earth's mean radius in kilometres.
 *
 * @example
 *   var p1 = new LatLonV(52.205, 0.119);
 */
function LatLonV(lat, lon, height, radius) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLonV)) return new LatLonV(lat, lon, height, radius);

    if (typeof height == 'undefined') height = 0;
    if (typeof radius == 'undefined') radius = 6371;
    radius = Math.min(Math.max(radius, 6353), 6384);

    this.lat    = Number(lat);
    this.lon    = Number(lon);
    this.height = Number(height);
    this.radius = Number(radius);
}


/**
 * Converts ‘this’ lat/lon point to Vector3d n-vector (normal to earth's surface).
 *
 * @private
 * @returns {Vector3d} Normalised n-vector representing lat/lon point.
 *
 * @example
 *   var p = new LatLonV(45, 45);
 *   var v = p.toVector(); // v.toString(): [0.500,0.500,0.707]
 */
LatLonV.prototype.toVector = function() {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();

    // right-handed vector: x -> 0°E,0°N; y -> 90°E,0°N, z -> 90°N
    var x = Math.cos(φ) * Math.cos(λ);
    var y = Math.cos(φ) * Math.sin(λ);
    var z = Math.sin(φ);

    return new Vector3d(x, y, z);
};


/**
 * Converts ‘this’ n-vector to latitude/longitude point.
 *
 * @private
 * @returns  {LatLonV} Latitude/longitude point vector points to.
 *
 * @example
 *   var v = new Vector3d(0.500, 0.500, 0.707);
 *   var p = v.toLatLon(); // p.toString(): 45.0°N, 45.0°E
 */
Vector3d.prototype.toLatLon = function() {
    var φ = Math.atan2(this.z, Math.sqrt(this.x*this.x + this.y*this.y));
    var λ = Math.atan2(this.y, this.x);

    return new LatLonV(φ.toDegrees(), λ.toDegrees());
};


/**
 * Great circle obtained by heading on given bearing from ‘this’ point.
 *
 * @private
 * @param   {number}   bearing - Compass bearing in degrees.
 * @returns {Vector3d} Normalised vector representing great circle.
 *
 * @example
 *   var p1 = new LatLonV(53.3206, -1.7297);
 *   var gc = p1.greatCircle(96.0); // gc.toString(): [-0.794,0.129,0.594]
 */
LatLonV.prototype.greatCircle = function(bearing) {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();
    var θ = Number(bearing).toRadians();

    var x =  Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
    var y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
    var z =  Math.cos(φ) * Math.sin(θ);

    return new Vector3d(x, y, z);
};


/**
 * Returns the distance from ‘this’ point to the specified point.
 *
 * @param   {LatLonV} point - Latitude/longitude of destination point.
 * @returns {number}  Distance between this point and destination point in km.
 *
 * @example
 *   var p1 = new LatLonV(52.205, 0.119), p2 = new LatLonV(48.857, 2.351);
 *   var d = p1.distanceTo(p2); // d.toPrecision(4): 404.3
 */
LatLonV.prototype.distanceTo = function(point) {
    var p1 = this.toVector();
    var p2 = point.toVector();

    var δ = p1.angleTo(p2);
    var d = δ * this.radius;

    return d;
};


/**
 * Returns the (initial) bearing from ‘this’ point to the specified point, in compass degrees.
 *
 * @param   {LatLonV} point - Latitude/longitude of destination point.
 * @returns {number}  Initial bearing in degrees from North (0°..360°).
 *
 * @example
 *   var p1 = new LatLonV(52.205, 0.119), p2 = new LatLonV(48.857, 2.351);
 *   var b1 = p1.bearingTo(p2); // b1.toFixed(1): 156.2
 */
LatLonV.prototype.bearingTo = function(point) {
    var p1 = this.toVector();
    var p2 = point.toVector();

    var northPole = new Vector3d(0, 0, 1);

    var c1 = p1.cross(p2);        // great circle through p1 & p2
    var c2 = p1.cross(northPole); // great circle through p1 & north pole

    // bearing is (signed) angle between c1 & c2
    var bearing = c1.angleTo(c2, p1).toDegrees();

    return (bearing+360) % 360; // normalise to 0..360
};


/**
 * Returns the midpoint between ‘this’ point and specified point.
 *
 * @param   {LatLonV} point - Latitude/longitude of destination point.
 * @returns {LatLonV} Midpoint between this point and destination point.
 *
 * @example
 *   var p1 = new LatLonV(52.205, 0.119), p2 = new LatLonV(48.857, 2.351);
 *   var pMid = p1.midpointTo(p2); // pMid.toString(): 50.5363°N, 001.2746°E
 */
LatLonV.prototype.midpointTo = function(point) {
    var p1 = this.toVector();
    var p2 = point.toVector();

    var mid = p1.plus(p2).unit();

    return mid.toLatLon();
};


/**
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing will normally vary before destination is reached).
 *
 * @param   {number}  bearing - Initial bearing in degrees.
 * @param   {number}  distance - Distance in km.
 * @returns {LatLonV} Destination point.
 *
 * @example
 *   var p1 = new LatLonV(51.4778, -0.0015);
 *   var p2 = p1.destinationPoint(300.7, 7.794); // p2.toString(): 51.5135°N, 000.0983°W
 */
LatLonV.prototype.destinationPoint = function(bearing, distance) {
    var δ = Number(distance) / this.radius; // angular distance in radians

    // get great circle obtained by starting from 'this' point on given bearing
    var c = this.greatCircle(bearing);

    var p1 = this.toVector();

    var x = p1.times(Math.cos(δ));          // component of p2 parallel to p1
    var y = c.cross(p1).times(Math.sin(δ)); // component of p2 perpendicular to p1

    var p2 = x.plus(y).unit();

    return p2.toLatLon();
};


/**
 * Returns the point of intersection of two paths each defined by point pairs or start point and bearing.
 *
 * @param   {LatLonV}        path1start - Start point of first path.
 * @param   {LatLonV|number} path1brngEnd - End point of first path or initial bearing from first start point.
 * @param   {LatLonV}        path2start - Start point of second path.
 * @param   {LatLonV|number} path2brngEnd - End point of second path or initial bearing from second start point.
 * @returns {LatLonV}        Destination point (null if no unique intersection defined)
 *
 * @example
 *   var p1 = LatLonV(51.8853, 0.2545), brng1 = 108.55;
 *   var p2 = LatLonV(49.0034, 2.5735), brng2 =  32.44;
 *   var pInt = LatLonV.intersection(p1, brng1, p2, brng2); // pInt.toString(): 50.9078°N, 004.5084°E
 */
LatLonV.intersection = function(path1start, path1brngEnd, path2start, path2brngEnd) {
    var c1, c2;
    if (path1brngEnd instanceof LatLonV) { // path 1 defined by endpoint
        c1 = path1start.toVector().cross(path1brngEnd.toVector());
    } else {                               // path 1 defined by initial bearing
        c1 = path1start.greatCircle(path1brngEnd);
    }
    if (path2brngEnd instanceof LatLonV) { // path 2 defined by endpoint
        c2 = path2start.toVector().cross(path2brngEnd.toVector());
    } else {                               // path 2 defined by initial bearing
        c2 = path2start.greatCircle(path2brngEnd);
    }

    var intersection = c1.cross(c2);

    return intersection.toLatLon();
};


/**
 * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point/bearing.
 *
 * @param   {LatLonV}        pathStart - Start point of great circle path.
 * @param   {LatLonV|number} pathBrngEnd - End point of great circle path or initial bearing from great circle start point.
 * @returns {number}         Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   var pCurrent = new LatLonV(53.2611, -0.7972);
 *
 *   var p1 = new LatLonV(53.3206, -1.7297), brng = 96.0;
 *   var d = pCurrent.crossTrackDistanceTo(p1, brng);// d.toPrecision(4): 0.3354
 *
 *   var p1 = new LatLonV(53.3206, -1.7297), p2 = new LatLonV(53.1883, 0.1333);
 *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // d.toPrecision(4): 0.3354
 */
LatLonV.prototype.crossTrackDistanceTo = function(pathStart, pathBrngEnd) {
    var p = this.toVector();

    var gc;
    if (pathBrngEnd instanceof LatLonV) {
        // great circle defined by two points
        var pathEnd = pathBrngEnd;
        gc = pathStart.toVector().cross(pathEnd.toVector());
    } else {
        // great circle defined by point + bearing
        var pathBrng = Number(pathBrngEnd);
        gc = pathStart.greatCircle(pathBrng);
    }

    var α = gc.angleTo(p, p.cross(gc)); // (signed) angle between point & great-circle normal vector
    α = α<0 ? -Math.PI/2 - α : Math.PI/2 - α; // (signed) angle between point & great-circle

    var d = α * this.radius;

    return d;
};


/**
 * Tests whether ‘this’ point is enclosed by the (convex) polygon defined by a set of points.
 *
 * @param   {LatLonV[]} points - Ordered array of points defining vertices of polygon.
 * @returns {bool}      Whether this point is enclosed by region.
 * @throws  {Error}     If polygon is not convex.
 *
 * @example
 *   var bounds = [ new LatLonV(45,1), new LatLonV(45,2), new LatLonV(46,2), new LatLonV(46,1) ];
 *   var p = new LatLonV(45,1, 1.1);
 *   var inside = p.enclosedBy(bounds); // inside: true;
 */
LatLonV.prototype.enclosedBy = function(points) {
    var v = this.toVector(); // vector to 'this' point

    // if fully closed polygon, pop last point off array
    if (points[0].equals(points[points.length-1])) points.pop();

    // get great-circle vector for each segment
    var c = [];
    for (var n=0; n<points.length; n++) {
        var p1 = points[n].toVector();
        var p2 = points[n+1==points.length ? 0 : n+1].toVector();
        c[n] = p1.cross(p2); // great circle for segment n
    }

    // is 'this' point on same side of each segment? (left/right depending on (anti-)clockwise)
    var toLeft0 = c[0].angleTo(v) <= Math.PI/2; // 'this' point to left of first segment?
    for (var n=1; n<points.length; n++) {
        var toLeftN = c[n].angleTo(v) <= Math.PI/2; // 'this' point to left of segment n?
        if (toLeft0 != toLeftN) return false;
    }

    // is polygon convex? (otherwise above test is not reliable)
    for (var n=0; n<points.length; n++) {
        var c1 = c[n];
        var c2 = c[n+1==points.length ? 0 : n+1];
        var α = c1.angleTo(c2, v); // angle between great-circle vectors, signed by direction of v
        if (α < 0) throw new Error('Polygon is not convex');
    }

    return true;
};


/**
 * Returns point representing geographic mean of supplied points.
 *
 * @param   {LatLonV[]} points - Array of points to be averaged.
 * @returns {LatLonV}   Point at the geographic mean of the supplied points.
 * @todo Not yet tested.
 */
LatLonV.meanOf = function(points) {
    var m = new Vector3d(0, 0, 0);

    // add all vectors
    for (var p=0; p<points.length; p++) {
        m = m.plus(points[p].toVector());
    }

    // m is now geographic mean
    return m.unit().toLatLon();
};


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @private
 * @param   {LatLonV} point - Point to be compared against this point.
 * @returns {bool}    True if points are identical.
 *
 * @example
 *   var p1 = new LatLonV(52.205, 0.119), p2 = new LatLonV(52.205, 0.119);
 *   var equal = p1.equals(p2); // equals: true
 */
LatLonV.prototype.equals = function(point) {
    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;
    if (this.height != point.height) return false;
    if (this.radius != point.radius) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use: default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated formatted latitude/longitude.
 */
LatLonV.prototype.toString = function(format, dp) {
    if (typeof format == 'undefined') format = 'dms';

    return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/** Extend Math object to test the sign of a number, indicating whether it's positive, negative or zero */
if (typeof Math.sign == 'undefined') {
    // stackoverflow.com/questions/7624920/number-sign-in-javascript
    Math.sign = function(x) {
        return typeof x == 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLonV; // CommonJS
if (typeof module != 'undefined' && module.exports) module.exports.Vector3d = Vector3d; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return LatLonV; }); // AMD
if (typeof define == 'function' && define.amd) define([], function() { return Vector3d; }); // AMD??
