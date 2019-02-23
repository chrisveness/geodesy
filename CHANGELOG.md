# Changelog

## [Unreleased]

### Fixed

- LatLon object returned by Utm.toLatLon() was missing a .toUtm() method

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
