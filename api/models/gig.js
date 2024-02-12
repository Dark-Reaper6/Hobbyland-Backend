const mongoose = require('mongoose');
const { immutableCondition } = require('../../helpers/database');

const GigSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    portfolio: [
        {
            media_url: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            }
        }
    ],
    category: {
        type: String,
        required: true,
    },
    tags: [
        { type: String }
    ],
    pricing: [
        {
            plan: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            delivery_time: {
                type: Number,
                required: true
            },
            features: [
                { type: String }
            ]
        }
    ],
    delivery_methods: [
        { type: String }
    ],
    FAQ: [
        {
            question: {
                type: String,
                required: true,
            },
            answer: {
                type: String,
                required: true,
            }
        }
    ]
});

module.exports = mongoose.model('Gig', GigSchema);