const User = require(`../models/user`);
const Notifications = require("../models/notifications");
const StandardApi = require("../middlewares/standard-api");
const { SignJwt } = require("../../helpers/cyphers");
const { userUpdateSchema } = require("../../validation-schemas/user");

const GetMe = async (req, res) => StandardApi(req, res, async () => {
    const user = await User.findById(req.user._id).populate("agency.agency_id").lean();
    res.status(200).json({ success: true, payload: SignJwt(user) })
})

const UpdateUser = async (req, res) => StandardApi(req, res, async () => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, lean: true })
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
    res.status(200).json({ success: true, payload: SignJwt(user) })
}, { validationSchema: userUpdateSchema })

const GetUserNotifications = async (req, res) => StandardApi(req, res, async () => {
    const notificData = await Notifications.find({ user_id: req.user._id }).lean();
    res.status(200).json({ success: true, notifications_data: notificData })
})

module.exports = {
    GetMe,
    UpdateUser,
    GetUserNotifications
}