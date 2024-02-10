const mongoose = require('mongoose');
const hashValue = require('.../helpers/cyphers')

const UserSchema = new mongoose.model({
    username: {
        type: String,
        required: [true, "Please enter a username"],
        maxLength: [30, "Username cannot exceed 30 characters"],
        minLength: [4, "Username should have more than 4 characters"],
        unique: [true, "This username is already in use"]
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email address"],
        unique: [true, "This email address is already in use"],
    },
    register_provider: {
        type: String,
        enum: ["hobbyland", "google"],
        default: "hobbyland"
    },
    phone_number: {
        prefix: String,
        suffix: String
    },
    country: String,
    profile_image: {
        type: String
    },
    banner_image: {
        type: String
    },
    password: {
        type: String,
        minLength: [8, "Password should be greater than 8 characters"],
        set: hashValue,
        immutable: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    account_type: {
        type: String,
        enum: ["student", "mentor", "agency"],
        default: "student"
    },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    level: Number,
    two_fa: {
        secret: {
            type: String,
            minLength: 20,
            select: false
        },
        activation_date: Date,
        enabled: {
            type: Boolean,
            default: false
        }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_checkin: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);