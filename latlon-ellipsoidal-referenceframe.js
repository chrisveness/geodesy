/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for conversions between reference frames             (c) Chris Veness 2016-2019  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-ellipsoidal-referenceframe          */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import LatLonEllipsoidal, { Cartesian, Dms } from './latlon-ellipsoidal.js';


/**
 * Modern geodetic reference frames: a latitude/longitude point defines a geographic location on or
 * above/below the earth’s surface, measured in degrees from the equator and the International
 * Reference Meridian and metres above the ellipsoid within a given terrestrial reference frame at a
 * given epoch.
 *
 * This module extends the core latlon-ellipsoidal module to include methods for converting between
 * different reference frames.
 *
 * This is scratching the surface of complexities involved in high precision geodesy, but may be of
 * interest and/or value to those with less demanding requirements.
 *
 * Note that ITRF solutions do not directly use an ellipsoid, but are specified by cartesian
 * coordinates; the GRS80 ellipsoid is recommended for transformations to geographical coordinates
 * (itrf.ensg.ign.fr).
 *
 * @module latlon-ellipsoidal-referenceframe
 */


/*
 * Sources:
 *
 * - Soler & Snay, “Transforming Positions and Velocities between the International Terrestrial Refer-
 *   ence Frame of 2000 and North American Datum of 1983”, Journal of Surveying Engineering May 2004;
 *   www.ngs.noaa.gov/CORS/Articles/SolerSnayASCE.pdf.
 *
 * - Dawson & Woods, “ITRF to GDA94 coordinate transformations”, Journal of Applied Geodesy 4 (2010);
 *   www.ga.gov.au/webtemp/image_cache/GA19050.pdf.
 */

/* eslint-disable key-spacing, indent */

/*
 * Ellipsoid parameters; exposed through static getter below.
 */
const ellipsoids = {
    WGS84: { a: 6378137, b: 6356752.314245, f: 1/298.257223563 },
    GRS80: { a: 6378137, b: 6356752.314140, f: 1/298.257222101 },
};

/*
 * Reference frames; exposed through static getter below.
 */
const referenceFrames = {
    ITRF2014:   { name: 'ITRF2014',   epoch: 2010.0, ellipsoid: ellipsoids.GRS80 },
    ITRF2008:   { name: 'ITRF2008',   epoch: 2005.0, ellipsoid: ellipsoids.GRS80 },
    ITRF2005:   { name: 'ITRF2005',   epoch: 2000.0, ellipsoid: ellipsoids.GRS80 },
    ITRF2000:   { name: 'ITRF2000',   epoch: 1997.0, ellipsoid: ellipsoids.GRS80 },
    ITRF93:     { name: 'ITRF93',     epoch: 1988.0, ellipsoid: ellipsoids.GRS80 },
    ITRF91:     { name: 'ITRF91',     epoch: 1988.0, ellipsoid: ellipsoids.GRS80 },
    WGS84g1762: { name: 'WGS84g1762', epoch: 2005.0, ellipsoid: ellipsoids.WGS84 },
    WGS84g1674: { name: 'WGS84g1674', epoch: 2005.0, ellipsoid: ellipsoids.WGS84 },
    WGS84g1150: { name: 'WGS84g1150', epoch: 2001.0, ellipsoid: ellipsoids.WGS84 },
    ETRF2000:   { name: 'ETRF2000',   epoch: 2005.0, ellipsoid: ellipsoids.GRS80 }, // ETRF2000(R08)
    NAD83:      { name: 'NAD83',      epoch: 1997.0, ellipsoid: ellipsoids.GRS80 }, // CORS96
    GDA94:      { name: 'GDA94',      epoch: 1994.0, ellipsoid: ellipsoids.GRS80 },
};

/*
 * Transform parameters; exposed through static getter below.
 */
import txParams from './latlon-ellipsoidal-referenceframe-txparams.js';


// freeze static properties
Object.keys(ellipsoids).forEach(e => Object.freeze(ellipsoids[e]));
Object.keys(referenceFrames).forEach(trf => Object.freeze(referenceFrames[trf]));
Object.keys(txParams).forEach(tx => { Object.freeze(txParams[tx]); Object.freeze(txParams[tx].params); Object.freeze(txParams[tx].rates); });

