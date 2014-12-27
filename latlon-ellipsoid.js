/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model         (c) Chris Veness 2005-2014 / MIT Licence  */
/*                                                                                                */
/* Includes methods for converting lat/lon coordinates between different coordinate systems.      */
/*   - www.movable-type.co.uk/scripts/latlong-convert-coords.html                                 */
/*                                                                                                */
/*  Usage: to eg convert WGS 84 coordinate to OSGB coordinate:                                    */
/*   - var wgs84 = new LatLonE(latWGS84, lonWGS84, LatLonE.datum.WGS84);                          */
/*   - var osgb = wgs84.convertDatum(LatLonE.datum.OSGB36);                                       */
/*   - var latOSGB = osgb.lat, lonOSGB = osgb.lon;                                                */
/*                                                                                                */
/*  q.v. Ordnance Survey 'A guide to coordinate systems in Great Britain' Section 6               */
/*   - www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf           */
/*                                                                                                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = require('./vector3d.js'); // CommonJS (Node.js)
if (typeof module!='undefined' && module.exports) var Geo = require('./geo.js'); // CommonJS (Node.js)


/**
 * Creates lat/lon (polar) point with latitude & longitude values and height above ellipsoid, on a
 * specified datum.
 *
 * @classdesc Library of geodesy functions for operations on an ellipsoidal earth model.
 * @requires Geo
 *
 * @constructor
 * @param {number}        lat - Geodetic latitude in degrees.
 * @param {number}        lon - Longitude in degrees.
 * @param {LatLonE.datum} [datum=WGS84] - Datum this point is defined within.
 * @param {number}        [height=0] - Height above ellipsoid, in metres.
 *
 * @example
 *     var p1 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
 */
function LatLonE(lat, lon, datum, height) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLonE)) return new LatLonE(lat, lon, datum, height);

    if (typeof datum == 'undefined') datum = LatLonE.datum.WGS84;
    if (typeof height == 'undefined') height = 0;

    this.lat = Number(lat);
    this.lon = Number(lon);
    this.datum = datum;
    this.height = Number(height);
}


/**
 * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
 */
LatLonE.ellipsoid = {
    WGS84:        { a: 6378137,     b: 6356752.31425, f: 1/298.257223563 },
    GRS80:        { a: 6378137,     b: 6356752.31414, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,   f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,   f: 1/299.3249646   },
    Intl1924:     { a: 6378388,     b: 6356911.946,   f: 1/297           },
    Bessel1841:   { a: 6377397.155, b: 6356078.963,   f: 1/299.152815351 }
};

/**
 * Datums; with associated *ellipsoid* and Helmert *transform* parameters to convert from WGS 84
 * into given datum.
 */
LatLonE.datum = {
    WGS84: {
        ellipsoid: LatLonE.ellipsoid.WGS84,
        transform: { tx:    0.0,    ty:    0.0,     tz:    0.0,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.0,    // sec
                      s:    0.0 }                                  // ppm
    },
    NAD83: { // (2009); functionally ≡ WGS84 - www.uvm.edu/giv/resources/WGS84_NAD83.pdf
        ellipsoid: LatLonE.ellipsoid.GRS80,
        transform: { tx:    1.004,  ty:   -1.910,   tz:   -0.515,  // m
                     rx:    0.0267 ,ry:    0.00034, rz:    0.011,  // sec
                      s:   -0.0015 }                               // ppm
    }, // note: if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
    OSGB36: { // www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
        ellipsoid: LatLonE.ellipsoid.Airy1830,
        transform: { tx: -446.448,  ty:  125.157,   tz: -542.060,  // m
                     rx:   -0.1502, ry:   -0.2470,  rz:   -0.8421, // sec
                      s:   20.4894 }                               // ppm
    },
    ED50: { // og.decc.gov.uk/en/olgs/cms/pons_and_cop/pons/pon4/pon4.aspx
        ellipsoid: LatLonE.ellipsoid.Intl1924,
        transform: { tx:   89.5,    ty:   93.8,     tz:  123.1,    // m
                     rx:    0.0,    ry:    0.0,     rz:    0.156,  // sec
                      s:   -1.2 }                                  // ppm
    },
    Irl1975: { // osi.ie/OSI/media/OSI/Content/Publications/transformations_booklet.pdf
        ellipsoid: LatLonE.ellipsoid.AiryModified,
        transform: { tx: -482.530,  ty:  130.596,   tz: -564.557,  // m
                     rx:   -1.042,  ry:   -0.214,   rz:   -0.631,  // sec
                      s:   -8.150 }                                // ppm
    },
    TokyoJapan: { // www.geocachingtoolbox.com?page=datumEllipsoidDetails
        ellipsoid: LatLonE.ellipsoid.Bessel1841,
        transform: { tx:  148,      ty: -507,       tz: -685,      // m
                     rx:    0,      ry:    0,       rz:    0,      // sec
                      s:    0 }                                    // ppm
    }
};


