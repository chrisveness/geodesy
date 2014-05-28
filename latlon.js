/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2014            */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var p1 = new LatLon(51.5136, -0.0983);                                                      */
/*    var p2 = new LatLon(51.4778, -0.0015);                                                      */
/*    var dist = p1.distanceTo(p2);          // in km                                             */
/*    var brng = p1.bearingTo(p2);           // in degrees clockwise from north                   */
/*    ... etc                                                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @classdesc Tools for geodetic calculations
 * @requires Geo
 *
 * @constructor
 * @param {Number} lat - latitude in degrees
 * @param {Number} lon - longitude in degrees
 * @param {Number} [radius=6371] - radius of earth if different value is required from standard 6,371km
 */
function LatLon(lat, lon, radius) {
    if (typeof radius == 'undefined') radius = 6371;  // earth's mean radius in km

    this.lat    = Number(lat);
    this.lon    = Number(lon);
    this.radius = Number(radius);
}


/**
 * Returns the distance from 'this' point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @param   {Number} [precision=4] - number of significant digits to use for returned value
 * @returns {Number} distance between this point and destination point, in km
 */
LatLon.prototype.distanceTo = function(point, precision) {
    // default 4 significant figures reflects typical 0.3% accuracy of spherical model
    if (typeof precision == 'undefined') precision = 4;
  
    var R = this.radius;
    var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d.toPrecisionFixed(Number(precision));
}


/**
 * Returns the (initial) bearing from 'this' point to destination point, in degrees.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} initial bearing in degrees from North
 */
LatLon.prototype.bearingTo = function(point) {
    // see http://williams.best.vwh.net/avform.htm#Crs

    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    var θ = Math.atan2(y, x);
  
    return (θ.toDegrees()+360) % 360;
}


/**
 * Returns final bearing arriving at destination destination point from 'this' point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} final bearing in degrees from North
 */
LatLon.prototype.finalBearingTo = function(point) {
    // get initial bearing from destination point to this point & reverse it by adding 180°
    return ( point.bearingTo(this)+180 ) % 360;
}


/**
 * Returns the midpoint between 'this' point and the supplied point.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {LatLon} midpoint between this point and the supplied point
 */
LatLon.prototype.midpointTo = function(point) {
    // see http://mathforum.org/library/drmath/view/51822.html for derivation

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    var Bx = Math.cos(φ2) * Math.cos(Δλ);
    var By = Math.cos(φ2) * Math.sin(Δλ);

    var φ3 = Math.atan2(Math.sin(φ1)+Math.sin(φ2),
             Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By) );
    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
    λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
}


/**
 * Returns the destination point from 'this' point having travelled the given distance on the
 * given initial bearing (bearing may vary before destination is reached).
 *
 * @param   {Number} brng - initial bearing in degrees
 * @param   {Number} dist - distance in km
 * @returns {LatLon} destination point
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
    // see http://williams.best.vwh.net/avform.htm#LL

    var θ = Number(brng).toRadians();
    var δ = Number(dist) / this.radius; // angular distance in radians

    var φ1 = this.lat.toRadians();
    var λ1 = this.lon.toRadians();

    var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
                        Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
    var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                             Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
    λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(φ2.toDegrees(), λ2.toDegrees());
}


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - first point
 * @param   {Number} brng1 - initial bearing from first point
 * @param   {LatLon} p2 - second point
 * @param   {Number} brng2 - initial bearing from second point
 * @returns {LatLon} destination point (null if no unique intersection defined)
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
    // see http://williams.best.vwh.net/avform.htm#Intersection

    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();
    var θ13 = Number(brng1).toRadians(), θ23 = Number(brng2).toRadians();
    var Δφ = φ2-φ1, Δλ = λ2-λ1;

    var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2) +
        Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
    if (δ12 == 0) return null;

    // initial/final bearings between points
    var θ1 = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) /
           ( Math.sin(δ12)*Math.cos(φ1) ) );
    if (isNaN(θ1)) θ1 = 0; // protect against rounding
    var θ2 = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) /
           ( Math.sin(δ12)*Math.cos(φ2) ) );

    if (Math.sin(λ2-λ1) > 0) {
        var θ12 = θ1;
        var θ21 = 2*Math.PI - θ2;
    } else {
        var θ12 = 2*Math.PI - θ1;
        var θ21 = θ2;
    }

    var α1 = (θ13 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var α2 = (θ21 - θ23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
    if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

    //α1 = Math.abs(α1);
    //α2 = Math.abs(α2);
    // ... Ed Williams takes abs of α1/α2, but seems to break calculation?

    var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) +
                         Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
    var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2),
                          Math.cos(α2)+Math.cos(α1)*Math.cos(α3) )
    var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) +
                        Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
    var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1),
                           Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
    var λ3 = λ1 + Δλ13;
    λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} distance in km between this point and destination point
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
    // see http://williams.best.vwh.net/avform.htm#Rhumb

    var R = this.radius;
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = Math.abs(point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    // on Mercator projection, longitude gets increasing stretched by latitude; q is the 'stretch factor'

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

    // the stretch factor becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return dist.toPrecisionFixed(4); // 4 sig figs reflects typical 0.3% accuracy of spherical model
}


/**
 * Returns the bearing from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {Number} bearing in degrees from North
 */
