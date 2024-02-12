const mongoose = require('mongoose');

const VerificationDocumentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: immutableCondition
    },
    documents: [
        {
            documentType: {
                type: String,
                enum: ['ID Card', 'Passport', "Driver's License", 'Other'],
                required: true,
            },
            documentNumber: {
                type: String,
                required: true,
            },
            issuedBy: {
                type: String,
                required: true,
            },
            issueDate: {
                type: Date,
                required: true,
            },
            expirationDate: {
                type: Date,
            }
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
        immutable: immutableCondition
    },
    verificationDate: {
        type: Date,
        immutable: immutableCondition
    }
});

module.exports = mongoose.model('verification-documents', VerificationDocumentSchema);