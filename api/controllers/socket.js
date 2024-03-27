const { SignJwt } = require("../../helpers/cyphers")
const { jwtExpiries } = require("../../hobbyland.config")
const StandardApi = require("../middlewares/standard-api");

const GetSocketAuthToken = async (req, res) => StandardApi(req, res, async () => {
    const { user } = req;

    const token = SignJwt({
        id: user._id,
        username: user.username,
        email: user.email
    }, jwtExpiries.socket)


    res.status(201).json({
        success: true,
        token,
        msg: ''
    })
})

module.exports = { GetSocketAuthToken }