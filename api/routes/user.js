const express = require(`express`);
const { update } = require(`../controllers/user`);
const router = express.Router();

router.put(`/update`, update);

module.exports = router;