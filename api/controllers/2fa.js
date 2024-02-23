const User = require(`../models/user`);
const StandardApi = require("../middlewares/standard-api");
const { SignJwt, SetSessionCookie } = require("../../helpers/cyphers");
const { jwtExpiries } = require("../../hobbyland.config");

const VerifyTotp = async (req, res) => StandardApi(req, res, async () => {
    const { totp_code } = req.query;
    if (!totp_code) return res.status(401).json({ success: false, msg: "All Query Parameter `totp_code` is required." })

    const { "otp_user_id": user_id } = req.cookies;
    if (!user_id) return res.status(400).json({ success: false, msg: "Oops! your session doesn't match the user id. Please retry." })

    let user = await User.findById(user_id).select('+two_fa.secret')
    if (!user) return res.status(404).json({ success: false, msg: "User does not exist." })
    if (!user.two_fa.secret || !user.two_fa.enabled) return res.status(403).json({ success: false, msg: "This user does not have 2FA enabled." })

    const verified = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: 'base32',
        token: totp_code,
    });

    if (verified) {
        delete user.two_fa.secret;
        res.clearCookie("otp_user_id")
        SetSessionCookie(res, {
            _id: user._id,
            username: user.username,
            email: user.email,
            timezone: user.timezone,
            createdAt: user.createdAt,
            user_agent: SignJwt(user.user_agent),
            last_checkin: user.last_checkin,
            ...(user.firstname && { firstname: user.firstname }),
            ...(user.lastname && { lastname: user.firstname }),
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        }, jwtExpiries.default);

        res.status(200).json({
            success: true,
            msg: "You are signed in successfully!",
            payload: SignJwt(user)
        })
    } else return res.status(401).json({
        success: false,
        msg: "The code is either wrong or expired. Please try again."
    })
}, { verify_user: false })


module.exports = { VerifyTotp };