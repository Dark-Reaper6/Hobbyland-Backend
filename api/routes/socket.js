const express = require(`express`);
const { GetSocketAuthToken } = require(`../controllers/socket`);
const router = express.Router();

router.get("/auth", GetSocketAuthToken);

module.exports = router;