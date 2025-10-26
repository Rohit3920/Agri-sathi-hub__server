const express = require('express');
const { registerUser, loginUser, getUserById, getUsersByUserMode, updateUser, deleteUser } = require('../controllers/authController');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

router.get('/get-user/:id', getUserById);
router.get('/get-users', getUsersByUserMode);
router.put('/update-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser);


module.exports = router;