const User = require(`../models/user`);
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
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
        secret: user.two_fa.secret,
        encoding: 'base32',
        token: totp_code
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

const GetQrCode = async (req, res) => StandardApi(req, res, async () => {
    const { user } = req;

    const secret = speakeasy.generateSecret({
        issuer: "Hobbyland",
        name: `Hobbyland: ${user.username}`,
        length: 30
    })
    const qr_url = await qrcode.toDataURL(secret.otpauth_url);
    res.status(200).json({
        success: true,
        qr_secret: secret.base32,
        qr_url
    })
})

const Register2fa = async (req, res) => StandardApi(req, res, async () => {
    const { qr_secret, totp_code } = req.body;
    const user_id = req.user._id;
    if (qr_secret?.length < 29 || totp_code?.length < 4) return res.status(400).json({ success: false, msg: "All valid parameters required. Body Parameters: qr_secret, totp_code" })

    const verified = speakeasy.totp.verify({
        secret: qr_secret,
        encoding: 'base32',
        token: totp_code
    });

    if (verified) {
        const user = await User.findByIdAndUpdate(user_id, {
            two_fa: {
                secret: qr_secret,
                enabled: true,
                activation_date: new Date()
            }
        }, { new: true, immutability: "disable", lean: true });

        SetSessionCookie(res, {
            _id: user._id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            timezone: user.timezone,
            createdAt: user.createdAt,
            user_agent: user.user_agent,
            last_checkin: user.last_checkin,
            two_fa: user.two_fa,
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        }, res.user.exp);
        delete user.two_fa.secret;
        delete user.password;

        return res.status(201).json({
            success: true,
            msg: "2 Factor Authentication is Enabled",
            payload: SignJwt(user)
        })
    }
    else return res.status(401).json({
        success: false,
        msg: "Your code is either wrong or expired. Please try again."
    })
})

const Update2fa = async (req, res) => StandardApi(req, res, async () => {
    const { totp_code } = req.body;
    const user_id = req.user._id;
    if (totp_code?.length < 4) return res.status(400).json({ success: false, msg: "Invalid TOTP. Query Parameter: totp_code" })

    let user = await User.findById(user_id).select('+two_fa.secret');
    if (!user) { res.clearCookie('session-token'); res.clearCookie('is_logged_in'); return res.status(404).json({ success: false, msg: "User with provided user_id does not exist." }) }
    if (!user.two_fa.secret || !user.two_fa.activation_date) return res.status(400).json({ success: false, msg: "This user does not have registered the 2FA." })

    const verified = speakeasy.totp.verify({
        secret: user.two_fa.secret,
        encoding: 'base32',
        token: totp_code,
    });

    if (verified) {
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { "two_fa.enabled": !user.two_fa.enabled },
            { new: true, immutability: "disable", lean: true }
        )

        SetSessionCookie(req, res, {
            _id: user._id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            timezone: user.timezone,
            createdAt: user.createdAt,
            user_agent: user.user_agent,
            last_checkin: user.last_checkin,
            two_fa: user.two_fa,
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        }, res.user.exp);
        delete user.two_fa.secret;

        res.status(200).json({
            success: true,
            msg: `Your 2FA has been ${updatedUser.two_fa.enabled ? "enabled" : "disabled"} successfully.`,
            payload: SignJwt(updatedUser)
        })
    }
    else return res.status(401).json({
        success: false,
        msg: "The code is either wrong or expired. Please try again."
    })
})

module.exports = { GetQrCode, Register2fa, VerifyTotp, Update2fa };