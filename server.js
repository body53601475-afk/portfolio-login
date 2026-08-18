        .const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID || 'instance188836';
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN || 'zrzcd8jsb1asiglk';

let isConnected = false;
const connectDB = async () => {
  if (isConnected || !MONGO_URI) return;
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

// إرسال كود OTP عبر الـ API
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
    res.status(500).json({ success: false, error: err.message, otp });
  }
});

// استعادة كلمة المرور عبر الـ API
app.post('/api/auth/forgot-password', async (req, res) => {
  const { phone } = req.body;
  let phoneDigits = phone.replace(/[\s-]/g, '');
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// المسار الرئيسي لعرض واجهة الموقع الكاملة
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#080d1a">
<title>Abdulrahman Dahshan | Portfolio</title>

<!-- Fonts & Icons -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

:root {
  --c1: #4eedc2;
  --c2: #38bdf8;
  --grad-main: linear-gradient(135deg, #4eedc2 0%, #38bdf8 100%);
  --grad-glow: rgba(78, 237, 194, 0.35);
  --bg-dark: #080d1a;
  --card-bg: rgba(13, 22, 38, 0.92);
  --glass-border: rgba(255, 255, 255, 0.12);
  --text-main: #f8fafc;
  --text-dim: #94a3b8;
  --slow-motion-ease: cubic-bezier(0.25, 1, 0.3, 1);
}

body.theme-purple {
  --c1: #a78bfa;
  --c2: #f472b6;
  --grad-main: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
  --grad-glow: rgba(167, 139, 250, 0.35);
  --bg-dark: #0f0c1b;
  --card-bg: rgba(23, 18, 41, 0.92);
}

body.theme-sunset {
  --c1: #fb923c;
  --c2: #f43f5e;
  --grad-main: linear-gradient(135deg, #fb923c 0%, #f43f5e 100%);
  --grad-glow: rgba(251, 146, 60, 0.35);
  --bg-dark: #140d12;
  --card-bg: rgba(31, 18, 25, 0.92);
}

body.theme-ocean {
  --c1: #38bdf8;
  --c2: #818cf8;
  --grad-main: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  --grad-glow: rgba(56, 189, 248, 0.35);
  --bg-dark: #090f1d;
  --card-bg: rgba(15, 24, 46, 0.92);
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  font-family: 'Cairo', sans-serif;
  color: var(--text-main);
  background: var(--bg-dark);
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.theme-picker-group {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: rgba(15, 23, 42, 0.85);
  padding: 6px 12px;
  border-radius: 50px;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}
.theme-dot {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s var(--slow-motion-ease), box-shadow 0.3s ease;
}
.theme-dot:hover, .theme-dot.active {
  transform: scale(1.3);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
}
.theme-dot.emerald { background: linear-gradient(135deg, #4eedc2, #38bdf8); }
.theme-dot.purple { background: linear-gradient(135deg, #a78bfa, #f472b6); }
.theme-dot.sunset { background: linear-gradient(135deg, #fb923c, #f43f5e); }
.theme-dot.ocean { background: linear-gradient(135deg, #38bdf8, #818cf8); }

.login-theme-floater {
  position: fixed;
  top: 1.25rem;
  left: 1.25rem;
  z-index: 1000;
}

.toast-box {
  position: fixed;
  top: 25px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: var(--card-bg);
  border: 1px solid var(--c1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px var(--grad-glow);
  padding: 0.85rem 1.6rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
  z-index: 99999;
  opacity: 0;
  transition: all 0.5s var(--slow-motion-ease);
  pointer-events: none;
  direction: rtl;
}
.toast-box.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.toast-box i { font-size: 1.25rem; color: var(--c1); }

#authSection {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.3) 0%, var(--bg-dark) 100%);
  overflow: hidden;
  padding: 1.5rem;
  direction: ltr;
  font-family: 'Poppins', 'Cairo', sans-serif;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 34px 34px;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.28;
}
.blob-1 { width: 420px; height: 420px; background: var(--c1); top: -120px; left: -120px; }
.blob-2 { width: 380px; height: 380px; background: var(--c2); bottom: -100px; right: -100px; }

.card {
  display: flex;
  width: 860px;
  height: 480px;
  max-width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px var(--grad-glow);
  position: relative;
  z-index: 10;
  overflow: hidden;
  margin: auto;
  will-change: width, height, border-radius, transform, box-shadow;
  transition: 
    width 0.95s var(--slow-motion-ease),
    height 0.95s var(--slow-motion-ease),
    border-radius 0.95s var(--slow-motion-ease),
    border-color 0.95s var(--slow-motion-ease),
    box-shadow 0.95s var(--slow-motion-ease),
    background 0.95s var(--slow-motion-ease);
}

#authSection.light-off .card {
  width: 220px !important;
  height: 220px !important;
  border-radius: 50% !important;
  border: 2.5px solid var(--c1);
  box-shadow: 0 0 45px var(--grad-glow), 0 15px 50px rgba(0, 0, 0, 0.85);
  cursor: pointer;
}

#authSection.light-off .right-panel {
  opacity: 0 !important;
  transform: translateX(30px) scale(0.9);
  pointer-events: none !important;
  display: none !important;
}

#authSection.light-off .light-beam-cone,
#authSection.light-off .floor-glow {
  opacity: 0 !important;
  pointer-events: none !important;
}

#authSection.light-off .stage-panel {
  border-right: none;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(10, 16, 30, 0.98) 100%);
}

#authSection.light-off .robot-wrapper {
  margin-bottom: 0 !important;
  transform: translateY(-8px) scale(0.92);
}

#authSection.light-off .pull-cord-wrapper {
  top: 15px !important;
  left: calc(50% + 55px) !important;
}

.stage-panel {
  flex: 1;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.04) 0%, rgba(10, 16, 30, 0.95) 100%);
  border-right: 1px solid var(--glass-border);
  overflow: hidden;
  user-select: none;
  transition: background 0.95s var(--slow-motion-ease);
}

.lamp-assembly {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 8;
  pointer-events: none;
}
.lamp-wire { width: 2px; height: 42px; background: rgba(255,255,255,0.25); }
.lamp-shade {
  width: 86px;
  height: 38px;
  background: linear-gradient(180deg, #1e293b, #0f172a);
  border: 1px solid rgba(255,255,255,0.15);
  clip-path: polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%);
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.lamp-bulb {
  width: 32px;
  height: 10px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 16px #ffffff, 0 0 25px var(--c1);
  margin-bottom: -4px;
}

.light-beam-cone {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 300px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, var(--grad-glow) 40%, transparent 100%);
  clip-path: polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%);
  pointer-events: none;
  z-index: 3;
}

.pull-cord-wrapper {
  position: absolute;
  top: 75px;
  left: calc(50% + 46px);
  width: 44px;
  height: 110px;
  cursor: pointer;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: top 0.95s var(--slow-motion-ease), left 0.95s var(--slow-motion-ease);
}
.pull-cord-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transform-origin: top center;
}
.pull-cord-wrapper.pulling .pull-cord-inner {
  animation: springPull 0.55s var(--slow-motion-ease);
}
@keyframes springPull {
  0% { transform: translateY(0); }
  45% { transform: translateY(32px); }
  100% { transform: translateY(0); }
}
.cord-line { width: 2px; height: 60px; background: rgba(255,255,255,0.4); }
.cord-handle {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255,255,255,0.6);
  margin-top: -1px;
}

.floor-glow {
  position: absolute;
  bottom: 0;
  width: 210px;
  height: 40px;
  background: radial-gradient(ellipse at center, var(--grad-glow) 0%, transparent 72%);
  pointer-events: none;
  z-index: 2;
}

#particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.robot-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  z-index: 5;
  will-change: transform;
  transition: transform 0.95s var(--slow-motion-ease), margin-bottom 0.95s var(--slow-motion-ease);
}
.robot-antenna {
  width: 3px;
  height: 20px;
  background: linear-gradient(to top, #94a3b8, #cbd5e1);
  border-radius: 2px;
  position: relative;
  margin-bottom: -2px;
  display: flex;
  justify-content: center;
}
.robot-antenna::before {
  content: "";
  position: absolute;
  top: -9px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--c1);
  box-shadow: 0 0 12px var(--c1);
}

