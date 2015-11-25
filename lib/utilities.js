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
