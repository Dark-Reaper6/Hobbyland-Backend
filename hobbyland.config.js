const adminRoles = ["administrator", "maintainer", "support"]

const jwtExpiries = {
    default: 7, // 7 days
    extended: 30 // 30 days
}

const registerProviders = ["hobbyland", "google"];

const userDocsTypes = ['id_card', 'passport', "driver_license", 'other'];

module.exports = {
    adminRoles,
    jwtExpiries,
    userDocsTypes,
    registerProviders
}