const hashService = require("../services/hash-service");
const otpService = require("../services/otp-service");
const tokenService = require("../services/token_service");
const userService = require("../services/user-service");
const UserDto = require("../dtos/user-dto");
class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "phone field is required" });
    }
    const ttl = 1000 * 60 * 2; // 2 minutes
    const expires = Date.now() + ttl;
    const otp = await otpService.generateOtp();
    const data = `${phone}.${otp}.${expires}`;
    const hash = hashService.hashOtp(data);
    try {
      //await otpService.sendBySms(phone, otp);
      return res.json({
        hash: `${hash}.${expires}`,
        phone: phone,
        otp,
      });
    } catch (error) {
      return res.status(500).json({ message: "message sending failed" });
    }
  }
  async verifyOtp(req, res) {
    const { otp, hash, phone } = req.body;
    if (!otp || !hash || !phone) {
      return res.status(400).json({ message: "all fields required" });
    }
    const [hashOtp, expires] = hash.split(".");
    if (Date.now() > +expires) {
      return res.status(400).json({ message: "otp expired" });
    }
    const data = `${phone}.${otp}.${expires}`;
    const isValid = otpService.verifyOtp(hashOtp, data);

    if (!isValid) {
      return res.status(400).json({ message: "invalid otp" });
    } else {
      let user;
      try {
        user = await userService.findUser({ phone });
        if (!user) {
          user = await userService.createUser({ phone });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "db error on create user" });
      }
      const { accessToken, refreshToken } = tokenService.generateTokens({
        _id: user._id,
        activated: false,
      });
      await tokenService.storeRefreshToken(refreshToken, user._id);
      // res.cookie("refreshToken", refreshToken, {
      //   maxAge: 1000 * 60 * 60 * 24 * 30,
      //   httpOnly: true,
      // });
      // res.cookie("accessToken", accessToken, {
      //   maxAge: 1000 * 60 * 60 * 24 * 30,
      //   httpOnly: true,
      // });
      const userDtoo = new UserDto(user);
      return res.json({ user: userDtoo, auth: true,accessToken,refreshToken });
    }
  }
  async refresh(req, res) {
    // get refresh token from cookie
    //const { refreshToken: refreshTokenFromCookie } = req.cookies;
    const {refreshToken:refreshTokenFromCookie} = req.body;
    // check if token is valid
    let userData;
    if(!refreshTokenFromCookie) return res.status(401).json({ message: "token hi nhi hai bc" });
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (err) {
      return res.status(401).json({ message: "mar ja bsdk" });
    }
    // Check if token is in db
    try {
      const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal error" });
    }
    // check if valid user
    const user = await userService.findUser({ _id: userData._id });
    if (!user) {
      return res.status(404).json({ message: "No user" });
    }
    // Generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({
      _id: userData._id,
    });

    // Update refresh token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (err) {
      return res.status(500).json({ message: "Internal error" });
    }
    // put in cookie
    // res.cookie("refreshToken", refreshToken, {
    //   maxAge: 1000 * 60 * 60 * 24 * 30,
    //   httpOnly: true,
    // });

    // res.cookie("accessToken", accessToken, {
    //   maxAge: 1000 * 60 * 60 * 24 * 30,
    //   httpOnly: true,
    // });
    // response
    const userDtoo = new UserDto(user);
    res.json({ user: userDtoo, auth: true,refreshToken,accessToken });
  }

  async logout(req, res) {
    const { refreshToken } = req.body;
    // delete refresh token from db
    await tokenService.removeToken(refreshToken);
    // delete cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.json({ user: null, auth: false });
  }
}
module.exports = new AuthController();
