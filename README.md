This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# 🌟 Multilingual Portrait Studio

## Getting Started
Transform any photo into a glowing visual art portrait written in 100 languages. Inspired by creative Python animations (multilingual rotating wheels and beating hearts), built as a modern, interactive web application.

First, run the development server:
---

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
## ✨ Features

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
- **Photo Upload & Framing**: Upload any portrait with instant client-side processing (or test with built-in sample models).
- **100 Languages Engine**: Generates accurate script translations and phonetic transliterations in 100 languages (including Arabic, Russian Cyrillic, Hindi Devanagari, Japanese Katakana, Korean Hangul, Greek, Hebrew, Thai, etc.).
- **3 Visual Animation Styles**:
  1. 💖 **Heart Pulse** (Inspired by Reel 2): Pulsating glowing heart formed by concentric loops of multilingual text radiating from the central photo.
  2. 🔄 **Mandala Wheel** (Inspired by Reel 1): Rotating kaleidoscopic wheel with 48+ radiant spokes of multilingual text and sparkling star trails.
  3. 👤 **Micrography / Typographic Portrait**: Rebuilds the portrait using pixel luminance filled with the multilingual words.
- **Interactive Controls**: Customize neon glow color (Pink, Cyan, Gold, Purple, Green, Red), glow intensity, rotation speed, and font size in real time at 60 FPS.
- **Export**:
  - 📸 **Download 4K Art**: Instant high-resolution PNG snapshot.
  - 🎥 **Record Animation Video**: In-browser WebM/MP4 recording ready to share on Instagram Reels or TikTok.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
## 🚀 How to Run Locally

## Learn More
1. Open PowerShell / Command Prompt in this folder:
   ```bash
   cd "C:\Users\yousa\.gemini\antigravity\scratch\multilingual-portrait"
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

To learn more about Next.js, take a look at the following resources:
---

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
## 🌐 100% Free Hosting on Vercel

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
Since this project has only 3–4 users, you can host it **completely free forever** on Vercel:

## Deploy on Vercel
### Step 1: Push to GitHub
1. Create a free GitHub account if you don't have one.
2. Create a new repository (e.g., `multilingual-portrait`).
3. Run these commands inside this project directory:
   ```bash
   git add .
   git commit -m "Initial commit of Multilingual Portrait Studio"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/multilingual-portrait.git
   git push -u origin main
   ```

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** and select `multilingual-portrait`.
3. Click **"Deploy"**.
4. In under 60 seconds, you will receive a free public link:
   ```
   https://multilingual-portrait.vercel.app
   ```
Share this link with your 3–4 users!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---

## 🔑 Optional: AI Transliteration (Free Tier)

The app already includes an offline transliteration dictionary for 100 languages that works out of the box. 

If you want Gemini AI to generate customized transliterations for any rare or unique custom name:
1. Get a free API key at [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env.local` file in this folder:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```
3. On Vercel, add `GEMINI_API_KEY` under **Project Settings > Environment Variables**.
