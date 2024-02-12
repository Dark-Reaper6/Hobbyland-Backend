const User = require(`../models/user`);
const jwt = require(`jsonwebtoken`);

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({
            hasError: true,
            message: "Email and Password are required."
        })

        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({
            hasError: true,
            message: `Requested email does not exist.`,
        });
        const payload = structuredClone({ ...user._doc, _id: user._doc._id.toString(), password: undefined })
        if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({
            hasError: true,
            message: "Your password is incorrect"
        });
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
        return res.status(200).json({
            message: "You are signed in successfully.",
            token
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            hasError: true,
            error,
            message: "Internal server error occurred, please retry later."
        });
    }
};


const signup = async (req, res) => {
    const createUser = new User(req.body);
    await createUser.save().then((result) => {
        console.log(result)
    }).catch((err) => console.log(err))
}
// exporting user controllers as modules
module.exports = { login, signup };
