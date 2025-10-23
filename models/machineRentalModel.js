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
            required: [true, "Please provide the registration number of the machine"],
            trim: true,
            unique: true,
        },

        machineType: {
            type: String,
            required: [true, "Please specify the type of machine"],
            trim: true,
        },

        machineModel: {
            type: String,
            required: [true, "Please specify the model of the machine"],
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        machineImage: {
            type: String,
            required: [true, "Please provide an image URL for the machine"],
            validate: {
                validator: function (v) {
                    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)$/.test(v);
                },
                message: "Please provide a valid image URL",
            },
        },

        machineParts: {
            type: [String],
            required: [true, "Please provide the parts of the machine"],
            validate: {
                validator: function (v) {
                    return v.length > 0;
                },
                message: "At least one machine part is required",
            },
        },

        machineWorkingArea: {
            type: String,
            required: [true, "Please provide the working area of the machine"],
            trim: true,
        },

        machineWorkingHours: {
            type: Number,
            required: [true, "Please provide the working hours of the machine"],
            min: [1, "Working hours must be greater than zero"],
        },

        rentalPricePerHour: {
            type: Number,
            min: [0, "Rental price per hour must be a positive number"],
            default: 0,
        },

        availabilityStartDate: {
            type: Date,
            default: Date.now,
        },

        availabilityEndDate: {
            type: Date,
        },

        location: {
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true },
            coordinates: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point",
                },
                coordinates: {
                    type: [Number], // [longitude, latitude]
                    index: "2dsphere",
                },
            },
        },

        machineOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Machine owner is required"],
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
                "working",
            ],
            default: "available",
        },
    },
    { timestamps: true }
);

// 🔹 Auto-update status based on availability date
machineRentalSchema.pre("save", function (next) {
    // Only update status if it's currently 'available' or 'idle' to avoid overriding 'rented' or 'maintenance'
    if (this.machineStatus === "available" || this.machineStatus === "idle") {
        if (this.availabilityEndDate && this.availabilityEndDate < new Date()) {
            this.machineStatus = "unavailable";
        }
    }
    next();
});

module.exports = mongoose.model('MachineRental', machineRentalSchema);