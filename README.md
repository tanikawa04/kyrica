# kyrica

_※現在、開発初期段階であるため、今後、仕様が大幅に変更になる可能性があります。_

__kyrica__ は歌詞自動生成プログラムです。歌詞生成アルゴリズムには、文章生成系のプログラムで広く使われている__マルコフ連鎖__を用いています。


## 要件

kyrica を実行するには、端末に次のシステムがインストールされている必要があります。

- Node.js (v5.1.0 以降)
- MongoDB


## 準備

(1) 学習用の歌詞を MongoDB に格納します。

```
$ mongo
> use kyrica
> db.lyrics.insert({body: '春が来た　春が来た　どこに来た\n山に来た　里に来た　野にも来た'})
> db.lyrics.insert({body: '海は広いな　大きいな\n月がのぼるし　日が沈む'})
... （略）
```

kyrica は歌詞のドキュメントから `body` キーに設定された値を読み込むため、歌詞のテキストを `body` に格納します（その他のキーは無視されます）。


(2) `lib` フォルダ内に `config.js` を作成し、次の形式で MongoDB の設定を記述します。

```js
module.exports = {
    dbName: 'kyrica',           // DB 名
    dbLocation: 'localhost',    // IP / ドメイン
    dbPort: 27017,              // ポート番号
    lyricsCollection: 'lyrics', // 歌詞を格納しているコレクション
    markovCollection: 'markov'  // マルコフ状態空間を格納するコレクション
};
```


## 実行

まず学習を行い、マルコフ状態空間を生成します。学習終了後、生成された状態空間を用いて歌詞の生成を行います。

### 学習

```
$ node index.js --learn --order 2 --markov 2-markov
```

この例では、2階マルコフ連鎖で学習を行い、結果を `2-markov` として DB に格納します。

- `--learn` or `-l` : 学習モードを実行
- `--order [n]` : マルコフ連鎖のオーダ（n 階マルコフ連鎖）
- `--markov [name]` or `-m [name]` : DB に格納するマルコフ状態空間の名前

### 歌詞生成

```
$ node index.js --generate --line 20 --markov 2-markov
```

この例では、DB に格納された `2-markov` を利用して、20行の歌詞を生成します。

- `--generate` or `-g` : 歌詞生成モードを実行
- `--line [n]` : 生成する歌詞の行数
- `--markov [name]` or `-m [name]` : DB から取得するマルコフ状態空間の名前


## 今後の予定

- 歌詞生成アルゴリズムを見直す
  - 自然な内容の歌詞の生成を目指す
- 生成する歌詞に制限を加えられるようにする
  - 文字数
  - 単語
  - テーマ
- etc.
