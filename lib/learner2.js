'use strict';

const trim = require('./utilities').trim;
const Learner1 = require('./learner1');
const constants = require('./constants');

const __bol__ = constants.__bol__;
const __eol__ = constants.__eol__;

class Learner2 extends Learner1 {
    /**
     * コンストラクタ
     * @param  {Object} opt オプション
     */
    constructor(opt) {
        super(opt);
    }

    /**
     * 学習を行う
     * @param  {string} lyric 歌詞のテキスト
     * @param  {Function} callback コールバック関数
     */
    learn(lyric, callback) {
        const lines = trim(lyric).split(/\r?\n/);
        let chains = this._parse(lines);
        const words = this._format(chains);
        this._learn(words);
    }

    /**
     * 整形された歌詞データをもとに学習を行う
     * @param  {string[]} words 単語の配列
     */
    _learn(words) {
        for (let i = 0, n = words.length - this._order; i < n; i++) {
            let tuple = [];
            for (let j = i; j < i + this._order + 1; j++) {
                tuple.push(words[j]);
            }
            this._markov.inclement(tuple);
        }
    }

    _format(chains) {
        const cs = chains.filter(words => {
                return words.length > 0 && words[0] !== '';     // 空行は形態素解析の結果 words => [''] となる
            })
            .reduce((memo, words) => {
                return [...memo, ...words, __eol__];
            }, []);
        return [__bol__, ...cs];
    }
}

module.exports = Learner2;
