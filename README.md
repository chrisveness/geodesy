Geodesy functions
=================

[![Build Status](https://travis-ci.com/chrisveness/geodesy.svg?branch=master)](https://app.travis-ci.com/github/chrisveness/geodesy)
[![Coverage Status](https://coveralls.io/repos/github/chrisveness/geodesy/badge.svg)](https://coveralls.io/github/chrisveness/geodesy)
[![Documentation](https://img.shields.io/badge/docs-www.movable--type.co.uk%2Fscripts%2Fgeodesy--library.html-lightgrey.svg)](https://www.movable-type.co.uk/scripts/geodesy-library.html)

These libraries started life (a long time ago) as simple ‘latitude/longitude’ code fragments
covering distances and bearings, intended to help people who had little experience of geodesy, and
perhaps limited programming experience.

The intention was to have clear, simple illustrative code samples which could be adapted and re-used
in other projects (whether those be coded in JavaScript, Java, C++, Excel VBA, or anything else...).
With its untyped C-style syntax, JavaScript reads remarkably close to pseudo-code, exposing the
algorithms with a minimum of syntactic distractions

While still valid for that purpose, they have grown since then into considerable libraries, based
around:
- simpler **trig**-based functions (distance, bearing, etc) based on a **spherical earth** model
- more sophisticated **trig**-based functions (distance, bearing, etc) based on a
  more accurate **ellipsoidal earth** model
- **vector**-based functions mostly based on a **spherical** earth model, with some **ellipsoidal**
  functions

Complementing these are various mapping-related functions covering:
- UTM coordinates & MGRS grid references
- UK Ordnance Survey (OSGB) national grid references

And also functions for historical datum conversions (such as between NAD83, OSGB36, Irl1975, 
etc) and modern reference frame conversions (such as ITRF2014, ETRF2000, GDA94, etc), 
and conversions between geodetic (latitude/longitude) coordinates and geocentric cartesian (x/y/z) 
coordinates.

There are also supporting libraries:
- 3d vector manipulation functions (supporting cartesian (x/y/z) coordinates and n-vector geodesy)
- functions for conversion between decimal degrees and (sexagesimal) degrees/minutes/seconds

The spherical-earth model provides simple formulae covering most ‘everyday’ accuracy requirements;
the ellipsoidal-earth model provides more accurate formulae at the expense of complexity. The
vector-based functions provide an alternative approach to the trig-based functions, with some
overlapping functionality; which one to use may depend on availability of related functions or on
other considerations.

These functions are as language-agnostic as possible, avoiding excessive use of
JavaScript-specific language features which would not be recognised by users of other languages
(and which might be difficult to translate to other languages). I use Greek letters in variables
representing maths symbols conventionally presented as Greek letters: I value the great benefit in
legibility over the minor inconvenience in typing.

This version 2 of the library uses JavaScript ES classes and modules to organise the 
interdependencies; this makes the code both more immediately readable than previously, and also more 
accessible to non-JavaScript readers (always  bearing in mind JavaScript uses prototype-based 
classes rather than classical inheritance-based classes). For older browsers (or Node.js <8.0.0), 
[v1.1.3](https://github.com/chrisveness/geodesy/tree/v1.1.3) is ES5-based. Note that there are 
[breaking changes](https://www.movable-type.co.uk/scripts/geodesy-library-migrating-from-v1.html) 
in moving from version 1 to version 2. 

While some aspects of the library are quite complex to understand and use, basic usage is simple –
for instance:

- to find the distance between two points using a simple spherical earth model:

```javascript
import LatLon from 'geodesy/latlon-spherical.js';
const p1 = new LatLon(52.205, 0.119);
const p2 = new LatLon(48.857, 2.351);
const d = p1.distanceTo(p2); // 404.3×10³ m
```

- or to find the destination point for a given distance and initial bearing on an ellipsoidal model
  earth:

```javascript
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';
const p1 = new LatLon(-37.95103, 144.42487);
const dist = 54972.271;
const brng = 306.86816;
const p2 = p1.destinationPoint(dist, brng); // 37.6528°S, 143.9265°E
```

Full documentation is available at [www.movable-type.co.uk/scripts/geodesy-library.html](https://www.movable-type.co.uk/scripts/geodesy-library.html), 
and tests in the [browser](https://www.movable-type.co.uk/scripts/test/geodesy-test.html) as well as
[Travis CI](https://travis-ci.org/chrisveness/geodesy).

Usage
-----

While originally intended as illustrative code fragments, these functions can be used ‘as-is’;
either client-side in-browser, or with Node.js.

### Usage in browser

The library can be used in the browser by taking a local copy, or loading it from
    [jsDelivr](https://www.jsdelivr.com/package/npm/geodesy): for example,

```html
<!doctype html><title>geodesy example</title><meta charset="utf-8">
<script type="module">
    import LatLon from 'https://cdn.jsdelivr.net/npm/geodesy@2.4.0/latlon-spherical.min.js';

    const p1 = new LatLon(50.06632, -5.71475);
    const p2 = new LatLon(58.64402, -3.07009);

    const d = p1.distanceTo(p2);
    console.assert(d.toFixed(3) == '968874.704');

    const mid = p1.midpointTo(p2);
    console.assert(mid.toString('dms') == '54° 21′ 44″ N, 004° 31′ 51″ W');
</script>
```

### Usage in Node.js

The library can be loaded from [npm](https://www.npmjs.com/package/geodesy) to be used in a Node.js app 
(in Node.js v13.2.0+, or Node.js v12.0.0+ using --experimental-modules, or v8.0.0–v12.15.0<sup title="v12.16.0+ is not compatible with esm@3.2.25">*</sup>) using the [esm](https://www.npmjs.com/package/esm) package:

```shell
$ npm install geodesy
$ node
> const { default: LatLon } = await import('geodesy/latlon-spherical.js');
> const p1 = new LatLon(50.06632, -5.71475);
> const p2 = new LatLon(58.64402, -3.07009);
> const d = p1.distanceTo(p2);
> console.assert(d.toFixed(3) == '968874.704');
> const mid = p1.midpointTo(p2);
> console.assert(mid.toString('dms') == '54° 21′ 44″ N, 004° 31′ 51″ W');
```

To some extent, mixins can be used to add methods of a class to a different class, e.g.:

```javascript
import LatLon  from 'geodesy/latlon-nvector-ellipsoidal.js';
import LatLonV from 'geodesy/latlon-ellipsoidal-vincenty.js';

for (const method of Object.getOwnPropertyNames(LatLonV.prototype)) {
    LatLon.prototype[method] = LatLonV.prototype[method];
}

const d = new LatLon(51, 0).distanceTo(new LatLon(52, 1)); // vincenty
const δ = new LatLon(51, 0).deltaTo(new LatLon(52, 1));    // n-vector
```

More care is of course required if there are conflicting constructors or method names.

For TypeScript users, type definitions are available from DefinitelyTyped: [www.npmjs.com/package/@types/geodesy](https://www.npmjs.com/package/@types/geodesy).

### Other examples

Some examples of calculations possible with the libraries:

e.g. for geodesic distance on an ellipsoidal model earth using Vincenty’s algorithm:

```javascript
import LatLon from 'geodesy/latlon-ellipsoidal-vincenty.js';

const p1 = new LatLon(50.06632, -5.71475);
const p2 = new LatLon(58.64402, -3.07009);

const d = p1.distanceTo(p2);
console.assert(d.toFixed(3) == '969954.166');
```

e.g. for UTM conversions:

```javascript
import Utm from 'geodesy/utm.js';

const utm = Utm.parse('48 N 377298.745 1483034.794');
const latlon = utm.toLatLon();

console.assert(latlon.toString('dms', 2) == '13° 24′ 45.00″ N, 103° 52′ 00.00″ E');
console.assert(latlon.toUtm().toString() == '48 N 377298.745 1483034.794';
```

e.g. for MGRS/NATO map references:

```javascript
import Mgrs, { LatLon } from 'geodesy/mgrs.js';

const mgrs = Mgrs.parse('31U DQ 48251 11932');
const latlon = mgrs.toUtm().toLatLon();
console.assert(latlon.toString('dms', 2) == '48° 51′ 29.50″ N, 002° 17′ 40.16″ E');

const p = LatLon.parse('51°28′40.37″N, 000°00′05.29″W');
const ref = p.toUtm().toMgrs();
console.assert(ref.toString() == '30U YC 08215 07233');
```

e.g. for OS grid references:

```javascript
import OsGridRef, { LatLon } from 'geodesy/osgridref.js';

const gridref = new OsGridRef(651409.903, 313177.270);

const pWgs84 = gridref.toLatLon();
console.assert(pWgs84.toString('dms', 4) == '52° 39′ 28.7230″ N, 001° 42′ 57.7870″ E');

const pOsgb = gridref.toLatLon(LatLon.datums.OSGB36);
console.assert(pOsgb.toString('dms', 4) == '52° 39′ 27.2531″ N, 001° 43′ 04.5177″ E');
```

e.g. for testing if a point is enclosed within a polygon:

```javascript
import LatLon from 'geodesy/latlon-nvector-spherical.js';

const polygon = [ new LatLon(48,2), new LatLon(49,2), new LatLon(49,3), new LatLon(48,3) ];

const enclosed = new LatLon(48.9,2.4).isEnclosedBy(polygon);
console.assert(enclosed == true);
```

e.g. greater parsing & presentation control:

```javascript
import LatLon from 'geodesy/latlon-spherical.js';
Dms.separator = ' '; // full-space separator between degrees-minutes-seconds

const p1 = LatLon.parse({ lat: '50:03:59N', lng: '005:42:53W' });
const p2 = LatLon.parse('58°38′38″N, 003°04′12″W');

const mid = p1.midpointTo(p2);
console.assert(mid.toString('dms') == '54° 21′ 44″ N, 004° 31′ 50″ W');
```

e.g. datum conversions:

```javascript
import LatLon from 'geodesy/latlon-ellipsoidal-datum.js';

const pWgs84 = new LatLon(53.3444, -6.2577);

const pIrl1975 = pWgs84.convertDatum(LatLon.datums.Irl1975);
console.assert(pIrl1975.toString() == '53.3442° N, 006.2567° W');
```

(The format of the import statements will vary according to deployment).
