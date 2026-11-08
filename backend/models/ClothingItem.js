
const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema(
    {
        item: {
            type: String,
            required: true
        },
        image: {
    type: String,
    default: ''
},

        type: {
            type: String,
            required: true
        },

        size: {
            type: String,
            required: true
        },

        brand: {
            type: String,
            required: true
        },

        condition: {
            type: String,
            required: true
        },

        swapValue: {
            type: Number,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        availability: {
            type: String,
            default: 'Available'
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