.robot-head {
  width: 124px;
  height: 104px;
  border-radius: 46px 46px 40px 40px;
  background: linear-gradient(165deg, #ffffff 0%, #f1f5f9 45%, #cbd5e1 100%);
  box-shadow: 
    0 18px 30px rgba(0, 0, 0, 0.35),
    inset 0 4px 6px rgba(255, 255, 255, 0.9),
    inset 0 -5px 10px rgba(148, 163, 184, 0.4);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.robot-ear-left, .robot-ear-right {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 34px;
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
  border-radius: 8px;
  transform: translateY(-50%);
}
.robot-ear-left { left: -9px; }
.robot-ear-right { right: -9px; }

.robot-face {
  width: 98px;
  height: 76px;
  border-radius: 32px;
  background: #0f172a;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(255,255,255,0.4);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.robot-eye {
  width: 26px;
  height: 26px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  overflow: hidden;
}
.robot-eye.left { left: 15px; }
.robot-eye.right { right: 15px; }

.pupil {
  width: 12px;
  height: 12px;
  background: #0f172a;
  border-radius: 50%;
  position: relative;
  will-change: transform;
}
.pupil::after {
  content: "";
  position: absolute;
  top: 2px;
  right: 2px;
  width: 4.5px;
  height: 4.5px;
  background: #ffffff;
  border-radius: 50%;
}

.robot-blush-left, .robot-blush-right {
  position: absolute;
  bottom: 20px;
  width: 11px;
  height: 6px;
  border-radius: 50%;
  background: rgba(244, 114, 182, 0.45);
}
.robot-blush-left { left: 14px; }
.robot-blush-right { right: 14px; }

.robot-smile {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  border-bottom: 2.5px solid #ffffff;
  border-radius: 0 0 12px 12px;
}

.robot-head.eyes-closed .pupil { transform: scaleY(0.1) !important; }
.robot-head.eyes-closed .robot-smile {
  width: 12px; height: 2.5px; border-radius: 2px; background: #ffffff; border-bottom: none;
}

.right-panel {
  flex: 1.2;
  padding: 2.2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 5;
  will-change: opacity, transform;
  transition: opacity 0.6s var(--slow-motion-ease), transform 0.6s var(--slow-motion-ease);
}

.auth-header { margin-bottom: 1.1rem; }
.auth-header h2 {
  font-size: 1.65rem;
  font-weight: 800;
  background: var(--grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.auth-header p { font-size: 0.82rem; color: var(--text-dim); margin-top: 0.2rem; }

.login-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 1.25rem;
  gap: 4px;
}
.tab-btn {
  flex: 1;
  padding: 0.6rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  transition: all 0.3s ease;
}
.tab-btn.active {
  background: var(--grad-main);
  color: #0f172a;
  box-shadow: 0 4px 15px var(--grad-glow);
}

.form-group { margin-bottom: 0.9rem; }
.form-group label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: var(--text-dim);
  margin-bottom: 0.35rem;
}

.input-box { position: relative; display: flex; align-items: center; }
.input-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  color: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}
.input-box input:focus {
  border-color: var(--c1);
  box-shadow: 0 0 12px var(--grad-glow);
}
.input-box input.invalid {
  border-color: #f43f5e;
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.3);
}
.input-box i.input-icon {
  position: absolute;
  left: 0.95rem;
  color: var(--c1);
  font-size: 1rem;
  pointer-events: none;
}
.input-box i.toggle-password {
  position: absolute;
  right: 0.95rem;
  color: var(--text-dim);
  cursor: pointer;
}

