const mongoose = require('mongoose');

const RatingsScehma = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        immutable: immutableCondition
    },
    ratings: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                enum: [1, 2, 3, 4, 5],
                required: true
            },
            review: String
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model("Ratings", RatingsScehma);