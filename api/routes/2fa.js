const express = require("express");
const { GetQrCode, Register2fa, VerifyTotp, Update2fa } = require(`../controllers/2fa`);
const router = express.Router();

router.get("/get-qrcode", GetQrCode);
router.post("/register", Register2fa);
router.put("/toggle", Update2fa);
router.post("/verify-totp", VerifyTotp);

module.exports = router;