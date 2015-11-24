'use strict';

const Mecab = require('./mecab');

if (!process.argv[2]) {
    console.error('invalid argument');
    process.exit(1);
}

Mecab.parse(process.argv[2], (res, err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(res);
    process.exit(0);
});
