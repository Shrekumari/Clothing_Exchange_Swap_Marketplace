
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ClothingItem = require('../models/ClothingItem');

const router = express.Router();

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    }
});

// Accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Add a clothing item with image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const {
            item,
            type,
            size,
            brand,
            condition,
            swapValue,
            location,
            owner
        } = req.body;

        if (
            !item || !type || !size || !brand ||
            !condition || swapValue === undefined ||
            !location || !owner
        ) {
            if (req.file) fs.unlinkSync(req.file.path);

            return res.status(400).json({
                message: 'Please provide all required clothing details'
            });
        }

        const clothingItem = await ClothingItem.create({
            item,
            type,
            size,
            brand,
            condition,
            swapValue: Number(swapValue),
            location,
            owner,
            image: req.file ? `/uploads/${req.file.filename}` : ''
        });

        res.status(201).json({
            message: 'Clothing item listed successfully',
            clothingItem
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: 'Failed to add clothing item',
            error: error.message
        });
    }
});

// Get all clothing items
router.get('/', async (req, res) => {
    try {
        const clothingItems = await ClothingItem.find();

        res.status(200).json(clothingItems);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch clothing items',
            error: error.message
        });
    }
});

// Get clothing items belonging to a particular user
router.get('/my-listings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const clothingItems = await ClothingItem.find({
            owner: userId
        });

        res.status(200).json(clothingItems);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch your listings',
            error: error.message
        });
    }
});

// Delete a clothing item belonging to the user
router.delete('/:itemId/:userId', async (req, res) => {
    try {
        const { itemId, userId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(itemId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                message: 'Invalid item ID or user ID'
            });
        }

        const clothingItem = await ClothingItem.findOne({
            _id: itemId,
            owner: userId
        });

        if (!clothingItem) {
            return res.status(404).json({
                message: 'Listing not found or you are not the owner'
            });
        }

        if (clothingItem.availability === 'Swapped') {
            return res.status(400).json({
                message: 'Swapped items cannot be deleted'
            });
        }

        await ClothingItem.findByIdAndDelete(itemId);

        // Delete associated image if it exists
        if (clothingItem.image) {
            const imagePath = path.join(
                __dirname,
                '..',
                clothingItem.image.replace(/^\/uploads\//, 'uploads/')
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({
            message: 'Clothing listing deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete clothing listing',
            error: error.message
        });
    }
});

// Handle image upload errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: error.code === 'LIMIT_FILE_SIZE'
                ? 'Image size must be less than 5 MB'
                : error.message
        });
    }

    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }

    next();
});

module.exports = router;
