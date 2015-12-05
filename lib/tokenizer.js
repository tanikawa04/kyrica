'use strict';

const path = require('path');
const kuromoji = require('kuromoji');

const encode = require('./utilities').encode;

let _tokenizer;

const _pos = {
    'その他': 'o',
    'フィラー': 'f',
    '感動詞': 'i',
    '記号': 's',
    '連体詞': 'pa',
    '形容詞': 'aj',
    '助詞': 'pt',
    '助動詞': 'ax',
    '接続詞': 'c',
    '接頭詞': 'pr',
    '動詞': 'v',
    '副詞': 'ad',
    '名詞': 'n',
    'アルファベット': 'al'
};

class Tokenizer {
    static init() {
        return new Promise((resolve, reject) => {
        const builder = kuromoji.builder({dicPath: path.join(__dirname, '../node_modules/kuromoji/dist/dict/')});
            builder.build(function (err, tokenizer) {
                if (err) {
                    reject();
                    return;
                }
                _tokenizer = tokenizer;
                resolve();
            });
        });
    }

    static split(text) {
        const t = text
            .replace(/　/g, ' ')                // 全角スペースを半角スペースに変換
            .replace(/\r?\n/g, '');             // 改行コードを除去

        return _tokenizer.tokenize(t)
            .map(token => {
                const surfaceForm = token.surface_form;
                if (surfaceForm.search(/[a-zA-Z]/) !== -1) {
                    return `${encode(surfaceForm)}#${_pos['アルファベット']}`;
                } else if (surfaceForm.search(/[\!"#\$%&'\(\)\*\+\,\-\.\/:;<=>\?\\]/) !== -1) {
                    return `${encode(surfaceForm)}#${_pos['記号']}`;
                } else {
                    return `${encode(surfaceForm)}#${_pos[token.pos]}`;
                }
            });
    }
}

module.exports = Tokenizer;
