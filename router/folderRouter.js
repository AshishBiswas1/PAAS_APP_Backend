const express = require("express");
const folderController = require("../controllers/folderController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
router.use(authController.protect, authController.restrictTo("user"));

router.route("/:id/folder").get(folderController.getCollectionFolder);

router.route("/create").post(folderController.addFolder);

module.exports = router;
