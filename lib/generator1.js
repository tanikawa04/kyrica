'use strict';

const utilities = require('./utilities');
const choose = utilities.choose;
const constants = require('./constants');

const __bol__ = constants.__bol__;
const __eol__ = constants.__eol__;

class Generator1 {
    /**
     * コンストラクタ
     * @param  {Markov} マルコフ連鎖の状態空間
     */
    constructor(markov) {
        this._markov = markov;
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
        const order = this._markov.order;
        words = this._chooseFirstWords(words);
        let word = '';
        while (word !== __eol__) {
            try {
                word = this._chooseWord(words.slice(words.length - order).concat('*'));
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
        const markov = this._markov;

        let ws = (words !== undefined && words.length > 0) ? words : [__bol__];
        const order = markov.order;
        const n = order - ws.length;

        if (n <= 0) {
            return ws;
        }

        let candidates = markov.find(ws);

        // マルコフ連鎖のスタートに、登録されていない単語が指定されてしまった場合、単語を無作為に選び直す
        if (candidates.length === 0) {
            ws = [__bol__];
            candidates = this._markov.get(ws);
        }

        const counts = candidates.map(cand => {
            return markov.get(cand);
        });
        const index = choose(counts);
        const choice = candidates[index];
        return choice.split(':');
    }

    /**
     * 単語を選ぶ
     * @param  {string[]} tail 現在までに生成されている文の末尾（配列長 = マルコフのオーダ）
     * @return {string} 選ばれた単語
     */
    _chooseWord(tail) {
        const markov = this._markov;
        const candidates = markov.find(tail);
        const counts = candidates.map(cand => {
            return markov.get(cand);
        });
        const index = choose(counts);
        const choice = candidates[index];
        return choice.slice(choice.lastIndexOf(':') + 1);
    }

    /**
     * 指定されたキーに対応する値を取得する
     * @param  {string[]} keys キーの配列
     * @return {} キーに対応する値（数値またはオブジェクト）
     */
    _getMarkov(keys) {
        return this._markov.get(keys);
    }

    convert(word) {
        return word.replace(__bol__, '')
            .replace(__eol__, '\n')
            .replace(/#.+$/, '');
    }
}

module.exports = Generator1;
