Geodesy functions
=================

These libraries started life (a long time ago) as simple ‘latitude/longitude’ code fragments intended
to help people who had little experience of geodesy, and perhaps limited programming experience.

The intention was to have clear, simple illustrative code samples which could be adapted and re-used
in other projects (whether those be coded in JavaScript, Java, C++, Excel VBA, Fortran(!), or
anything else...). With its untyped C-style syntax, JavaScript reads remarkably close to pseudo-code,
exposing the algorithms with a minimum of syntactic distractions

While still valid for that purpose, they have grown since then into considerable libraries, based
around:
- simpler trigonometric functions (distance, bearing, etc) based on a spherical earth model
- more sophisticated trigonometric functions (distance, bearing, datum conversions, etc) based on a
  more accurate ellipsoidal earth model
- vector-based functions based (mostly) on a spherical earth model

Complementing these are various mapping-related functions covering:
- UTM coordinates & MGRS grid references
- UK Ordnance Survey grid references

There are also supporting libraries:
- 3d vector manipulation functions, also used for cartesian (x/y/z) coordinates
- functions for conversion between decimal degrees and degrees/minutes/seconds

The spherical-earth model provides simple formulae covering most ‘everyday’ accuracy requirements;
the ellipsoidal-earth model provides more accurate formulae at the expense of complexity; the
vector-based functions provide for an alternative (largely trig-free) approach.

The three core libraries (latlon-spherical.js, latlon-ellipsoidal.js, latlon-vectors.js) are mutually
exclusive: only one can be used at a time. The mapping-related libraries depend on the ellipsoidal
model.

These functions are as language-agnostic as possible, avoiding (as far as possible)
JavaScript-specific language features which would not be recognised by users of other languages
(and which might be difficult to translate to other languages). I use Greek letters in variables
representing maths symbols conventionally presented as Greek letters: I value the great benefit in
legibility over the minor inconvenience in typing.


*latlon-spherical.js*: latitude/longitude geodesy functions on a spherical earth model
--------------------------------------------------------------------------------------

Geodesy functions for working with points and paths (distances, bearings, destinations, etc) on a
spherical-model earth, including (orthodromic) great-circle geodesics and (loxodromic) rhumb lines.
All calculations are done using simple spherical trigonometric formulae.

* *Constructor*
    * `new LatLon(lat, lon)`
        - Create new latitude/longitude point on a spherical earth model
* *Methods*
    * `latlon.distanceTo(point[, radius])`
        - Distance to 2nd point (using haversine formula)
    * `latlon.bearingTo(point)`
        - (Initial) bearing to 2nd point
    * `latlon.finalBearingTo(point)`
        - Final bearing to 2nd point
    * `latlon.midpointTo(point)`
        - Midpoint to 2nd point
    * `intermediatePointTo(point, fraction)`
        - Point at given fraction towards 2nd point
    * `latlon.destinationPoint(distance, bearing[, radius])`
        - Destination point travelling given distance on given bearing
    * `LatLon.intersection(point1, bearing1, point2, bearing2)`
        - Intersection point of two paths defined by point and bearing
    * `LatLon.crossTrackDistanceTo(pathStart, pathEnd, radius)`
        - Distance to great circle defined by pathStart and pathEnd
    * `LatLon.maxLatitude(bearing)`
        - Maximum latitude reached travelling on given (initial) bearing
    * `LatLon.crossingParallels(point1, point2, latitude)`
        - Meridians at which great circle defined by point1 & point2 cross given latitude
    * `latlon.rhumbDistanceTo(point[, radius])`
        - Distance to point along rhumb line
    * `latlon.rhumbBearingTo(point)`
        - (Initial) bearing to point along rhumb line
    * `latlon.rhumbDestinationPoint(distance, bearing[, radius])`
        - Destination point travelling distance on bearing
    * `latlon.rhumbMidpointTo(point)`
        - Midpoint on rhumb line to 2nd point
    * `LatLon.areaOf(polygon[, radius])`
        - Area of polygon defined by array of vertex points
    * `latlon.equals(point)`
        - Equality of points
    * `latlon.toString([format[, decimals]])`
        - String representation of point, in deg/deg-min/deg-min-sec format to given decimal places

Full details are available at www.movable-type.co.uk/scripts/latlong.html.

*Notes: previously named simply latlon.js; radius moved from constructor to distance calculation
methods; distances previously in kilometres now default to metres, order of arguments to destination
point methods reversed.*


*latlon-ellipsoidal.js*: latitude/longitude geodesy functions on an ellipsoidal earth model
-------------------------------------------------------------------------------------------

