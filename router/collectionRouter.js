const express = require('express');
const collectionController = require('../controllers/collectionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/getCollection/:id').get(collectionController.getUserCollection);
router.route('/userCollection').post(collectionController.createUserCollection);

module.exports = router;