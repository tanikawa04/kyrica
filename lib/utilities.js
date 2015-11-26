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
    },

    range(start, end) {
        return Array.from({length: end - start}, (v, k) => k + start);
    },

    /**
     * 2つの時刻の差分を求める
     * @param  {Date}   start 開始時刻
     * @param  {Date}   end   終了時刻
     * @return {string}       差分
     */
    getDiff(start, end) {
        const total = end.getTime() - start.getTime();

        const min = ~~(total / 60000);
        const sec = (total - (min * 60000)) / 1000;

        // 時間が長い場合はミリ秒以下を切り捨てる
        if (min < 1) {
            return `${sec} 秒`;
        } else {
            return `${min} 分 ${~~sec} 秒`;
        }
    }
};
