/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* MGRS / UTM Conversion Functions                                    (c) Chris Veness 2014-2022  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-utm-mgrs.html                                           */
/* www.movable-type.co.uk/scripts/geodesy-library.html#mgrs                                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import Utm, { LatLon as LatLonEllipsoidal, Dms } from './utm.js';


/**
 * Military Grid Reference System (MGRS/NATO) grid references provides geocoordinate references
 * covering the entire globe, based on UTM projections.
 *
 * MGRS references comprise a grid zone designator, a 100km square identification, and an easting
 * and northing (in metres); e.g. ‘31U DQ 48251 11932’.
 *
 * Depending on requirements, some parts of the reference may be omitted (implied), and
 * eastings/northings may be given to varying resolution.
 *
 * qv www.fgdc.gov/standards/projects/FGDC-standards-projects/usng/fgdc_std_011_2001_usng.pdf
 *
 * @module mgrs
 */


/*
 * Latitude bands C..X 8° each, covering 80°S to 84°N
 */
const latBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N


/*
 * 100km grid square column (‘e’) letters repeat every third zone
 */
const e100kLetters = [ 'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ' ];


/*
 * 100km grid square row (‘n’) letters repeat every other zone
 */
const n100kLetters = [ 'ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE' ];


/* Mgrs - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Military Grid Reference System (MGRS/NATO) grid references, with methods to parse references, and
 * to convert to UTM coordinates.
 */
class Mgrs {

    /**
     * Creates an Mgrs grid reference object.
     *
     * @param  {number} zone - 6° longitudinal zone (1..60 covering 180°W..180°E).
     * @param  {string} band - 8° latitudinal band (C..X covering 80°S..84°N).
     * @param  {string} e100k - First letter (E) of 100km grid square.
     * @param  {string} n100k - Second letter (N) of 100km grid square.
     * @param  {number} easting - Easting in metres within 100km grid square.
     * @param  {number} northing - Northing in metres within 100km grid square.
     * @param  {LatLon.datums} [datum=WGS84] - Datum UTM coordinate is based on.
     * @throws {RangeError}  Invalid MGRS grid reference.
     *
     * @example
     *   import Mgrs from '/js/geodesy/mgrs.js';
     *   const mgrsRef = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932); // 31U DQ 48251 11932
     */
    constructor(zone, band, e100k, n100k, easting, northing, datum=LatLonEllipsoidal.datums.WGS84) {
        if (!(1<=zone && zone<=60)) throw new RangeError(`invalid MGRS zone ‘${zone}’`);
        if (zone != parseInt(zone)) throw new RangeError(`invalid MGRS zone ‘${zone}’`);
        const errors = []; // check & report all other possible errors rather than reporting one-by-one
        if (band.length!=1 || latBands.indexOf(band) == -1) errors.push(`invalid MGRS band ‘${band}’`);
        if (e100k.length!=1 || e100kLetters[(zone-1)%3].indexOf(e100k) == -1) errors.push(`invalid MGRS 100km grid square column ‘${e100k}’ for zone ${zone}`);
        if (n100k.length!=1 || n100kLetters[0].indexOf(n100k) == -1) errors.push(`invalid MGRS 100km grid square row ‘${n100k}’`);
        if (isNaN(Number(easting))) errors.push(`invalid MGRS easting ‘${easting}’`);
        if (isNaN(Number(northing))) errors.push(`invalid MGRS northing ‘${northing}’`);
        if (Number(easting) < 0 || Number(easting) > 99999) errors.push(`invalid MGRS easting ‘${easting}’`);
        if (Number(northing) < 0 || Number(northing) > 99999) errors.push(`invalid MGRS northing ‘${northing}’`);
        if (!datum || datum.ellipsoid==undefined) errors.push(`unrecognised datum ‘${datum}’`);
        if (errors.length > 0) throw new RangeError(errors.join(', '));

        this.zone = Number(zone);
        this.band = band;
        this.e100k = e100k;
        this.n100k = n100k;
        this.easting = Math.floor(easting);
        this.northing = Math.floor(northing);
        this.datum = datum;
    }


