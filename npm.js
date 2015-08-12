/* npm main module */
'use strict';
exports.LatLonSpherical   = require('./latlon-spherical.js');
exports.LatLonEllipsoidal = require('./latlon-ellipsoidal.js');
// merge vincenty methods into LatLonEllipsoidal
var V = require('./latlon-vincenty.js');
for (var prop in V) exports.LatLonEllipsoidal[prop] = V[prop];
exports.LatLonVectors     = require('./latlon-vectors.js');
exports.Vector3d          = require('./vector3d.js');
exports.Utm               = require('./utm.js');
exports.Mgrs              = require('./mgrs.js');
exports.OsGridRef         = require('./osgridref.js');
exports.Dms               = require('./dms.js');