.error-text {
  display: none;
  color: #f43f5e;
  font-size: 0.75rem;
  margin-top: 0.3rem;
}
.error-text.show { display: block; }

.signin-btn {
  width: 100%;
  padding: 0.85rem;
  border-radius: 50px;
  background: var(--grad-main);
  color: #0f172a;
  font-weight: 800;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 6px 20px var(--grad-glow);
  transition: transform 0.3s var(--slow-motion-ease), box-shadow 0.3s var(--slow-motion-ease);
  margin-top: 0.4rem;
}
.signin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--grad-glow);
}

.form-view { display: none; }
.form-view.active { display: block; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  direction: rtl;
}
.modal-overlay.open { display: flex; }
.modal-box {
  width: 100%;
  max-width: 410px;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  padding: 2.2rem;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.6);
}
.modal-box h3 { font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; }
.modal-box h3 span { color: var(--c1); }
.modal-box p { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 1.25rem; }
.modal-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
.modal-actions button { flex: 1; }
.btn-secondary {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: #fff;
  box-shadow: none;
}
.modal-success { display: none; }
.modal-success.show { display: block; }
.modal-success i { font-size: 2.6rem; color: var(--c1); margin-bottom: 1rem; display: block; }

#mainWebsite { display: none; width: 100%; }

header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  padding: 0.85rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 900;
  font-size: 1.25rem;
  background: var(--grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

#mainNav { display: block; }
#mainNav ul {
  display: flex;
  gap: 1.8rem;
  list-style: none;
  align-items: center;
}
#mainNav a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  position: relative;
}
#mainNav a:hover, #mainNav a.active { color: var(--c1); }
#mainNav a::after {
  content: "";
  position: absolute;
  right: 0; bottom: -4px;
  width: 0; height: 2px;
  background: var(--grad-main);
  transition: width .35s var(--slow-motion-ease);
}
#mainNav a.active::after { width: 100%; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logout-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s var(--slow-motion-ease), background 0.3s ease;
}
.logout-icon-btn:hover {
  background: rgba(244, 63, 94, 0.3);
  color: #fff;
  border-color: #f43f5e;
  transform: scale(1.1);
}

.nav-toggle {
  display: none;
  background: transparent;
  border: 1px solid var(--glass-border);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 6rem 1.5rem 2rem;
}
.hero h1 {
  font-size: clamp(2.5rem, 5.5vw, 4.6rem);
  font-weight: 900;
  margin-bottom: 1rem;
  background: var(--grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-dim);
  max-width: 620px;
  margin-bottom: 2.2rem;
  min-height: 2em;
}

.btn {
  display: inline-block;
  padding: 0.85rem 2.2rem;
  border-radius: 50px;
  background: var(--grad-main);
  color: #0f172a;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.3s var(--slow-motion-ease), box-shadow 0.3s var(--slow-motion-ease);
  box-shadow: 0 6px 20px var(--grad-glow);
}
.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px var(--grad-glow);
}

