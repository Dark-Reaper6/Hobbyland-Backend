const express = require(`express`);
const {
    GetMe,
    GetUserNotifications,
    UpdateUser
} = require(`../controllers/user`);
const { SubmitDocs } = require(`../controllers/mentor`);
const router = express.Router();

router.get("/get/me", GetMe);
router.get("/get/notifications", GetUserNotifications);
router.put("/update", UpdateUser);
router.put("/mentor/submit-docs", SubmitDocs);

module.exports = router;