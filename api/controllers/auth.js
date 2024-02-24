const User = require(`../models/user`);
const OTP = require("../models/otp");
const { OAuth2Client } = require('google-auth-library');
const StandardApi = require("../middlewares/standard-api");
const { generateRandomInt, SignJwt, EncryptOrDecryptData } = require("../../helpers/cyphers");
const { signupSchema, googleSignupSchema, loginSchema } = require("../../validation-schemas/auth");
// const UAParser = require("ua-parser-js");

const SignUp = async (req, res) => StandardApi(req, res, async () => {
    const { email, username } = req.body;
    let user = await User.findOne().or([{ email }, { username }]);
    if (user) return res.status(409).json({ success: false, msg: "This Email or Username already in use." })
    if (!req.body.accept_policies) return res.status(403).json({ success: false, msg: "A user can't register without accepting our policies and terms of use." })

    let dbOtp = await OTP.findOne({ email });
    if (dbOtp) return res.status(409).json({ success: false, msg: "You already have registration session, try after 5 minutes." })
    if (!dbOtp) {
        let otp = generateRandomInt(10001, 999999)
        dbOtp = await OTP.create({
            email,
            otp,
            new_user: req.body
        })
        const isProdEnv = process.env.DEVELOPMENT_ENV === "PRODUCTION";
        res.cookie(process.env.OTPID_COOKIE, dbOtp._id, {
            httpOnly: true,
            sameSite: isProdEnv ? "none" : "lax",
            priority: "high",
            path: "/",
            secure: isProdEnv
        })

        // const template = verifyEmail(otp)
        // await sendEmail({ to: req.body.email, subject: "Verify your email for registration on Hobbyland" }, template)
        res.status(200).json({
            success: true,
            otp_id: dbOtp._id,
            msg: `Verification Email sent to ${email}`
        })
    }
}, { verify_user: false, validationSchema: signupSchema });

const SignUpWithGoogle = async (req, res) => StandardApi(req, res, async () => {
    const { token, timezone, account_type } = req.body;

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (e) { return res.status(401).json({ success: false, msg: "Invalid token, user unauthorized. Please try registring again with valid google account." }) }
    const { name, email, picture } = ticket.getPayload();

    let username = email.split('@')[0]
    let splittedName = name.split(' ')
    let firstname = splittedName[0]
    splittedName.shift()
    let lastname = splittedName.join(' ')

    let user = await User.findOne().or([{ email }, { username }]);
    if (user) return res.status(409).json({ success: false, msg: "This Email or Username already in use." });

    const currentUserAgent = req.headers['user-agent']
    // const parser = new UAParser(currentUserAgent)
    user = (await User.create({
        email,
        username,
        firstname,
        lastname,
        image: picture,
        account_type,
        timezone,
        user_agent: SignJwt(currentUserAgent),
        register_provider: "google",
        createdAt: getDateOfTimezone(timezone)
    })).toObject();

    SetSessionCookie(res, {
        _id: user._id,
        username: user.username,
        email: user.email,
        register_provider: user.register_provider,
        timezone: user.timezone,
        user_agent: user.user_agent,
        last_checkin: user.last_checkin,
        createdAt: user.createdAt
    });

    res.status(200).json({
        success: true,
        msg: "You are Resgistered successfully !",
        payload: SignJwt(user)
    })
}, { verify_user: false, validationSchema: googleSignupSchema })

const SignupCallback = async (req, res) => StandardApi(req, res, async () => {
    const { otp } = req.body;
    if (typeof otp !== "number" || otp < 10001) return res.status(401).json({
        success: false,
        msg: "Invalid OTP"
    })
    const otp_id = res.cookies?.[process.env.OTPID_COOKIE];
    if (!otp_id) return res.status(400).json({ success: false, msg: "Oops! something went wrong, your session doesn't match otp id, please retry." })

    const otpData = await OTP.findById(otp_id).lean();
    if (!otpData) return res.status(401).json({ success: false, msg: "The OTP has expired, please try again." })
    if (otpData.otp !== otp) return res.status(401).json({ success: false, msg: "The OTP is incorrect." })

    let credentials = otpData.new_user;
    if (otpData) {
        let user = await User.findOne().or([{ email: credentials.email }, { username: credentials.username }])
        if (user) return res.status(409).json({ success: false, msg: "This Email or Username already in use." })
        const currentUserAgent = req.headers['user-agent'];
        // const parser = new UAParser(currentUserAgent);
        user = (await User.create({
            ...credentials,
            user_agent: SignJwt(currentUserAgent),
            createdAt: getDateOfTimezone(credentials.timezone)
        })).toObject();

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
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        });
        res.clearCookie(process.env.OTPID_COOKIE);

        res.status(200).json({
            success: true,
            msg: "You're Resgistered successfully !",
            payload: SignJwt(user),
        })
    }
}, { verify_user: false })

const Login = async (req, res) => StandardApi(req, res, async () => {
    const { email, username, password, remember_me } = req.body;

    const currentUserAgent = req.headers['user-agent'];
    // const parser = new UAParser(currentUserAgent);
    let user = await User.findOneAndUpdate({ $or: [{ email }, { username }] }, { user_agent: SignJwt(currentUserAgent) }, { new: true, lean: true }).select("+password")
    if (!user) return res.status(404).json({ success: false, msg: "User not found, please create an account" })
    if (user.register_provider !== req.body.register_provider) return res.status(409).json({ success: false, msg: `This account is associated with ${user.register_provider}` })
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
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            timezone: user.timezone,
            createdAt: user.createdAt,
            user_agent: user.user_agent,
            last_checkin: user.last_checkin,
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        }, (remember_me && remember_me === true) ? jwtExpiries.extended : jwtExpiries.default);
        delete user.password;

        res.status(200).json({
            success: true,
            msg: "You are Logged in successfully !",
            payload: SignJwt(user)
        })
    }
}, { verify_user: false, validationSchema: loginSchema })


const LoginWithGoogle = async (req, res) => StandardApi(req, res, async () => {
    const { token } = req.body;
    if (!token || token.length < 800) return res.status(400).json({ success: false, msg: "A valid google token as `token` is required." })

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (e) { return res.status(401).json({ success: false, msg: "Invalid token, user unauthorized. Please try logging in again with valid google account." }) }
    const { email } = ticket.getPayload();

    await ConnectDB();
    const currentUserAgent = req.headers['user-agent']
    // const parser = new UAParser(currentUserAgent)
    let user = await User.findOneAndUpdate({ email }, { user_agent: SignJwt(currentUserAgent) }, { new: true, lean: true });
    if (!user) return res.status(404).json({ success: false, msg: "User not found, please signup for a new account." });
    else if (user.two_fa.register_date && user.two_fa.enabled) {
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
        ...(user.role && { role: user.role }),
        ...(user.level && { level: user.level }),
        ...(user.agency && { agency: user.agency }),
        ...(user.account_type && { account_type: user.account_type })
    }, jwtExpiries.default);

    res.status(200).json({
        success: true,
        msg: "You are Resgistered successfully !",
        payload: SignJwt(user)
    })
}, { verify_user: false })

module.exports = { SignUp, SignUpWithGoogle, SignupCallback, Login, LoginWithGoogle };
