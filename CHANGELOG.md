# Changelog

## [2.2.1] - 2020-04-22

### Fixed

- Coerce textual lat/long to numeric in latlon-spherical
- Return crossTrackDistance / alongTrackDistance of 0 when 'this' point equals start point
- Round UTM to nm rather than (erroneous) μm
- Fix (rare) rounding error issue in intersection() [#71]
- Fix (edgecase) gross error in MGRS -> UTM conversion [#73]
- Return 0 rather than NaN for cross-track / along-track distance of coincident points [#76]
- Remove tests from published package

## [2.2.0] - 2019-07-08

### Fixed

- Fix vincenty inverse calculation for antipodal points
- Provide convertDatum() method on a LatLon obtained from Utm.toLatLon()

### Added

- Option to override UTM zone in LatLon.toUtm(), option to suppress UTM easting/northing checks
- ETRS89 datum (≡ WGS84 @ 1m level)

## [2.1.0] - 2019-06-03

### Added

- Latlon-ellipsoidal-datum.js:Cartesian_Datum.convertDatum()

### Deprecated

- datum parameter to latlon-ellipsoidal-datum.js:Cartesian_Datum.toLatLon()

## [2.0.1] - 2019-04-10

### Fixed

- Add missing n-vector spherical alongTrackDistanceTo() method
- Add missing .toUtm() method to LatLon object returned by Utm.toLatLon()
- Fix n-vector spherical isWithinExtent() for point in different hemisphere
- Fix vector3d angleTo() for case where plane normal n is in the plane
- Rationalise/harmonise exception messages

### Added

- README ‘docs’ badge with link to documentation

## [2.0.0] - 2019-02-14

### Changed

- Restructured to use ES modules, ES2015 syntax
- Separated n-vector functions into spherical / ellipsoidal
- General rationalisation of API

### Added

- Modern terrestrial reference frames (TRFs) to complement historical datums
- LatLon.parse() methods
- latlon.toString() numeric format ‘n’

### Breaking

- LatLon is now a class, so the new operator is no longer optional on the constructor
- latlon.bearingTo() is now latlon.initialBearingTo()
- latlon.toString() defaults to ‘d’ in place of ‘dms’
- LatLon.ellipse, LatLon.datum are now LatLon.ellipses, LatLon.datums
- Dms.parseDMS() is now simply Dms.parse()
- Dms.toDMS() is now Dms.toDms()
- Dms.defaultSeparator (between degree, minute, second values) defaults to ‘narrow no-break space’ in place of no space
