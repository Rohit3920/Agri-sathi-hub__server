const supabase = require('../utils/supabaseClient');
const twilio = require('twilio');

// Register with Supabase
const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Supabase signup
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }, // metadata
            },
        });

        if (error) return res.status(400).json({ message: error.message });

        res.status(201).json({
            user: data.user,
            message: 'User registered via Supabase!',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};


// Login with Supabase
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.status(401).json({ message: error.message });

        res.status(200).json({
            user: data.user,
            session: data.session, // contains access_token & refresh_token
            message: 'Logged in via Supabase!',
        });
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


module.exports = { registerUser, loginUser, loginWithOTP };
