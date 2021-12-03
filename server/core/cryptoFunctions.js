const crypto = require('crypto');

function hash(string, base = "base64") {
    if (!string || string === undefined || string === null) {
        throw Error('Hash string is udnefined');
    }
    // Это надо улучшить
    return crypto.createHash('sha256').update(string).digest(base);
}

function random() {
    // Это точно надо улучшить
    return (Math.random() * 10).toString() + (Math.random() * 10).toString();
}

// function encodeBase64(string) {

// }

module.exports = { hash, random };