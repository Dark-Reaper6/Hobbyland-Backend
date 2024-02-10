const { sendAdminNotification } = require(".../helpers/send-notificaion");
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { adminRoles } = require(".../hobbyland.config.js")

async function StandardApi(req, res, { verify_user = true, verify_admin = false }, next) {

    if (verify_user || verify_admin) try {
        const { auth_token } = req.cookies;
        if (!auth_token) return res.status(401).json({ success: false, msg: "Your session has expired, please login again." })
        const decodedToken = jwt.verify(auth_token, process.env.APP_SECRET_KEY);
        if (!mongoose.Types.ObjectId.isValid(decodedToken._id)) throw new Error("Invalid authentication token.");
        if (verify_admin && !adminRoles.includes(decodedToken.role)) throw new Error("Invalid authentication token.");
        req.user_id = decodedToken._id
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, msg: "Invalid authentication token." })
    }

    try { await next() }
    catch (error) {
        console.log(error);
        await sendAdminNotification()
        return res.status(500).json({ success: false, msg: "Internal Server Error occurred, please try again in a while.", error })
    }
}
module.exports = StandardApi