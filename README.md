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
