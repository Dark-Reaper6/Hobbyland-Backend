const express = require(`express`);
const { SignUp, SignupCallback, Login } = require(`../controllers/auth`);
const router = express.Router();

router.post(`/signup`, SignUp);
router.post(`/signup/callback`, SignupCallback);
router.post(`/login`, Login);

module.exports = router;