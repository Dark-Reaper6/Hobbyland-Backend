const mongoose = require('mongoose');
const { immutableCondition } = require('../../helpers/database');
const { hashValue } = require("../../helpers/cyphers");

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter a username"],
        maxLength: [30, "Username cannot exceed 30 characters"],
        minLength: [4, "Username should have more than 4 characters"],
        unique: [true, "This username is already in use"],
        immutable: immutableCondition
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email address"],
        unique: [true, "This email address is already in use"],
        immutable: immutableCondition
    },
    role: {
        type: String,
        enum: ["administrator", "maintainer", "support"],
        default: "maintainer",
        immutable: immutableCondition
    },
    profile_image: {
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
        type: String
    },
    two_fa: {
        secret: {
            type: String,
            minLength: 20,
            select: false,
            immutable: immutableCondition
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
    }
}, { timestamps: true });

module.exports = mongoose.model(`Admin`, AdminSchema);