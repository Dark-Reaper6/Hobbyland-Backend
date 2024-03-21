const mongoose = require('mongoose');
const { userDocsTypes, docsVerificStatuses } = require("../../hobbyland.config");
const { immutableCondition } = require('../../helpers/database');

const VerificationDocumentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: immutableCondition
    },
    documents: [
        {
            document_type: {
                type: String,
                enum: userDocsTypes,
                required: true
            },
            document_number: {
                type: String,
                required: true
            },
            document_name: {
                type: String,
                required: true
            },
            issued_by: {
                type: String,
                required: true
            },
            issue_date: {
                type: Date,
                required: true
            },
            front_image: {
                type: String,
                required: true
            },
            back_image: {
                type: String,
                required: true
            },
            additional_details: String,
            expiration_date: Date
        }
    ],
    verification_status: {
        type: String,
        enum: docsVerificStatuses,
        default: docsVerificStatuses[0],
        immutable: immutableCondition
    },
    rejection: {
        rejected: Boolean,
        reason: String
    },
    verification_date: {
        type: Date,
        immutable: immutableCondition
    }
});

module.exports = mongoose.model('verification-documents', VerificationDocumentSchema);