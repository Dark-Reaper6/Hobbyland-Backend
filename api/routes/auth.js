const express = require(`express`);
const { SignUp, SignupCallback } = require(`../controllers/auth`);
const router = express.Router();

router.post(`/signup`, SignUp);
router.post(`/signup/callback`, SignupCallback);
// router.post(`/login`, login);

module.exports = router;