LatLon.prototype.rhumbBearingTo = function(point) {
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

    var θ = Math.atan2(Δλ, Δψ);

    return (θ.toDegrees()+360) % 360;
}


/**
 * Returns the destination point having travelled along a rhumb line from 'this' point the given
 * distance on the  given bearing.
 *
 * @param   {Number} brng - bearing in degrees from North
 * @param   {Number} dist - distance in km
 * @returns {LatLon} destination point
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
    var δ = Number(dist) / this.radius; // angular distance in radians
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var θ = Number(brng).toRadians();

    var Δφ = δ * Math.cos(θ);

    var φ2 = φ1 + Δφ;
    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

    var Δλ = δ*Math.sin(θ)/q;

    var λ2 = λ1 + Δλ;

    λ2 = (λ2 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(φ2.toDegrees(), λ2.toDegrees());
}


/**
 * Returns the loxodromic midpoint (along a rhumb line) between 'this' point and the supplied point.
 *
 * @param   {LatLon} point - latitude/longitude of destination point
 * @returns {LatLon} midpoint between this point and the supplied point
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
    // http://mathforum.org/kb/message.jspa?messageID=148837

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();

    if (Math.abs(λ2-λ1) > Math.PI) λ1 += 2*Math.PI; // crossing anti-meridian

    var φ3 = (φ1+φ2)/2;
    var f1 = Math.tan(Math.PI/4 + φ1/2);
    var f2 = Math.tan(Math.PI/4 + φ2/2);
    var f3 = Math.tan(Math.PI/4 + φ3/2);
    var λ3 = ( (λ2-λ1)*Math.log(f3) + λ1*Math.log(f2) - λ2*Math.log(f1) ) / Math.log(f2/f1);

    if (!isFinite(λ3)) λ3 = (λ1+λ2)/2; // parallel of latitude

    λ3 = (λ3 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns a string representation of 'this' point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {String} [format=dms] - format point as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4] - number of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} comma-separated latitude/longitude
 */
LatLon.prototype.toString = function(format, dp) {
    if (typeof format == 'undefined') format = 'dms';

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


/** 
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 * 
 * @param   {Number} precision - Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
    Number.prototype.toPrecisionFixed = function(precision) {

        // use standard toPrecision method
        var n = this.toPrecision(precision);

        // ... but replace +ve exponential format with trailing zeros
        n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
            sig = sig.replace(/\./, '');       // remove decimal from significand
            var l = sig.length - 1;
            while (exp-- > l) sig = sig + '0'; // append zeros from exponent
            return sig;
        });

        // ... and replace -ve exponential format with leading zeros
        n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
            sig = sig.replace(/\./, '');       // remove decimal from significand
            while (exp-- > 1) sig = '0' + sig; // prepend zeros from exponent
            return '0.' + sig;
        });

        return n;
    }
}


/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}


/** Returns the sign of a number, indicating whether the number is positive, negative or zero */
if (typeof Math.sign == 'undefined') {
    // stackoverflow.com/questions/7624920/number-sign-in-javascript
    Math.sign = function(x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    }
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (!window.console) window.console = { log: function() {} };
