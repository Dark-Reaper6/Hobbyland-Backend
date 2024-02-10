const CryptoJS = require("crypto-js")

const hashValue = (value = "hobbyland@2024") => {
    const hashed = CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex)
    return hashed
}

module.exports = {
    hashValue
}