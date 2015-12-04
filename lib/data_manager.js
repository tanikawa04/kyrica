'use strict';

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const MarkovState = require('./markov');
const config = require('./config');

let _db,
    _lyricsCollection,
    _markovCollection;

class DataManager {
    /**
     * DB に接続する
     * @return {Promise}
     */
    static connectDb() {
        return MongoClient.connect(`mongodb://${config.dbLocation}:${config.dbPort}/${config.dbName}`)
            .then(db => {
                _db = db;
                _lyricsCollection = db.collection(config.lyricsCollection);
                _markovCollection = db.collection(config.markovCollection);
            });
    }

    /**
     * DB をクローズする
     * @return {Promise}
     */
    static closeDb() {
        return _db.close();
    }

    /**
     * 歌詞を読み込む
     * @return {Promise}
     * @resolves {string[]} 歌詞の配列
     */
    static loadLyrics() {
        return _lyricsCollection.find({}, {body: 1})
            .toArray()
            .then(docs => {
                return Promise.all(docs.map(doc => {
                    return Promise.resolve(doc.body);
                }));
            });
    }

    /**
     * マルコフ状態空間を読み込む
     * @param  {string}
     * @return {Promise}
     * @resolves {MarkovState} マルコフ状態空間
     */
    static loadMarkovState(name) {
        return _markovCollection.find({name}, {order: 1, state: 1}).limit(1).next()
            .then(doc => {
                if (!doc) {
                    throw new Error(`存在しないコレクション名です: "${name}"`);
                }
                return new MarkovState(doc.order, doc.state);
            });
    }

    /**
     * マルコフ状態空間を保存する
     * @param  {string} name マルコフ状態空間の名前（ロード時のキーとなる）
     * @param  {MarkovState} markovState マルコフ状態空間
     * @return {Promise}
     */
    static saveMarkovState(name, markovState) {
        return _markovCollection.update(
            {name},
            {$set: {name, order: markovState.order, state: markovState.$}},
            {upsert: true}
        );
    }
}

module.exports = DataManager;
