const { z } = require("zod");
const { userDocsTypes } = require("../hobbyland.config")

const userUpdateSchema = z.object({
    firstname: z.string({ required_error: "Firsname is required" }).min(2, 'First Name must be at least 2 characters long').max(28, "maximum 28 characters allowed."),
    lastname: z.string({ required_error: "Lastname is required" }).min(2, 'Last Name must be atleast 2 characters long').max(28, "maximum 28 characters allowed."),
    phone_number: z.object({
        prefix: z.string(),
        suffix: z.string()
    }),
    profile_image: z.string(),
    banner_image: z.string(),
    gender: z.string(),
    social_links: z.array(z.object({
        name: z.string(),
        link: z.string()
    }))
});

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

const serviceSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    portfolio: z.array(z.object({
        media_url: z.string().url(),
        description: z.string().optional()
    })),
    category: z.string(),
    tags: z.array(z.string()).optional,
    pricing: z.array(z.object({
        plan: z.string(),
        title: z.string(),
        description: z.string().optional(),
        price: z.number(),
        delivery_time: z.string(),
        features: z.array(z.string()),
    })),
    delivery_methods: z.array(z.string()),
    FAQ: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })).optional(),
})

module.exports = {
    serviceSchema,
    userUpdateSchema,
    verificationDocsSchema
}