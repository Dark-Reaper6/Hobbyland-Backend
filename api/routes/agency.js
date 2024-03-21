const express = require(`express`);
const {
    CreateAgencyByCriteria
} = require("../controllers/agency/index");
const router = express.Router();

router.post("/create/by-criteria", CreateAgencyByCriteria);

module.exports = router;