Datum conversions etc on an ellipsoidal-model earth.

* *Constructor*
    * `new LatLon(lat, lon[, datum])`
        - Create new latitude/longitude point on an ellipsoidal earth model using given datum (default WGS84)
* *Properties*
    * `datum`
        - Associated ellipsoids, and Helmert transform parameters from WGS84, for various datums
    * `ellipsoid`
        - Ellipsoid parameters major axis (a), minor axis (b), and flattening (f) for various ellipsoids
* *Methods*
    * `latlon.convertDatum(datum)`
        - Convert point into new datum
    * `latlon.toCartesian()`
        - Convert point to cartesian Vector3d point
    * `vector3d.toLatLon([datum])`
        - Convert cartesian (Vector3d) point to (geodetic) latitude/longitude in given datum (default WGS84)
    * `latlon.toString([format[, decimals]])`
        - String representation of point, in d/dm/dms format to given decimal places

*Notes: `LatLonE` now simply `LatLon`.*

More information at www.movable-type.co.uk/scripts/latlong-convert-coords.html.


*latlon-vincenty.js*: distances & bearings on geodesics
-------------------------------------------------------

Direct and inverse solutions of geodesics on the ellipsoid using Vincenty formulae (accurate to
within 0.5mm distance, 0.000015″ bearing).

* *Methods*
    * `latlon.distanceTo(point)`
        - Distance to point (using Vincenty calculation)
    * `latlon.bearingTo(point)`
        - (Initial) bearing to point (using Vincenty calculation)
    * `latlon.finalBearingTo(point)`
        - Final bearing to point (using Vincenty calculation)
    * `latlon.destinationPoint(distance, bearing)`
        - Destination point travelling distance on bearing (using Vincenty calculation)
    * `latlon.finalBearingOn(distance, initialBearing)`
        - Final bearing having travelled along a geodesic given by initial bearing for given distance

Full details are available at www.movable-type.co.uk/scripts/latlong-vincenty.html.


*latlon-vectors.js*: latitude/longitude geodesy functions using vector calculations
-----------------------------------------------------------------------------------

Sometimes geodesy calculations can be easier using vectors rather than spherical trigonometry; this
provides some basic functions. The `toVector` and `toLatLon` functions are equally applicable to
a spherical model and an ellipsoidal model (using ‘n-vectors’); other functions are applicable
to a spherical earth model only.

* *Constructor*
    * `new LatLon(lat, lon)`
        - Create new latitude/longitude point on a spherical earth model of given radius (default 6371km)
* *Methods*
    * `latlon.toVector()`
        - Convert (spherical/geodetic) latitude/longitude point to vector
    * `vector3d.toLatLonS()`
        - Convert cartesian (Vector3d) coordinate to (spherical) latitude/longitude point
    * `latlon.greatCircle(bearing)`
        - Return vector representing great circle obtained by heading on given bearing from latlon point
    * `latlon.distanceTo(point[, radius])`
        - Distance to point
    * `latlon.bearingTo(point)`
        - (Initial) bearing to point
    * `latlon.midpointTo(point)`
        - Midpoint to point
    * `latlon.destinationPoint(distance, bearing[, radius])`
        - Destination point travelling distance on bearing
    * `latlon.intersection(path1start, path1brngEnd, path2start, path2brngEnd)`
        - Intersection of two paths defined by start+bearing or start+end
    * `latlon.crossTrackDistanceTo(pathStart, pathBrngEnd[, radius])`
        - Distance to great circle defined by start-point and end-point/bearing
    * `latlon.nearestPointOnSegment(point1, point2)`
        - Closest point on segment between two other points
    * `latlon.isBetween(point1, point2)`
        - Whether point is between two other points
    * `latlon.enclosedBy(points)`
        - Whether point is enclosed by polygon
    * `latlon.meanOf(points)`
        - Geographic mean of set of points
    * `latlon.equals(point)`
        - Whether points are equal
    * `latlon.toString([format[, decimals]])`
        - String representation of point, in d/dm/dms format to given decimal places

*Notes: `LatLonE` now simply `LatLon`; order of arguments to destination point method reversed.
More thought is required on which of these functions operate on spherical model, which on n-vector
(geodetic) ellipsoidal model, and which equally on either.*

More information at www.movable-type.co.uk/scripts/latlong-vectors.html.


*vector3d.js*: 3-d vector handling functions
--------------------------------------------

Generic 3-d vector functions, not tied to geodesy applications.

* *Constructor*
    * `new Vector3d(x, y, z)`
        - Create new 3-d vector
