'use strict';

// const path = require('path');
// const fs = require('fs');
const co = require('co');

const Mecab = require('./mecab');
const Learner = require('./learner');
const Generator = require('./generator1');
const DataManager = require('./data_manager');
const fillZero = require('./utilities').fillZero;

let isLearnMode = false;
let isGenerateMode = false;
let order = 2;
let markovStateName = 'markov';
let lineCount = 10;

// コマンドから `node` と `index(.js)` を除く argv を取得
const argv = process.argv.slice(2);

const iter = argv[Symbol.iterator]();
let item = iter.next();
while (!item.done) {
    if (item.value === '--learn' || item.value === '-l') {
        if (isGenerateMode) {
            console.error('コマンドが不正です');
            process.exit(1);
        }
        isLearnMode = true;
    } else if (item.value === '--generate' || item.value === '-g') {
        if (isLearnMode) {
            console.error('コマンドが不正です');
            process.exit(1);
        }
        isGenerateMode = true;
    } else if (item.value === '--order') {
        item = iter.next();
        order = Number.parseInt(item.value);
        if (!Number.isInteger(order)) {
            console.error('コマンドが不正です');
            process.exit(1);
        }
    } else if (item.value === '--markov' || item.value === '-m') {
        item = iter.next();
        markovStateName = item.value;
        if (!markovStateName) {
            console.error('コマンドが不正です');
            process.exit(1);
        }
    } else if (item.value === '--line') {
        item = iter.next();
        lineCount = Number.parseInt(item.value);
        if (!Number.isInteger(lineCount)) {
            console.error('コマンドが不正です');
            process.exit(1);
        }
    }
    item = iter.next();
}

if (isLearnMode) {
    console.log('[学習モード]');

    co(function*() {
        // MeCab の動作確認
        yield (() => {
            return new Promise((resolve, reject) => {
                Mecab.parse('', (res, err) => {
                    if (err) {
                        console.error('MeCab の実行ができません');
                        process.exit(1);
                    }
                    resolve();
                });
            });
        })();

        // DB 接続
        yield DataManager.connectDb();

        // 歌詞取得
        const lyrics = yield DataManager.loadLyrics();

        // 学習
        const learner = new Learner({order});
        const len = lyrics.length;
        const digitLen = ('' + len).length;
        console.log(`${len} 曲の歌詞から学習を行います`);
        for (let i = 0; i < len; i++) {
            yield (() => {
                return new Promise((resolve, reject) => {
                    learner.learn(lyrics[i], (res, err) => {
                        process.stdout.write(`\r${fillZero(i + 1, digitLen)} / ${len} 曲 完了`);
                        resolve();
                    });
                });
            })();
        }
        console.log('');
        console.log('全ての歌詞の学習が完了しました');

        // 学習データ（マルコフ状態空間）保存
        yield DataManager.saveMarkovState(markovStateName, learner.markovState);

        console.log('学習データを DB に保存しました');
        console.log('finish !');

        yield DataManager.closeDb();
        process.exit(0);
    })
    .catch(err => {
        console.error(err);

        DataManager.closeDb()
            .then(() => {
                process.exit(1);
            });
    });
} else if (isGenerateMode) {
    console.log('[歌詞生成モード]');
    console.log('');

    co(function*() {
        // DB 接続
        yield DataManager.connectDb();

        // 学習データ取得
        const markovState = yield DataManager.loadMarkovState(markovStateName);

        // 歌詞生成
        const generator = new Generator(markovState);
        const lyric = generator.generate(lineCount);

        console.log(lyric);
        console.log('finish !');

        yield DataManager.closeDb();
        process.exit(0);
    })
    .catch(err => {
        console.error(err);

        DataManager.closeDb()
            .then(() => {
                process.exit(1);
            });
    });
} else {
    console.error('コマンドが不正です');
    process.exit(1);
}
