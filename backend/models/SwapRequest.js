
const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        offeredItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClothingItem',
            required: true
        },

        requestedItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClothingItem',
            required: true
        },

        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
