const express = require('express');
const { registerUser, loginUser, loginWithOTP, getUserByID, getAllUsers, deleteUser, updateUser, getWorkers } = require('../controllers/authController');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/get-user/:id', getUserByID);
router.get('/get-all-users', getAllUsers);
router.delete('/delete-user/:id', deleteUser);
router.put('/update-user/:id', updateUser);

router.get('/get-worker', getWorkers);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);


module.exports = router;