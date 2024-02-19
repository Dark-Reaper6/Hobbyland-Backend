const express = require(`express`);
const { getMe } = require(`../controllers/user`);
const router = express.Router();

router.get(`/get/me`, getMe);

module.exports = router;