/* eslint-enable key-spacing, indent */


/* LatLon - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Latitude/longitude points on an ellipsoidal model earth, with ellipsoid parameters and methods
 * for converting between reference frames and to geocentric (ECEF) cartesian coordinates.
 *
 * @extends LatLonEllipsoidal
 */
class LatLonEllipsoidal_ReferenceFrame extends LatLonEllipsoidal {

    /**
     * Creates geodetic latitude/longitude point on an ellipsoidal model earth using using a
     * specified reference frame.
     *
     * Note that while the epoch defaults to the frame reference epoch, the accuracy of ITRF
     * realisations is meaningless without knowing the observation epoch.
     *
     * @param  {number} lat - Geodetic latitude in degrees.
     * @param  {number} lon - Geodetic longitude in degrees.
     * @param  {number} [height=0] - Height above ellipsoid in metres.
     * @param  {LatLon.referenceFrames} [referenceFrame=ITRF2014] - Reference frame this point is defined within.
     * @param  {number} [epoch=referenceFrame.epoch] - date of observation of coordinate (decimal year).
     *   defaults to reference epoch t₀ of reference frame.
     * @throws {TypeError} Unrecognised reference frame.
     *
     * @example
     *   import LatLon from '/js/geodesy/latlon-ellipsoidal-referenceframe.js';
     *   const p = new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2000);
     */
    constructor(lat, lon, height=0, referenceFrame=referenceFrames.ITRF2014, epoch=undefined) {
        if (!referenceFrame || referenceFrame.epoch==undefined) throw new TypeError('unrecognised reference frame');
        if (epoch != undefined && isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);

        super(lat, lon, height);

        this._referenceFrame = referenceFrame;
        if (epoch) this._epoch = Number(epoch);
    }


    /**
     * Reference frame this point is defined within.
     */
    get referenceFrame() {
        return this._referenceFrame;
    }


    /**
     * Point’s observed epoch.
     */
    get epoch() {
        return this._epoch || this.referenceFrame.epoch;
    }


    /**
     * Ellipsoid parameters; semi-major axis (a), semi-minor axis (b), and flattening (f).
     *
     * The only ellipsoids used in modern geodesy are WGS-84 and GRS-80 (while based on differing
     * defining parameters, the only effective difference is a 0.1mm variation in the minor axis b).
     *
     * @example
     *   const availableEllipsoids = Object.keys(LatLon.ellipsoids).join(); // WGS84,GRS80
     *   const a = LatLon.ellipsoids.Airy1830.a;                            // 6377563.396
     */
    static get ellipsoids() {
        return ellipsoids;
    }


    /**
     * Reference frames, with their base ellipsoids and reference epochs.
     *
     * @example
     *   const availableReferenceFrames = Object.keys(LatLon.referenceFrames).join(); // ITRF2014,ITRF2008, ...
     */
    static get referenceFrames() {
        return referenceFrames;
    }


    /**
     * 14-parameter Helmert transformation parameters between (dynamic) ITRS frames, and from ITRS
     * frames to (static) regional TRFs NAD83, ETRF2000, and GDA94.
     *
     * This is a limited set of transformations; e.g. ITRF frames prior to ITRF2000 are not included.
     * More transformations could be added on request.
     *
     * Many conversions are direct; for NAD83, successive ITRF transformations are chained back to
     * ITRF2000.
     */
    static get transformParameters() {
        return txParams;
    }


