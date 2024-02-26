const { z } = require("zod");

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

module.exports = {
    userUpdateSchema
}