section {
  padding: 5.5rem 1.5rem 4.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
.section-title {
  font-size: 2.1rem;
  font-weight: 900;
  margin-bottom: 2.2rem;
  text-align: center;
  background: var(--grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
.card-item {
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  padding: 2.2rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.4s var(--slow-motion-ease), border-color 0.4s ease;
}
.card-item:hover {
  border-color: var(--c1);
  transform: translateY(-6px);
}
.card-item h3 {
  margin-bottom: 1rem;
  color: var(--c1);
  font-size: 1.35rem;
}
.card-item p {
  color: var(--text-dim);
  line-height: 1.65;
}

footer {
  text-align: center;
  padding: 2.5rem 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: var(--card-bg);
  margin-top: 4rem;
}
.socials {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
}
.socials a {
  color: #fff;
  font-size: 1.6rem;
  transition: color 0.3s ease, transform 0.3s var(--slow-motion-ease);
}
.socials a:hover { color: var(--c1); transform: translateY(-3px); }

.cursor-glow {
  position: fixed;
  top: 0; left: 0;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--grad-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%,-50%);
  opacity: 0;
  will-change: transform;
}
@media (hover:hover){ .cursor-glow{opacity:0.35;} }

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .6s var(--slow-motion-ease), transform .6s var(--slow-motion-ease);
}
.reveal.show { opacity: 1; transform: translateY(0); }

#backToTop {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 50px; height: 50px;
  border-radius: 50%;
  background: var(--grad-main);
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px var(--grad-glow);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all .4s var(--slow-motion-ease);
  z-index: 999;
}
#backToTop.show { opacity: 1; visibility: visible; transform: translateY(0); }
#backToTop:hover { transform: translateY(-4px); }

.typing-cursor {
  display: inline-block;
  width: 2px;
  background: var(--c1);
  margin-right: 2px;
  animation: blink 0.9s steps(1) infinite;
}
@keyframes blink{50%{opacity:0;}}

@media (max-width: 860px) {
  #authSection {
    padding: 1rem;
    align-items: center;
    justify-content: center;
  }
  .card {
    flex-direction: column;
    width: 100% !important;
    max-width: 420px !important;
    height: auto !important;
    min-height: 520px;
  }
  #authSection.light-off .card {
    width: 200px !important;
    height: 200px !important;
    min-height: 200px !important;
  }
  .stage-panel { border-right: none; border-bottom: 1px solid var(--glass-border); min-height: 260px; }
  .right-panel { padding: 1.25rem 1.2rem; }
  
  .nav-toggle { display: flex; }
  #mainNav {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--glass-border);
    max-height: 0;
    overflow: hidden;
    transition: max-height .45s var(--slow-motion-ease);
  }
  #mainNav.open { max-height: 300px; }
  #mainNav ul { flex-direction: column; gap: 0; padding: 0.5rem 1.5rem; }
  #mainNav ul li { border-top: 1px solid var(--glass-border); width: 100%; }
  #mainNav ul li:first-child { border-top: none; }
  #mainNav a { display: block; padding: 0.85rem 0; text-align: right; }
  #mainNav a::after { display: none; }
}
</style>
</head>
<body>

<div class="toast-box" id="appToast">
  <i class="fa-solid fa-circle-check" id="toastIcon"></i>
  <span id="toastMsg">تم الإرسال بنجاح</span>
</div>

<div class="cursor-glow" id="cursorGlow"></div>
<button id="backToTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>

<div id="authSection" class="notranslate" translate="no">
  <div class="login-theme-floater">
    <div class="theme-picker-group" title="اختر مزيج الألوان">
      <div class="theme-dot emerald active" data-theme="emerald" title="Soft Mint & Ice Cyan"></div>
      <div class="theme-dot purple" data-theme="purple" title="Soft Lavender & Pink"></div>
      <div class="theme-dot sunset" data-theme="sunset" title="Warm Peach & Rose"></div>
      <div class="theme-dot ocean" data-theme="ocean" title="Ice Blue & Sky"></div>
    </div>
  </div>

  <div class="grid-bg"></div>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>

  <div class="card" id="authCard">
    <div class="stage-panel" id="stagePanel">
      <div class="floor-glow"></div>
      <canvas id="particles"></canvas>

      <div class="lamp-assembly">
        <div class="lamp-wire"></div>
        <div class="lamp-shade">
          <div class="lamp-bulb"></div>
        </div>
      </div>

      <div class="light-beam-cone"></div>

      <div class="pull-cord-wrapper" id="pullCord" title="انقر لسحب الحبل">
        <div class="pull-cord-inner">
          <div class="cord-line"></div>
          <div class="cord-handle"></div>
        </div>
      </div>

      <div class="robot-wrapper">
        <div class="robot-antenna"></div>
        <div class="robot-head" id="robotHead">
          <div class="robot-ear-left"></div>
          <div class="robot-ear-right"></div>
          <div class="robot-face">
            <div class="robot-eye left"><div class="pupil" id="pupilLeft"></div></div>
            <div class="robot-eye right"><div class="pupil" id="pupilRight"></div></div>
            <div class="robot-blush-left"></div>
            <div class="robot-blush-right"></div>
            <div class="robot-smile"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="auth-header">
        <h2>Welcome <span>Back</span>.</h2>
        <p>Choose your preferred sign-in method</p>
      </div>

      <div class="login-tabs">
        <button type="button" class="tab-btn active" id="tabEmailBtn">
          <i class="fa-solid fa-envelope"></i> Gmail
        </button>
        <button type="button" class="tab-btn" id="tabPhoneBtn">
          <i class="fa-brands fa-whatsapp"></i> Phone OTP
        </button>
      </div>

      <form id="emailAuthForm" class="form-view active" novalidate>
        <div class="form-group">
          <label>GMAIL / EMAIL</label>
          <div class="input-box">
            <i class="fa-regular fa-envelope input-icon"></i>
            <input type="text" id="emailInput" placeholder="Enter your Gmail or username" autocomplete="username">
          </div>
          <div class="error-text" id="emailError">الرجاء إدخال اسم المستخدم أو البريد</div>
        </div>

        <div class="form-group">
          <label>PASSWORD</label>
          <div class="input-box">
            <i class="fa-solid fa-lock input-icon"></i>
            <input type="password" id="passwordInput" placeholder="••••••••" autocomplete="current-password">
            <i class="fa-solid fa-eye-slash toggle-password" id="togglePassword"></i>
          </div>
          <div class="error-text" id="passwordError">كلمة المرور مطلوبة</div>
        </div>

        <div style="text-align: right; margin-bottom: 0.8rem;">
          <a href="#" id="forgotPassLink" style="color: var(--c1); font-size: 0.82rem; text-decoration: none; font-weight: 600;">Forgot Password?</a>
        </div>

        <button type="button" class="signin-btn" id="gmailSignInBtn">
          <span>SIGN IN WITH GMAIL</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>

      <form id="phoneAuthForm" class="form-view" novalidate>
        <div class="form-group" id="phoneInputGroup">
          <label>PHONE NUMBER (WHATSAPP)</label>
          <div class="input-box">
            <i class="fa-brands fa-whatsapp input-icon"></i>
            <input type="tel" id="loginPhoneInput" placeholder="01012345678" autocomplete="tel">
          </div>
          <div class="error-text" id="phoneError">الرجاء إدخال رقم موبايل مصري صحيح</div>
        </div>

        <div class="form-group" id="otpInputGroup" style="display: none;">
          <label>ENTER 6-DIGIT OTP CODE</label>
          <div class="input-box">
            <i class="fa-solid fa-key input-icon"></i>
            <input type="number" id="otpCodeInput" placeholder="123456" maxlength="6">
          </div>
          <div class="error-text" id="otpError">رمز التحقق غير صحيح، يرجى المحاولة ثانية</div>
        </div>

        <button type="button" class="signin-btn" id="sendOtpBtn">
          <span>إرسال رمز الدخول عبر واتساب</span>
          <i class="fa-solid fa-paper-plane"></i>
        </button>

        <button type="button" class="signin-btn" id="verifyOtpBtn" style="display: none;">
          <span>تأكيد وتسجيل الدخول</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </div>
  </div>
