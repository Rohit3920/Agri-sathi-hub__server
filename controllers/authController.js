const supabase = require('../utils/supabaseClient');
const User = require('../models/authModel');
const generateToken = require('../utils/generateToken');
const twilio = require('twilio');

// Register with mongoDB
const registerUser = async (req, res) => {
    try {
        const { userMode, email, password, username, MobileNum, profilePicture, address } = req.body;
        console.log("Request Body:", req.body);

        if (!username || !email || !password || !MobileNum) {
            return res.status(400).json({ message: 'Missing required fields: username, email, password, and MobileNum are mandatory.' });
        }

const existingUser = await User.findOne({
    $or: [
        { email },
        { MobileNum },
        { username }
    ]
});

if (existingUser) {
    if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    if (existingUser.MobileNum === MobileNum) {
        return res.status(400).json({ message: 'Mobile number already exists' });
    }
    if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
    }
}

        const newUser = await User.create({
            userMode,
            username,
            email,
            MobileNum,
            password,
            address: [address]
        });

        res.status(201).json({
            user: newUser,
            message: 'User registered successfully and data stored in MongoDB. 🎉',
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error during registration.', error: err.message });
        console.log(err);
    }
};


// Login with MongoDB
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
                    res.status(200).json({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        token: generateToken(user._id),
                        message: 'Logged in successfully!'
                    });
                } else {
                    res.status(401).json({ message: 'Invalid credentials (email or password)' });
                }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// login with OTP (Twilio)
const loginWithOTP = async (req, res) => {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // app.post("/send-otp", async () => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "Mobile number required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobile}`, // change country code as needed
        });

        console.log("OTP sent:", otp);
        res.json({ success: true, otp }); // send OTP back for demo, remove in production
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
}


// getUserByID
const getUserByID = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching user' });
    }
};


// getAllUsers
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

// deleteUser
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};


// updateUser
const updateUser = async (req, res) => {
    const userId = req.params.id;
    const updates = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating user' });
    }
};

module.exports = { registerUser, loginUser, loginWithOTP, getUserByID, getAllUsers, deleteUser, updateUser };