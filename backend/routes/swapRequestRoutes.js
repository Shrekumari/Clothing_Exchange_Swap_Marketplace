
const express = require('express');
const mongoose = require('mongoose');

const SwapRequest = require('../models/SwapRequest');
const ClothingItem = require('../models/ClothingItem');
const User = require('../models/User');

const router = express.Router();

// SEND SWAP REQUEST
router.post('/', async (req, res) => {
    try {
        const { senderId, requestedItemId, offeredItemId } = req.body;

        if (!senderId || !requestedItemId || !offeredItemId) {
            return res.status(400).json({
                message: 'All swap request details are required'
            });
        }

        const ids = [senderId, requestedItemId, offeredItemId];

        if (!ids.every(id => mongoose.isValidObjectId(id))) {
            return res.status(400).json({
                message: 'Invalid ID provided'
            });
        }

        const sender = await User.findById(senderId);
        const requestedItem = await ClothingItem.findById(requestedItemId);
        const offeredItem = await ClothingItem.findById(offeredItemId);

        if (!sender || !requestedItem || !offeredItem) {
            return res.status(404).json({
                message: 'User or clothing item not found'
            });
        }

        if (!offeredItem.owner ||
            offeredItem.owner.toString() !== senderId) {
            return res.status(403).json({
                message: 'You can only offer your own clothing item'
            });
        }

        if (!requestedItem.owner ||
            requestedItem.owner.toString() === senderId) {
            return res.status(400).json({
                message: 'You cannot request your own item'
            });
        }

        if (
            requestedItem.availability !== 'Available' ||
            offeredItem.availability !== 'Available'
        ) {
            return res.status(400).json({
                message: 'One or both items are unavailable'
            });
        }

        // Prevent duplicate pending requests
        const existingRequest = await SwapRequest.findOne({
            sender: senderId,
            requestedItem: requestedItemId,
            offeredItem: offeredItemId,
            status: 'Pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'You have already sent this swap request'
            });
        }

        const swapRequest = await SwapRequest.create({
            sender: senderId,
            receiver: requestedItem.owner,
            offeredItem: offeredItemId,
            requestedItem: requestedItemId
        });

        res.status(201).json({
            message: 'Swap request sent successfully',
            swapRequest
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to send swap request',
            error: error.message
        });
    }
});


// GET INCOMING REQUESTS
router.get('/incoming/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const requests = await SwapRequest.find({
            receiver: userId
        })
        .populate('sender', 'name email location')
        .populate('offeredItem')
        .populate('requestedItem')
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch incoming requests',
            error: error.message
        });
    }
});


// GET SENT REQUESTS
router.get('/sent/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const requests = await SwapRequest.find({
            sender: userId
        })
        .populate('receiver', 'name email location')
        .populate('offeredItem')
        .populate('requestedItem')
        .sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch sent requests',
            error: error.message
        });
    }
});


// GET SWAP HISTORY
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const history = await SwapRequest.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            status: 'Accepted'
        })
        .populate('sender', 'name email location')
        .populate('receiver', 'name email location')
        .populate('offeredItem')
        .populate('requestedItem')
        .sort({ updatedAt: -1 });

        res.status(200).json(history);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch swap history',
            error: error.message
        });
    }
});


// ACCEPT OR REJECT REQUEST
router.patch('/:requestId/status', async (req, res) => {
    try {
        const { status, userId } = req.body;

        if (
            !mongoose.isValidObjectId(req.params.requestId) ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(400).json({
                message: 'Invalid ID provided'
            });
        }

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid request status'
            });
        }

        const swapRequest = await SwapRequest.findById(
            req.params.requestId
        );

        if (!swapRequest) {
            return res.status(404).json({
                message: 'Swap request not found'
            });
        }

        if (swapRequest.receiver.toString() !== userId) {
            return res.status(403).json({
                message: 'Only the item owner can update this request'
            });
        }

        if (swapRequest.status !== 'Pending') {
            return res.status(400).json({
                message: 'This request has already been processed'
            });
        }

        if (status === 'Accepted') {
            const requestedItem = await ClothingItem.findById(
                swapRequest.requestedItem
            );

            const offeredItem = await ClothingItem.findById(
                swapRequest.offeredItem
            );

            if (
                !requestedItem ||
                !offeredItem ||
                requestedItem.availability !== 'Available' ||
                offeredItem.availability !== 'Available'
            ) {
                return res.status(400).json({
                    message: 'One or both items are no longer available'
                });
            }

            requestedItem.availability = 'Swapped';
            offeredItem.availability = 'Swapped';

            await requestedItem.save();
            await offeredItem.save();

            swapRequest.status = 'Accepted';
            await swapRequest.save();

            // Reject other pending requests involving these items
            await SwapRequest.updateMany(
                {
                    _id: { $ne: swapRequest._id },
                    status: 'Pending',
                    $or: [
                        { requestedItem: swapRequest.requestedItem },
                        { offeredItem: swapRequest.requestedItem },
                        { requestedItem: swapRequest.offeredItem },
                        { offeredItem: swapRequest.offeredItem }
                    ]
                },
                {
                    $set: { status: 'Rejected' }
                }
            );

        } else {
            swapRequest.status = 'Rejected';
            await swapRequest.save();
        }

        res.status(200).json({
            message: `Swap request ${status.toLowerCase()} successfully`,
            swapRequest
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update swap request',
            error: error.message
        });
    }
});

module.exports = router;
