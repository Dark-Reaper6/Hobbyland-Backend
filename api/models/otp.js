const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        immutable: true
    },
    otp: {
        type: String,
        required: true,
        immutable: true
    },
    new_email: {
        type: String,
        immutable: true
    },
    new_password: {
        type: String,
        immutable: true
    },
    email: {
        type: String,
        immutable: true
    },
    new_user: {
        type: Object,
        immutable: true
    },
    expiresAt: {
        type: Date,
        default: new Date(new Date().setTime(new Date().getTime() + (5 * 60 * 1000)))
    }
}, { strict: false, timestamps: true })

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", OTPSchema)