const crypo = require('crypto');
class HashService{
    hashOtp(data){
        const a = process.env.HASH_SECRET ;
        return crypo.createHmac('sha256',process.env.HASH_SECRET).
        update(data).
        digest('hex');
    }
}
module.exports = new HashService();