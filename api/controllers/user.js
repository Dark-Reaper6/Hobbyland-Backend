const User = require(`../models/user`);
const StandardApi = require("../middlewares/standard-api");
const { SignJwt } = require("../../helpers/cyphers")

const getMe = async (req, res) => StandardApi(req, res, async () => {
    const user = await User.findById(req.user._id).lean();
    res.status(200).json({ success: true, payload: SignJwt(user) })
})

module.exports = {
    getMe
}