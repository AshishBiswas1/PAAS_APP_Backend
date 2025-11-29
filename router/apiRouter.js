const express = require('express');
const apiController = require('../controllers/apiController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/save').post(apiController.saveApi);
router.route('/userapi').get(apiController.getUserapi);
router.route('/:id').get(apiController.getApiById);
router.route('/delete/:id').delete(apiController.deleteApi);

module.exports = router;