* *Methods*
    * `vector3d.plus(v)`
        - Add vector v
    * `vector3d.minus(v)`
        - Subtract vector v
    * `vector3d.times(x)`
        - Multiply vector by (scalar) x
    * `vector3d.dividedBy(x)`
        - Divide vector by (scalar) x
    * `vector3d.dot(v)`
        - Multiply vector by v using dot (scalar) product
    * `vector3d.cross(v)`
        - Multiply vector by v using cross (vector) product
    * `vector3d.negate()`
        - Negate vector to point in the opposite direction
    * `vector3d.length()`
        - Length (magnitude or norm) of vector
    * `vector3d.unit()`
        - Normalize a vector to its unit vector
    * `vector3d.angleTo(v, vSign)`
        - Angle to 2nd vector
    * `vector3d.rotateAround(axis, theta)`
        - Rotate vector around axis by given angle
    * `vector3d.toString(decimals)`
        - String representation of vector


*utm.js*: Universal Transverse Mercator / Latitude-Longitude conversions
------------------------------------------------------------------------

Conversions between UTM coordinates and latitude-longitude points using Karney’s calculations
(accurate to 5nm).

* *Constructor*
    * `new Utm(zone, hemisphere, easting, northing[, datum[, convergence, scale]])`
        - Create new UTM coordinate on given datum (default WGS84)
* *Methods*
    * `latlon.toUtm()`
        - Convert (geodetic) latitude/longitude point to UTM coordinate
    * `utm.toLatLonE()`
        - Convert UTM coordinate to latitude/longitude point
    * `Utm.parse([utmCoord])`
        - Parse string representation of UTM coordinate
    * `utm.toString([digits])`
        - String representation of UTM coordinate

More information at www.movable-type.co.uk/scripts/latlong-utm-mgrs.html.


*mgrs.js*: MGRS/NATO grid references
------------------------------------

Conversions between MGRS/NATO grid references and UTM coordinates.

* *Constructor*
    * `new Mgrs(zone, band, e100k, n100k, easting, northing[, datum])`
        - Create new MGRS grid reference on given datum (default WGS84)
* *Methods*
    * `Utm.toMgrs()`
        - Convert UTM coordinate to MGRS grid reference
    * `mgrs.toUtm()`
        - Convert MGRS grid reference to UTM coordinate
    * `Mgrs.parse(mgrsGridRef)`
        - Parse string representation of MGRS grid reference
    * `mgrs.toString([digits])`
        - String representation of MGRS grid reference

More information at www.movable-type.co.uk/scripts/latlong-utm-mgrs.html.


*osgridref.js*: UK Ordnance Survey grid references
--------------------------------------------------

Conversions between UK OS grid references and (OSGB36) latitude/longitude points (based on Ordnance
Survey formulae).

* *Constructor*
    * `new OsGridRef(easting, northing)`
        - Create new OS grid reference
* *Methods*
    * `OsGridRef.latLonToOsGrid(point)`
        - Convert UTM coordinate to MGRS grid reference
    * `OsGridRef.osGridToLatLon(gridref, datum)`
        - Convert OS grid reference to latitude/longitude
    * `OsGridRef.parse(gridref)`
        - Parse string representation of OS grid reference
    * `osGridRef.toString([digits])`
        - String representation of OS grid reference

More information at www.movable-type.co.uk/scripts/latlong-gridref.html.


*dms.js*: conversion routines for degrees, minutes, seconds
-----------------------------------------------------------

Conversions between decimal degrees and (sexagesimal) degrees-minutes-seconds (and compass points).

* *Methods*
    * `Dms.parseDMS(dmsStr)`
        - Parse string representing degrees/minutes/seconds into numeric degrees
    * `Dms.toDms(degrees[, format[, decimals]])`
        - Convert decimal degrees to deg/min/sec format
    * `Dms.toLat(degrees[, format[, decimals]])`
        - Convert numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S)
    * `Dms.toLon(degrees[, format[, decimals]])`
        - Convert numeric degrees to deg/min/sec longitude (2-digit degrees, suffixed with E/W)
    * `Dms.toBrng(degrees[, format[, decimals]])`
        - Convert numeric degrees to deg/min/sec as a bearing (0°..360°)
    * `Dms.compassPoint(bearing[, precision])`
        - Return compass point for supplied bearing to given precision (cardinal / intercardinal / secondary-intercardinal)

*Notes: renamed from `Geo` (geo.js)*


Documentation
-------------

Documentation for all these methods is available at www.movable-type.co.uk/scripts/js/geodesy/docs.


Usage
-----

While originally intended as illustrative code fragments, these functions can be used ‘as-is’,
either client-side in-browser or with Node.js.

