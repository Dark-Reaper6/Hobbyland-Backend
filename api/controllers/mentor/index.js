const User = require(`../../models/user`);
const VerificDocs = require(`../../models/verfication-documents`);
const StandardApi = require("../../middlewares/standard-api");
const { verificationDocsSchema } = require("../../../validation-schemas/user");
// const { SignJwt } = require("../../helpers/cyphers");

const SubmitDocs = async (req, res) => StandardApi(req, res, async () => {
    const user_id = req.user._id;
    const verificDocs = (await VerificDocs.create({ ...req.body, user_id })).toObject();

    res.status(201).json({
        success: true,
        documents: verificDocs,
        msg: "Documents submitted for review, please wait for approval."
    })
}, { validationSchema: verificationDocsSchema })

module.exports = {
    SubmitDocs,
}