</div>

<div class="modal-overlay" id="forgotModal">
  <div class="modal-box">
    <div class="modal-request">
      <h3>استعادة <span>كلمة المرور</span></h3>
      <p>اكتب رقم موبايلك المسجل لإرسال كود التحقق مباشرة إلى الواتساب الخاص بك.</p>
      <div class="input-box" style="margin-bottom: 0.5rem;">
        <input type="tel" id="forgotEmailInput" placeholder="رقم الموبايل (مثال: 01012345678)" autocomplete="tel" dir="ltr" style="text-align:left;">
        <i class="fa-brands fa-whatsapp input-icon"></i>
      </div>
      <div class="error-text" id="forgotEmailError">الرجاء إدخال رقم موبايل مصري صحيح</div>
      <div class="modal-actions">
        <button type="button" class="signin-btn btn-secondary" id="forgotCancelBtn">إلغاء</button>
        <button type="button" class="signin-btn" id="forgotSendBtn">إرسال الطلب</button>
      </div>
    </div>
    <div class="modal-success" id="modalSuccess">
      <i class="fa-solid fa-circle-check"></i>
      <h3>تم <span>الإرسال</span></h3>
      <p id="modalSuccessText">تم إرسال الرسالة إلى الواتساب بنجاح.</p>
      <div class="modal-actions">
        <button type="button" class="signin-btn" id="forgotCloseBtn" style="flex:1;">تمام</button>
      </div>
    </div>
  </div>
</div>

