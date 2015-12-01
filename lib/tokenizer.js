'use strict';

const path = require('path');
const kuromoji = require('kuromoji');

let _tokenizer;

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
                return token.surface_form;
            });
    }
}

module.exports = Tokenizer;
