'use strict';

const deepcopy = require('deepcopy');

const _wildCard = '*';

let _cache;

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
     * @param  {string | Array} key キー（単語の組）
     * @return {Object} キーに対応する値
     */
    get(key) {
        const k = this._formatKey(key);
        const v = this._$[k];
        if (v === undefined) {
            throw Error(`値を取得できませんでした - key: ${k}`);
        }
        return v;
    }

    find(key) {
        const words = this._unformatKey(key);
        const length = words.length;
        const n = this._order + 1;
        const d = n - length;
        if (d < 0) {
            throw Error(`単語数がマルコフ連鎖のオーダを上回っています`);
        }
        for (let i = 0; i < d; i++) {
            words.push(_wildCard);
        }

        let keys = this._getMarkovKeys();
        for (let i = 0, len = words.length; i < len; i++) {
            const word = words[i];
            if (word !== _wildCard) {
                const keys_ = [];
                for (let j = 0, keysLen = keys.length; j < keysLen; j++) {
                    const k = keys[j];
                    if (k.split(':')[i] === words[i]) {
                        keys_.push(k);
                    }
                }
                keys = keys_;
            }
        }
        return keys;
    }

    /**
     * 指定された単語の組の登場回数を 1 加算する
     * @param  {string | Array} key キー（単語の組）
     */
    inclement(key) {
        const length = Array.isArray(key) ? key.length : key.split(':').length;
        if (length !== this._order + 1) {
            throw Error(`単語数とマルコフ連鎖のオーダが一致しません`);
        }

        const k = this._formatKey(key);
        const s = this._$;
        if (s.hasOwnProperty(k)) {
            s[k]++;
        } else {
            s[k] = 1;
        }
    }

    _formatKey(key) {
        if (Array.isArray(key)) {
            // 各単語を : で連結
            return key.join(':');
        } else {
            return key;
        }
    }

    _unformatKey(key) {
        if (Array.isArray(key)) {
            return [...key];
        } else {
            return key.split(':');
        }
    }

    _getMarkovKeys() {
        if (!_cache) {
            // find の度に key を配列化すると時間がかかるのでキャッシュする
            _cache = Object.keys(this._$);
        }
        return _cache;
    }
}

module.exports = Markov;
