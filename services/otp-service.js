const crypo = require('crypto');
const hashService = require('./hash-service');
class OtpServices{
    async generateOtp(){
        const otp =  crypo.randomInt(1000,9999);
        return otp;
    }
    async sendBySms(phone,otp){
        return true;
    }
    verifyOtp(hashOtp,data){
        let computedHash = hashService.hashOtp(data);
        return hashOtp === computedHash ;
    }
}
module.exports = new OtpServices();