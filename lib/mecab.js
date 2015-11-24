'use strict';

const cp = require('child_process');

const trimRight = require('./utilities').trimRight;

const __space__ = ' ___ ';  // 半角スペースの識別子（形態素解析で半角スペースを認識させるため）

let _mecabCmd = 'mecab';

class Mecab {
    static setOption(opt) {
        if (opt.mecabCmd !== undefined) {
            _mecabCmd = opt.mecabCmd;
        }
    }

    static parse(text, callback) {
        const _text = text
            .replace(/　/g, ' ')        // 全角スペースを半角スペースに変換
            .replace(/ /g, __space__)   // 半角スペースを識別子に変換
            .replace(/\r?\n/g, '');     // 改行コードを除去
        const cmd = `echo "${_text}" | ${_mecabCmd} -O wakati`;

        cp.exec(cmd, {encoding: 'utf-8'}, (err, stdout, stderr) => {
            if (err) {
                return callback(null, err);
            }
            const res = trimRight(stdout).split(' ');
            return callback(res, null);
        });
    }
}

module.exports = Mecab;
