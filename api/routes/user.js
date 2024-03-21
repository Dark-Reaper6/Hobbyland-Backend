const express = require(`express`);
const {
    GetMe,
    GetUserNotifications,
    UpdateUser
} = require(`../controllers/user`);
const { SubmitDocs } = require(`../controllers/mentor/index`);
const { CreateService } = require(`../controllers/mentor/services`);
const router = express.Router();

// Universal user endpoints
router.get("/get/me", GetMe);
router.get("/get/notifications", GetUserNotifications);
router.put("/update", UpdateUser);

// Mentor endpoints
router.post("/mentor/submit-docs", SubmitDocs);
router.post("/mentor/service/create", CreateService);

module.exports = router;