    /**
     * Converts MGRS grid reference to UTM coordinate.
     *
     * Grid references refer to squares rather than points (with the size of the square indicated
     * by the precision of the reference); this conversion will return the UTM coordinate of the SW
     * corner of the grid reference square.
     *
     * @returns {Utm} UTM coordinate of SW corner of this MGRS grid reference.
     *
     * @example
     *   const mgrsRef = Mgrs.parse('31U DQ 48251 11932');
     *   const utmCoord = mgrsRef.toUtm(); // 31 N 448251 5411932
     */
    toUtm() {
        const hemisphere = this.band>='N' ? 'N' : 'S';

        // get easting specified by e100k (note +1 because eastings start at 166e3 due to 500km false origin)
        const col = e100kLetters[(this.zone-1)%3].indexOf(this.e100k) + 1;
        const e100kNum = col * 100e3; // e100k in metres

        // get northing specified by n100k
        const row = n100kLetters[(this.zone-1)%2].indexOf(this.n100k);
        const n100kNum = row * 100e3; // n100k in metres

        // get latitude of (bottom of) band (10 bands above the equator, 8°latitude each)
        const latBand = (latBands.indexOf(this.band)-10)*8;

        // get southern-most northing of bottom of band, using floor() to extend to include entirety
        // of bottom-most 100km square - note in northern hemisphere, centre of zone will be furthest
        // south; in southern hemisphere extremity of zone will be furthest south, so use 3°E / 0°E
        const lon = this.band >= 'N' ? 3 : 0;
        const nBand = Math.floor(new LatLonEllipsoidal(latBand, lon).toUtm().northing/100e3)*100e3;

        // 100km grid square row letters repeat every 2,000km north; add enough 2,000km blocks to
        // get into required band
        let n2M = 0; // northing of 2,000km block
        while (n2M + n100kNum + this.northing < nBand) n2M += 2000e3;

        return new Utm_Mgrs(this.zone, hemisphere, e100kNum+this.easting, n2M+n100kNum+this.northing, this.datum);
    }


    /**
     * Parses string representation of MGRS grid reference.
     *
     * An MGRS grid reference comprises (space-separated)
     *  - grid zone designator (GZD)
     *  - 100km grid square letter-pair
     *  - easting
     *  - northing.
     *
     * @param   {string} mgrsGridRef - String representation of MGRS grid reference.
     * @returns {Mgrs}   Mgrs grid reference object.
     * @throws  {Error}  Invalid MGRS grid reference.
     *
     * @example
     *   const mgrsRef = Mgrs.parse('31U DQ 48251 11932');
     *   const mgrsRef = Mgrs.parse('31UDQ4825111932'); // military style no separators
     *   //  mgrsRef: { zone:31, band:'U', e100k:'D', n100k:'Q', easting:48251, northing:11932 }
     */
    static parse(mgrsGridRef) {
        if (!mgrsGridRef) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);

        // check for military-style grid reference with no separators
        if (!mgrsGridRef.trim().match(/\s/)) { // convert mgrsGridRef to standard space-separated format
            const ref = mgrsGridRef.match(/(\d\d?[A-Z])([A-Z]{2})([0-9]{2,10})/i);
            if (!ref) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);

            const [ , gzd, en100k, en ] = ref;  // split grid ref into gzd, en100k, en
            const [ easting, northing ] = [ en.slice(0, en.length/2), en.slice(-en.length/2) ];
            mgrsGridRef = `${gzd} ${en100k} ${easting} ${northing}`;
        }

        // match separate elements (separated by whitespace)
        const ref = mgrsGridRef.match(/\S+/g); // returns [ gzd, e100k, easting, northing ]
        if (ref==null || ref.length!=4) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);

        const [ gzd, en100k, e, n ] = ref;                     // split grid ref into gzd, en100k, e, n
        const [ , zone, band ] = gzd.match(/(\d\d?)([A-Z])/i); // split gzd into zone, band
        const [ e100k, n100k ] = en100k.split('');             // split 100km letter-pair into e, n

        // standardise to 10-digit refs - ie metres) (but only if < 10-digit refs, to allow decimals)
        const easting = e.length>=5 ?  e : e.padEnd(5, '0');
        const northing = n.length>=5 ?  n : n.padEnd(5, '0');

        return new Mgrs(zone, band, e100k, n100k, easting, northing);
    }


    /**
     * Returns a string representation of an MGRS grid reference.
     *
     * To distinguish from civilian UTM coordinate representations, no space is included within the
     * zone/band grid zone designator.
     *
     * Components are separated by spaces: for a military-style unseparated string, use
     *   Mgrs.toString().replace(/ /g, '');
     *
     * Note that MGRS grid references get truncated, not rounded (unlike UTM coordinates); grid
     * references indicate a bounding square, rather than a point, with the size of the square
     * indicated by the precision - a precision of 10 indicates a 1-metre square, a precision of 4
     * indicates a 1,000-metre square (hence 31U DQ 48 11 indicates a 1km square with SW corner at
     * 31 N 448000 5411000, which would include the 1m square 31U DQ 48251 11932).
     *
     * @param   {number}     [digits=10] - Precision of returned grid reference (eg 4 = km, 10 = m).
     * @returns {string}     This grid reference in standard format.
     * @throws  {RangeError} Invalid precision.
     *
     * @example
     *   const mgrsStr = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932).toString(); // 31U DQ 48251 11932
     */
    toString(digits=10) {
        if (![ 2, 4, 6, 8, 10 ].includes(Number(digits))) throw new RangeError(`invalid precision ‘${digits}’`);

        const { zone, band, e100k, n100k, easting, northing } = this;

        // truncate to required precision
        const eRounded = Math.floor(easting/Math.pow(10, 5-digits/2));
        const nRounded = Math.floor(northing/Math.pow(10, 5-digits/2));

        // ensure leading zeros
        const zPadded = zone.toString().padStart(2, '0');
        const ePadded = eRounded.toString().padStart(digits/2, '0');
        const nPadded = nRounded.toString().padStart(digits/2, '0');

        return `${zPadded}${band} ${e100k}${n100k} ${ePadded} ${nPadded}`;
    }
}


