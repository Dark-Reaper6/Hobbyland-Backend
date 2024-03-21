const adminRoles = ["administrator", "maintainer", "support"]

const jwtExpiries = {
    default: 7, // 7 days
    extended: 30 // 30 days
}

const userLevels = {
    "0": 500,
    "1": 1000,
    "2": 3200,
    "3": 6400,
    "4": 18000,
    "5": 30000
}

const rewards = {
    dailyCheckinExp: 50,
    streakExp: {
        "7days": 20,
        "30days": 50,
    }
}

const registerProviders = ["hobbyland", "google"];

const userDocsTypes = ['id_card', 'passport', "driver_license", 'other'];

module.exports = {
    rewards,
    adminRoles,
    userLevels,
    jwtExpiries,
    userDocsTypes,
    registerProviders
}