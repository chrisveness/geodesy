/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  MGRS / UTM Conversion Functions                     (c) Chris Veness 2014-2015 / MIT Licence  */
/*                                                                                                */
/* Convert between Universal Transverse Mercator (UTM) coordinates and Military Grid Reference    */
/* System (MGRS/NATO) grid references                                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Utm = require('./utm.js'); // CommonJS (Node)
if (typeof module!='undefined' && module.exports) var LatLon = require('./latlon-ellipsoidal.js'); // CommonJS (Node)


/* qv www.fgdc.gov/standards/projects/FGDC-standards-projects/usng/fgdc_std_011_2001_usng.pdf p10 */


/**
 * Latitude bands C..X 8° each, covering 80°S to 84°N
 * @private
 */
Mgrs.latBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N


/**
 * 100km grid square column (‘e’) letters repeat every third zone
 * @private
 */
Mgrs.e100kLetters = [ 'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ' ];


/**
 * 100km grid square row (‘n’) letters repeat every other zone
 * @private
 */
Mgrs.n100kLetters = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];


/**
 * Creates an Mgrs grid reference object.
 *
 * @classdesc Convert MGRS grid references to/from UTM coordinates.
 *
 * @constructor
 * @param  {number} zone - 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} band - 8° latitudinal band (C..X covering 80°S..84°N).
 * @param  {string} e100k - First letter (E) of 100km grid square.
 * @param  {string} n100k - Second letter (N) of 100km grid square.
 * @param  {number} easting - Easting in metres within 100km grid square.
 * @param  {number} northing - Northing in metres within 100km grid square.
 * @param  {LatLon.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @throws {Error} Invalid MGRS grid reference
 *
 * @example
 *   var mgrsRef = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932); // 31U DQ 48251 11932
 */
