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
};