/* Utm_Mgrs - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Extends Utm with method to convert UTM coordinate to MGRS reference.
 *
 * @extends Utm
 */
class Utm_Mgrs extends Utm {

    /**
     * Converts UTM coordinate to MGRS reference.
     *
     * @returns {Mgrs}
     * @throws  {TypeError} Invalid UTM coordinate.
     *
     * @example
     *   const utmCoord = new Utm(31, 'N', 448251, 5411932);
     *   const mgrsRef = utmCoord.toMgrs(); // 31U DQ 48251 11932
     */
    toMgrs() {
        // MGRS zone is same as UTM zone
        const zone = this.zone;

        // convert UTM to lat/long to get latitude to determine band
        const latlong = this.toLatLon();
        // grid zones are 8° tall, 0°N is 10th band
        const band = latBands.charAt(Math.floor(latlong.lat.toFixed(12)/8+10)); // latitude band

        // columns in zone 1 are A-H, zone 2 J-R, zone 3 S-Z, then repeating every 3rd zone
        const col = Math.floor(this.easting / 100e3);
        // (note -1 because eastings start at 166e3 due to 500km false origin)
        const e100k = e100kLetters[(zone-1)%3].charAt(col-1);

        // rows in even zones are A-V, in odd zones are F-E
        const row = Math.floor(this.northing / 100e3) % 20;
        const n100k = n100kLetters[(zone-1)%2].charAt(row);

        // truncate easting/northing to within 100km grid square & round to 1-metre precision
        const easting = Math.floor(this.easting % 100e3);
        const northing = Math.floor(this.northing % 100e3);

        return new Mgrs(zone, band, e100k, n100k, easting, northing);
    }

}


/**
 * Extends LatLonEllipsoidal adding toMgrs() method to the Utm object returned by LatLon.toUtm().
 *
 * @extends LatLonEllipsoidal
 */
class Latlon_Utm_Mgrs extends LatLonEllipsoidal {

    /**
     * Converts latitude/longitude to UTM coordinate.
     *
     * Shadow of LatLon.toUtm, returning Utm augmented with toMgrs() method.
     *
     * @param   {number} [zoneOverride] - Use specified zone rather than zone within which point lies;
     *          note overriding the UTM zone has the potential to result in negative eastings, and
     *          perverse results within Norway/Svalbard exceptions (this is unlikely to be relevant
     *          for MGRS, but is needed as Mgrs passes through the Utm class).
     * @returns {Utm}   UTM coordinate.
     * @throws  {Error} If point not valid, if point outside latitude range.
     *
     * @example
     *   const latlong = new LatLon(48.8582, 2.2945);
     *   const utmCoord = latlong.toUtm(); // 31 N 448252 5411933
     */
    toUtm(zoneOverride=undefined) {
        const utm = super.toUtm(zoneOverride);
        return new Utm_Mgrs(utm.zone, utm.hemisphere, utm.easting, utm.northing, utm.datum, utm.convergence, utm.scale);
    }

}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { Mgrs as default, Utm_Mgrs as Utm, Latlon_Utm_Mgrs as LatLon, Dms };
