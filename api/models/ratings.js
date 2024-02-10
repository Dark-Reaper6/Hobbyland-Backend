const mongoose = require('mongoose');

const RatingsScehma = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ratings: [
        {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            rating: {type: Number, required: true},
            review: String
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model("Ratings", RatingsScehma);