const tClient = require("../utils/twilio");
const OtpModel = require("../models/otpModel");

// Send OTP
exports.sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        // Save request to MongoDB (optional)
        await OtpModel.create({ phoneNumber });

        // Send OTP via Twilio Verify Service
        const verification = await tClient.verify.v2
            .services("VA05d526b4f541b9f168a7bacbbde4b732")
            .verifications.create({ to: phoneNumber, channel: "sms" });

        res.status(200).json({
            success: true,
            message: "OTP sent successfully!",
            sid: verification.sid,
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { phoneNumber, userOTP } = req.body;

    try {
        const verificationCheck = await tClient.verify.v2
            .services("VA05d526b4f541b9f168a7bacbbde4b732")
            .verificationChecks.create({ to: phoneNumber, code: userOTP });

        if (verificationCheck.status === "approved") {
            res.status(200).json({ success: true, message: "OTP verified successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, error: "Verification failed" });
    }
};


// OTP controller are use in userRoutes.js

