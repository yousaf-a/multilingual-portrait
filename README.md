# 🌟 Multilingual Calligraphy & Portrait Studio

A full-stack Next.js web application that slowly sketches portraits top-to-bottom purely with multilingual calligraphy and fine hatching, accompanied by trending Instagram Story audio, 4K artwork export, and a **real-time 2-person live room & chat**.

---

## ✨ Features

- **Masterpiece Calligraphy Engine**: Reconstructs any photo with hand-sketched hatching and framing typography across 100 world scripts (Cyrillic, Devanagari, Greek, Arabic, Katakana, Hangul, Latin, etc.).
- **Strict User-Only Inscription**: Writes strictly what the user types without forcing any default messages.
- **Form Validation**: Photo, Inscription, and Theme are required before generating; music is optional.
- **Instagram Story Music Library**: 20+ aesthetic romance and ambient soundtracks, preview player, procedural Web Audio synthesizer, and custom MP3 upload.
- **💬 Real-Time 2-Person Live Duo Room**:
  - Live chat drawer with instant messaging.
  - Sound chimes on incoming partner messages.
  - Quick emoji reactions (❤️, ✨, 🔥, 🥺, 🌹) that float up the screen live on both devices.
  - **✍️ Whisper on Canvas**: Type a secret dedication to render as a glowing animated banner across the drawing.
- **🎁 Surprise Gift Experience (`/gift`)**: 3D interactive wax-seal envelope reveal for partners with synced music and drawing animation.
- **4K Masterpiece & Video Export**: Download high-resolution PNG or record WebM video loops ready for Instagram Reels or TikTok.

---

## 🔒 100% Privacy & Zero-Storage Architecture

- **No Database & No Server File Storage**: The server never receives, logs, or stores user-uploaded images.
- **Client-Side URL Hash Encoding**: When sharing a gift link, the image is compressed entirely in the sender's browser and placed into the URL hash fragment (`#img=...`).
- **HTTP Standard Privacy**: Browsers never transmit hash fragments to servers, ensuring true peer-to-peer browser privacy between you and your recipient.

---

## 🚀 Getting Started Locally

1. Open PowerShell / Command Prompt in this folder:
   ```bash
   cd "C:\Users\yousa\.gemini\antigravity\scratch\multilingual-portrait"
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

---

## 🌐 Deploy Free on Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: multilingual calligraphy studio with live 2-person chat & zero-storage privacy"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** and select `multilingual-portrait`.
3. Click **"Deploy"**.
4. In under 60 seconds, your public live link is ready (e.g. `https://multilingual-portrait.vercel.app`) for $0 / free forever!
