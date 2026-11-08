
const express = require('express');
const cors = require('cors');
const path = require('path');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clothingRoutes = require('./routes/clothingRoutes');
const swapRequestRoutes = require('./routes/swapRequestRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/messages', messageRoutes);

// Serve uploaded clothing images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/clothing', clothingRoutes);
app.use('/api/swap-requests', swapRequestRoutes);

app.get('/', (req, res) => {
    res.send('Clothing Exchange & Swap Marketplace API is running!');
});

const PORT = 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
