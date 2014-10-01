/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  UTM / WGS 84 Conversion Functions                                      (c) Chris Veness 2014  */
/*                                                                                                */
/* Convert between Universal Transverse Mercator coordinates and WGS 84 latitude/longitude points */
/*                                                                                                */
/* Based on Karney 2011 ‘Transverse Mercator with an accuracy of a few nanometers’, building on   */
/* Krüger 1912 ‘Konforme Abbildung des Erdellipsoids in der Ebene’.                               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/* jshint node:true, laxbreak:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var LatLonE = require('./latlon-ellipsoid.js'); // CommonJS (Node.js)


/**
 * Creates a Utm coordinate object.
 *
 * @classdesc Convert UTM coordinates to/from WGS 84 latitude/longitude points.
 *
 *   Method based on Karney 2011 ‘Transverse Mercator with an accuracy of a few nanometers’,
 *   building on Krüger 1912 ‘Konforme Abbildung des Erdellipsoids in der Ebene’.
 *
 * @constructor
 * @param  {number} zone - UTM 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} hemisphere - N for northern hemisphere, S for southern hemisphere.
 * @param  {number} easting - Easting in metres from false easting (-500km from central meridian).
 * @param  {number} northing - Northing in metres from equator (N) or from false northing -10,000km (S).
 * @param  {LatLonE.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @throws {Error}  Invalid UTM coordinate
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 */
function Utm(zone, hemisphere, easting, northing, datum) {
    // allow instantiation without 'new'
    if (!(this instanceof Utm)) return new Utm(zone, hemisphere, easting, northing, datum);

    if (typeof datum == 'undefined') datum = LatLonE.datum.WGS84; // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid UTM coordinate');
    if (!hemisphere.match(/[NS]/i)) throw new Error('Invalid UTM coordinate');
    if (!(120e3<=easting && easting<=880e3)) throw new Error('Invalid UTM coordinate'); // 40km overlap
    if (!(0<=northing && northing<=10000e3)) throw new Error('Invalid UTM coordinate');

    this.zone = Number(zone);
    this.hemisphere = hemisphere.toUpperCase();
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
}


/**
 * Converts latitude/longitude to UTM coordinate.
 *
 * Implements Karney’s method, using Krüger series to order n^6, giving results accurate to 5nm for
 * distances up to 3900km from the central meridian.
 *
 * @returns {Utm}   UTM coordinate.
 * @throws  {Error} If point not valid, if point outside latitude range.
 *
 * @example
 *   var latlong = new LatLonE(48.8582, 2.2945, LatLonE.datum.WGS84);
 *   var utmCoord = latlong.toUtm(); // utmCoord.toString(): '31 448251 5411932'
 */
