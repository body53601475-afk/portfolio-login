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

// المسار الرئيسي لقراءة ملف index.html من أي مسار محتمل في Vercel
app.get('/', (req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.resolve('index.html')
  ];

  let htmlContent = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      htmlContent = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  if (htmlContent) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlContent);
  }

  // في حال تعذر الوصول للملف لأي سبب يتم إرجاع واجهة تسجيل الدخول مباشرة
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تسجيل الدخول</title>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: #fff; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 90%; max-width: 400px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; box-sizing: border-box; }
        button { width: 100%; padding: 12px; border: none; border-radius: 8px; background: #22c55e; color: #000; font-weight: bold; cursor: pointer; margin-top: 10px; }
        button:hover { background: #16a34a; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>تسجيل الدخول إلى المحفظة</h2>
        <form id="loginForm">
          <input type="text" id="username" placeholder="اسم المستخدم أو الهاتف" required />
          <input type="password" id="password" placeholder="كلمة المرور" required />
          <button type="submit">دخول</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// فحص السيرفر
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', dbConnected: Boolean(isConnected) });
});

// إرسال رسائل الواتساب عبر UltraMsg
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
