var Q = require('q');
var crypto = require('crypto');
var pbkdf2 = Q.nbind(crypto.pbkdf2, crypto);

function Scrambler() {}

Scrambler.prototype.encode = function(opt) {
    return pbkdf2(opt.secret, opt.salt, opt.iterations, opt.keylen);
};

Scrambler.prototype.verify = function(opt){
    return this.encode(opt).then(function(key){
       return key.toString('hex') === opt.key;
    });
};

module.exports = function () {
    return new Scrambler();
};
