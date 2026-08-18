const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تشغيل الملفات الثابتة
app.use(express.static(process.cwd()));

const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || 'instance188836';
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN || 'zrzcd8jsb1asiglk';

// عرض صفحة الموقع الرئيسية index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// مسار إرسال OTP عبر واتساب
app.post('/api/auth/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
  
  let phoneDigits = phone.replace(/[\s-]/g, '');
  if (phoneDigits.startsWith('01')) phoneDigits = '2' + phoneDigits;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const msgText = `رمز التحقق لتسجيل دخولك في موقع Abdulrahman Dahshan هو: ${otp} (صالح لمدة 10 دقائق)`;

  try {
    await axios.post(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      token: ULTRAMSG_TOKEN,
      to: phoneDigits,
      body: msgText
    });
    res.json({ success: true, otp });
  } catch (err) {
    res.json({ success: true, otp });
  }
});

// مسار استعادة كلمة المرور
app.post('/api/auth/forgot-password', async (req, res) => {
  const { phone } = req.body;
  let phoneDigits = (phone || '').replace(/[\s-]/g, '');
  if (phoneDigits.startsWith('01')) phoneDigits = '2' + phoneDigits;

  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const msgText = `كود استعادة كلمة المرور الخاص بك في موقع Abdulrahman Dahshan هو: ${otpCode} (صالح لمدة 10 دقائق)`;

  try {
    await axios.post(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      token: ULTRAMSG_TOKEN,
      to: phoneDigits,
      body: msgText
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true });
  }
});

module.exports = app;
