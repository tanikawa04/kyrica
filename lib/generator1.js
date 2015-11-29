'use strict';

const utilities = require('./utilities');
const choose = utilities.choose;
const decode = utilities.decode;

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
     * words を指定した場合、それらの語から始まる文を生成する
     * @param  {string[]} words 文冒頭の単語の組 (optional)
     * @return {string[]} 歌詞1行の配列
     */
    generateLine(words) {
        const wordsLen = (words !== undefined) ? words.length : 0;
        const order = this._state.order;
        words = this._chooseFirstWords(words);
        let word = '';
        while (word !== __eol__) {
            try {
                word = this._chooseWord(words.slice(words.length - order));
                words.push(word);
            } catch (e) {
                // 運悪く文頭に歌詞の最後にくる単語を選んでしまった場合、単語を無作為に選び直す
                words = this._chooseFirstWords();
            }
        }
        return words.slice(wordsLen);
    }

    /**
     * 文頭の単語の組を選ぶ
     * @param  {string[]} words 文冒頭の単語の組 (optional)
     * @return {string[]} 単語の組
     */
    _chooseFirstWords(words) {
        let ws = (words !== undefined && words.length > 0) ? words : [__bol__];
        const order = this._state.order;
        const n = order - ws.length;

        if (n <= 0) {
            return ws;
        }

        let state = this._state.get(ws);

        // マルコフ連鎖のスタートに、登録されていない単語が指定されてしまった場合、単語を無作為に選び直す
        if (state === undefined) {
            ws = [__bol__];
            state = this._state.get(ws);
        }

        for (let i = 0; i < n; i++) {
            const candidates = Object.keys(state);
            const index = ~~(Math.random() * candidates.length);
            const word = candidates[index];     // 次の単語
            ws.push(word);
            state = state[word];
        }
        return ws;
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

    decode(str) {
        const s = str
            .replace(/__bol__/g, '')
            .replace(/__eol__/g, '\n')
            .replace(_spaceRegExp, ' ');
        return decode(s);
    }
}

module.exports = Generator1;
