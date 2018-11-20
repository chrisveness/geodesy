/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Ordnance Survey Grid Reference functions                           (c) Chris Veness 2005-2018  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-gridref.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-osgridref.html                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var LatLon = require('./latlon-ellipsoidal.js'); // ≡ import LatLon from 'latlon-ellipsoidal.js'


/**
 * Convert OS grid references to/from OSGB latitude/longitude points.
 *
 * Formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is inferior
 * to Krüger as used by e.g. Karney 2011.
 *
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * Note OSGB grid references cover Great Britain only; Ireland and the Channel Islands have their
 * own references.
 *
 * Note that these formulae are based on ellipsoidal calculations, and according to the OS are
 * accurate to about 4–5 metres – for greater accuracy, a geoid-based transformation (OSTN15) must
 * be used.
 *
 * @module   osgridref
 * @requires latlon-ellipsoidal
 */

/*
 * Converted 2015 to work with WGS84 by default, OSGB36 as option;
 * www.ordnancesurvey.co.uk/blog/2014/12/confirmation-on-changes-to-latitude-and-longitude
 */


/**
 * Creates an OsGridRef object.
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing, projection) {
    // allow instantiation without 'new'
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    if (projection === undefined) projection = OsGridRef.projection.NationalGridGB;

    this.easting = Number(easting);
    this.northing = Number(northing);
    this.projection = projection;
}
/**
 * Projection parameters 
 * ellipsoid reference from LatLon
 * Scale factor on central meridian (F0)
 * True origin (φ0 and λ0) in degrees
 * Map coordinates of true origin (m) (E0 and N0)
*/
OsGridRef.projection = {
    NationalGridGB:     { ellipsoid: LatLon.ellipsoid.Airy1830,     datum: LatLon.datum.OSGB36,  F0: 0.9996012717,   φ0: 49,     λ0: -2,                 E0: 400000, N0: -100000  },
    IrishGrid:          { ellipsoid: LatLon.ellipsoid.AiryModified, datum: LatLon.datum.OSGB36,   F0: 1.000035,       φ0: 53.5,   λ0: -8,                 E0: 200000, N0:  250000  },
    ITM:                { ellipsoid: LatLon.ellipsoid.GRS80,        datum: LatLon.datum.WGS84,   F0: 0.99982,        φ0: 53.5,   λ0: -8,                 E0: 600000, N0:  750000  },
    NewJTM:             { ellipsoid: LatLon.ellipsoid.GRS80,        datum: LatLon.datum.WGS84,   F0: 0.99999,        φ0: 49.225, λ0: -2.135,             E0: 40000,  N0:  70000   },
    Guernsey_Grid:      { ellipsoid: LatLon.ellipsoid.GRS80,        datum: LatLon.datum.WGS84,   F0: 0.999997,       φ0: 49.5,   λ0: -2.416666666666667, E0: 47000,  N0:  50000   }
}
/*
Sources:
NationalGridGB, ITM from https://www.ordnancesurvey.co.uk/business-and-government/help-and-support/navigation-technology/os-net/formats-for-developers.html
NationalGridGB: http://spatialreference.org/ref/epsg/7405/html/
IrishGrid: http://spatialreference.org/ref/epsg/29903/html/
ITM: http://spatialreference.org/ref/epsg/2157/html/
NewJTM: http://spatialreference.org/ref/epsg/3109/html/
PROJCS["NewJTM",GEOGCS["GCS_ETRF_1989",DATUM["D_ETRF_1989",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",40000.0],PARAMETER["False_Northing",70000.0],PARAMETER["Central_Meridian",-2.135],PARAMETER["Scale_Factor",0.99999],PARAMETER["Latitude_Of_Origin",49.225],UNIT["Meter",1.0]]
Guernsey_Grid: http://spatialreference.org/ref/epsg/3108/html/
PROJCS["Guernsey_Grid",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",47000.0],PARAMETER["False_Northing",50000.0],PARAMETER["Central_Meridian",-2.416666666666667],PARAMETER["Scale_Factor",0.999997],PARAMETER["Latitude_Of_Origin",49.5],UNIT["Meter",1.0]]
*/

/**
 * Converts latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {LatLon}    point - latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 *
 * @example
 *   var p = new LatLon(52.65798, 1.71605);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 *   // for conversion of (historical) OSGB36 latitude/longitude point:
 *   var p = new LatLon(52.65757, 1.71791, LatLon.datum.OSGB36);
 */
