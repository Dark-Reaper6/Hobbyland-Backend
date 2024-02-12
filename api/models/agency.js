const mongoose = require('mongoose');
const { immutableCondition } = require('../../helpers/database');

const AgencySchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        immutable: immutableCondition
    },
    name: {
        type: String,
        required: [true, "Please enter an agency name"],
        maxLength: [30, "Username cannot exceed 30 characters"],
        minLength: [4, "Username should have more than 4 characters"],
        unique: [true, "This username is already in use"]
    },
    biography: {
        headline: String,
        about: String,
        tags: [String],
        skills: [
            { title: String, description: String }
        ],
        locations: [
            { title: String, meta: String }
        ]
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email address"],
        unique: [true, "This email address is already in use"],
    },
    phone_number: {
        prefix: String,
        suffix: String
    },
    profile_image: {
        type: String
    },
    banner_image: {
        type: String
    },
    members: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            permissions: [],
            role: {
                type: String,
                required: true
            }
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

module.exports = mongoose.model("Agency", AgencySchema);