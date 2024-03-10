const { z } = require("zod");
const { userDocsTypes } = require("../hobbyland.config")

const adminLoginSchema = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters long').max(24, 'Username cannot exceed 24 characters').regex(/^[A-Za-z0-9_]+$/, 'Username must contain only letters, numbers, and underscores').optional(),
    email: z.string().email('Invalid email format.').optional(),
    password: z.string({ required_error: "Password is required" }).min(8, 'Password must be atleast 8 characters long').max(32, "Password can be at maximum 28 characters long."),
}).refine(({ username, email }) => (username && !email) || (email && !username), "Username or Email is required.")

const verificationDocsSchema = z.object({
    documents: z.array(z.object({
        document_type: z.string({ required_error: "Document Type is required" }).refine(value => userDocsTypes.includes(value), "Invalid document type."),
        document_number: z.number({ required_error: "Document Number is required" }),
        document_name: z.string({ required_error: "Document Name is required" }).min(2),
        issued_by: z.string({ required_error: "Issuer is required" }),
        issue_date: z.string({ required_error: "Issue Date is required" }),
        front_image: z.string({ required_error: "Front Image is required" }).url("Front Image must be a valid URL"),
        back_image: z.string({ required_error: "Back Image is required" }).url("Back Image must be a valid URL"),
        additional_details: z.string().optional(),
        expiration_date: z.string().optional()
    })),
    is_verified: z.boolean(),
    verification_date: z.string()
})

module.exports = {
    adminLoginSchema,
}