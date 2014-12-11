
/* jshint node:true *//* global define */
'use strict';

var libs = ['geo', 'latlon', 'mgrs', 'osgridref', 'utm', 'vector3d'],
    geodesy = {};


libs.forEach(function libIterator (libName) {

  // add library to export Object
  geodesy[libName] = require('./' + libName);
});


module.exports = geodesy;
