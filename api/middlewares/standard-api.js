const User = require("../models/user");
const { isValidObjectId } = require("mongoose");
const { sendAdminNotification } = require("../../helpers/send-notification");
const { verify, decode } = require("jsonwebtoken");
const { parse } = require("cookie");
const { adminRoles } = require("../../hobbyland.config");

export default async function StandardApi(req, res, next, options = { verify_user: true, verify_admin: false }) {
    try {
        if (options.verify_user || options.verify_admin) try {
            const { "session-token": sessionToken } = parse(req.headers.cookie || '')
            if (!sessionToken) return res.status(401).json("invalid session token");
            const decodedToken = verify(sessionToken, process.env.APP_SECRET_KEY);
            if (!isValidObjectId(decodedToken._id)) throw new Error("invalid session token");
            if (decode(decodedToken.user_agent) !== req.headers['user-agent']) throw new Error("invalid session token");
            if (options.verify_admin) {
                await ConnectDB()
                let admin = await User.findById(admin_id)
                if (!admin || !adminRoles.includes(admin.role)) throw new Error("invalid session token");
            }
            req.user = decodedToken;
            await next()
        } catch (error) {
            console.log(error)
            return res.status(401).json({ success: false, error, msg: "Your session is invalid or expired. Please sign in again." })
        }
        else await next()

    } catch (error) {
        console.log(error);
        sendAdminNotification()
        return res.status(500).json({ success: false, msg: "Internal Server Error occurred, please try again in a while.", error })
    }
}