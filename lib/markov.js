'use strict';

const deepcopy = require('deepcopy');

class Markov {
    /**
     * コンストラクタ
     * @param  {integer} order マルコフ連鎖のオーダ
     */
    constructor(order, $) {
        this._$ = ($ !== undefined) ? $ : {};    // 単語の組が歌詞中に登場した回数
        this._order = (order !== undefined && order >= 1) ? order : 2;
    }

    /**
     * 単語の組の登場回数を返す
     * @return {Object} 単語の組の登場回数
     */
    get $() {
        return deepcopy(this._$);
    }

    /**
     * マルコフ連鎖のオーダを返す
     * @return {integer} マルコフ連鎖のオーダ
     */
    get order() {
        return this._order;
    }

    /**
     * 指定されたキーに対応する値を返す
     * eg. param: ['foo', 'bar'] -> return: this._$.foo.bar
     * @param  {string[]} keys キーの配列
     * @return {} キーに対応する値（数値またはオブジェクト）
     */
    get(keys) {
        try {
            return keys.reduce((memo, key) => {
                return memo[key];
            }, this._$);
        } catch (e) {
            throw `値を取り出せませんでした: (${keys})`;
        }
    }

    /**
     * 指定された単語の組の登場回数を 1 加算する
     * @param  {string[]} words 単語の組
     */
    inclement(words) {
        if (words.length !== this._order + 1) {
            throw '単語の組数とマルコフ連鎖のオーダが一致しません';
        }

        const n = this._order;
        let s = this._$;

        for (let i = 0; i < n; i++) {
            const word = words[i];
            if (s.hasOwnProperty(word)) {
                s = s[word];
            } else {
                s = s[word] = {};
            }
        }

        const word = words[n];
        if (s.hasOwnProperty(word)) {
            s[word]++;
        } else {
            s[word] = 1;
        }
    }
}

module.exports = Markov;
