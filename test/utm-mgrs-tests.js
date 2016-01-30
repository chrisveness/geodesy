/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - utm/mgrs                                   (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai = require('chai');  // BDD/TDD assertion library

var LatLon = require('../npm.js').LatLonEllipsoidal;
var Utm    = require('../npm.js').Utm;
var Mgrs   = require('../npm.js').Mgrs;

chai.should();
var test = it; // just an alias

describe('utm/mgrs', function() {
    // http://www.rcn.montana.edu/resources/converter.aspx

    // latitude/longitude -> UTM
    test('LL->UTM 0,0',                function() { new LatLon( 0,  0).toUtm().toString(6).should.equal('31 N 166021.443081 0.000000'); });
    test('LL->UTM 1,1',                function() { new LatLon( 1,  1).toUtm().toString(6).should.equal('31 N 277438.263521 110597.972524'); });
    test('LL->UTM -1,-1',              function() { new LatLon(-1, -1).toUtm().toString(6).should.equal('30 S 722561.736479 9889402.027476'); });
    test('LL->UTM eiffel tower',       function() { new LatLon( 48.8583,   2.2945).toUtm().toString(3).should.equal('31 N 448251.898 5411943.794'); });
    test('LL->UTM sidney o/h',         function() { new LatLon(-33.857,  151.215 ).toUtm().toString(3).should.equal('56 S 334873.199 6252266.092'); });
    test('LL->UTM white house',        function() { new LatLon( 38.8977, -77.0365).toUtm().toString(3).should.equal('18 N 323394.296 4307395.634'); });
    test('LL->UTM rio christ',         function() { new LatLon(-22.9519, -43.2106).toUtm().toString(3).should.equal('23 S 683466.254 7460687.433'); });
    test('LL->UTM bergen',             function() { new LatLon( 60.39135,  5.3249).toUtm().toString(3).should.equal('32 N 297508.410 6700645.296'); });
    test('LL->UTM bergen convergence', function() { new LatLon( 60.39135,  5.3249).toUtm().convergence.should.equal(-3.196281440); });
    test('LL->UTM bergen scale',       function() { new LatLon( 60.39135,  5.3249).toUtm().scale.should.equal(    1.000102473211); });

    // UTM -> latitude/longitude
    test('UTM->LL 0,0',                function() { Utm.parse('31 N 166021.443081 0.000000').toLatLonE().toString().should.equal(new LatLon(0, 0).toString()); });
    test('UTM->LL 1,1',                function() { Utm.parse('31 N 277438.263521 110597.972524').toLatLonE().toString().should.equal(new LatLon( 1,  1).toString()); });
    test('UTM->LL -1,-1',              function() { Utm.parse('30 S 722561.736479 9889402.027476').toLatLonE().toString().should.equal(new LatLon(-1, -1).toString()); });
    test('UTM->LL eiffel tower',       function() { Utm.parse('31 N 448251.898 5411943.794').toLatLonE().toString().should.equal(new LatLon( 48.8583,   2.2945).toString()); });
    test('UTM->LL sidney o/h',         function() { Utm.parse('56 S 334873.199 6252266.092').toLatLonE().toString().should.equal(new LatLon(-33.857,  151.215 ).toString()); });
    test('UTM->LL white house',        function() { Utm.parse('18 N 323394.296 4307395.634').toLatLonE().toString().should.equal(new LatLon( 38.8977, -77.0365).toString()); });
    test('UTM->LL rio christ',         function() { Utm.parse('23 S 683466.254 7460687.433').toLatLonE().toString().should.equal(new LatLon(-22.9519, -43.2106).toString()); });
    test('UTM->LL bergen',             function() { Utm.parse('32 N 297508.410 6700645.296').toLatLonE().toString().should.equal(new LatLon( 60.39135,  5.3249).toString()); });
    test('UTM->LL bergen convergence', function() { Utm.parse('32 N 297508.410 6700645.296').toLatLonE().convergence.should.equal(-3.196281443); });
    test('UTM->LL bergen scale',       function() { Utm.parse('32 N 297508.410 6700645.296').toLatLonE().scale.should.equal(    1.000102473212); });

    // UTM -> MGRS
    test('UTM->MGRS 0,0',              function() { Utm.parse('31 N 166021.443081 0.000000').toMgrs().toString().should.equal('31N AA 66021 00000'); });
    test('UTM->MGRS 1,1',              function() { Utm.parse('31 N 277438.263521 110597.972524').toMgrs().toString().should.equal('31N BB 77438 10597'); });
    test('UTM->MGRS -1,-1',            function() { Utm.parse('30 S 722561.736479 9889402.027476').toMgrs().toString().should.equal('30M YD 22561 89402'); });
    test('UTM->MGRS eiffel tower',     function() { Utm.parse('31 N 448251.898 5411943.794').toMgrs().toString().should.equal('31U DQ 48251 11943'); });
    test('UTM->MGRS sidney o/h',       function() { Utm.parse('56 S 334873.199 6252266.092').toMgrs().toString().should.equal('56H LH 34873 52266'); });
    test('UTM->MGRS white house',      function() { Utm.parse('18 N 323394.296 4307395.634').toMgrs().toString().should.equal('18S UJ 23394 07395'); });
    test('UTM->MGRS rio christ',       function() { Utm.parse('23 S 683466.254 7460687.433').toMgrs().toString().should.equal('23K PQ 83466 60687'); });
    test('UTM->MGRS bergen',           function() { Utm.parse('32 N 297508.410 6700645.296').toMgrs().toString().should.equal('32V KN 97508 00645'); });

    // MGRS -> UTM
    test('MGRS->UTM 0,0',              function() { Mgrs.parse('31N AA 66021 00000').toUtm().toString().should.equal('31 N 166021 0'); });
    test('MGRS->UTM 1,1',              function() { Mgrs.parse('31N BB 77438 10597').toUtm().toString().should.equal('31 N 277438 110597'); });
    test('MGRS->UTM -1,-1',            function() { Mgrs.parse('30M YD 22561 89402').toUtm().toString().should.equal('30 S 722561 9889402'); });
    test('MGRS->UTM eiffel tower',     function() { Mgrs.parse('31U DQ 48251 11943').toUtm().toString().should.equal('31 N 448251 5411943'); });
    test('MGRS->UTM sidney o/h',       function() { Mgrs.parse('56H LH 34873 52266').toUtm().toString().should.equal('56 S 334873 6252266'); });
    test('MGRS->UTM white house',      function() { Mgrs.parse('18S UJ 23394 07395').toUtm().toString().should.equal('18 N 323394 4307395'); });
    test('MGRS->UTM rio christ',       function() { Mgrs.parse('23K PQ 83466 60687').toUtm().toString().should.equal('23 S 683466 7460687'); });
    test('MGRS->UTM bergen',           function() { Mgrs.parse('32V KN 97508 00645').toUtm().toString().should.equal('32 N 297508 6700645'); });

    // varying resolution
    test('MGRS 4-digit',         function() { Mgrs.parse('12S TC 52 86').toUtm().toString().should.equal('12 N 252000 3786000'); });
    test('MGRS 10-digit',         function() { Mgrs.parse('12S TC 52000 86000').toUtm().toString().should.equal('12 N 252000 3786000'); });
    test('MGRS 10-digit+decimals',         function() { Mgrs.parse('12S TC 52000.123 86000.123').toUtm().toString(3).should.equal('12 N 252000.123 3786000.123'); });

    /* http://www.ibm.com/developerworks/library/j-coordconvert/
     ( 0.0000    0.0000  )     "31 N 166021 0"
     ( 0.1300   -0.2324  )     "30 N 808084 14385"
     (-45.6456   23.3545 )     "34 G 683473 4942631"
     (-12.7650  -33.8765 )     "25 L 404859 8588690"
     (-80.5434  -170.6540)     "02 C 506346 1057742"
     ( 90.0000   177.0000)     "60 Z 500000 9997964"
     (-90.0000  -177.0000)     "01 A 500000 2035"
     ( 90.0000    3.0000 )     "31 Z 500000 9997964"
     ( 23.4578  -135.4545)     "08 Q 453580 2594272"
     ( 77.3450   156.9876)     "57 X 450793 8586116"
     (-89.3454  -48.9306 )     "22 A 502639 75072"
     */
});
