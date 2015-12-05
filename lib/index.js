'use strict';

// const path = require('path');
// const fs = require('fs');
const co = require('co');

const Tokenizer = require('./tokenizer');
const Learner = require('./learner2');
const Generator = require('./generator1');
const DataManager = require('./data_manager');
const utilities = require('./utilities');
const fillZero = utilities.fillZero;
const range = utilities.range;
const getDiff = utilities.getDiff;
const decode = utilities.decode;

let isLearnMode = false;
let isGenerateMode = false;
let order = 2;
let markovName = 'markov';
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
        markovName = item.value;
        if (!markovName) {
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

let start,
    end;

if (isLearnMode) {
    console.log('[学習モード]');

    co(function*() {
        // kuromoji 初期化
        yield Tokenizer.init();

        // DB 接続
        yield DataManager.connectDb();

        console.log('DB から歌詞を取得します');

        // 歌詞取得
        const lyrics = yield DataManager.loadLyrics();

        console.log('歌詞の取得が完了しました');

        // 学習
        const learner = new Learner({order});
        const len = lyrics.length;
        const digitLen = ('' + len).length;

        console.log(`${len} 曲の歌詞から学習を行います`);
        process.stdout.write(`\r${fillZero(0, digitLen)} / ${len} 曲 完了`);

        start = new Date();
        for (let i = 0; i < len; i++) {
            learner.learn(lyrics[i]);
            process.stdout.write(`\r${fillZero(i + 1, digitLen)} / ${len} 曲 完了`);
        }
        end = new Date();

        console.log('');
        console.log('全ての歌詞の学習が完了しました');
        console.log(`時間: ${getDiff(start, end)}`);

        // 学習データ（マルコフ状態空間）保存
        yield DataManager.saveMarkov(markovName, learner.markov);

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

    co(function*() {
        // DB 接続
        yield DataManager.connectDb();

        // 学習データ取得
        const markov = yield DataManager.loadMarkov(markovName);

        // 歌詞生成
        const generator = new Generator(markov);
        const digitLen = ('' + lineCount).length;

        console.log(`${lineCount} 行の歌詞を生成します`);
        process.stdout.write(`\r${fillZero(0, digitLen)} / ${lineCount} 行 完了`);

        start = new Date();
        const lyric = range(0, lineCount - 1).reduce((memo, i) => {
            // 最後に生成された order 個分の語をもとに新たな文を生成
            const words = generator.generateLine(memo.slice(-order));
            // const words = generator.generateLine();
            process.stdout.write(`\r${fillZero(i + 1, digitLen)} / ${lineCount} 行 完了`);
            return [...memo, ...words];
        }, [])
        .map(word => {
            return decode(generator.convert(word));
        })
        .join('');
        end = new Date();

        console.log('');
        console.log('歌詞の生成が完了しました');
        console.log(`時間: ${getDiff(start, end)}`);
        console.log('');

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
