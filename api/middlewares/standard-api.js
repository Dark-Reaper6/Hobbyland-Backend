const User = require("../models/user");
const { isValidObjectId } = require("mongoose");
const { sendAdminNotification } = require("../../helpers/send-notification");
const { verify, decode } = require("jsonwebtoken");
const { adminRoles } = require("../../hobbyland.config");

module.exports = async function StandardApi(req, res, next, options = { verify_user: true, verify_admin: false, validationSchema: null }) {

    const callNextHandler = async () => {
        const { validationSchema } = options;
        if (validationSchema) {
            try {
                const parsedData = validationSchema.parse(req.body);
                req.body = parsedData;
                return next;
            } catch (error) {
                res.status(400).json({ success: false, error: error.issues, msg: "Validation failed." });
            }
        } else return next;
    }

    try {
        if (options.verify_user || options.verify_admin) try {
            // Authorizing the request.
            const { "session-token": sessionToken } = req.cookies;
            if (!sessionToken) throw new Error("invalid session token");
            const decodedToken = verify(sessionToken, process.env.APP_SECRET_KEY);
            if (!isValidObjectId(decodedToken._id)) throw new Error("invalid session token");
            // if (decode(decodedToken.user_agent) !== req.headers['user-agent']) throw new Error("invalid session token");
            if (options.verify_admin) {
                let admin = await User.findById(admin_id);
                if (!admin || !adminRoles.includes(admin.role)) throw new Error("invalid session token");
            }
            req.user = decodedToken;

            await (await callNextHandler())()
        } catch (error) {
            console.log(error)
            return res.status(401).json({ success: false, error_code: process.env.APP_CODE + 401, error, msg: "Your session is invalid or expired. Please sign in again." })
        }
        else await (await callNextHandler())()

    } catch (error) {
        console.log(error);
        sendAdminNotification()
        return res.status(500).json({ success: false, msg: "Internal Server Error occurred, please try again in a while.", error })
    }
}