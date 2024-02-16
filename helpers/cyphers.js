const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken");
const { jwtExpiries } = require("../hobbyland.config");
const isProdEnv = process.env.DEVELOPMENT_ENV === "PRODUCTION";

const generateRandomInt = (from, to) => Math.floor(Math.random() * (to - from + 1)) + from;
const SignJwt = (data, expiry) => jwt.sign(data, process.env.APP_SECRET_KEY, expiry ? { expiresIn: expiry } : {});
const DeleteCookie = (name) => document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
const getDateOfTimezone = (timeZone) => new Date(new Date().toLocaleDateString('en-US', { timeZone }));
const hashValue = (value = "hobbyland@2024") => CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);

const isValidTimeZone = (timeZone) => {
    try {
        new Date().toLocaleString('en', { timeZone });
        return true;
    } catch (error) { return false }
}

const EncryptOrDecryptData = (data, encrypt = true) => {
    if (typeof data !== "string") throw new Error("Encryption error: The data must be of type string.")
    if (encrypt) return CryptoJS.AES.encrypt(data, process.env.APP_SECRET_KEY).toString()
    else return CryptoJS.AES.decrypt(data, process.env.APP_SECRET_KEY).toString(CryptoJS.enc.Utf8)
}

const SetSessionCookie = (req, res, sessionData, expiresAt = jwtExpiries.default) => {
    res.cookie('session-token', SignJwt(sessionData, expiresAt), {
        httpOnly: true,
        sameSite: isProdEnv ? "none" : "lax",
        priority: "high",
        path: "/",
        secure: isProdEnv,
        maxAge: expiresAt
    })
    res.cookie('is_logged_in', true, {
        httpOnly: false,
        sameSite: isProdEnv ? "none" : "lax",
        priority: "high",
        path: "/",
        secure: isProdEnv,
        maxAge: expiresAt
    })
}

const RemoveSessionCookie = (res) => {
    const sessionTokenCookie = serialize('session-token', "null", {
        httpOnly: true,
        sameSite: isProdEnv ? "none" : "lax",
        path: "/",
        secure: isProdEnv,
        maxAge: 0
    })
    const isLoggedInCookie = serialize('is_logged_in', false, {
        httpOnly: false,
        sameSite: isProdEnv ? "none" : "lax",
        path: "/",
        secure: isProdEnv,
        maxAge: 0
    })
    res.setHeader('Set-Cookie', [sessionTokenCookie, isLoggedInCookie])
}

module.exports = {
    hashValue,
    generateRandomInt,
    DeleteCookie,
    getDateOfTimezone,
    isValidTimeZone,
    EncryptOrDecryptData,
    SetSessionCookie,
    RemoveSessionCookie
}