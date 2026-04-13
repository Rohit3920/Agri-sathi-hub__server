const generateToken = require('../utils/generateToken');

// Login with MongoDB
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {

        const adminUser = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (email === adminUser && password === adminPassword) { 
            res.status(200).json({
                message: 'Logged in successfully!',
                token: generateToken(adminUser)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (email or password)' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { loginAdmin };