const express = require("express");
const {
    AdminLogin,
    GetAdmin
} = require(`../controllers/admin`);
const router = express.Router();

router.post("/auth/login", AdminLogin);
router.get("/get/me", GetAdmin);

module.exports = router;