/**
 * Converts ‘this’ lat/lon coordinate to new coordinate system.
 *
 * @param   {LatLonE.datum} toDatum - Datum this coordinate is to be converted to.
 * @returns {LatLonE} This point converted to new datum.
 *
 * @example
 *     var pWGS84 = new LatLonE(51.4778, -0.0016, LatLonE.datum.WGS84);
 *     var pOSGB = pWGS84.convertDatum(LatLonE.datum.OSGB36); // pOSGB.toString(): 51.4773°N, 000.0000°E
 */
LatLonE.prototype.convertDatum = function(toDatum) {
    var oldLatLon = this;
    var transform;

    if (oldLatLon.datum == LatLonE.datum.WGS84) {
        // converting from WGS 84
        transform = toDatum.transform;
    }
    if (toDatum == LatLonE.datum.WGS84) {
        // converting to WGS 84; use inverse transform (don't overwrite original!)
        transform = {};
        for (var param in oldLatLon.datum.transform) {
            if (oldLatLon.datum.transform.hasOwnProperty(param)) {
                transform[param] = -oldLatLon.datum.transform[param];
            }
        }
    }
    if (typeof transform == 'undefined') {
        // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
        oldLatLon = this.convertDatum(LatLonE.datum.WGS84);
        transform = toDatum.transform;
    }

    // convert polar to cartesian
    var cartesian = oldLatLon.toCartesian();

    // apply transform
    cartesian = cartesian.applyTransform(transform);

    // convert cartesian to polar
    var newLatLon = cartesian.toLatLon(toDatum);

    return newLatLon;
};


/**
 * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
 * (x/y/z) coordinates.
 *
 * @returns {Vector3d} Vector pointing to lat/lon point, with x, y, z in metres from earth centre.
 */
LatLonE.prototype.toCartesian = function() {
    var φ = this.lat.toRadians(), λ = this.lon.toRadians();
    var h = this.height; // above ellipsoid
    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b;

    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var sinλ = Math.sin(λ), cosλ = Math.cos(λ);

    var eSq = (a*a - b*b) / (a*a);
    var ν = a / Math.sqrt(1 - eSq*sinφ*sinφ);

    var x = (ν+h) * cosφ * cosλ;
    var y = (ν+h) * cosφ * sinλ;
    var z = ((1-eSq)*ν + h) * sinφ;

    var point = new Vector3d(x, y, z);

    return point;
};


/**
 * Converts ‘this’ (geocentric) cartesian (x/y/z) point to (ellipsoidal geodetic) latitude/longitude
 * coordinates on specified datum.
 *
 * Uses Bowring’s (1985) formulation for μm precision.
 *
 * @param {LatLonE.datum.transform} datum - Datum to use when converting point.
 */
Vector3d.prototype.toLatLon = function(datum) {
    var x = this.x, y = this.y, z = this.z;
    var a = datum.ellipsoid.a, b = datum.ellipsoid.b;

    var e2 = (a*a-b*b) / (a*a); // 1st eccentricity squared
    var ε2 = (a*a-b*b) / (b*b); // 2nd eccentricity squared
    var p = Math.sqrt(x*x + y*y);
    var R = Math.sqrt(p*p + z*z); // radius

    // u = parametric latitude (Bowring eqn 17)
    var tanu = (b*z)/(a*p) * (1+ε2*b/R);
    var sinu = tanu / Math.sqrt(1+tanu*tanu);
    var cosu = sinu / tanu;

    // geodetic latitude (Bowring eqn 18)
    var B = Math.atan2(z + ε2*b*sinu*sinu*sinu,
                       p - e2*a*cosu*cosu*cosu);

    // longitude
    var λ = Math.atan2(y, x);

    // height above ellipsoid (Bowring eqn 7)
    var sinB = Math.sin(B), cosB = Math.cos(B);
    var ν = a*Math.sqrt(1-e2*sinB*sinB); // length of the normal terminated by the minor axis
    var h = p*cosB + z*sinB - (a*a/ν);

    var point = new LatLonE(B.toDegrees(), λ.toDegrees(), datum, h);

    return point;
};

/**
 * Applies Helmert transform to ‘this’ point using transform parameters t.
 *
 * @private
 * @param {LatLonE.datum.transform} t - Transform to apply to this point.
 */
Vector3d.prototype.applyTransform = function(t)   {
    var x1 = this.x, y1 = this.y, z1 = this.z;

    var tx = t.tx, ty = t.ty, tz = t.tz;
    var rx = (t.rx/3600).toRadians(); // normalise seconds to radians
    var ry = (t.ry/3600).toRadians(); // normalise seconds to radians
    var rz = (t.rz/3600).toRadians(); // normalise seconds to radians
    var s1 = t.s/1e6 + 1;             // normalise ppm to (s+1)

    // apply transform
    var x2 = tx + x1*s1 - y1*rz + z1*ry;
    var y2 = ty + x1*rz + y1*s1 - z1*rx;
    var z2 = tz - x1*ry + y1*rx + z1*s1;

    var point = new Vector3d(x2, y2, z2);

    return point;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLonE.prototype.toString = function(format, dp) {
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

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLonE; // CommonJS
if (typeof module != 'undefined' && module.exports) module.exports.Vector3d = Vector3d; // CommonJs
if (typeof define == 'function' && define.amd) define([], function() { return LatLonE; }); // AMD
if (typeof define == 'function' && define.amd) define([], function() { return Vector3d; }); // AMD??
