const express = require("express");
const { VerifyTotp } = require(`../controllers/2fa`);
const router = express.Router();

router.post(`/verify-totp`, VerifyTotp);

module.exports = router;