    /**
     * Parses a latitude/longitude point from a variety of formats.
     *
     * Latitude & longitude (in degrees) can be supplied as two separate parameters, as a single
     * comma-separated lat/lon string, or as a single object with { lat, lon } or GeoJSON properties.
     *
     * The latitude/longitude values may be numeric or strings; they may be signed decimal or
     * deg-min-sec (hexagesimal) suffixed by compass direction (NSEW); a variety of separators are
     * accepted. Examples -3.62, '3 37 12W', '3°37′12″W'.
     *
     * Thousands/decimal separators must be comma/dot; use Dms.fromLocale to convert locale-specific
     * thousands/decimal separators.
     *
     * @param   {number|string|Object}   lat|latlon - Geodetic Latitude (in degrees) or comma-separated lat/lon or lat/lon object.
     * @param   {number}                 [lon] - Longitude in degrees.
     * @param   {number}                 height - Height above ellipsoid in metres.
     * @param   {LatLon.referenceFrames} referenceFrame - Reference frame this point is defined within.
     * @param   {number} [epoch=referenceFrame.epoch] - date of observation of coordinate (decimal year).
     * @returns {LatLon} Latitude/longitude point on ellipsoidal model earth using given reference frame.
     * @throws {TypeError} Unrecognised reference frame.
     *
     * @example
     *   const p1 = LatLon.parse(51.47788, -0.00147, 17, LatLon.referenceFrames.ETRF2000);          // numeric pair
     *   const p2 = LatLon.parse('51°28′40″N, 000°00′05″W', 17, LatLon.referenceFrames.ETRF2000);   // dms string + height
     *   const p3 = LatLon.parse({ lat: 52.205, lon: 0.119 }, 17, LatLon.referenceFrames.ETRF2000); // { lat, lon } object numeric
     */
    static parse(...args) {
        if (args.length == 0) throw new TypeError('invalid (empty) point');

        let referenceFrame = null, epoch = null;

        if (!isNaN(args[1]) && typeof args[2] == 'object') { // latlon, height, referenceFrame, [epoch]
            [ referenceFrame ] = args.splice(2, 1);
            [ epoch ] = args.splice(2, 1);
        }

        if (!isNaN(args[2]) && typeof args[3] == 'object') { // lat, lon, height, referenceFrame, [epoch]
            [ referenceFrame ] = args.splice(3, 1);
            [ epoch ] = args.splice(3, 1);
        }

        if (!referenceFrame || referenceFrame.epoch==undefined) throw new TypeError('unrecognised reference frame');

        // args is now lat, lon, height or latlon, height as taken by LatLonEllipsoidal .parse()

        const point = super.parse(...args); // note super.parse() also invokes this.constructor()

        point._referenceFrame = referenceFrame;
        if (epoch) point._epoch = Number(epoch);

        return point;
    }


    /**
     * Converts ‘this’ lat/lon coordinate to new coordinate system.
     *
     * @param   {LatLon.referenceFrames} toReferenceFrame - Reference frame this coordinate is to be converted to.
     * @returns {LatLon} This point converted to new reference frame.
     * @throws  {Error}  Undefined reference frame, Transformation not available.
     *
     * @example
     *   const pEtrf = new LatLon(51.47788000, -0.00147000, 0, LatLon.referenceFrames.ITRF2000);
     *   const pItrf = pEtrf.convertReferenceFrame(LatLon.referenceFrames.ETRF2000); // 51.47787826°N, 000.00147125°W
     */
    convertReferenceFrame(toReferenceFrame) {
        if (!toReferenceFrame || toReferenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');

        const oldCartesian = this.toCartesian();                                   // convert geodetic to cartesian
        const newCartesian = oldCartesian.convertReferenceFrame(toReferenceFrame); // convert TRF
        const newLatLon = newCartesian.toLatLon();                                 // convert cartesian back to to geodetic

        return newLatLon;
    }


    /**
     * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
     * (x/y/z) coordinates, based on same reference frame.
     *
     * Shadow of LatLonEllipsoidal.toCartesian(), returning Cartesian augmented with
     * LatLonEllipsoidal_ReferenceFrame methods/properties.
     *
     * @returns {Cartesian} Cartesian point equivalent to lat/lon point, with x, y, z in metres from
     *   earth centre, augmented with reference frame conversion methods and properties.
     */
    toCartesian() {
        const cartesian = super.toCartesian();
        const cartesianReferenceFrame = new Cartesian_ReferenceFrame(cartesian.x, cartesian.y, cartesian.z, this.referenceFrame, this.epoch);
        return cartesianReferenceFrame;
    }


    /**
     * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
     * degrees+minutes+seconds.
     *
     * @param   {string} [format=d] - Format point as 'd', 'dm', 'dms'.
     * @param   {number} [dp=4|2|0] - Number of decimal places to use: default 4 for d, 2 for dm, 0 for dms.
     * @param   {number} [dpHeight=null] - Number of decimal places to use for height; default (null) is no height display.
     * @param   {boolean} [referenceFrame=false] - Whether to show reference frame point is defined on.
     * @returns {string} Comma-separated formatted latitude/longitude.
     *
     * @example
     *   new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2014).toString();             // 51.4778°N, 000.0015°W
     *   new LatLon(51.47788, -0.00147, 0, LatLon.referenceFrames.ITRF2014).toString('dms');        // 51°28′40″N, 000°00′05″W
     *   new LatLon(51.47788, -0.00147, 42, LatLon.referenceFrames.ITRF2014).toString('dms', 0, 0); // 51°28′40″N, 000°00′05″W +42m
     */
    toString(format='d', dp=undefined, dpHeight=null, referenceFrame=false) {
        const ll = super.toString(format, dp, dpHeight);

        const epochFmt = { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 20 };
        const epoch = this.referenceFrame && this.epoch != this.referenceFrame.epoch ? this.epoch.toLocaleString('en', epochFmt) : '';

        const trf = referenceFrame ? ` (${this.referenceFrame.name}${epoch?'@'+epoch:''})` : '';

        return ll + trf;
    }

}


/* Cartesian  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Augments Cartesian with reference frame and observation epoch the cooordinate is based on, and
 * methods to convert between reference frames (using Helmert 14-parameter transforms) and to
 * convert cartesian to geodetic latitude/longitude point.
 *
 * @extends Cartesian
 */
class Cartesian_ReferenceFrame extends Cartesian {

