const mongoose = require('mongoose');
const { immutableCondition } = require('../../helpers/database');

const NotificationsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        immutable: immutableCondition
    },
    notifications: [
        {
            category: {
                type: String,
                default: "account",
                enum: ["account", "primary"]
            },
            title: {
                type: String,
                required: true
            },
            mini_msg: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            },
            href: String,
            seen: {
                type: Boolean,
                default: false
            },
            timestamp: Date
        }
    ]
}, { timestamps: true })

module.export = mongoose.model("Notifications", NotificationsSchema)