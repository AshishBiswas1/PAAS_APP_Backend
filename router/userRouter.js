const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.use(authController.protect, authController.restrictTo('user'));

router.route('/Me').get(userController.getMe);
router.route('/updateMe').post(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

module.exports = router;