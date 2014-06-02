geodesy
=======

Libraries of geodesy functions implemented in JavaScript – intended to serve as examples or
starting-points for people wanting to develop geodesy applications (in JavaScript or other languages),
though they can also be used as-is.

latlon.js
---------

This is a library of geodesy functions for working with points and paths on (a spherical model of)
the earth’s surface, including (orthodromic) great-circle geodesics and (loxodromic) rhumb lines.
All calculations are done using spherical trigonometry.

The library includes the following functions:

- `distanceTo` destination point (using haversine formulation)
- `bearingTo` destination point
- `finalBearingTo` destination point
- `midpointTo` destination point
- `destinationPoint` following initial bearing for given distance
- `intersection` of two paths
- `rhumbDistanceTo` destination point
- `rhumbBearingTo` destination point
- `rhumbDestinationPoint` following given bearing for given distance
- `rhumbMidpointTo` destination point

Full details are available at www.movable-type.co.uk/scripts/latlong.html

latlon-vincenty.js
------------------

Vincenty’s formulae for ‘direct and inverse solutions of geodesics on the ellipsoid’;
these give distances and bearings on an ellipsoidal earth model accurate to within 0.5mm distance,
0.000015″ bearing.

The library includes the following wrapper functions:

- `distanceTo` destination point
- `initialBearingTo` destination point
- `finalBearingTo` destination point
- `destinationPoint` following initial bearing for given distance
- `finalBearingOn` initial bearing for given distance

The heaving lifting is done in two routines:

- `direct` (implementing the direct solution of geodesics on the ellipsoid)
- `inverse` (implementing the inverse solution of geodesics on the ellipsoid)

Full details are available at www.movable-type.co.uk/scripts/latlong-vincenty.html

latlon-ellipsoid.js
-------------------

Geodesy tools for an ellipsoidal earth model. 
The `LatLonE` object incorporates not just latitude & longitude coordinates,
but also the datum the lat/lon point is defined on,
along with functions for translating between different datums. 
Also included is the `GeoParams` object with ellipsoid parameters and datum transform parameters.

The library includes:

- ellipsoid parameters
- datum ellipsoid & Helmert transform parameters
- `convertDatum`
- `toCartesian` (ECEF 3-d vector)
- `toLatLon` (from ECEF 3-d vector)

More information at www.movable-type.co.uk/scripts/latlong-convert-coords.html

latlon-vectors.js
-----------------

This is a library of functions for working with points and paths on (a spherical model of) the
earth’s surface using a vector-based approach using ‘n-vectors’ (rather than the more common
spherical trigonometry; a vector-based approach makes most calculations much simpler, and easier to
follow, compared with trigonometric equivalents).

The library includes:

- `distanceTo` destination point
- `bearingTo` destination point
- `midpointTo` destination point
- `destinationPoint` following initial bearing for given distance
- `intersection` of two paths
- `crossTrackDistanceTo` great circle path
- `enclosedBy` polygon
- `meanOf` set of points

More information at www.movable-type.co.uk/scripts/latlong-vectors.html

geo.js
------

Tools for converting between numeric degrees and degrees / minutes / seconds.

The library includes the following functions:

- `parseDMS`: parse string representing degrees/minutes/seconds into numeric degrees
- `toLat`: convert decimal degrees to latitude
- `toLon`: convert decimal degrees to longitude
- `toBrng`: convert decimal degrees to bearing

Documentation
-------------

Documentation for all these methods is available at www.movable-type.co.uk/scripts/js/geodesy/docs.
