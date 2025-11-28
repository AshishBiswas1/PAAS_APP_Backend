const express = require("express");
const collectionController = require("../controllers/collectionController");
const authController = require("../controllers/authController");
const folderRouter = require("./folderRouter");

const router = express.Router();

router.use(authController.protect, authController.restrictTo("user"));

// mount folderRouter so its routes (like "/:id/folder") become
// /api/paas/collection/:id/folder
router.use("/", folderRouter);

router.route("/getCollection/:id").get(collectionController.getUserCollection);
router.route("/userCollection").post(collectionController.createUserCollection);
router
  .route("/updateCollection/:cid")
  .patch(collectionController.updateUserCollection);

module.exports = router;
