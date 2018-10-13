const express = require("express");
const router = express.Router();
const validation = require("./validation");

const userController = require("../controllers/userController");

router.get("/users/sign_up", userController.signUp);
router.get("/users/sign_in", userController.signInForm);
router.get("/users/sign_out", userController.signOut);
router.get("/users/:id/upgrade", userController.upgradePage);
router.get("/users/:id", userController.show);
router.get("/users/:id/downgrade", userController.downgradePage);
router.post("/users/:id/upgrade", userController.upgrade);
router.post("/users/:id/downgrade", userController.downgrade);
router.post("/users/sign_in", validation.validateUserSignIn, userController.signIn);
router.post("/users", validation.validateUsers, userController.create);

module.exports = router;