<div id="mainWebsite">
  <header>
    <a href="#" class="logo">Abdulrahman Dahshan</a>

    <nav id="mainNav">
      <ul>
        <li><a href="#hero">الرئيسية</a></li>
        <li><a href="#projects">أعمالي</a></li>
        <li><a href="#my-profile">صفحاتي</a></li>
        <li><a href="#contact">تواصل معي</a></li>
      </ul>
    </nav>

    <div class="header-actions">
      <div class="theme-picker-group" title="اختر مزيج الألوان">
        <div class="theme-dot emerald active" data-theme="emerald" title="Soft Mint & Ice Cyan"></div>
        <div class="theme-dot purple" data-theme="purple" title="Soft Lavender & Pink"></div>
        <div class="theme-dot sunset" data-theme="sunset" title="Warm Peach & Rose"></div>
        <div class="theme-dot ocean" data-theme="ocean" title="Ice Blue & Sky"></div>
      </div>
      
      <button class="logout-icon-btn" id="logoutBtn" title="تسجيل الخروج" aria-label="Logout">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </button>

      <button class="nav-toggle" id="navToggle" aria-label="فتح القائمة"><i class="fa-solid fa-bars"></i></button>
    </div>
  </header>

  <section id="hero" class="hero">
    <h1>Abdulrahman Dahshan</h1>
    <p id="heroTyping">&nbsp;</p>
    <a href="#projects" class="btn">استكشف أعمالي</a>
  </section>

  <section id="projects">
    <h2 class="section-title reveal">أبرز الأعمال والمشاريع</h2>
    <div class="grid">
      <div class="card-item reveal">
        <h3>مشروع 1</h3>
        <p>تصميم وتطوير واجهة مستخدم تفاعلية بتجربة مستخدم سلسة وعصرية مع أفضل الممارسات البرمجية.</p>
      </div>
      <div class="card-item reveal">
        <h3>مشروع 2</h3>
        <p>تطوير تطبيقات ومواقع متكاملة تعتمد على بنية تحتية سحابية موثوقة وسريعة الاستجابة.</p>
      </div>
      <div class="card-item reveal">
        <h3>مشروع 3</h3>
        <p>صناعة تجارب رقمية مميزة وهوية برمجية ذات طابع متقدم وعصري.</p>
      </div>
    </div>
  </section>

  <section id="my-profile">
    <h2 class="section-title reveal">صفحتي الشخصية وحساباتي</h2>
    <div class="grid">
      <div class="card-item reveal">
        <h3><i class="fab fa-facebook"></i> فيسبوك</h3>
        <p>تواصل معي وتابع حسابي الشخصي على فيسبوك.</p>
        <a href="https://www.facebook.com/share/1JvM9z8MCY/" target="_blank" rel="noopener noreferrer" class="btn" style="width:100%; margin-top:1.25rem;">زيارة الصفحة</a>
      </div>
      <div class="card-item reveal">
        <h3><i class="fab fa-tiktok"></i> تيك توك</h3>
        <p>شاهد أحدث المقاطع والمحتوى التقني الحصري.</p>
        <a href="https://www.tiktok.com/@abdelr6hman_dahshan?_r=1&_t=ZS-98xFtqQx2AP" target="_blank" rel="noopener noreferrer" class="btn" style="width:100%; margin-top:1.25rem;">زيارة الصفحة</a>
      </div>
      <div class="card-item reveal">
        <h3><i class="fab fa-instagram"></i> انستجرام</h3>
        <p>تابع صور اليوميات والقصص الخاصة بي أولاً بأول.</p>
        <a href="https://www.instagram.com/abd.elrahmanelsayed2?igsh=MTIxeHc3bmI0MWhtYw==&igsi=MTIxeHc3bmI0MWhtYw==" target="_blank" rel="noopener noreferrer" class="btn" style="width:100%; margin-top:1.25rem;">زيارة الصفحة</a>
      </div>
      <div class="card-item reveal">
        <h3><i class="fab fa-youtube"></i> يوتيوب</h3>
        <p>تابع الشروحات والفيديوهات والدروس البرمجية الكاملة.</p>
        <a href="https://youtube.com/@abdelrahmanelsayad0?si=EL2jL1xmavoxOMbc" target="_blank" rel="noopener noreferrer" class="btn" style="width:100%; margin-top:1.25rem;">زيارة الصفحة</a>
      </div>
    </div>
  </section>

  <section id="contact">
    <h2 class="section-title reveal">تواصل معي</h2>
    <div class="card-item reveal" style="max-width: 600px; margin: 0 auto; text-align: center;">
      <p style="margin-bottom: 1.5rem;">يسعدني التواصل معك ومناقشة أي فكرة أو مشروع جديد.</p>
      <a href="https://wa.me/201033965094" target="_blank" rel="noopener noreferrer" class="btn">راسلني واتساب</a>
    </div>
  </section>

  <footer>
    <div class="socials">
      <a href="https://www.facebook.com/share/1JvM9z8MCY/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
      <a href="https://www.tiktok.com/@abdelr6hman_dahshan?_r=1&_t=ZS-98xFtqQx2AP" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
      <a href="https://www.instagram.com/abd.elrahmanelsayed2?igsh=MTIxeHc3bmI0MWhtYw==&igsi=MTIxeHc3bmI0MWhtYw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
      <a href="https://youtube.com/@abdelrahmanelsayad0?si=EL2jL1xmavoxOMbc" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
    </div>
    <p>&copy; 2026 Abdulrahman Dahshan. جميع الحقوق محفوظة.</p>
  </footer>
</div>

<script>
const allThemeDots = document.querySelectorAll('.theme-dot');
allThemeDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    const theme = dot.dataset.theme;
    allThemeDots.forEach(d => {
      if(d.dataset.theme === theme) d.classList.add('active');
      else d.classList.remove('active');
    });
    
    document.body.classList.remove('theme-purple', 'theme-sunset', 'theme-ocean');
    if (theme !== 'emerald') {
      document.body.classList.add('theme-' + theme);
    }
  });
});