### Usage in browser

The scripts can be used in the browser simply by including them within `<script>` tags. This involves
an appreciation of dependencies, the order of loading is significant. I believe browserify, bower, 
etc can use npm and/or github directly, but I have no experience of using front-end package managers.

eg for various calculations on a spherical model earth:

    <!doctype html><title>spherical</title><meta charset="utf-8">
    <script src="js/geodesy/latlon-spherical.js"></script>
    <script src="js/geodesy/dms.js"></script>
    <script>
        var p1 = new LatLon(50.06632, -5.71475);
        var p2 = new LatLon(58.64402, -3.07009);
        var d = p1.distanceTo(p2);
        console.assert(d.toFixed(3) == '968874.704');
        var mid = p1.midpointTo(p2);
        console.assert(mid.toString() == '54°21′44″N, 004°31′51″W');
    </script>

eg for geodesic distance using Vincenty’s algorithm:

    <!doctype html><title>vincenty</title><meta charset="utf-8">
    <script src="js/geodesy/vector3d.js"></script>
    <script src="js/geodesy/latlon-ellipsoidal.js"></script>
    <script src="js/geodesy/latlon-vincenty.js"></script>
    <script src="js/geodesy/dms.js"></script>
    <script>
        var p1 = new LatLon(50.06632, -5.71475);
        var p2 = new LatLon(58.64402, -3.07009);
        var d = p1.distanceTo(p2);
        console.assert(d.toFixed(3) == '969954.166');
    </script>

eg for UTM conversions:

    <!doctype html><title>utm</title><meta charset="utf-8">
    <script src="js/geodesy/vector3d.js"></script>
    <script src="js/geodesy/latlon-ellipsoidal.js"></script>
    <script src="js/geodesy/utm.js"></script>
    <script src="js/geodesy/dms.js"></script>
    <script>
        var utm = Utm.parse('48 N 377298.745 1483034.794');
        var latlon = utm.toLatLonE();
        console.assert(latlon.toString('dms', 2) == '13°24′45.00″N, 103°52′00.00″E');
    </script>

eg for OS grid references:

    <!doctype html><title>osgridref</title><meta charset="utf-8">
    <script src="js/geodesy/vector3d.js"></script>
    <script src="js/geodesy/latlon-ellipsoidal.js"></script>
    <script src="js/geodesy/osgridref.js"></script>
    <script src="js/geodesy/dms.js"></script>
    <script>
        var gridref = new OsGridRef(651409.903, 313177.270);
    
        var pWgs84 = OsGridRef.osGridToLatLon(gridref);
        console.assert(pWgs84.toString('dms', 4) == '52°39′28.7230″N, 001°42′57.7870″E');
    
        var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
        console.assert(pOsgb.toString('dms', 4) == '52°39′27.2531″N, 001°43′04.5177″E');
    </script>

### Usage in Node.js

I’ve also made a packaged-up npm package available:

    npm install geodesy

eg for various calculations on a spherical model earth:

    var LatLon = require('geodesy').LatLonSpherical;

    var p1 = new LatLon(50.06632, -5.71475);
    var p2 = new LatLon(58.64402, -3.07009);
    var d = p1.distanceTo(p2);
    console.assert(d.toFixed(3) == '968874.704');
    var mid = p1.midpointTo(p2);
    console.assert(mid.toString() == '54°21′44″N, 004°31′51″W');

eg for geodesic distance:

    var LatLon = require('geodesy').LatLonEllipsoidal;

    var p1 = new LatLon(50.06632, -5.71475);
    var p2 = new LatLon(58.64402, -3.07009);
    var d = p1.distanceTo(p2);
    console.assert(d.toFixed(3) == '969954.166');

eg for UTM conversions:

    var LatLon = require('geodesy').LatLonEllipsoidal;
    var Utm    = require('geodesy').Utm;
    var Dms    = require('geodesy').Dms;

    var utm = Utm.parse('48 N 377298.745 1483034.794');
    var latlon = utm.toLatLonE();
    console.assert(latlon.toString('dms', 2) == '13°24′45.00″N, 103°52′00.00″E');

eg for OS grid references:

    var OsGridRef = require('geodesy').OsGridRef;

    var gridref = new OsGridRef(651409.903, 313177.270);
    
    var pWgs84 = OsGridRef.osGridToLatLon(gridref);
    console.assert(pWgs84.toString('dms', 4) == '52°39′28.7230″N, 001°42′57.7870″E');

    var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36);
    console.assert(pOsgb.toString('dms', 4) == '52°39′27.2531″N, 001°43′04.5177″E');
