const mongoose = require("mongoose");

const machineRentalSchema = new mongoose.Schema(
{
    machineName: {
        type: String,
        required: [true, "Please provide the name of the machine"],
        trim: true,
        index: true
    },

    machineRegistationNumber: {
        type: String,
        required: [true, "Please provide the registration number"],
        trim: true,
        unique: true,
    },

    machineType: {
        type: String,
        required: true,
        trim: true,
    },

    machineModel: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        maxlength: 500,
    },

    machineImage: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)$/.test(v);
            },
            message: "Invalid image URL"
        }
    },

    machineParts: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: "At least one part required"
        }
    },

    machineWorkingArea: {
        type: String,
        required: true,
    },

    machineWorkingHours: {
        type: Number,
        required: true,
        min: 1
    },

    rentalPricePerHour: {
        type: Number,
        default: 0,
        min: 0
    },

    availabilityStartDate: {
        type: Date,
        default: Date.now
    },

    availabilityEndDate: {
        type: Date
    },

    // ✅ PROPER LOCATION STRUCTURE
    location: {
        city: String,
        state: String,
        country: { type: String, default: "INDIA" },
        geo: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },

    machineOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    machineStatus: {
        type: String,
        enum: [
            "available",
            "unavailable",
            "rented",
            "under_maintenance",
            "idle",
            "reserved",
            "out_of_service",
            "working"
        ],
        default: "available"
    }

}, { timestamps: true });


// ✅ Geo Index
machineRentalSchema.index({ "location.geo": "2dsphere" });


// ✅ Auto status update
machineRentalSchema.pre("save", function (next) {
    if (this.machineStatus === "available" || this.machineStatus === "idle") {
        if (this.availabilityEndDate && this.availabilityEndDate < new Date()) {
            this.machineStatus = "unavailable";
        }
    }
    next();
});

module.exports = mongoose.model("MachineRental", machineRentalSchema);