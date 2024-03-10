const Admin = require(`../models/admin`);
const User = require(`../models/user`);
const VerificDocs = require(`../models/verfication-documents`);
const StandardApi = require("../middlewares/standard-api");
const { adminRoles } = require("../../hobbyland.config");
const { adminLoginSchema } = require("../../validation-schemas/admin");
const { SignJwt, getDateOfTimezone } = require("../../helpers/cyphers");

const AdminLogin = async (req, res) => StandardApi(req, res, async () => {
    const { email, username, password } = req.body;

    const currentUserAgent = req.headers['user-agent'];
    // const parser = new UAParser(currentUserAgent);
    let user = await Admin.findOneAndUpdate({ $or: [{ email }, { username }] }, { user_agent: SignJwt(currentUserAgent) }, { new: true, lean: true }).select("+password")
    if (!user) return res.status(404).json({ success: false, msg: "Admin not found, please create an account" })
    if (user.register_provider !== "hobbyland") return res.status(409).json({ success: false, msg: `This account is associated with ${user.register_provider}` })
    if (!user.role || !adminRoles.includes(user.role)) return res.status(401).json({ success: false, msg: `The admin does not have a valid role.` })

    const originalPassword = EncryptOrDecryptData(user.password, false)
    if (password !== originalPassword) return res.status(401).json({ success: false, msg: "Your password is incorrect" })
    if (user.two_fa.register_date && user.two_fa.enabled) {
        res.cookie("otp_user_id", user._id, {
            httpOnly: true,
            sameSite: process.env.DEVELOPMENT_ENV === "PRODUCTION" ? "none" : "lax",
            path: "/",
            domain: "localhost",
            secure: process.env.DEVELOPMENT_ENV === "PRODUCTION",
        })
        return res.json({
            success: true,
            msg: "Step 1 completed, please verify TOTP",
            verify_totp: true,
        })
    }
    else if (!user.two_fa.enabled) {
        SetSessionCookie(res, {
            _id: user._id,
            role: user.role,
            email: user.email,
            timezone: user.timezone,
            lastname: user.lastname,
            username: user.username,
            createdAt: user.createdAt,
            firstname: user.firstname,
            user_agent: user.user_agent,
            last_checkin: user.last_checkin,
        }, (remember_me && remember_me === true) ? jwtExpiries.extended : jwtExpiries.default);
        delete user.password;

        res.status(200).json({
            success: true,
            msg: "You are Logged in successfully !",
            payload: SignJwt(user)
        })
    }
}, { verify_user: false, verify_admin: false, validationSchema: adminLoginSchema })

const GetAdmin = async (req, res) => StandardApi(req, res, async () => {
    const admin = await Admin.findById(req.user._id).lean();
    res.status(200).json({ success: true, payload: SignJwt(admin) })
})

const ApproveDocuments = async (req, res) => StandardApi(req, res, async () => {
    const user_id = req.body;
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ success: false, msg: "Respected user not found" });
    await User.findByIdAndUpdate(user_id, { account_type: "mentor", is_verified: true }, { immutability: "disable" });
    await VerificDocs.updateOne({ user_id }, { is_verified: true, verification_date: getDateOfTimezone(user.timezone) }, { immutability: "disable" });

    res.status(201).json({
        success: true,
        msg: "Documents approved successfully, they're mentor now."
    })

}, { verify_admin: true })

module.exports = {
    AdminLogin,
    GetAdmin,
    ApproveDocuments,
}