'use strict';

module.exports = {
    trim(str) {
        return str
            .replace(/^(\r?\n)+/, '')
            .replace(/^\s+/, '')
            .replace(/(\r?\n)+$/, '')
            .replace(/\s+$/, '');
    },

    trimLeft(str) {
        return str
            .replace(/^(\r?\n)+/, '')
            .replace(/^\s+/, '');
    },

    trimRight(str) {
        return str
            .replace(/(\r?\n)+$/, '')
            .replace(/\s+$/, '');
    },

    encode(str) {
        return str
            .replace(/\\/g, '\\\\')
            .replace(/\$/g, '\\u0024')
            .replace(/\./g, '\\u002e');
    },

    decode(str) {
        return str
            .replace(/\\u002e/g, '.')
            .replace(/\\u0024/g, '$')
            .replace(/\\\\/g, '\\');
    },

    fillZero(num, length) {
        return (new Array(length).join('0') + num).slice(-length);
    },

    choose(counts) {
        var sum = counts.reduce((memo, count) => {
            return memo + count;
        }, 0);
        var v = Math.random() * sum;
        for (let i = 0, len = counts.length; i < len; ++i) {
            v -= counts[i];
            if (v < 0) {
                return i;
            }
        }
    }
};
