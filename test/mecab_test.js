'use strict';

const assert = require('assert');

const Mecab = require('../lib/mecab');

describe('Mecab', () => {
    const tests = [
        {argv: '本日は晴天なり', expected: ['本日', 'は', '晴天', 'なり']},
        {argv: '\r\n  本日は晴天なり  \r\n  \r\n', expected: ['本日', 'は', '晴天', 'なり']},
    ];

    tests.forEach(test => {
        it(`should return a valid array of words: "${test.argv}"`, () =>{
            Mecab.parse(test.argv, (res, err) => {
                assert.equals(res, test.expected);
            });
        });
    });
});
