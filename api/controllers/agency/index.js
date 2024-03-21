const Agency = require("../../models/agency");
const User = require("../../models/user");
const StandardApi = require("../../middlewares/standard-api");
const { SetSessionCookie, SignJwt } = require("../../../helpers/cyphers");

const CreateAgencyByCriteria = async (req, res) => StandardApi(req, res, async () => {

    let user = await User.findById(req.user._id);
    if (!user?.account_type === "mentor") return res.status(401).json({ success: false, msg: "User not eligible for agency account." })

    const agency = (await Agency.create({ owner_id: user._id })).toObject();
    user = await User.findByIdAndUpdate(user._id, {
        agency: {
            agency_id: agency._id,
            role: "owner"
        }
    }, { new: true, lean: true });

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
    }, req.user.exp);

    res.status(201).json({
        success: true,
        payload: SignJwt(user),
        msg: "Your sevice created successfully."
    })

})

module.exports = {
    CreateAgencyByCriteria,
}