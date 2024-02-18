const User = require(`../models/user`);
const OTP = require("../models/otp");
const StandardApi = require("../middlewares/standard-api");
const { generateRandomInt, isValidTimeZone, SignJwt, EncryptOrDecryptData } = require("../../helpers/cyphers");
const { z } = require("zod");
// const UAParser = require("ua-parser-js");

const signupSchema = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters long').max(24, 'Username cannot exceed 24 characters').regex(/^[A-Za-z0-9_]+$/, 'Username must contain only letters, numbers, and underscores'),
    firstname: z.string().min(2, 'First Name must be at least 2 characters long').max(28, "maximum 28 characters allowed."),
    lastname: z.string().min(2, 'Last Name must be atleast 2 characters long').max(28, "maximum 28 characters allowed."),
    email: z.string().email('Invalid email format.').min(1, "Email is required"),
    password: z.string().min(8, 'Password must be atleast 8 characters long').max(32, "Password can be at maximum 28 characters long."),
    timezone: z.string().refine(isValidTimeZone, "Invalid timezone"),
    account_type: z.string().refine((value) => ["student", "mentor"].includes(value), "Account type is invalid."),
    accept_policies: z.boolean(),
});
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
        res.cookie('_otp-id', dbOtp._id, {
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



const SignupCallback = async (req, res) => StandardApi(req, res, async () => {
    const { otp } = req.body;
    if (typeof otp !== "number" || otp < 10001) return res.status(401).json({
        success: false,
        msg: "Invalid OTP"
    })
    const { "_otp-id": otp_id } = res.cookies;
    if (!otp_id) return res.status(400).json({ success: false, msg: "Oops! something went wrong, your session doesn't otp id, please retry." })

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
            ...(user.role && { role: user.role }),
            ...(user.level && { level: user.level }),
            ...(user.agency && { agency: user.agency }),
            ...(user.account_type && { account_type: user.account_type })
        });
        res.clearCookie("_otp-id");

        res.status(200).json({
            success: true,
            msg: "You're Resgistered successfully !",
            payload: SignJwt(user),
        })
    }
}, { verify_user: false })

module.exports = { SignUp, SignupCallback };
