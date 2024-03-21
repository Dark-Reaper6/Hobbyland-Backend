const express = require("express");
const {
    AdminLogin,
    GetAdmin,
    ApproveDocuments
} = require(`../controllers/admin`);
const router = express.Router();

router.post("/auth/login", AdminLogin);
router.get("/get/me", GetAdmin);
router.put("/mentor/documents/approve", ApproveDocuments);

module.exports = router;