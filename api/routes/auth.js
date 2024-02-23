const express = require("express");
const { SignUp, SignUpWithGoogle, SignupCallback, Login, LoginWithGoogle } = require(`../controllers/auth`);
const router = express.Router();

router.post(`/signup`, SignUp);
router.post(`/signup/callback`, SignupCallback);
router.post(`/signup/google`, SignUpWithGoogle);
router.post(`/login`, Login);
router.post(`/login/google`, LoginWithGoogle);

module.exports = router;