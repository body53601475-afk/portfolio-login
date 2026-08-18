const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID;
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB error:', error);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// قراءة وعرض ملف index.html مباشرة
app.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (err) {
    res.status(500).send('Error loading page: ' + err.message);
  }
});

// فحص السيرفر
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', dbConnected: Boolean(isConnected) });
});

// إرسال واتساب
app.post('/api/send-whatsapp', async (req, res) => {
  const { phone, message } = req.body;
  try {
    const response = await axios.post(
      `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`,
      {
        token: ULTRAMSG_TOKEN,
        to: phone,
        body: message,
      }
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