    /**
     * Creates cartesian coordinate representing ECEF (earth-centric earth-fixed) point, on a given
     * reference frame. The reference frame will identify the primary meridian (for the x-coordinate),
     * and is also useful in transforming to/from geodetic (lat/lon) coordinates.
     *
     * @param  {number} x - X coordinate in metres (=> 0°N,0°E).
     * @param  {number} y - Y coordinate in metres (=> 0°N,90°E).
     * @param  {number} z - Z coordinate in metres (=> 90°N).
     * @param  {LatLon.referenceFrames} [referenceFrame] - Reference frame this coordinate is defined within.
     * @param  {number} [epoch=referenceFrame.epoch] - date of observation of coordinate (decimal year).
     * @throws {TypeError} Unrecognised reference frame, Invalid epoch.
     *
     * @example
     *   import { Cartesian } from '/js/geodesy/latlon-ellipsoidal-referenceframe.js';
     *   const coord = new Cartesian(3980581.210, -111.159, 4966824.522);
     */
    constructor(x, y, z, referenceFrame=undefined, epoch=undefined) {
        if (referenceFrame!=undefined && referenceFrame.epoch==undefined) throw new TypeError('unrecognised reference frame');
        if (epoch!=undefined && isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);

        super(x, y, z);

        if (referenceFrame) this._referenceFrame = referenceFrame;
        if (epoch) this._epoch = epoch;
    }


    /**
     * Reference frame this point is defined within.
     */
    get referenceFrame() {
        return this._referenceFrame;
    }
    set referenceFrame(referenceFrame) {
        if (!referenceFrame || referenceFrame.epoch==undefined) throw new TypeError('unrecognised reference frame');
        this._referenceFrame = referenceFrame;
    }

    /**
     * Point’s observed epoch.
     */
    get epoch() {
        return this._epoch ? this._epoch : (this._referenceFrame ? this._referenceFrame.epoch : undefined);
    }
    set epoch(epoch) {
        if (isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);
        if (this._epoch != this._referenceFrame.epoch) this._epoch = Number(epoch);
    }


    /**
     * Converts ‘this’ (geocentric) cartesian (x/y/z) coordinate to (geodetic) latitude/longitude
     * point (based on the same reference frame).
     *
     * Shadow of Cartesian.toLatLon(), returning LatLon augmented with LatLonEllipsoidal_ReferenceFrame
     * methods convertReferenceFrame, toCartesian, etc.
     *
     * @returns {LatLon} Latitude/longitude point defined by cartesian coordinates, in given reference frame.
     * @throws  {Error} No reference frame defined.
     *
     * @example
     *   const c = new Cartesian(4027893.924, 307041.993, 4919474.294, LatLon.referenceFrames.ITRF2000);
     *   const p = c.toLatLon(); // 50.7978°N, 004.3592°E
     */
    toLatLon() {
        if (!this.referenceFrame) throw new Error('cartesian reference frame not defined');

        const latLon = super.toLatLon(this.referenceFrame.ellipsoid);
        const point = new LatLonEllipsoidal_ReferenceFrame(latLon.lat, latLon.lon, latLon.height, this.referenceFrame, this.epoch);
        return point;
    }


