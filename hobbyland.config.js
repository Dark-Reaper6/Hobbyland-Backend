const adminRoles = ["administrator", "maintainer", "support"]

const jwtExpiries = {
    default: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    extended: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
}

const registerProviders = ["hobbyland", "google"];

module.exports = {
    adminRoles,
    jwtExpiries,
    registerProviders
}