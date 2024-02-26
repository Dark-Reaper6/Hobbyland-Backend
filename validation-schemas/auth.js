const { z } = require("zod");
const { isValidTimeZone } = require("../helpers/cyphers");
const { registerProviders } = require("../hobbyland.config")

const signupSchema = z.object({
    username: z.string({ required_error: "Username is required" }).min(5, 'Username must be at least 5 characters long').max(24, 'Username cannot exceed 24 characters').regex(/^[A-Za-z0-9_]+$/, 'Username must contain only letters, numbers, and underscores'),
    firstname: z.string({ required_error: "Firsname is required" }).min(2, 'First Name must be at least 2 characters long').max(28, "maximum 28 characters allowed."),
    lastname: z.string({ required_error: "Lastname is required" }).min(2, 'Last Name must be atleast 2 characters long').max(28, "maximum 28 characters allowed."),
    email: z.string({ required_error: "Email is required" }).email('Invalid email format.').min(1, "Email is required"),
    password: z.string({ required_error: "Password is required" }).min(8, 'Password must be atleast 8 characters long').max(32, "Password can be at maximum 28 characters long."),
    timezone: z.string({ required_error: "User Timezone is required" }).refine(isValidTimeZone, "Invalid timezone"),
    register_provider: z.string().refine(value => registerProviders.includes(value), "Invalid register provider.").optional(),
    account_type: z.string({ required_error: "Account type is required" }).refine((value) => ["student", "mentor"].includes(value), "Account type is invalid."),
    accept_policies: z.boolean({ required_error: "User must accept the policies and terms of use." }),
});
const loginSchema = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters long').max(24, 'Username cannot exceed 24 characters').regex(/^[A-Za-z0-9_]+$/, 'Username must contain only letters, numbers, and underscores').optional(),
    email: z.string().email('Invalid email format.').optional(),
    register_provider: z.string({ required_error: "Register Provider is required" }).refine(value => registerProviders.includes(value), "Invalid register provider."),
    password: z.string({ required_error: "Password is required" }).min(8, 'Password must be atleast 8 characters long').max(32, "Password can be at maximum 28 characters long."),
    remember_me: z.boolean().optional()
}).refine(({ username, email }) => (username && !email) || (email && !username), "Username or Email is required.")
const googleSignupSchema = z.object({
    token: z.string({ required_error: "Google token is required" }).min(800, "Token must be valid"),
    timezone: z.string({ required_error: "User Timezone is required" }).refine(isValidTimeZone, "Invalid timezone"),
    account_type: z.boolean().optional()
}).refine(({ username, email }) => (username && !email) || (email && !username), "Username or Email is required.")
const forgotPasswordSchema = z.object({
    username: z.string().min(5, 'Username must be at least 5 characters long').max(24, 'Username cannot exceed 24 characters').regex(/^[A-Za-z0-9_]+$/, 'Username must contain only letters, numbers, and underscores').optional(),
    email: z.string().email('Invalid email format.').optional(),
    password: z.string({ required_error: "Password is required" }).min(8, 'Password must be atleast 8 characters long').max(32, "Password can be at maximum 28 characters long."),
}).refine(({ username, email }) => (username && !email) || (email && !username), "Username or Email is required.")

module.exports = { signupSchema, loginSchema, googleSignupSchema, forgotPasswordSchema }