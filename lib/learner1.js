'use strict';

const co = require('co');

const utilities = require('./utilities');
const trim = utilities.trim;
const encode = utilities.encode;
const Mecab = require('./mecab');
const MarkovState = require('./markov_state');

const __bol__ = '__bol__';  // begin of line
const __eol__ = '__eol__';  // end of line

class Learner1 {
    /**
     * コンストラクタ
     * @param  {Object} opt オプション（order: マルコフ連鎖のオーダ）
     */
    constructor(opt) {
        this._order = (opt !== undefined && opt.order !== undefined && opt.order >= 1) ? opt.order : 2;
        this._state = new MarkovState(this._order);
    }

    get markovState() {
        return this._state;
    }

    /**
     * 学習を行う
     * @param  {string} lyric 歌詞のテキスト
     * @param  {Function} callback コールバック関数
     */
    learn(lyric, callback) {
        const lines = trim(lyric).split(/\r?\n/);

        co(function*() {
            let chains = yield this._parse(lines);
            chains = this._removeBlankLine(chains);
            chains = this._encode(chains);
            this._learn(chains);
            callback(this._state);
        }.bind(this))
        .catch(err => {
            callback(null, err);
        });
    }

    /**
     * 文の配列を形態素解析する
     * @param  {string[]} lines 文の配列
     * @return {Promise[]}
     */
    _parse(lines) {
        return Promise.all(lines.map(line => {
            return new Promise((resolve, reject) => {
                Mecab.parse(line, (res, err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
            });
        }));
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
                this._state.inclement(tuple);
            }
        });
    }

    _encode(chains) {
        return chains.map(words => {
            return words.map(word => {
                return encode(word);
            });
        });
    }
}

module.exports = Learner1;