function showToast(message, isError = false) {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  toastMsg.textContent = message;
  if(isError) {
    toast.classList.add('error');
    toastIcon.className = 'fa-solid fa-circle-exclamation';
  } else {
    toast.classList.remove('error');
    toastIcon.className = 'fa-solid fa-circle-check';
  }

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

const authSection = document.getElementById('authSection');
const authCard = document.getElementById('authCard');
const pullCord = document.getElementById('pullCord');
const robotHead = document.getElementById('robotHead');
const pupilLeft = document.getElementById('pupilLeft');
const pupilRight = document.getElementById('pupilRight');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const togglePassword = document.getElementById('togglePassword');
const mainWebsite = document.getElementById('mainWebsite');
const logoutBtn = document.getElementById('logoutBtn');
const gmailSignInBtn = document.getElementById('gmailSignInBtn');

const ULTRAMSG_INSTANCE = 'instance188836';
const ULTRAMSG_TOKEN = 'zrzcd8jsb1asiglk';

function triggerCordPull(e) {
  if (e) e.stopPropagation();
  pullCord.classList.remove('pulling');
  void pullCord.offsetWidth;
  pullCord.classList.add('pulling');
  if (navigator.vibrate) navigator.vibrate(40);
  
  authSection.classList.toggle('light-off');
}

pullCord.addEventListener('click', triggerCordPull);

authCard.addEventListener('click', (e) => {
  if (authSection.classList.contains('light-off')) {
    triggerCordPull();
  }
});

let isThrottled = false;
function updateRobotEyes(clientX, clientY) {
  if (!robotHead || isThrottled) return;
  isThrottled = true;
  requestAnimationFrame(() => {
    const rect = robotHead.getBoundingClientRect();
    const robotX = rect.left + rect.width / 2;
    const robotY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - robotY, clientX - robotX);
    const distance = Math.min(5, Math.hypot(clientX - robotX, clientY - robotY) / 28);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    pupilLeft.style.transform = 'translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
    pupilRight.style.transform = 'translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
    isThrottled = false;
  });
}

document.addEventListener('mousemove', (e) => updateRobotEyes(e.clientX, e.clientY), { passive: true });
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) updateRobotEyes(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

passwordInput.addEventListener('focus', () => robotHead.classList.add('eyes-closed'));
passwordInput.addEventListener('blur', () => robotHead.classList.remove('eyes-closed'));

togglePassword.addEventListener('click', () => {
  const isPassword = passwordInput.getAttribute('type') === 'password';
  passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
  togglePassword.classList.toggle('fa-eye');
  togglePassword.classList.toggle('fa-eye-slash');
});

const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = canvas.width / 2 + (Math.random() * 40 - 20);
      this.y = 80;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 1.2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.opacity = 1;
    }
    update() { this.y += this.speedY; this.x += this.speedX; this.opacity -= 0.009; }
    draw() {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function handleParticles() {
    if (!authSection.classList.contains('light-off') && Math.random() < 0.25) {
      particlesArray.push(new Particle());
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
      if (particlesArray[i].opacity <= 0 || particlesArray[i].y > canvas.height) {
        particlesArray.splice(i, 1);
        i--;
      }
    }
    requestAnimationFrame(handleParticles);
  }
  handleParticles();
}

const tabEmailBtn = document.getElementById('tabEmailBtn');
const tabPhoneBtn = document.getElementById('tabPhoneBtn');
const emailAuthForm = document.getElementById('emailAuthForm');
const phoneAuthForm = document.getElementById('phoneAuthForm');

tabEmailBtn.addEventListener('click', () => {
  tabEmailBtn.classList.add('active');
  tabPhoneBtn.classList.remove('active');
  emailAuthForm.classList.add('active');
  phoneAuthForm.classList.remove('active');
});

tabPhoneBtn.addEventListener('click', () => {
  tabPhoneBtn.classList.add('active');
  tabEmailBtn.classList.remove('active');
  phoneAuthForm.classList.add('active');
  emailAuthForm.classList.remove('active');
});

function loginSuccess() {
  authSection.style.display = 'none';
  mainWebsite.style.display = 'block';
  window.scrollTo(0, 0);
  initEnhancements();
  showToast('تم تسجيل الدخول بنجاح! أهلاً بك.');
}

logoutBtn.addEventListener('click', () => {
  mainWebsite.style.display = 'none';
  authSection.style.display = 'flex';
  authSection.classList.remove('light-off');
  window.scrollTo(0, 0);

  emailInput.value = '';
  passwordInput.value = '';
  loginPhoneInput.value = '';
  loginPhoneInput.disabled = false;
  otpCodeInput.value = '';
  sendOtpBtn.style.display = 'flex';
  sendOtpBtn.textContent = 'إرسال رمز الدخول عبر واتساب';
  sendOtpBtn.disabled = false;
  otpInputGroup.style.display = 'none';
  verifyOtpBtn.style.display = 'none';

  showToast('تم تسجيل الخروج بنجاح.');
});

function handleGmailLogin() {
  const emailVal = emailInput.value.trim();
  const passVal = passwordInput.value.trim();
  let valid = true;

  if(!emailVal){
    emailInput.classList.add('invalid');
    document.getElementById('emailError').classList.add('show');
    valid = false;
  } else {
    emailInput.classList.remove('invalid');
    document.getElementById('emailError').classList.remove('show');
  }

  if(!passVal){
    passwordInput.classList.add('invalid');
    document.getElementById('passwordError').classList.add('show');
    valid = false;
  } else {
    passwordInput.classList.remove('invalid');
    document.getElementById('passwordError').classList.remove('show');
  }

  if(valid) loginSuccess();
}

gmailSignInBtn.addEventListener('click', handleGmailLogin);
emailAuthForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleGmailLogin();
});

