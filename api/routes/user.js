const express = require(`express`);
const { getMe, UpdateUser } = require(`../controllers/user`);
const router = express.Router();

router.get("/get/me", getMe);
router.put("/update", UpdateUser);

module.exports = router;