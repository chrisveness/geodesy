/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - dms                                        (c) Chris Veness 2014-2017  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var should = require('chai').should();  // BDD/TDD assertion library

var Dms = require('../npm.js').Dms;

var test = it; // just an alias

describe('dms', function() {

    describe('0°', function() {
        test('parse 0.0°',           function() { Dms.parseDMS('0.0°').should.equal(0); });
        test('output 000.0000°',     function() { Dms.toDMS(0, 'd').should.equal('000.0000°'); });
        test('parse 0°',             function() { Dms.parseDMS('0°').should.equal(0); });
        test('output 000°',          function() { Dms.toDMS(0, 'd', 0).should.equal('000°'); });
        test('parse 000 00 00 ',     function() { Dms.parseDMS('000 00 00 ').should.equal(0); });
        test('parse 000°00′00″',     function() { Dms.parseDMS('000°00′00″').should.equal(0); });
        test('output 000°00′00″',    function() { Dms.toDMS(0).should.equal('000°00′00″'); });
        test('parse 000°00′00.0″',   function() { Dms.parseDMS('000°00′00.0″').should.equal(0); });
        test('output 000°00′00.00″', function() { Dms.toDMS(0, 'dms', 2).should.equal('000°00′00.00″'); });
        test('parse num 0',          function() { Dms.parseDMS(0).should.equal(0); });
        test('output str 0',         function() { Dms.toDMS('0', 'dms', 2).should.equal('000°00′00.00″'); });
    });

    describe('parse variations', function() { // including whitespace, different d/m/s symbols (ordinal, ascii/typo quotes)
        var variations = [
            '45.76260',
            '45.76260 ',
            '45.76260°',
            '45°45.756′',
            '45° 45.756′',
            '45 45.756',
            '45°45′45.36″',
            '45º45\'45.36"',
            '45°45’45.36”',
            '45 45 45.36 ',
            '45° 45′ 45.36″',
            '45º 45\' 45.36"',
            '45° 45’ 45.36”',
        ];
        for (var v in variations) test('parse dms variations '+variations[v],     function() { Dms.parseDMS(variations[v]).should.equal(45.76260); });
        for (var v in variations) test('parse dms variations '+'-'+variations[v], function() { Dms.parseDMS('-'+variations[v]).should.equal(-45.76260); });
        for (var v in variations) test('parse dms variations '+variations[v]+'N', function() { Dms.parseDMS(variations[v]+'N').should.equal(45.76260); });
        for (var v in variations) test('parse dms variations '+variations[v]+'S', function() { Dms.parseDMS(variations[v]+'S').should.equal(-45.76260); });
        for (var v in variations) test('parse dms variations '+variations[v]+'E', function() { Dms.parseDMS(variations[v]+'E').should.equal(45.76260); });
        for (var v in variations) test('parse dms variations '+variations[v]+'W', function() { Dms.parseDMS(variations[v]+'W').should.equal(-45.76260); });
        test('parse dms variations '+' ws before+after ', function() { Dms.parseDMS(' 45°45′45.36″ ').should.equal(45.76260); });
    });

    describe('parse out-of-range', function() { // (these need to be normalised externally)
        test('parse 185',  function() { Dms.parseDMS('185').should.be.equal(185); });
        test('parse 365',  function() { Dms.parseDMS('365').should.be.equal(365); });
        test('parse -185', function() { Dms.parseDMS('-185').should.be.equal(-185); });
        test('parse -365', function() { Dms.parseDMS('-365').should.be.equal(-365); });
    });

    describe('output variations', function() {
        test('output dms ',         function() { Dms.toDMS(45.76260).should.equal('045°45′45″'); });
        test('output dms '+'d',     function() { Dms.toDMS(45.76260, 'd').should.equal('045.7626°'); });
        test('output dms '+'dm',    function() { Dms.toDMS(45.76260, 'dm').should.equal('045°45.76′'); });
        test('output dms '+'dms',   function() { Dms.toDMS(45.76260, 'dms').should.equal('045°45′45″'); });
        test('output dms '+'dm,6',  function() { Dms.toDMS(45.76260, 'd', 6).should.equal('045.762600°'); });
        test('output dms '+'dm,4',  function() { Dms.toDMS(45.76260, 'dm', 4).should.equal('045°45.7560′'); });
        test('output dms '+'dms,2', function() { Dms.toDMS(45.76260, 'dms', 2).should.equal('045°45′45.36″'); });
        test('output dms '+'xxx',   function() { Dms.toDMS(45.76260, 'xxx').should.equal('045°45′45″'); });
        test('output dms '+'xxx,6', function() { Dms.toDMS(45.76260, 'xxx', 6).should.equal('045.762600°'); }); // !!
    });

    describe('compass points', function() {
        test('1 -> N ',       function() { Dms.compassPoint(1).should.equal('N'); });
        test('0 -> N ',       function() { Dms.compassPoint(0).should.equal('N'); });
        test('-1 -> N ',      function() { Dms.compassPoint(-1).should.equal('N'); });
        test('359 -> N ',     function() { Dms.compassPoint(359).should.equal('N'); });
        test('24 -> NNE ',    function() { Dms.compassPoint(24).should.equal('NNE'); });
        test('24:1 -> N ',    function() { Dms.compassPoint(24, 1).should.equal('N'); });
        test('24:2 -> NE ',   function() { Dms.compassPoint(24, 2).should.equal('NE'); });
        test('24:3 -> NNE ',  function() { Dms.compassPoint(24, 3).should.equal('NNE'); });
        test('226 -> SW ',    function() { Dms.compassPoint(226).should.equal('SW'); });
        test('226:1 -> W ',   function() { Dms.compassPoint(226, 1).should.equal('W'); });
        test('226:2 -> SW ',  function() { Dms.compassPoint(226, 2).should.equal('SW'); });
        test('226:3 -> SW ',  function() { Dms.compassPoint(226, 3).should.equal('SW'); });
        test('237 -> WSW ',   function() { Dms.compassPoint(237).should.equal('WSW'); });
        test('237:1 -> W ',   function() { Dms.compassPoint(237, 1).should.equal('W'); });
        test('237:2 -> SW ',  function() { Dms.compassPoint(237, 2).should.equal('SW'); });
        test('237:3 -> WSW ', function() { Dms.compassPoint(237, 3).should.equal('WSW'); });
    });

    describe('misc', function() {
        test('toLat num',    function() { Dms.toLat(51.2, 'dms').should.equal('51°12′00″N'); });
        test('toLat str',    function() { Dms.toLat('51.2', 'dms').should.equal('51°12′00″N'); });
        test('toLat xxx',    function() { Dms.toLat('xxx', 'dms').should.equal('–'); });
        test('toLon num',    function() { Dms.toLon(0.33, 'dms').should.equal('000°19′48″E'); });
        test('toLon str',    function() { Dms.toLon('0.33', 'dms').should.equal('000°19′48″E'); });
        test('toLon xxx',    function() { Dms.toLon('xxx', 'dms').should.equal('–'); });
        test('toDMS rnd-up', function() { Dms.toDMS(51.19999999999999, 'd').should.equal('051.2000°'); });
        test('toDMS rnd-up', function() { Dms.toDMS(51.19999999999999, 'dm').should.equal('051°12.00′'); });
        test('toDMS rnd-up', function() { Dms.toDMS(51.19999999999999, 'dms').should.equal('051°12′00″'); });
        test('toBrng',       function() { Dms.toBrng(1).should.equal('001°00′00″'); });
    });

    describe('parse failures', function() {
        test('parse 0 0 0 0', function() { Dms.parseDMS('0 0 0 0').should.be.NaN; });
        test('parse xxx',     function() { Dms.parseDMS('xxx').should.be.NaN; });
        test('parse ""',      function() { Dms.parseDMS('').should.be.NaN; });
        test('parse null',    function() { Dms.parseDMS(null).should.be.NaN; });
        test('parse obj',     function() { Dms.parseDMS({ a: 1 }).should.be.NaN; });
        test('parse true',    function() { Dms.parseDMS(true).should.be.NaN; });
        test('parse false',   function() { Dms.parseDMS(false).should.be.NaN; });
    });

    describe('convert failures', function() {
        test('output 0 0 0 0', function() { should.equal(Dms.toDMS('0 0 0 0'), null); });
        test('output xxx',     function() { should.equal(Dms.toDMS('xxx', 'dms', 2), null); });
        test('output xxx',     function() { should.equal(Dms.toDMS('xxx'), null); });
        test('output ""',      function() { should.equal(Dms.toDMS(''), '000°00′00″'); }); // TODO: fix on next semver major
        test('output null',    function() { should.equal(Dms.toDMS(null), '000°00′00″'); }); // TODO: fix on next semver major
        test('output obj',     function() { should.equal(Dms.toDMS({ a: 1 }), null); });
        test('output true',    function() { should.equal(Dms.toDMS(true), '001°00′00″'); }); // TODO: fix on next semver major
        test('output false',   function() { should.equal(Dms.toDMS(false), '000°00′00″'); }); // TODO: fix on next semver major
        test('output ∞',       function() { should.equal(Dms.toDMS(1/0), 'ity°aN′NaN″'); }); // TODO: fix on next semver major
    });

});
