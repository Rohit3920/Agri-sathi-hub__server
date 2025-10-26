const jwt = require('jsonwebtoken');
const User = require('../models/authModel');
const supabase = require('../utils/supabaseClient');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.user;

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) return res.status(401).json({ message: 'Invalid token' });
        req.user = data.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};


// const authenticate = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) return res.status(401).json({ message: 'No token provided' });

//         const { data, error } = await supabase.auth.getUser(token);

//         if (error || !data.user) return res.status(401).json({ message: 'Invalid token' });

//         req.user = data.user;
//         next();
//     } catch (err) {
//         res.status(500).json({ message: 'Auth check failed' });
//     }
// };

// module.exports = authenticate;