OsGridRef.latLonToOsGrid = function(point, projection) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    if (projection == undefined) projection = OsGridRef.projection.NationalGridGB;
    // if necessary convert to local datum first
    if (point.datum != projection.datum) point = point.convertDatum(projection.datum);

    var φ = point.lat.toRadians();
    var λ = point.lon.toRadians();

    var a = projection.ellipsoid.a, b = projection.ellipsoid.b;  //  major & minor semi-axes
    var F0 = projection.F0;                          // NatGrid scale factor on central meridian
    var φ0 = (projection.φ0).toRadians(), λ0 = (projection.λ0).toRadians();  // true origin is in degrees
    var N0 = projection.N0, E0 = projection.E0;        // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
    var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
    var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
    var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
    var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    var cos3φ = cosφ*cosφ*cosφ;
    var cos5φ = cos3φ*cosφ*cosφ;
    var tan2φ = Math.tan(φ)*Math.tan(φ);
    var tan4φ = tan2φ*tan2φ;

    var I = M + N0;
    var II = (ν/2)*sinφ*cosφ;
    var III = (ν/24)*sinφ*cos3φ*(5-tan2φ+9*η2);
    var IIIA = (ν/720)*sinφ*cos5φ*(61-58*tan2φ+tan4φ);
    var IV = ν*cosφ;
    var V = (ν/6)*cos3φ*(ν/ρ-tan2φ);
    var VI = (ν/120) * cos5φ * (5 - 18*tan2φ + tan4φ + 14*η2 - 58*tan2φ*η2);

    var Δλ = λ-λ0;
    var Δλ2 = Δλ*Δλ, Δλ3 = Δλ2*Δλ, Δλ4 = Δλ3*Δλ, Δλ5 = Δλ4*Δλ, Δλ6 = Δλ5*Δλ;

    var N = I + II*Δλ2 + III*Δλ4 + IIIA*Δλ6;
    var E = E0 + IV*Δλ + V*Δλ3 + VI*Δλ5;

    N = Number(N.toFixed(3)); // round to mm precision
    E = Number(E.toFixed(3));

    return new OsGridRef(E, N, projection); // gets truncated to SW corner of 1m grid square
};


/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to latitude/longitude
 * (SW corner of grid square).
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {OsGridRef}    gridref - Grid ref E/N to be converted to lat/long (SW corner of grid square).
 * @param   {LatLon.datum} [datum=WGS84] - Datum to convert grid reference into.
 * @returns {LatLon}       Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var gridref = new OsGridRef(651409.903, 313177.270);
 *   var pWgs84 = OsGridRef.osGridToLatLon(gridref);                     // 52°39′28.723″N, 001°42′57.787″E
 *   // to obtain (historical) OSGB36 latitude/longitude point:
 *   var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36); // 52°39′27.253″N, 001°43′04.518″E
 */
OsGridRef.osGridToLatLon = function(gridref, datum) {
    if (!(gridref instanceof OsGridRef)) throw new TypeError('gridref is not OsGridRef object');
    if (datum === undefined) datum = LatLon.datum.WGS84;

    var E = gridref.easting;
    var N = gridref.northing;
    var projection = gridref.projection;

    var a = projection.ellipsoid.a, b = projection.ellipsoid.b;  //  major & minor semi-axes
    var F0 = projection.F0;                          // NatGrid scale factor on central meridian
    var φ0 = (projection.φ0).toRadians(), λ0 = (projection.λ0).toRadians();  // true origin is in degrees
    var N0 = projection.N0, E0 = projection.E0;        // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var φ=φ0, M=0;
    do {
        φ = (N-N0-M)/(a*F0) + φ;

        var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
        var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
        var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
        var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
        M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    } while (Math.abs(N-N0-M) >= 0.00001);  // ie until < 0.01mm

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var tanφ = Math.tan(φ);
    var tan2φ = tanφ*tanφ, tan4φ = tan2φ*tan2φ, tan6φ = tan4φ*tan2φ;
    var secφ = 1/cosφ;
    var ν3 = ν*ν*ν, ν5 = ν3*ν*ν, ν7 = ν5*ν*ν;
    var VII = tanφ/(2*ρ*ν);
    var VIII = tanφ/(24*ρ*ν3)*(5+3*tan2φ+η2-9*tan2φ*η2);
    var IX = tanφ/(720*ρ*ν5)*(61+90*tan2φ+45*tan4φ);
    var X = secφ/ν;
    var XI = secφ/(6*ν3)*(ν/ρ+2*tan2φ);
    var XII = secφ/(120*ν5)*(5+28*tan2φ+24*tan4φ);
    var XIIA = secφ/(5040*ν7)*(61+662*tan2φ+1320*tan4φ+720*tan6φ);

    var dE = (E-E0), dE2 = dE*dE, dE3 = dE2*dE, dE4 = dE2*dE2, dE5 = dE3*dE2, dE6 = dE4*dE2, dE7 = dE5*dE2;
    φ = φ - VII*dE2 + VIII*dE4 - IX*dE6;
    var λ = λ0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;

    var point =  new LatLon(φ.toDegrees(), λ.toDegrees(), projection.datum);
    if (datum != projection.datum) point = point.convertDatum(datum);

    return point;
};


