
const express = require('express');
const mongoose = require('mongoose');

const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();
console.log("MESSAGE ROUTES FILE LOADED");

router.get('/test', (req, res) => {
    res.send('Message routes are working!');
});


// 1. SEND MESSAGE
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message?.trim()) {
            return res.status(400).json({
                message: 'All message details are required'
            });
        }

        if (
            !mongoose.isValidObjectId(senderId) ||
            !mongoose.isValidObjectId(receiverId)
        ) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        if (senderId === receiverId) {
            return res.status(400).json({
                message: 'You cannot message yourself'
            });
        }

        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            message: message.trim()
        });

        await newMessage.populate(
            'sender receiver',
            'name email location'
        );

        res.status(201).json({
            message: 'Message sent successfully',
            newMessage
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to send message',
            error: error.message
        });
    }
});


// 2. GET USERS WHO HAVE CONVERSATIONS WITH CURRENT USER
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .populate('sender receiver', 'name email location')
            .sort({ createdAt: -1 });

        const conversations = new Map();

        messages.forEach((msg) => {
            if (!msg.sender || !msg.receiver) return;

            const otherUser =
                msg.sender._id.toString() === userId
                    ? msg.receiver
                    : msg.sender;

            const otherUserId = otherUser._id.toString();

            if (!conversations.has(otherUserId)) {
                conversations.set(otherUserId, {
                    user: otherUser,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0
                });
            }

            if (
                msg.receiver._id.toString() === userId &&
                !msg.isRead
            ) {
                conversations.get(otherUserId).unreadCount++;
            }
        });

        res.status(200).json(
            Array.from(conversations.values())
        );

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
});
// GET ALL USERS EXCEPT CURRENT USER
router.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const users = await User.find({
            _id: { $ne: userId }
        }).select('name email location');

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// 3. GET CONVERSATION BETWEEN TWO USERS
router.get('/:userId/:otherUserId', async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;

        if (
            !mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(otherUserId)
        ) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        if (userId === otherUserId) {
            return res.status(400).json({
                message: 'Invalid conversation'
            });
        }

        const [currentUser, otherUser] = await Promise.all([
            User.findById(userId),
            User.findById(otherUserId)
        ]);

        if (!currentUser || !otherUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const conversation = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
            .populate('sender receiver', 'name email location')
            .sort({ createdAt: 1 });

        await Message.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        res.status(200).json(conversation);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch conversation',
            error: error.message
        });
    }
});


module.exports = router;
