/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy Test Harness - dms                                         (c) Chris Veness 2014-2021  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import Dms from '../dms.js';

if (typeof window == 'undefined') { // node
    const { default: chai } = await import('chai');
    global.should = chai.should();
}


describe('dms', function() {
    const test = it;    // just an alias
    Dms.separator = ''; // tests are easier without any DMS separator

    describe('0°', function() {
        test('parse 0.0°',           () => Dms.parse('0.0°').should.equal(0));
        test('output 000.0000°',     () => Dms.toDms(0).should.equal('000.0000°'));
        test('parse 0°',             () => Dms.parse('0°').should.equal(0));
        test('output 000°',          () => Dms.toDms(0, 'd', 0).should.equal('000°'));
        test('parse 000 00 00 ',     () => Dms.parse('000 00 00 ').should.equal(0));
        test('parse 000°00′00″',     () => Dms.parse('000°00′00″').should.equal(0));
        test('output 000°00′00″',    () => Dms.toDms(0, 'dms').should.equal('000°00′00″'));
        test('parse 000°00′00.0″',   () => Dms.parse('000°00′00.0″').should.equal(0));
        test('output 000°00′00.00″', () => Dms.toDms(0, 'dms', 2).should.equal('000°00′00.00″'));
        test('parse num 0',          () => Dms.parse(0).should.equal(0));
        test('output str 0',         () => Dms.toDms('0', 'dms', 2).should.equal('000°00′00.00″'));
    });

    describe('parse variations', function() { // including whitespace, different d/m/s symbols (ordinal, ascii/typo quotes)
        const variations = [
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
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]}’`,   () => Dms.parse(variations[v]).should.equal(45.76260));
        for (const v in variations) test(`parse dms variations v = ‘-${variations[v]}’`,  () => Dms.parse('-'+variations[v]).should.equal(-45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]}N'`,  () => Dms.parse(variations[v]+'N').should.equal(45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]}S'`,  () => Dms.parse(variations[v]+'S').should.equal(-45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]}E'`,  () => Dms.parse(variations[v]+'E').should.equal(45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]}W'`,  () => Dms.parse(variations[v]+'W').should.equal(-45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]} N'`, () => Dms.parse(variations[v]+' N').should.equal(45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]} S'`, () => Dms.parse(variations[v]+' S').should.equal(-45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]} E'`, () => Dms.parse(variations[v]+' E').should.equal(45.76260));
        for (const v in variations) test(`parse dms variations v = ‘${variations[v]} W'`, () => Dms.parse(variations[v]+' W').should.equal(-45.76260));
        test('parse dms variations '+' ws before+after', () => Dms.parse(' 45°45′45.36″ ').should.equal(45.76260));
    });

    describe('parse out-of-range (should be normalised externally)', function() {
        test('parse 185',  () => Dms.parse('185').should.be.equal(185));
        test('parse 365',  () => Dms.parse('365').should.be.equal(365));
        test('parse -185', () => Dms.parse('-185').should.be.equal(-185));
        test('parse -365', () => Dms.parse('-365').should.be.equal(-365));
    });

    describe('output variations', function() {
        test('output dms ',         () => Dms.toDms(9.1525).should.equal('009.1525°'));
        test('output dms '+'d',     () => Dms.toDms(9.1525, 'd').should.equal('009.1525°'));
        test('output dms '+'dm',    () => Dms.toDms(9.1525, 'dm').should.equal('009°09.15′'));
        test('output dms '+'dms',   () => Dms.toDms(9.1525, 'dms').should.equal('009°09′09″'));
        test('output dms '+'dm,6',  () => Dms.toDms(9.1525, 'd', 6).should.equal('009.152500°'));
        test('output dms '+'dm,4',  () => Dms.toDms(9.1525, 'dm', 4).should.equal('009°09.1500′'));
        test('output dms '+'dms,2', () => Dms.toDms(9.1525, 'dms', 2).should.equal('009°09′09.00″'));
        test('output dms '+'x',     () => Dms.toDms(9.1525, 'x').should.equal('009.1525°'));
        test('output dms '+'x,6',   () => Dms.toDms(9.1525, 'x', 6).should.equal('009.152500°')); // !!
    });

    describe('compass points', function() {
        test('1 -> N ',       () => Dms.compassPoint(1).should.equal('N'));
        test('0 -> N ',       () => Dms.compassPoint(0).should.equal('N'));
        test('-1 -> N ',      () => Dms.compassPoint(-1).should.equal('N'));
        test('359 -> N ',     () => Dms.compassPoint(359).should.equal('N'));
        test('24 -> NNE ',    () => Dms.compassPoint(24).should.equal('NNE'));
        test('24:1 -> N ',    () => Dms.compassPoint(24, 1).should.equal('N'));
        test('24:2 -> NE ',   () => Dms.compassPoint(24, 2).should.equal('NE'));
        test('24:3 -> NNE ',  () => Dms.compassPoint(24, 3).should.equal('NNE'));
        test('226 -> SW ',    () => Dms.compassPoint(226).should.equal('SW'));
        test('226:1 -> W ',   () => Dms.compassPoint(226, 1).should.equal('W'));
        test('226:2 -> SW ',  () => Dms.compassPoint(226, 2).should.equal('SW'));
        test('226:3 -> SW ',  () => Dms.compassPoint(226, 3).should.equal('SW'));
        test('237 -> WSW ',   () => Dms.compassPoint(237).should.equal('WSW'));
        test('237:1 -> W ',   () => Dms.compassPoint(237, 1).should.equal('W'));
        test('237:2 -> SW ',  () => Dms.compassPoint(237, 2).should.equal('SW'));
        test('237:3 -> WSW ', () => Dms.compassPoint(237, 3).should.equal('WSW'));
        test('bad precision', () => should.Throw(function() { Dms.compassPoint(0, 0); }, RangeError));
    });

    describe('misc', function() {
        test('toLat num',    () => Dms.toLat(51.2, 'dms').should.equal('51°12′00″N'));
        test('toLat rnd-up', () => Dms.toLat(51.19999999999999, 'dm').should.equal('51°12.00′N'));
        test('toLat rnd-up', () => Dms.toLat(51.19999999999999, 'dms').should.equal('51°12′00″N'));
        test('toLat str',    () => Dms.toLat('51.2', 'dms').should.equal('51°12′00″N'));
        test('toLat xxx',    () => Dms.toLat('xxx', 'dms').should.equal('–'));
        test('toLon num',    () => Dms.toLon(0.33, 'dms').should.equal('000°19′48″E'));
        test('toLon str',    () => Dms.toLon('0.33', 'dms').should.equal('000°19′48″E'));
        test('toLon xxx',    () => Dms.toLon('xxx', 'dms').should.equal('–'));
        test('toDMS rnd-up', () => Dms.toDms(51.99999999999999, 'd').should.equal('052.0000°'));
        test('toDMS rnd-up', () => Dms.toDms(51.99999999999999, 'dm').should.equal('052°00.00′'));
        test('toDMS rnd-up', () => Dms.toDms(51.99999999999999, 'dms').should.equal('052°00′00″'));
        test('toDMS rnd-up', () => Dms.toDms(51.19999999999999, 'd').should.equal('051.2000°'));
        test('toDMS rnd-up', () => Dms.toDms(51.19999999999999, 'dm').should.equal('051°12.00′'));
        test('toDMS rnd-up', () => Dms.toDms(51.19999999999999, 'dms').should.equal('051°12′00″'));
        test('toBrng num',   () => Dms.toBrng(1).should.equal('001.0000°'));
        test('toBrng str',   () => Dms.toBrng('1').should.equal('001.0000°'));
        test('toBrng xxx',   () => Dms.toBrng('xxx').should.equal('–'));
        test('toLocale',     () => Dms.toLocale('123,456.789').should.equal('123,456.789'));
        test('fromLocale',   () => Dms.fromLocale('51°28′40.12″N').should.equal('51°28′40.12″N'));
        test('fromLocale',   () => Dms.fromLocale('51°28′40.12″N, 000°00′05.31″W').should.equal('51°28′40.12″N, 000°00′05.31″W'));
    });

    describe('parse failures', function() {
        test('parse 0 0 0 0', () => Dms.parse('0 0 0 0').should.be.NaN);
        test('parse str',     () => Dms.parse('xxx').should.be.NaN);
        test('parse ""',      () => Dms.parse('').should.be.NaN);
        test('parse null',    () => Dms.parse(null).should.be.NaN);
        test('parse obj',     () => Dms.parse({ a: 1 }).should.be.NaN);
        test('parse true',    () => Dms.parse(true).should.be.NaN);
        test('parse false',   () => Dms.parse(false).should.be.NaN);
    });

    describe('convert failures', function() {
        test('output 0 0 0 0', () => should.equal(Dms.toDms('0 0 0 0'), null));
        test('output xxx',     () => should.equal(Dms.toDms('xxx', 'dms', 2), null));
        test('output xxx',     () => should.equal(Dms.toDms('xxx'), null));
        test('output ""',      () => should.equal(Dms.toDms(''), null));
        test('output " "',     () => should.equal(Dms.toDms(' '), null));
        test('output null',    () => should.equal(Dms.toDms(null), null));
        test('output obj',     () => should.equal(Dms.toDms({ a: 1 }), null));
        test('output true',    () => should.equal(Dms.toDms(true), null));
        test('output false',   () => should.equal(Dms.toDms(false), null));
        test('output ∞',       () => should.equal(Dms.toDms(1/0), null));
    });

    describe('wrap360', function() {
        /* eslint-disable space-in-parens */
        test('-450°', () => Dms.wrap360(-450).should.equal(270));
        test('-405°', () => Dms.wrap360(-405).should.equal(315));
        test('-360°', () => Dms.wrap360(-360).should.equal(  0));
        test('-315°', () => Dms.wrap360(-315).should.equal( 45));
        test('-270°', () => Dms.wrap360(-270).should.equal( 90));
        test('-225°', () => Dms.wrap360(-225).should.equal(135));
        test('-180°', () => Dms.wrap360(-180).should.equal(180));
        test('-135°', () => Dms.wrap360(-135).should.equal(225));
        test(' -90°', () => Dms.wrap360( -90).should.equal(270));
        test(' -45°', () => Dms.wrap360( -45).should.equal(315));
        test('   0°', () => Dms.wrap360(   0).should.equal(  0));
        test('  45°', () => Dms.wrap360(  45).should.equal( 45));
        test('  90°', () => Dms.wrap360(  90).should.equal( 90));
        test(' 135°', () => Dms.wrap360( 135).should.equal(135));
        test(' 180°', () => Dms.wrap360( 180).should.equal(180));
        test(' 225°', () => Dms.wrap360( 225).should.equal(225));
        test(' 270°', () => Dms.wrap360( 270).should.equal(270));
        test(' 315°', () => Dms.wrap360( 315).should.equal(315));
        test(' 360°', () => Dms.wrap360( 360).should.equal(  0));
        test(' 405°', () => Dms.wrap360( 405).should.equal( 45));
        test(' 450°', () => Dms.wrap360( 450).should.equal( 90));
    });

    describe('wrap180', function() {
        test('-450°', () => Dms.wrap180(-450).should.equal( -90));
        test('-405°', () => Dms.wrap180(-405).should.equal( -45));
        test('-360°', () => Dms.wrap180(-360).should.equal(   0));
        test('-315°', () => Dms.wrap180(-315).should.equal(  45));
        test('-270°', () => Dms.wrap180(-270).should.equal(  90));
        test('-225°', () => Dms.wrap180(-225).should.equal( 135));
        test('-180°', () => Dms.wrap180(-180).should.equal(-180));
        test('-135°', () => Dms.wrap180(-135).should.equal(-135));
        test(' -90°', () => Dms.wrap180( -90).should.equal( -90));
        test(' -45°', () => Dms.wrap180( -45).should.equal( -45));
        test('   0°', () => Dms.wrap180(   0).should.equal(   0));
        test('  45°', () => Dms.wrap180(  45).should.equal(  45));
        test('  90°', () => Dms.wrap180(  90).should.equal(  90));
        test(' 135°', () => Dms.wrap180( 135).should.equal( 135));
        test(' 180°', () => Dms.wrap180( 180).should.equal( 180));
        test(' 225°', () => Dms.wrap180( 225).should.equal(-135));
        test(' 270°', () => Dms.wrap180( 270).should.equal( -90));
        test(' 315°', () => Dms.wrap180( 315).should.equal( -45));
        test(' 360°', () => Dms.wrap180( 360).should.equal(   0));
        test(' 405°', () => Dms.wrap180( 405).should.equal(  45));
        test(' 450°', () => Dms.wrap180( 450).should.equal(  90));
    });

    describe('wrap90', function() {
        test('-450°', () => Dms.wrap90(-450).should.equal( -90));
        test('-405°', () => Dms.wrap90(-405).should.equal( -45));
        test('-360°', () => Dms.wrap90(-360).should.equal(   0));
        test('-315°', () => Dms.wrap90(-315).should.equal(  45));
        test('-270°', () => Dms.wrap90(-270).should.equal(  90));
        test('-225°', () => Dms.wrap90(-225).should.equal(  45));
        test('-180°', () => Dms.wrap90(-180).should.equal(   0));
        test('-135°', () => Dms.wrap90(-135).should.equal( -45));
        test(' -90°', () => Dms.wrap90( -90).should.equal( -90));
        test(' -45°', () => Dms.wrap90( -45).should.equal( -45));
        test('   0°', () => Dms.wrap90(   0).should.equal(   0));
        test('  45°', () => Dms.wrap90(  45).should.equal(  45));
        test('  90°', () => Dms.wrap90(  90).should.equal(  90));
        test(' 135°', () => Dms.wrap90( 135).should.equal(  45));
        test(' 180°', () => Dms.wrap90( 180).should.equal(   0));
        test(' 225°', () => Dms.wrap90( 225).should.equal( -45));
        test(' 270°', () => Dms.wrap90( 270).should.equal( -90));
        test(' 315°', () => Dms.wrap90( 315).should.equal( -45));
        test(' 360°', () => Dms.wrap90( 360).should.equal(   0));
        test(' 405°', () => Dms.wrap90( 405).should.equal(  45));
        test(' 450°', () => Dms.wrap90( 450).should.equal(  90));
    });

});
