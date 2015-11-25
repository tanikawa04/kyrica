'use strict';

const choose = require('./utilities').choose;

const __bol__ = '__bol__';  // begin of line
const __eol__ = '__eol__';  // end of line
const __space__ = '___';

const _spaceRegExp = new RegExp(__space__, 'g');

class Generator1 {
    /**
     * コンストラクタ
     * @param  {MarkovState} マルコフ連鎖の状態空間
     */
    constructor(state) {
        this._state = state;
    }

    /**
     * 歌詞を生成する
     * @param  {integer} lineCount 行数
     * @return {string} 歌詞
     */
    generate(lineCount) {
        let lyric = '';
        for (let i = 0; i < lineCount; i++) {
            lyric += this._generateLine() + '\n';
        }
        return lyric;
    }

    /**
     * 歌詞の1行を生成する
     * @return {string} 歌詞1行
     */
    _generateLine() {
        const order = this._state.order;
        let words = this._chooseFirstTuple();
        let w;
        while (w !== __eol__) {
            w = this._chooseWord(words.slice(words.length - order));
            words.push(w);
        }
        return words
            .join('')
            .replace(_spaceRegExp, ' ')
            .replace(__bol__, '')
            .replace(__eol__, '');
    }

    /**
     * 文頭の単語の組を選ぶ
     * @return {string[]} 単語の組
     */
    _chooseFirstTuple() {
        let tuple = [__bol__];      // 最初の単語
        let state = this._state.$.__bol__;

        for (let i = 0, n = this._state.order; i < n; i++) {
            const candidates = Object.keys(state);
            const index = ~~(Math.random() * candidates.length);
            const word = candidates[index];     // 次の単語
            tuple.push(word);
            state = state[word];
        }
        return tuple;
    }

    /**
     * 単語を選ぶ
     * @param  {string[]} tail 現在までに生成されている文の末尾（配列長 = マルコフのオーダ）
     * @return {string} 選ばれた単語
     */
    _chooseWord(tail) {
        const state = this._getState(tail);
        const candidates = Object.keys(state);
        const counts = candidates.map(cand => {
            return state[cand];
        });
        const index = choose(counts);
        return candidates[index];
    }

    /**
     * 指定されたキーに対応する値を取得する
     * @param  {string[]} keys キーの配列
     * @return {} キーに対応する値（数値またはオブジェクト）
     */
    _getState(keys) {
        return this._state.get(keys);
    }
}

module.exports = Generator1;
