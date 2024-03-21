const Service = require(`../../models/service`);
const { serviceSchema } = require("../../../validation-schemas/user");
const StandardApi = require("../../middlewares/standard-api");

const CreateService = async (req, res) => StandardApi(req, res, async () => {
    const service = (await Service.create({ ...req.body, user_id: req.user._id })).toObject();
    res.status(201).json({
        success: true,
        service,
        msg: "Your sevice created successfully."
    })
}, { validationSchema: serviceSchema })

module.exports = {
    CreateService,
}