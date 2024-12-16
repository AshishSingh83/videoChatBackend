const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const authMiddleware = require('./middlewares/auth-middleware');
const roomsController = require('./controllers/rooms-controller');
router.post('/api/send-otp',authController.sendOtp);
router.post('/api/verify-otp',authController.verifyOtp);
//this is an protected route so we have to check first if user have
//valid access token or not using middleware
router.post('/api/activate',authMiddleware,activateController.activate);
router.post('/api/refresh',authController.refresh);

router.post('/api/logout',authMiddleware,authController.logout);


router.post('/api/roomss',authMiddleware,roomsController.create);
router.post('/api/rooms',authMiddleware,roomsController.index);
router.post('/api/room',authMiddleware,roomsController.show);

module.exports = router 