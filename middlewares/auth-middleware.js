// const tokenService = require("../services/token_service");
// module.exports = async function (req, res, next) {
//   try {
//     //cookie getting automattically in every request
//     //console.log('check req',req.body);
//     //const { accessToken } = req.cookies;
//     const accessToken = req.body.accessToken ;
//     console.log('here babuji',accessToken);
//     if (!accessToken){
//       throw new Error();
//     }
//     let userData ;
//     try{
//       userData = await tokenService.verifyAccessToken(accessToken);
//     }
//     catch(e){
//       //res.status(401).json({ message: "token not verified" });
//       console.log('unable to verify');
//       throw new Error();
//     }
//     if (!userData){
//       throw new Error();
//     }
//     req.user = userData;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };
const tokenService = require("../services/token_service");
module.exports = async function (req, res, next) {
  try {
    // Token can be in cookies, headers, or body
    const accessToken = req.body.accessToken || req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      console.error("Access token is missing");
      return res.status(401).json({ message: "Access token is missing" });
    }

    let userData;
    try {
      userData = await tokenService.verifyAccessToken(accessToken);
    } catch (e) {
      console.error("Token verification failed:", e.message);
      return res.status(401).json({ message: "Token verification failed" });
    }

    if (!userData) {
      console.error("Invalid token payload");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = userData; // Attach user data to the request
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Error in authentication middleware:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
