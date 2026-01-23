const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    MachineRentalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MachineRental',
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true });

likeSchema.index({ MachineRentalId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);