function Mgrs(zone, band, e100k, n100k, easting, northing, datum) {
    // allow instantiation without 'new'
    if (!(this instanceof Mgrs)) return new Mgrs(zone, band, e100k, n100k, easting, northing, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid MGRS grid reference');
    if (band.length != 1) throw new Error('Invalid MGRS grid reference');
    if (Mgrs.latBands.indexOf(band) == -1) throw new Error('Invalid MGRS grid reference');
    if (e100k.length!=1 || n100k.length!=1) throw new Error('Invalid MGRS grid reference');

    this.zone = Number(zone);
    this.band = band;
    this.e100k = e100k;
    this.n100k = n100k;
    this.easting = Number(easting);
    this.northing = Number(northing);
}


/**
 * Converts UTM coordinate to MGRS reference.
 *
 * @returns {Mgrs}
 * @throws  {Error} Invalid coordinate
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 *   var mgrsRef = utmCoord.toMgrs(); // mgrsRef.toString() = '31U DQ 48251 11932'
 */
Utm.prototype.toMgrs = function() {
    if (isNaN(this.zone + this.easting + this.northing)) throw new Error('Invalid UTM coordinate');

    // MGRS zone is same as UTM zone
    var zone = this.zone;

    // convert UTM to lat/long to get latitude to determine band
    var latlong = this.toLatLonE();
    // grid zones are 8° tall, 0°N is 10th band
    var band = Mgrs.latBands.charAt(Math.floor(latlong.lat/8+10)); // latitude band

    // columns in zone 1 are A-H, zone 2 J-R, zone 3 S-Z, then repeating every 3rd zone
    var col = Math.floor(this.easting / 100000);
    var e100k = Mgrs.e100kLetters[(zone-1)%3].charAt(col-1); // TODO: why col-1?

    // rows in even zones are A-V, in odd zones are F-E
    var row = Math.floor(this.northing / 100000) % 20;
    var n100k = Mgrs.n100kLetters[(zone-1)%2].charAt(row);

    // truncate easting/northing to within 100km grid square
    var easting = this.easting % 100000;
    var northing = this.northing % 100000;

    // round to nm precision
    easting = Number(easting.toFixed(6));
    northing = Number(northing.toFixed(6));

    return new Mgrs(zone, band, e100k, n100k, easting, northing);
};


/**
 * Converts MGRS grid reference to UTM coordinate.
 *
 * @returns {Utm}
 *
 * @example
 *   var mgrsRef = Mgrs(31, 'U', 'D', 'Q', 448251, 11932);
 *   var utmCoord = mgrsRef.toUtm(); // utmCoord.toString() = '31 N 448251 5411932'
 */
Mgrs.prototype.toUtm = function() {
    var zone = this.zone;
    var band = this.band;
    var e100k = this.e100k;
    var n100k = this.n100k;
    var easting = this.easting;
    var northing = this.northing;

    var hemisphere = band>='N' ? 'N' : 'S';

    // get easting specified by e100k
    var col = Mgrs.e100kLetters[(zone-1)%3].indexOf(e100k) + 1; // TODO: why +1?
    var e100kNum = col * 100000; // e100k in metres

    // get northing specified by n100k
    var row = Mgrs.n100kLetters[(zone-1)%2].indexOf(n100k);
    var n100kNum = row * 100000; // n100k in metres

    // get latitude of (bottom of) band
    var latBand = (Mgrs.latBands.indexOf(band)-10)*8;

    // 100km grid square row letters repeat every 2,000km north; add enough 2,000km blocks to get
    // into required band
    var nBand = new LatLon(latBand, 0).toUtm().northing; // northing of bottom of band
    var n2M = 0; // northing of 2,000km block
    while (n2M + n100kNum + northing < nBand) n2M += 2000000;

    return new Utm(zone, hemisphere, e100kNum+easting, n2M+n100kNum+northing);
};


/**
 * Parses string representation of MGRS grid reference.
 *
 * An MGRS grid reference comprises (space-separated)
 *  - grid zone designator (GZD)
 *  - 100km grid square letter-pair
 *  - easting
 *  - northing.
 *
 * @param  {string} mgrsGridRef - String representation of MGRS grid reference.
 * @returns {Mgrs} Mgrs grid reference object.
 *
 * @example
 *   var mgrsRef = Mgrs.parse('31U DQ 48251 11932');
 *   var mgrsRef = Mgrs.parse('31UDQ4825111932');
 *   //  mgrsRef: { zone:31, band:'U', e100k:'D', n100k:'Q', easting:48251, northing:11932 }
 */
Mgrs.parse = function(mgrsGridRef) {
    mgrsGridRef = mgrsGridRef.trim();

    // check for military-style grid reference with no separators
    if (!mgrsGridRef.match(/\s/)) {
        var en = mgrsGridRef.slice(5); // get easting/northing following zone/band/100ksq
        en = en.slice(0, en.length/2)+' '+en.slice(-en.length/2); // separate easting/northing
        mgrsGridRef = mgrsGridRef.slice(0, 3)+' '+mgrsGridRef.slice(3, 5)+' '+en; // insert spaces
    }

    // match separate elements (separated by whitespace)
    mgrsGridRef = mgrsGridRef.match(/\S+/g);

    if (mgrsGridRef==null || mgrsGridRef.length!=4) throw new Error('Invalid MGRS grid reference');

    // split gzd into zone/band
    var gzd = mgrsGridRef[0];
    var zone = gzd.slice(0, 2);
    var band = gzd.slice(2, 3);

    // split 100km letter-pair into e/n
    var en100k = mgrsGridRef[1];
    var e100k = en100k.slice(0, 1);
    var n100k = en100k.slice(1, 2);

    var e = mgrsGridRef[2], n = mgrsGridRef[3];

    return new Mgrs(zone, band, e100k, n100k, e, n);
};


/**
 * Returns a string representation of an MGRS grid reference.
 *
 * To distinguish from civilian UTM coordinate representations, no space is included within the
 * zone/band grid zone designator.
 *
 * Components are separated by spaces: for a military-style unseparated string, use
 * Mgrs.toString().replace(/ /g, '');
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (eg 4 = km, 10 = m).
 * @returns {string} This grid reference in standard format.
 *
 * @example
 *   var mgrsStr = Mgrs(31, 'U', 'D', 'Q', 48251, 11932).toString(); // mgrsStr: '31U DQ 48251 11932'
 */
Mgrs.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);

    var zone = this.zone.pad(2); // ensure leading zero
    var band = this.band;

    var e100k = this.e100k;
    var n100k = this.n100k;

    // set required precision
    var easting = Math.floor(this.easting/Math.pow(10, 5-digits/2));
    var northing = Math.floor(this.northing/Math.pow(10, 5-digits/2));

    // ensure leading zeros
    easting = easting.pad(digits/2);
    northing = northing.pad(digits/2);

    return zone+band + ' ' + e100k+n100k + ' '  + easting + ' ' + northing;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Mgrs; // CommonJS (Node)
if (typeof define == 'function' && define.amd) define([], function() { return Mgrs; }); // AMD
