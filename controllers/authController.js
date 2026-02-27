const supabase = require('../utils/supabaseClient');
const User = require('../models/authModel');
const generateToken = require('../utils/generateToken');
const twilio = require('twilio');

// Register with mongoDB
const registerUser = async (req, res) => {
    try {
        const {
            userMode,
            email,
            password,
            username,
            MobileNum,
            profilePicture,
            address,
            longitude,
            latitude
        } = req.body;

        if (!username || !email || !password || !MobileNum) {
            return res.status(400).json({
                message: 'Missing required fields: username, email, password, and MobileNum are mandatory.'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { MobileNum }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email)
                return res.status(400).json({ message: 'Email already exists' });

            if (existingUser.MobileNum === MobileNum)
                return res.status(400).json({ message: 'Mobile number already exists' });

            if (existingUser.username === username)
                return res.status(400).json({ message: 'Username already exists' });
        }

        // ✅ Proper GeoJSON Location Handling
        let userData = {
            userMode,
            username,
            email,
            MobileNum,
            password,
            profilePicture,
            address: address ? [address] : []
        };

        if (
            longitude !== undefined &&
            latitude !== undefined &&
            !isNaN(longitude) &&
            !isNaN(latitude)
        ) {
            userData.location = {
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ]
            };
        }

        const newUser = await User.create(userData);

        res.status(201).json({
            user: newUser,
            message: 'User registered successfully. 🎉',
        });

    } catch (err) {
        console.error("Mongo Registration Error:", err);
        res.status(500).json({
            message: 'Internal server error.',
            error: err.message
        });
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
                userMode: user.userMode,
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

//  changeUserType
const changeUserType = async (req, res) => {
    try {
        const { password, newMode, userId } = req.body;

        // 1. Validate Input
        const allowedModes = ['farmer', 'servicer', 'worker'];
        if (!allowedModes.includes(newMode)) {
            return res.status(400).json({ message: "Invalid user mode selected." });
        }

        // 2. Find User (ensure password is selected for comparison)
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 3. Verify Password using your model's existing method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password. Mode change denied." });
        }

        // 4. Update User Type (ensure field name matches your Schema, e.g., 'userMode')
        user.userMode = newMode;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User mode updated to ${newMode} successfully.`,
            userMode: user.userMode
        });

    } catch (error) {
        console.error("Change Mode Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// changePassword
const changePassword = async (req, res) => {
    try {
        // 404 Fix: Ensure we are checking params, then user object, then body
        const userId = req.params.id || req.body.id;

        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // 1️⃣ Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 2️⃣ Check new password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // 3️⃣ Find user
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: "User not found in database." });
        }

        // 4️⃣ Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // 5️⃣ Update and save
        user.password = newPassword; 
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully. 🎉"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

//getWorkers

const getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ userMode: 'worker' });
        res.status(200).json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching workers' });
    }
};

module.exports = { registerUser, loginUser, changeUserType, changePassword, loginWithOTP, getUserByID, getAllUsers, deleteUser, updateUser, getWorkers };