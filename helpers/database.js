const mongoose = require('mongoose');

const ConnectDB = async () => {
    if (mongoose.connections[0].readyState) return console.log("Success! Connection already exists\n");
    try {
        console.log("Connecting to the database...\n");
        await mongoose.connect(process.env.MONGO_URI + process.env.DB_NAME);
        console.log("✅ Connected to the MongoDB successfully!\n");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
};

const DisconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log(`✅ Mongo DB disconnected.\n`);
        process.exit();
    } catch (error) {
        console.log(`❌ Error disconnecting DB: `, error);
    }
};

const immutableCondition = (doc) => {
    const { immutability } = doc.options;
    return !(immutability && immutability === "disable")
}

module.exports = {
    ConnectDB,
    DisconnectDB,
    immutableCondition
};