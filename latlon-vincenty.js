/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct and Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2014  */
/*                                                                                                */
/* from: Vincenty inverse formula - T Vincenty, "Direct and Inverse Solutions of Geodesics on the */
/*       Ellipsoid with application of nested equations", Survey Review, vol XXII no 176, 1975    */
/*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';


/**
 * Creates a LatLon point.
 *
 * @classdesc Direct and indirect solutions of geodesics on the ellipsoid using Vincenty formulae
 * @requires Geo
 *
 * @constructor
 * @param {Number} lat - latitude in degrees
 * @param {Number} lon - longitude in degrees
 */
function LatLon(lat, lon) {
    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Calculates geodetic distance between 'this' point and destination point specified by
 * latitude/longitude using Vincenty inverse formula for ellipsoids.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns (Number} distance in metres between points or NaN if failed to converge
 */
LatLon.prototype.distanceTo = function(point) {
    try {
        return this.inverse(point).distance;
    } catch (e) {
        return NaN; // failed to converge
    }
}


/**
 * Returns the initial bearing (forward azimuth) from 'this' point to the specified point,
 * in compass degrees.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} initial bearing in degrees from North (0°..360°) or NaN if failed to converge
 */
LatLon.prototype.initialBearingTo = function(point) {
    try {
        return this.inverse(point).initialBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
}


/**
 * Returns the final bearing (reverse azimuth) from 'this' point to the specified point,
 * in compass degrees.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} initial bearing in degrees from North (0°..360°) or NaN if failed to converge
 */
LatLon.prototype.finalBearingTo = function(point) {
    try {
        return this.inverse(point).finalBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
}


/**
 * Returns the destination point having travelled the given distance along the
 * given initial bearing from 'this' point.
 *
 * @param   {Number} initialBearing - initial bearing in degrees
 * @param   {Number} distance - distance travelled along the geodesic in metres
 * @returns {LatLon} destination point
 */
LatLon.prototype.destinationPoint = function(initialBearing, distance) {
    return this.direct(initialBearing, distance).point;
}


/**
 * Returns the final bearing (reverse azimuth) having travelled given distance on given bearing
 * from 'this' point, in compass degrees.
 *
 * @param   {LatLon} initialBearing - initial bearing in degrees
 * @param   {Number} distance - distance travelled along the geodesic in metres
 * @returns {Number} final bearing in degrees from North (0°..360°)
 */
LatLon.prototype.finalBearingOn = function(initialBearing, distance) {
    return this.direct(initialBearing, distance).finalBearing;
}


/**
 * Vincenty direct calculation.
 *
 * @param   {Number} initialBearing - initial bearing in decimal degrees
 * @param   {Number} distance - distance along bearing in metres
 * @returns (Object} point (destination point), finalBearing
 * @private
 */
LatLon.prototype.direct = function(initialBearing, distance) {
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var α1 = initialBearing.toRadians();
    var s = distance;

    var a = 6378137, b = 6356752.3142, f = 1/298.257223563;  // WGS-84 ellipsoid

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
    do {
        var cos2σM = Math.cos(2*σ1 + σ);
        var sinσ = Math.sin(σ);
        var cosσ = Math.cos(σ);
        var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations);
    console.log('direct', this.toString(), initialBearing, distance, iterations);

    var x = sinU1*sinσ - cosU1*cosσ*cosα1;
    var φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    var λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    var L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

    var revAz = Math.atan2(sinα, -x);

    return { point: new LatLon(φ2.toDegrees(), λ2.toDegrees()), finalBearing: revAz.toDegrees() };
}


/**
 * Vincenty inverse calculation.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Object} distance, initialBearing, finalBearing
 * @throws  {Error}  on formula failed to converge
 * @private
 */
LatLon.prototype.inverse = function(point) {
    var p1 = this, p2 = point;
    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();

    var a = 6378137, b = 6356752.3142, f = 1/298.257223563;  // WGS-84 ellipsoid parameters

    var L = λ2 - λ1;
    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    var λ = L, λʹ, iterations = 0;
    do {
        var sinλ = Math.sin(λ), cosλ = Math.cos(λ);
        var sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
        var sinσ = Math.sqrt(sinSqσ);
        if (sinσ==0) return 0;  // co-incident points
        var cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
        var σ = Math.atan2(sinσ, cosσ);
        var sinα = cosU1 * cosU2 * sinλ / sinσ;
        var cosSqα = 1 - sinα*sinα;
        var cos2σM = cosσ - 2*sinU1*sinU2/cosSqα;
        if (isNaN(cos2σM)) cos2σM = 0;  // equatorial line: cosSqα=0 (§6)
        var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
        λʹ = λ;
        λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<100);
    if (iterations>=100) throw new Error('Formula failed to converge');
    console.log('inverse', p1.toString(), p2.toString(), iterations);

    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
        B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

    var s = b*A*(σ-Δσ);

    var fwdAz = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
    var revAz = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

    s = Number(s.toFixed(3)); // round to 1mm precision
    return { distance: s, initialBearing: fwdAz.toDegrees(), finalBearing: revAz.toDegrees() };
}


/**
 * Returns a string representation of 'this' point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {String} [format=dms] - format point as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4] - number of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} comma-separated latitude/longitude
 */
LatLon.prototype.toString = function(format, dp) {
    return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() {
        return this * Math.PI / 180;
    }
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() {
        return this * 180 / Math.PI;
    }
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (!window.console) window.console = { log: function() {} };
