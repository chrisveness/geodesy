/* jshint node:true */
/* globals define */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct and Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2014  */
/*                                                                                                */
/* from: T Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid with application */
/*       of nested equations", Survey Review, vol XXIII no 176, 1975                              */
/*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';
if (typeof module!=='undefined' && module.exports) var LatLonE = require('./latlon-ellipsoid.js'); // CommonJS (Node.js)


/**
 * Direct and inverse solutions of geodesics on the ellipsoid using Vincenty formulae
 *
 * @augments LatLonE
 */


/**
 * Returns the distance between ‘this’ point and destination point along a geodesic, using Vincenty
 * inverse solution.
 *
 * @param   {LatLonE} point - Latitude/longitude of destination point.
 * @returns (Number}  Distance in metres between points or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLonE(50.06632, -5.71475), p2 = new LatLongE(58.64402, -3.07009);
 *   var d = p1.distanceTo(p2); // d.toFixed(3): 969954.114
 */
LatLonE.prototype.distanceTo = function(point) {
    try {
        return this.inverse(point).distance;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the initial bearing (forward azimuth) to travel along a geodesic from ‘this’ point to the
 * specified point, using Vincenty inverse solution.
 *
 * @param   {LatLonE} point - Latitude/longitude of destination point.
 * @returns {number}  initial Bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLonE(50.06632, -5.71475), p2 = new LatLongE(58.64402, -3.07009);
 *   var b1 = p1.initialBearingTo(p2); // b1.toFixed(4): 9.1419
 */
LatLonE.prototype.initialBearingTo = function(point) {
    try {
        return this.inverse(point).initialBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic from ‘this’ point
 * to the specified point, using Vincenty inverse solution.
 *
 * @param   {LatLonE} point - Latitude/longitude of destination point.
 * @returns {number}  Initial bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLonE(50.06632, -5.71475), p2 = new LatLongE(58.64402, -3.07009);
 *   var b2 = p1.finalBearingTo(p2); // b2.toFixed(4): 11.2972
 */
LatLonE.prototype.finalBearingTo = function(point) {
    try {
        return this.inverse(point).finalBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the destination point having travelled the given distance along a geodesic given by
 * initial bearing from ‘this’ point, using Vincenty direct solution.
 *
 * @param   {number}  initialBearing - Initial bearing in degrees from north.
 * @param   {number}  distance - Distance travelled along the geodesic in metres.
 * @returns {LatLonE} Destination point.
 *
 * @example
 *   var p1 = new LatLonE(-37.95103, 144.42487);
 *   var p2 = p1.destinationPoint(306.86816, 54972.271); // p2.toString(): 37.6528°S, 143.9265°E
 */
LatLonE.prototype.destinationPoint = function(initialBearing, distance) {
    return this.direct(initialBearing, distance).point;
};


/**
 * Returns the final bearing (reverse azimuth) having travelled given distance along a geodesic
 * given by initial bearing from ‘this’ point, using Vincenty direct solution.
 *
 * @param   {LatLonE} initialBearing - Initial bearing in degrees from north.
 * @param   {number}  distance - Distance travelled along the geodesic in metres.
 * @returns {number}  Final bearing in degrees from north (0°..360°).
 *
 * @example
 *   var p1 = new LatLonE(-37.95103, 144.42487);
 *   var b2 = p1.finalBearingOn(306.86816, 54972.271); // b2.toFixed(4): 307.1736
 */
LatLonE.prototype.finalBearingOn = function(initialBearing, distance) {
    return this.direct(initialBearing, distance).finalBearing;
};


/**
 * Vincenty direct calculation.
 *
 * @private
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @param   {number} distance - Distance along bearing in metres.
 * @returns (Object} Object including point (destination point), finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLonE.prototype.direct = function(initialBearing, distance) {
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var α1 = initialBearing.toRadians();
    var s = distance;

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var sinα1 = Math.sin(α1);
    var cosα1 = Math.cos(α1);

    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var σ1 = Math.atan2(tanU1, cosα1);
    var sinα = cosU1 * sinα1;
    var cosSqα = 1 - sinα*sinα;
    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    var σ = s / (b*A), σʹ, iterations = 0;
    var sinσ,cosσ,cos2σM;
    do {
        cos2σM = Math.cos(2*σ1 + σ);
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge'); // not possible?

    var x = sinU1*sinσ - cosU1*cosσ*cosα1;
    var φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    var λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    var L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

    var α2 = Math.atan2(sinα, -x);
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360

    return { point: new LatLonE(φ2.toDegrees(), λ2.toDegrees(), this.datum),
        finalBearing: α2.toDegrees() };
};


/**
 * Vincenty inverse calculation.
 *
 * @private
 * @param   {LatLonE} point - Latitude/longitude of destination point.
 * @returns {Object}  Object including istance, initialBearing, finalBearing.
 * @throws  {Error}   If formula failed to converge.
 */
LatLonE.prototype.inverse = function(point) {
    var p1 = this, p2 = point;
    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var L = λ2 - λ1;
    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    var λ = L, λʹ, iterations = 0;
    var cosSqα,sinσ,cosσ,cos2σM,σ,sinλ,cosλ;
    do {
        sinλ = Math.sin(λ);
        cosλ = Math.cos(λ);
        var sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
        sinσ = Math.sqrt(sinSqσ);
        if (sinσ===0) return 0;  // co-incident points
        cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
        σ = Math.atan2(sinσ, cosσ);
        var sinα = cosU1 * cosU2 * sinλ / sinσ;
        cosSqα = 1 - sinα*sinα;
        cos2σM = cosσ - 2*sinU1*sinU2/cosSqα;
        if (isNaN(cos2σM)) cos2σM = 0;  // equatorial line: cosSqα=0 (§6)
        var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
        λʹ = λ;
        λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge');

    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
        B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

    var s = b*A*(σ-Δσ);

    var α1 = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
    var α2 = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

    α1 = (α1 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0...360

    s = Number(s.toFixed(3)); // round to 1mm precision
    return { distance: s, initialBearing: α1.toDegrees(), finalBearing: α2.toDegrees() };
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians === 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees === 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof console === 'undefined') var console = { log: function() {} }; // console.log stub
if (typeof module !== 'undefined' && module.exports) module.exports = LatLonE; // CommonJS
if (typeof define === 'function' && define.amd) define([], function() { return LatLonE; }); // AMD
