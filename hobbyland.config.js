const adminRoles = ["administrator", "maintainer", "support"]

export const jwtExpiries = {
    default: 7, // 7 days
    extended: 30 // 30 days
}

const registerProviders = ["hobbyland", "google"];

module.exports = {
    adminRoles,
    jwtExpiries,
    registerProviders
}