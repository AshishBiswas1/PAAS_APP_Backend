const express = require('express');
const envController = require('../controllers/envController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/createEnv').post(envController.createEnvironment);
router.route('/saveEnv/:id').post(envController.addEnvVariable);
router.route('/getvariables/:id').get(envController.getEnvVariables);
router.route('/getEnvCol/:id').get(envController.getEnvCollecttion);
router
  .route('/variable/:id')
  .patch(envController.updateEnvVariable)
  .delete(envController.deleteEnvVariable);

module.exports = router;
