'use strict';

const trim = require('./utilities').trim;
const Tokenizer = require('./tokenizer');
const Markov = require('./markov');
const constants = require('./constants');

const __bol__ = constants.__bol__;
const __eol__ = constants.__eol__;

class Learner1 {
    /**
     * コンストラクタ
     * @param  {Object} opt オプション（order: マルコフ連鎖のオーダ）
     */
    constructor(opt) {
        this._order = (opt !== undefined && opt.order !== undefined && opt.order >= 1) ? opt.order : 2;
        this._markov = new Markov(this._order);
    }

    get markov() {
        return this._markov;
    }

    /**
     * 学習を行う
     * @param  {string} lyric 歌詞のテキスト
     * @param  {Function} callback コールバック関数
     */
    learn(lyric, callback) {
        const lines = trim(lyric).split(/\r?\n/);
        let chains = this._parse(lines);
        chains = this._removeBlankLine(chains);
        this._learn(chains);
    }

    /**
     * 歌詞を分かち書きする
     * @param  {string[]} lines 文の配列
     * @return {string[][]} 行ごとの分かち書きの結果
     */
    _parse(lines) {
        return lines.map(line => {
            return Tokenizer.split(line);
        });
    }

    /**
     * 空白行のチェインを削除する
     * @param  {string[][]} chains 単語のチェイン
     * @return {string[][]} 空白行を削除した後のチェイン
     */
    _removeBlankLine(chains) {
        return chains.filter(words => {
                return words[0] !== '';
            });
    }

    /**
     * 整形された歌詞データをもとに学習を行う
     * @param  {string[][]} chains 単語のチェイン
     */
    _learn(chains) {
        chains.forEach(words => {
            // 行頭と行末に識別子を追加する
            words.unshift(__bol__);
            words.push(__eol__);

            // 単語の組ごとの登場回数を数える
            for (let i = 0, n = words.length - this._order; i < n; i++) {
                let tuple = [];
                for (let j = i; j < i + this._order + 1; j++) {
                    tuple.push(words[j]);
                }
                this._markov.inclement(tuple);
            }
        });
    }
}

module.exports = Learner1;