LatLonE.prototype.toUtm = function() {
    if (isNaN(this.lat) || isNaN(this.lon)) throw new Error('Invalid point');
    if (this.lat > 84 || this.lat < -80) throw new Error('Outside UTM limits');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var zone = Math.floor((this.lon+180)/6) + 1; // longitudinal zone
    var λ0 = ((zone-1)*6 - 180 + 3).toRadians(); // longitude of central meridian

    // ---- handle Norway/Svalbard exceptions
    // grid zones are 8° tall; 0°N is offset 10 into latitude bands array
    var mgrsLatBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N
    var latBand = mgrsLatBands.charAt(Math.floor(this.lat/8+10));
    // adjust zone & central meridian for Norway
    if (zone==31 && latBand=='V' && this.lon>= 3) { zone++; λ0 += (6).toRadians(); }
    // adjust zone & central meridian for Svalbard
    if (zone==32 && latBand=='X' && this.lon<  9) { zone--; λ0 -= (6).toRadians(); }
    if (zone==32 && latBand=='X' && this.lon>= 9) { zone++; λ0 += (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon< 21) { zone--; λ0 -= (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon>=21) { zone++; λ0 += (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon< 33) { zone--; λ0 -= (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon>=33) { zone++; λ0 += (6).toRadians(); }

    var φ = this.lat.toRadians();      // latitude ± from equator
    var λ = this.lon.toRadians() - λ0; // longitude ± from central meridian

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;
    // WGS 84: a = 6378137, b = 6356752.314245, f = 1/298.257223563;

    var k0 = 0.9996; // UTM scale on the central meridian

    // ---- from Karney 2011 Eq 7-14, 29, 35:

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // third flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5; // TODO: compare Horner-form accuracy?

    var cosλ = Math.cos(λ), sinλ = Math.sin(λ);

    var τ = Math.tan(φ); // τ ≡ tanφ, τʹ ≡ tanφʹ; prime (ʹ) indicates angles on the conformal sphere
    var σ = Math.sinh(e*Math.atanh(e*τ/Math.sqrt(1+τ*τ)));

    var τʹ = τ*Math.sqrt(1+σ*σ) - σ*Math.sqrt(1+τ*τ);

    var ξʹ = Math.atan2(τʹ, cosλ);
    var ηʹ = Math.asinh(sinλ / Math.sqrt(τʹ*τʹ + cosλ*cosλ));

    var α1 = 1/2*n - 2/3*n2 + 5/16*n3 + 41/180*n4 - 127/288*n5 + 7891/37800*n6;
    var α2 = 13/48*n2 - 3/5*n3 + 557/1440*n4 + 281/630*n5 - 1983433/1935360*n6;
    var α3 = 61/240*n3 - 103/140*n4 + 15061/26880*n5 + 167603/181440*n6;
    var α4 = 49561/161280*n4 - 179/168*n5 + 6601661/7257600*n6;
    var α5 = 34729/80640*n5 - 3418889/1995840*n6;
    var α6 = 212378941/319334400*n6;

    var ξ = ξʹ
        + α1 * Math.sin( 2*ξʹ) * Math.cosh( 2*ηʹ)
        + α2 * Math.sin( 4*ξʹ) * Math.cosh( 4*ηʹ)
        + α3 * Math.sin( 6*ξʹ) * Math.cosh( 6*ηʹ)
        + α4 * Math.sin( 8*ξʹ) * Math.cosh( 8*ηʹ)
        + α5 * Math.sin(10*ξʹ) * Math.cosh(10*ηʹ)
        + α6 * Math.sin(12*ξʹ) * Math.cosh(12*ηʹ);

    var η = ηʹ
        + α1 * Math.cos( 2*ξʹ) * Math.sinh( 2*ηʹ)
        + α2 * Math.cos( 4*ξʹ) * Math.sinh( 4*ηʹ)
        + α3 * Math.cos( 6*ξʹ) * Math.sinh( 6*ηʹ)
        + α4 * Math.cos( 8*ξʹ) * Math.sinh( 8*ηʹ)
        + α5 * Math.cos(10*ξʹ) * Math.sinh(10*ηʹ)
        + α6 * Math.cos(12*ξʹ) * Math.sinh(12*ηʹ);

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var x = k0 * A * η;
    var y = k0 * A * ξ;

    // ------------

    // shift x/y to false origins
    x = x + falseEasting;             // make x relative to false easting
    if (y < 0) y = y + falseNorthing; // make y in southern hemisphere relative to false northing

    // round to nm precision
    x = Math.round(x*1e6)/1e6;
    y = Math.round(y*1e6)/1e6;

    var h = this.lat>=0 ? 'N' : 'S'; // hemisphere

    return new Utm(zone, h, x, y);
};


/**
 * Converts UTM zone/easting/northing coordinate to latitude/longitude
 *
 * @param   {Utm}     utmCoord - UTM coordinate to be converted to latitude/longitude.
 * @returns {LatLonE} Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var grid = new Utm(31, 'N', 448251.795, 5411932.678);
 *   var latlong = grid.toLatLon(); // latlong.toString(): 48°51′29.52″N, 002°17′40.20″E
 */
Utm.prototype.toLatLon = function() {
    var z = this.zone;
    var h = this.hemisphere;
    var x = this.easting;
    var y = this.northing;

    if (isNaN(z) || isNaN(x) || isNaN(y)) throw new Error('Invalid coordinate');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;
    // WGS 84:  a = 6378137, b = 6356752.314245, f = 1/298.257223563;

    var k0 = 0.9996; // UTM scale on the central meridian

    x = x - falseEasting;                // make x relative to central meridian
    if (h == 'S') y = y - falseNorthing; // make y -ve in southern hemisphere

    // ---- from Karney 2011 Eq 15-22, 36:

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // third flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5;

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var η = x / (k0*A);
    var ξ = y / (k0*A);

    var β1 = 1/2*n - 2/3*n2 + 37/96*n3 - 1/360*n4 - 81/512*n5 + 96199/604800*n6;
    var β2 = 1/48*n2 + 1/15*n3 - 437/1440*n4 + 46/105*n5 - 1118711/3870720*n6;
    var β3 = 17/480*n3 - 37/840*n4 - 209/4480*n5 + 5569/90720*n6;
    var β4 = 4397/161280*n4 - 11/501*n5 - 830251/7257600*n6;
    var β5 = 4583/161280*n5 - 108847/3991680*n6;
    var β6 = 20648693/638668800*n6;

    var ξʹ = ξ
        - β1 * Math.sin( 2*ξ) * Math.cosh( 2*η)
        - β2 * Math.sin( 4*ξ) * Math.cosh( 4*η)
        - β3 * Math.sin( 6*ξ) * Math.cosh( 6*η)
        - β4 * Math.sin( 8*ξ) * Math.cosh( 8*η)
        - β5 * Math.sin(10*ξ) * Math.cosh(10*η)
        - β6 * Math.sin(12*ξ) * Math.cosh(12*η);

    var ηʹ = η
        - β1 * Math.cos( 2*ξ) * Math.sinh( 2*η)
        - β2 * Math.cos( 4*ξ) * Math.sinh( 4*η)
        - β3 * Math.cos( 6*ξ) * Math.sinh( 6*η)
        - β4 * Math.cos( 8*ξ) * Math.sinh( 8*η)
        - β5 * Math.cos(10*ξ) * Math.sinh(10*η)
        - β6 * Math.cos(12*ξ) * Math.sinh(12*η);

    var sinhηʹ = Math.sinh(ηʹ);
    var cosξʹ = Math.cos(ξʹ);

    var τʹ = Math.sin(ξʹ) / Math.sqrt(sinhηʹ*sinhηʹ + cosξʹ*cosξʹ);

    var τi = τʹ;
    do {
        var σi = Math.sinh(e*Math.atanh(e*τi/Math.sqrt(1+τi*τi)));
        var τiʹ = τi * Math.sqrt(1+σi*σi) - σi * Math.sqrt(1+τi*τi);
        var δτi = (τʹ - τiʹ)/Math.sqrt(1+τiʹ*τiʹ)
            * (1 + (1-e*e)*τiʹ*τiʹ) / ((1-e*e)*Math.sqrt(1+τiʹ*τiʹ));
         τi += δτi;
    } while (Math.abs(δτi) > 1e-24); // using IEEE 754 δτi -> 0 (from 10^-18) after 5-8 iterations
    var τ = τi;

    var φ = Math.atan(τ);

    var λ = Math.atan2(sinhηʹ, cosξʹ);

    // ------------

    var λ0 = ((z-1)*6 - 180 + 3).toRadians(); // longitude of central meridian
    λ += λ0; // move λ from zonal to global coordinates

    // round to nm precision (1nm = 10^-11°)
    φ = Math.round((φ)*1e11)/1e11; // strictly should be 10^11⋅cosφ...
    λ = Math.round((λ)*1e11)/1e11;

    return new LatLonE(φ.toDegrees(), λ.toDegrees(), this.datum);
};


/**
 * Parses string representation of UTM coordinate.
 *
 * A UTM coordinate comprises (space-separated)
 *  - zone
 *  - hemisphere
 *  - easting
 *  - northing.
 *
 * @param   {string}   gridref - UTM grid reference (WGS 84).
 * @returns {Utm}
 * @throws  Error Invalid UTM coordinate
 *
 * @example
 *   var utmCoord = Utm.parse('31 N 448251 5411932');
 *   // utmCoord: {zone: 31, hemisphere: 'N', easting: 448251, northing: 5411932 }
 */
Utm.parse = function(utmCoord) {
    // match separate elements (separated by whitespace)
    utmCoord = utmCoord.trim().match(/\S+/g);

    if (utmCoord==null || utmCoord.length!=4) throw new Error('Invalid UTM coordinate');

    var z = utmCoord[0], h = utmCoord[1], e = utmCoord[2], n = utmCoord[3];

    return new Utm(z, h, e, n);
};


/**
 * Returns a string representation of a UTM coordinate.
 *
 * To distinguish from MGRS grid zone designators, a space is left between the zone and the
 * hemisphere.
 *
 * @param   {number} [digits=0] - Number of digits to appear after the decimal point (3 ≡ mm).
 * @returns {string} A string representation of the coordinate.
 */
Utm.prototype.toString = function(digits) {
    digits = (typeof digits == 'undefined') ? 0 : digits; // default if not supplied

    var z = this.zone;
    var h = this.hemisphere;
    var e = this.easting;
    var n = this.northing;
    if (isNaN(z) || !h.match(/[NS]/) || isNaN(e) || isNaN(n)) return '';

    return z+' '+h+' '+e.toFixed(digits)+' '+n.toFixed(digits);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Math object with hyperbolic sin function */
if (typeof Math.sinh == 'undefined') {
    Math.sinh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / 2;
    };
}

/** Extend Math object with hyperbolic cos function */
if (typeof Math.cosh == 'undefined') {
    Math.cosh = function(x) {
        return (Math.exp(x) + Math.exp(-x)) / 2;
    };
}

/** Extend Math object with hyperbolic asin function */
if (typeof Math.asinh == 'undefined') {
    Math.asinh = function(x) {
        return Math.log(x + Math.sqrt(1 + x*x));
    };
}

/** Extend Math object with hyperbolic atan function */
if (typeof Math.atanh == 'undefined') {
    Math.atanh = function(x) {
        return Math.log((1+x) / (1-x)) / 2;
    };
}


/** Extend String object with method to trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}


/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (typeof Number.prototype.pad == 'undefined') {
    Number.prototype.pad = function(w) {
        var n = this.toString();
        while (n.length < w) n = '0' + n;
        return n;
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Utm; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return Utm; }); // AMD
