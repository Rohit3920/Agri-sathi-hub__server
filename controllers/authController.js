const supabase = require('../utils/supabaseClient');
const User = require('../models/authModel');
const twilio = require('twilio');
const generateToken = require('../utils/generateToken');

// Register with Supabase
const registerUser = async (req, res) => {
    try {
        const { email, password, username, MobileNum, profilePicture, address, UserMode } = req.body;
        console.log("Request Body:", req.body);

        if (!username || !email || !password || !MobileNum) {
            return res.status(400).json({ message: 'Missing required fields: username, email, password, MobileNum, and UserMode are mandatory.' });
        }

        const newUser = await User.create({
            UserMode : 'farmer',
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


// Login with Supabase
const loginUser = async (req, res) => {
    // const { email, password } = req.body;

    // if (!email || !password) {
    //     return res.status(400).json({ message: 'Please enter all fields' });
    // }

    // try {
    //     const { data, error } = await supabase.auth.signInWithPassword({
    //         email,
    //         password,
    //     });

    //     if (error) return res.status(401).json({ message: error.message });

    //     res.status(200).json({
    //         user: data.user,
    //         session: data.session, // contains access_token & refresh_token
    //         message: 'Logged in via Supabase!',
    //     });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: 'Server error during login' });
    // }


    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            res.status(200).json({
                user: user,
                token: generateToken(user._id),
                message: 'Logged in successfully!'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (email or password)' });
        }
    } catch (error) {
        console.error(error);
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

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
}

// getUsersByUserMode
const getUsersByUserMode = async (req, res) => {
    try {
        const UserMode = req.body.UserMode;
        if (!UserMode) {
            return res.status(400).json({ message: 'User mode query parameter is required' });
        }

        const users = await User.find({ UserMode });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
};

// updateUser
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("Update Request Body:", req.body);  
        const updates = req.body;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
};

// deleteUser
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
};

module.exports = { registerUser, loginUser, loginWithOTP, getUserById, getUsersByUserMode, updateUser, deleteUser };
