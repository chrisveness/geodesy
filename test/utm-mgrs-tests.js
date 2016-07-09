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
    // http://geographiclib.sourceforge.net/cgi-bin/GeoConvert
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
    // forgiving parsing of 100km squares spanning bands
    test('MGRS->UTM 01P ≡ UTM 01Q',    function() { Mgrs.parse('01P ET 00000 68935').toUtm().toString().should.equal('01 N 500000 1768935'); });
    test('MGRS->UTM 01Q ≡ UTM 01P',    function() { Mgrs.parse('01Q ET 00000 68935').toUtm().toString().should.equal('01 N 500000 1768935'); });

    // https://www.ibm.com/developerworks/library/j-coordconvert/#listing7 (note UTM/MGRS confusion; UTM is rounded, MGRS is truncated; UPS not included)
    test('IBM #01 UTM->LL',            function() { Utm.parse('31 N 166021 0').toLatLonE().toString('d').should.equal('00.0000°N, 000.0000°W'); });
    test('IBM #02 UTM->LL',            function() { Utm.parse('30 N 808084 14385').toLatLonE().toString('d').should.equal('00.1300°N, 000.2324°W'); });
    test('IBM #03 UTM->LL',            function() { Utm.parse('34 S 683473 4942631').toLatLonE().toString('d').should.equal('45.6456°S, 023.3545°E'); });
    test('IBM #04 UTM->LL',            function() { Utm.parse('25 S 404859 8588690').toLatLonE().toString('d').should.equal('12.7650°S, 033.8765°W'); });
    test('IBM #09 UTM->LL',            function() { Utm.parse('08 N 453580 2594272').toLatLonE().toString('d').should.equal('23.4578°N, 135.4545°W'); });
    test('IBM #10 UTM->LL',            function() { Utm.parse('57 N 450793 8586116').toLatLonE().toString('d').should.equal('77.3450°N, 156.9876°E'); });
    test('IBM #01 LL->UTM',            function() { new LatLon(  0.0000,    0.0000).toUtm().toString().should.equal('31 N 166021 0'); });
    test('IBM #01 LL->MGRS',           function() { new LatLon(  0.0000,    0.0000).toUtm().toMgrs().toString().should.equal('31N AA 66021 00000'); });
    test('IBM #02 LL->UTM',            function() { new LatLon(  0.1300,   -0.2324).toUtm().toString().should.equal('30 N 808084 14386'); });
    test('IBM #02 LL->MGRS',           function() { new LatLon(  0.1300,   -0.2324).toUtm().toMgrs().toString().should.equal('30N ZF 08084 14385'); });
    test('IBM #03 LL->UTM',            function() { new LatLon(-45.6456,   23.3545).toUtm().toString().should.equal('34 S 683474 4942631'); });
    test('IBM #03 LL->MGRS',           function() { new LatLon(-45.6456,   23.3545).toUtm().toMgrs().toString().should.equal('34G FQ 83473 42631'); });
    test('IBM #04 LL->UTM',            function() { new LatLon(-12.7650,  -33.8765).toUtm().toString().should.equal('25 S 404859 8588691'); });
    test('IBM #04 LL->MGRS',           function() { new LatLon(-12.7650,  -33.8765).toUtm().toMgrs().toString().should.equal('25L DF 04859 88691'); });
    test('IBM #09 LL->UTM',            function() { new LatLon( 23.4578, -135.4545).toUtm().toString().should.equal('08 N 453580 2594273'); });
    test('IBM #09 LL->MGRS',           function() { new LatLon( 23.4578, -135.4545).toUtm().toMgrs().toString().should.equal('08Q ML 53580 94272'); });
    test('IBM #10 LL->UTM',            function() { new LatLon( 77.3450,  156.9876).toUtm().toString().should.equal('57 N 450794 8586116'); });
    test('IBM #10 LL->MGRS',           function() { new LatLon( 77.3450,  156.9876).toUtm().toMgrs().toString().should.equal('57X VF 50793 86116'); });

    // varying resolution
    test('MGRS 4-digit -> UTM',        function() { Mgrs.parse('12S TC 52 86').toUtm().toString().should.equal('12 N 252000 3786000'); });
    test('MGRS 10-digit -> UTM',       function() { Mgrs.parse('12S TC 52000 86000').toUtm().toString().should.equal('12 N 252000 3786000'); });
    test('MGRS 10-digit+decimals',     function() { Mgrs.parse('12S TC 52000.123 86000.123').toUtm().toString(3).should.equal('12 N 252000.123 3786000.123'); });
    test('MGRS truncate',              function() { Mgrs.parse('12S TC 52999.999 86999.999').toString(6).should.equal('12S TC 529 869'); });
    test('MGRS-UTM round',             function() { Mgrs.parse('12S TC 52999.999 86999.999').toUtm().toString().should.equal('12 N 253000 3787000'); });
});