    /**
     * Converts ‘this’ cartesian coordinate to new reference frame using Helmert 14-parameter
     * transformation. The observation epoch is unchanged.
     *
     * Note that different conversions have different tolerences; refer to the literature if
     * tolerances are significant.
     *
     * @param   {LatLon.referenceFrames} toReferenceFrame - Reference frame this coordinate is to be converted to.
     * @returns {Cartesian} This point converted to new reference frame.
     * @throws  {Error} Undefined reference frame.
     *
     * @example
     *   const c = new Cartesian(3980574.247, -102.127, 4966830.065, LatLon.referenceFrames.ITRF2000);
     *   c.convertReferenceFrame(LatLon.referenceFrames.ETRF2000); // [3980574.395,-102.214,4966829.941](ETRF2000@1997.0)
     */
    convertReferenceFrame(toReferenceFrame) {
        if (!toReferenceFrame || toReferenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
        if (!this.referenceFrame) throw new TypeError('cartesian coordinate has no reference frame');

        if (this.referenceFrame.name == toReferenceFrame.name) return this; // no-op!

        const oldTrf = this.referenceFrame;
        const newTrf = toReferenceFrame;

        // WGS84(G730/G873/G1150) are coincident with ITRF at 10-centimetre level; WGS84(G1674) and
        // ITRF20014 / ITRF2008 ‘are likely to agree at the centimeter level’ (QPS)
        if (oldTrf.name.startsWith('ITRF') && newTrf.name.startsWith('WGS84')) return this;
        if (oldTrf.name.startsWith('WGS84') && newTrf.name.startsWith('ITRF')) return this;

        const oldC = this;
        let newC = null;

        // is requested transformation available in single step?
        const txFwd = txParams[oldTrf.name+'→'+newTrf.name];
        const txRev = txParams[newTrf.name+'→'+oldTrf.name];

        if (txFwd || txRev) {
            // yes, single step available (either forward or reverse)
            const tx = txFwd? txFwd : reverseTransform(txRev);
            const t = this.epoch || this.referenceFrame.epoch;
            const t0 = tx.epoch;//epoch || newTrf.epoch;
            newC = oldC.applyTransform(tx.params, tx.rates, t-t0); // ...apply transform...
        } else {
            // find intermediate transform common to old & new to chain though; this is pretty yucky,
            // but since with current transform params we can transform in no more than 2 steps, it works!
            // TODO: find cleaner method!
            const txAvailFromOld = Object.keys(txParams).filter(tx => tx.split('→')[0] == oldTrf.name).map(tx => tx.split('→')[1]);
            const txAvailToNew = Object.keys(txParams).filter(tx => tx.split('→')[1] == newTrf.name).map(tx => tx.split('→')[0]);
            const txIntermediateFwd = txAvailFromOld.filter(tx => txAvailToNew.includes(tx))[0];
            const txAvailFromNew = Object.keys(txParams).filter(tx => tx.split('→')[0] == newTrf.name).map(tx => tx.split('→')[1]);
            const txAvailToOld = Object.keys(txParams).filter(tx => tx.split('→')[1] == oldTrf.name).map(tx => tx.split('→')[0]);
            const txIntermediateRev = txAvailFromNew.filter(tx => txAvailToOld.includes(tx))[0];
            const txFwd1 = txParams[oldTrf.name+'→'+txIntermediateFwd];
            const txFwd2 = txParams[txIntermediateFwd+'→'+newTrf.name];
            const txRev1 = txParams[newTrf.name+'→'+txIntermediateRev];
            const txRev2 = txParams[txIntermediateRev+'→'+oldTrf.name];
            const tx1 = txIntermediateFwd ? txFwd1 : reverseTransform(txRev2);
            const tx2 = txIntermediateFwd ? txFwd2 : reverseTransform(txRev1);
            const t = this.epoch || this.referenceFrame.epoch;
            newC = oldC.applyTransform(tx1.params, tx1.rates, t-tx1.epoch); // ...apply transform 1...
            newC = newC.applyTransform(tx2.params, tx2.rates, t-tx2.epoch); // ...apply transform 2...
        }

        newC.referenceFrame = toReferenceFrame;
        newC.epoch = oldC.epoch;

        return newC;

        function reverseTransform(tx) {
            return { epoch: tx.epoch, params: tx.params.map(p => -p), rates: tx.rates.map(r => -r) };
        }
    }


    /**
     * Applies Helmert 14-parameter transformation to ‘this’ coordinate using supplied transform
     * parameters and annual rates of change, with the secular variation given by the difference
     * between the reference epoch t0 and the observation epoch tc.
     *
     * This is used in converting reference frames.
     *
     * See e.g. 3D Coordinate Transformations, Deakin, 1998.
     *
     * @private
     * @param   {number[]} params - Transform parameters tx, ty, tz, s, rx, ry, rz..
     * @param   {number[]} rates - Rate of change of transform parameters ṫx, ṫy, ṫz, ṡ, ṙx, ṙy, ṙz.
     * @param   {number}   δt - Period between reference and observed epochs, t − t₀.
     * @returns {Cartesian} Transformed point (without reference frame).
     */
    applyTransform(params, rates, δt)   {
        // this point
        const x1 = this.x, y1 = this.y, z1 = this.z;

        // base parameters
        const tx = params[0]/1000;                    // x-shift: normalise millimetres to metres
        const ty = params[1]/1000;                    // y-shift: normalise millimetres to metres
        const tz = params[2]/1000;                    // z-shift: normalise millimetres to metres
        const s  = params[3]/1e9;                     // scale: normalise parts-per-billion
        const rx = (params[4]/3600/1000).toRadians(); // x-rotation: normalise milliarcseconds to radians
        const ry = (params[5]/3600/1000).toRadians(); // y-rotation: normalise milliarcseconds to radians
        const rz = (params[6]/3600/1000).toRadians(); // z-rotation: normalise milliarcseconds to radians

        // rate parameters
        const ṫx = rates[0]/1000;                     // x-shift: normalise millimetres to metres
        const ṫy = rates[1]/1000;                     // y-shift: normalise millimetres to metres
        const ṫz = rates[2]/1000;                     // z-shift: normalise millimetres to metres
        const ṡ  = rates[3]/1e9;                      // scale: normalise parts-per-billion
        const ṙx = (rates[4]/3600/1000).toRadians();  // x-rotation: normalise milliarcseconds to radians
        const ṙy = (rates[5]/3600/1000).toRadians();  // y-rotation: normalise milliarcseconds to radians
        const ṙz = (rates[6]/3600/1000).toRadians();  // z-rotation: normalise milliarcseconds to radians

        // combined (normalised) parameters
        const T = { x: tx + ṫx*δt, y: ty + ṫy*δt, z: tz + ṫz*δt };
        const R = { x: rx + ṙx*δt, y: ry + ṙy*δt, z: rz + ṙz*δt };
        const S = 1 + s + ṡ*δt;

        // apply transform (shift, scale, rotate)
        const x2 = T.x + x1*S   - y1*R.z + z1*R.y;
        const y2 = T.y + x1*R.z + y1*S   - z1*R.x;
        const z2 = T.z - x1*R.y + y1*R.x + z1*S;

        return new Cartesian_ReferenceFrame(x2, y2, z2);
    }


    /**
     * Returns a string representation of ‘this’ cartesian point. TRF is shown if set, and
     * observation epoch if different from reference epoch.
     *
     * @param   {number} [dp=0] - Number of decimal places to use.
     * @returns {string} Comma-separated latitude/longitude.
     */
    toString(dp=0) {
        const { x, y, z } = this;
        const epochFmt = { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 20 };
        const epoch = this.referenceFrame && this.epoch != this.referenceFrame.epoch ? this.epoch.toLocaleString('en', epochFmt) : '';
        const trf = this.referenceFrame ? `(${this.referenceFrame.name}${epoch?'@'+epoch:''})` : '';
        return `[${x.toFixed(dp)},${y.toFixed(dp)},${z.toFixed(dp)}]${trf}`;
    }
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

export { LatLonEllipsoidal_ReferenceFrame as default, Cartesian_ReferenceFrame as Cartesian, Dms };
