const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const addressSchema = new mongoose.Schema({
    street: { type: String },
    subDistrict: { type: String },
    district: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    addressType: {
        type: String,
        enum: ['Permanent', 'Current']
    }
});

const UserSchema = new mongoose.Schema(
    {
        userMode: {
            type: String,
            enum: ['farmer', 'servicer', 'worker'],
            required: [true, "Please specify user mode"]
        },

        username: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Please add a username"]
        },

        profilePicture: {
            type: String,
            default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        },

        email: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Please add an email"],
            match: [/^.+@.+\..+$/, "Please enter a valid email"]
        },

        verified: Boolean,

        MobileNum: {
            type: Number,
            unique: true,
            required: [true, "Please add a mobile number"],
            minlength: [10, "Mobile number must be at least 10 characters long"],
            maxlength: [15, "Mobile number must be at most 15 characters long"]
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: [6, "Password must be at least 6 characters long"],
            select: false
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        address: [addressSchema],

        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);


UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);