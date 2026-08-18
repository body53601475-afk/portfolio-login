const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
  .catch((err) => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message));

// UltraMsg Credentials
const INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || 'instance188836';
const TOKEN = process.env.ULTRAMSG_TOKEN || 'zrzcd8jsb1asiglk';

// Helper function to send WhatsApp messages
async function sendWhatsApp(phone, text) {
  let formattedPhone = phone.trim().replace(/[\s-]/g, '');
  if (formattedPhone.startsWith('01')) {
    formattedPhone = '2' + formattedPhone;
  }

  const payload = {
    token: TOKEN,
    to: formattedPhone,
    body: text
  };

  return axios.post(
    `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`,
    qs.stringify(payload),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
}

// 1. مسار تسجيل الدخول وإرسال OTP عبر الهاتف
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم الهاتف' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const msg = `رمز التحقق لتسجيل دخولك في موقع Abdulrahman Dahshan هو: ${otpCode} (صالح لمدة 10 دقائق)`;

    await sendWhatsApp(phone, msg);

    res.json({
      success: true,
      otp: otpCode,
      message: 'تم إرسال رمز التحقق عبر الواتساب بنجاح'
    });
  } catch (error) {
    console.error('UltraMsg Send Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'تعذر إرسال الرسالة عبر الواتساب' });
  }
});

// 2. مسار استعادة كلمة المرور عبر الواتساب
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم الهاتف' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const msg = `كود استعادة كلمة المرور الخاص بك في موقع Abdulrahman Dahshan هو: ${otpCode} (صالح لمدة 10 دقائق)`;

    await sendWhatsApp(phone, msg);

    res.json({
      success: true,
      otp: otpCode,
      message: 'تم إرسال كود الاستعادة بنجاح'
    });
  } catch (error) {
    console.error('UltraMsg Forgot Password Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'تعذر إرسال كود الاستعادة' });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});