/**
 * Parses grid reference to OsGridRef object.
 *
 * Accepts standard grid references (eg 'SU 387 148'), with or without whitespace separators, from
 * two-digit references up to 10-digit references (1m × 1m square), or fully numeric comma-separated
 * references in metres (eg '438700,114800').
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin (SW corner of
 *   supplied grid square).
 * @throws Error on Invalid grid reference.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function(gridref) {
    gridref = String(gridref).trim();

    // check for fully numeric comma-separated gridref format
    var match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return new OsGridRef(match[1], match[2]);

    // validate format
    match = gridref.match(/^[A-Z]{2}\s*[0-9]+\s*[0-9]+$/i);
    if (!match) throw new Error('Invalid grid reference');

    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e100km = ((l1-2)%5)*5 + (l2%5);
    var n100km = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);

    // skip grid letters to get numeric (easting/northing) part of ref
    var en = gridref.slice(2).trim().split(/\s+/);
    // if e/n not whitespace separated, split half way
    if (en.length == 1) en = [ en[0].slice(0, en[0].length/2), en[0].slice(en[0].length/2) ];

    // validation
    if (e100km<0 || e100km>6 || n100km<0 || n100km>12) throw new Error('Invalid grid reference');
    if (en.length != 2) throw new Error('Invalid grid reference');
    if (en[0].length != en[1].length) throw new Error('Invalid grid reference');

    // standardise to 10-digit refs (metres)
    en[0] = (en[0]+'00000').slice(0, 5);
    en[1] = (en[1]+'00000').slice(0, 5);

    var e = e100km + en[0];
    var n = n100km + en[1];

    return new OsGridRef(e, n);
};


/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (10 digits = metres);
 *   digits=0 will return grid reference in numeric format.
 * @returns {string} This grid reference in standard format.
 *
 * @example
 *   var ref = new OsGridRef(651409, 313177).toString(); // TG 51409 13177
 */
OsGridRef.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);
    if (isNaN(digits) || digits%2!=0 || digits>16) throw new RangeError('Invalid precision ‘'+digits+'’');

    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) throw new Error('Invalid grid reference');

    // use digits = 0 to return numeric format (in metres, allowing for decimals & for northing > 1e6)
    if (digits == 0) {
        var eInt = Math.floor(e), eDec = e - eInt;
        var nInt = Math.floor(n), nDec = n - nInt;
        var ePad = ('000000'+eInt).slice(-6) + (eDec>0 ? eDec.toFixed(3).slice(1) : '');
        var nPad = (nInt<1e6 ? ('000000'+nInt).slice(-6) : nInt) + (nDec>0 ? nDec.toFixed(3).slice(1) : '');
        return ePad + ',' + nPad;
    }

    // get the 100km-grid indices
    var e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>6 || n100k<0 || n100k>12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
    var l2 = (19-n100k)*5%25 + e100k%5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letterPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e%100000)/Math.pow(10, 5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10, 5-digits/2));

    // pad eastings & northings with leading zeros (just in case, allow up to 16-digit (mm) refs)
    e = ('00000000'+e).slice(-digits/2);
    n = ('00000000'+n).slice(-digits/2);

    return letterPair + ' ' + e + ' ' + n;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = OsGridRef; // ≡ export default OsGridRef
