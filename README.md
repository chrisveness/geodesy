geodesy
=======

Libraries of geodesy functions implemented in JavaScript

latlon.js
---------

This is a library of geodesy functions for working with points and paths on (a spherical model of) the Earth’s surface, 
including (orthodromic) great-circle geodesics and (loxodromic) rhumb lines. 
All calculations are done using spherical trigonometry.

The library includes the following functions:
- distanceTo (using haversine formulation)
- bearingTo
- finalBearingTo
- midpointTo
- destinationPoint
- intersection (of two paths)
- rhumbDistanceTo
- rhumbBearingTo
- rhumbDestinationPoint
- rhumbMidpointTo

Full details are available at www.movable-type.co.uk/scripts/latlong.html

latlon-vincenty.js
------------------

Vincenty’s calculations for direct and inverse solutions of geodesics on the ellipsoid.

The library includes the following wrapper functions:
- distanceTo (destination point)
- initialBearingTo (destination point)
- finalBearingTo (destination point)
- destinationPoint (following initial bearing for given distance)
- finalBearingOn (initial bearing for given distance)

The heaving lifting is done in two routines:
- direct (implementing the direct solution of geodesics on the ellipsoid)
- inverse (implementing the inverse solution of geodesics on the ellipsoid)

Full details are available at www.movable-type.co.uk/scripts/latlong-vincenty.html

latlon-ellipsoid.js
-------------------

Geodesy tools for an ellipsoidal earth model. 
This includes the LatLonE object which incorporates not just the latitude & longitude coordinates, 
but also the datum the latitude/longitude point is defined in, 
along with functions for translating between different datums. 
It also includes the GeoParams object with ellipsoid parameters and datum transform parameters.

The library includes:
- ellipsoid parameters
- datum ellipsoid & Helmert transform parameters
- convertDatum
- toCartesian (ECEF 3-d vector)
- toLatLon (from ECEF 3-d vector)

More information at www.movable-type.co.uk/scripts/latlong-convert-coords.html

geo.js
------

Tools for manipulating geodetic latitude/longitude in degrees, minutes, seconds.

The library includes the following functions:
- parseDMS: parse string representing degrees/minutes/seconds into numeric degrees
- toLat: convert decimal degrees to latitude
- toLon: convert decimal degrees to longitude
- toBrng: convert decimal degrees to bearing