const loginPhoneInput = document.getElementById('loginPhoneInput');
const phoneError = document.getElementById('phoneError');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const otpInputGroup = document.getElementById('otpInputGroup');
const otpCodeInput = document.getElementById('otpCodeInput');
const otpError = document.getElementById('otpError');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');

let generatedLoginOtp = null;

function isValidEgyptPhone(value){
  const digits = value.trim().replace(/[\s-]/g, '');
  return /^01[0125][0-9]{8}$/.test(digits);
}

sendOtpBtn.addEventListener('click', async () => {
  const phoneVal = loginPhoneInput.value.trim();
  if(!isValidEgyptPhone(phoneVal)){
    loginPhoneInput.classList.add('invalid');
    phoneError.classList.add('show');
    return;
  }

  loginPhoneInput.classList.remove('invalid');
  phoneError.classList.remove('show');
  sendOtpBtn.textContent = 'جاري إرسال الرمز...';
  sendOtpBtn.disabled = true;

  let phoneDigits = phoneVal.replace(/[\s-]/g, '');
  if (phoneDigits.startsWith('01')) phoneDigits = '2' + phoneDigits;

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  generatedLoginOtp = otpCode;
  const msgText = 'رمز التحقق لتسجيل دخولك في موقع Abdulrahman Dahshan هو: ' + otpCode + ' (صالح لمدة 10 دقائق)';

  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneVal })
    });
    const data = await res.json();
    if(data.success) generatedLoginOtp = data.otp;
  } catch (e) {
    const apiUrl = 'https://api.ultramsg.com/' + ULTRAMSG_INSTANCE + '/messages/chat?token=' + ULTRAMSG_TOKEN + '&to=' + phoneDigits + '&body=' + encodeURIComponent(msgText);
    const img = new Image();
    img.src = apiUrl;
  }

  sendOtpBtn.style.display = 'none';
  otpInputGroup.style.display = 'block';
  verifyOtpBtn.style.display = 'flex';
  loginPhoneInput.disabled = true;

  showToast('تم إرسال كود التحقق إلى واتساب (' + phoneVal + ') بنجاح');
  otpCodeInput.focus();
});

function handleOtpVerify() {
  const enteredOtp = otpCodeInput.value.trim();

  if(enteredOtp === generatedLoginOtp && enteredOtp.length === 6){
    otpCodeInput.classList.remove('invalid');
    otpError.classList.remove('show');
    loginSuccess();
  } else {
    otpCodeInput.classList.add('invalid');
    otpError.classList.add('show');
    showToast('رمز التحقق غير صحيح، يرجى إعادة المحاولة', true);
  }
}

verifyOtpBtn.addEventListener('click', handleOtpVerify);
phoneAuthForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleOtpVerify();
});

const forgotPassLink = document.getElementById('forgotPassLink');
const forgotModal = document.getElementById('forgotModal');
const forgotEmailInput = document.getElementById('forgotEmailInput');
const forgotEmailError = document.getElementById('forgotEmailError');
const forgotSendBtn = document.getElementById('forgotSendBtn');
const forgotCancelBtn = document.getElementById('forgotCancelBtn');
const forgotCloseBtn = document.getElementById('forgotCloseBtn');
const modalRequest = document.querySelector('.modal-request');
const modalSuccess = document.getElementById('modalSuccess');
const modalSuccessText = document.getElementById('modalSuccessText');

function openForgotModal(){
  forgotModal.classList.add('open');
  modalRequest.style.display = 'block';
  modalSuccess.classList.remove('show');
  forgotEmailInput.value = '';
  forgotEmailInput.classList.remove('invalid');
  forgotEmailError.classList.remove('show');
  setTimeout(() => forgotEmailInput.focus(), 50);
}

function closeForgotModal(){ forgotModal.classList.remove('open'); }

forgotPassLink.addEventListener('click', (e) => {
  e.preventDefault();
  openForgotModal();
});
forgotCancelBtn.addEventListener('click', closeForgotModal);
forgotCloseBtn.addEventListener('click', closeForgotModal);
forgotModal.addEventListener('click', (e) => { if(e.target === forgotModal) closeForgotModal(); });

forgotSendBtn.addEventListener('click', async () => {
  const val = forgotEmailInput.value.trim();
  if(!isValidEgyptPhone(val)){
    forgotEmailInput.classList.add('invalid');
    forgotEmailError.classList.add('show');
    return;
  }
  
  forgotEmailInput.classList.remove('invalid');
  forgotEmailError.classList.remove('show');
  forgotSendBtn.textContent = 'جاري الإرسال...';
  forgotSendBtn.disabled = true;

  let phoneDigits = val.replace(/[\s-]/g, '');
  if (phoneDigits.startsWith('01')) phoneDigits = '2' + phoneDigits;

  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const msgText = 'كود استعادة كلمة المرور الخاص بك في موقع Abdulrahman Dahshan هو: ' + otpCode + ' (صالح لمدة 10 دقائق)';

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: val })
    });
    const data = await res.json();
    if (data.success) {
      modalSuccessText.textContent = 'تم إرسال كود الاستعادة إلى رقم واتساب (' + val + ') بنجاح!';
      modalRequest.style.display = 'none';
      modalSuccess.classList.add('show');
    }
  } catch (error) {
    con
