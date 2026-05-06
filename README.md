# 🌹 Birthday Experience — React + Vite + TypeScript

A romantic, interactive 3D birthday web app.

## Features
- **Smile-to-unlock** — MediaPipe face detection; she smiles to reveal the slideshow
- **Deep mirror camera** — Circular mirror with depth illusion, glow rings & sparkles
- **3D photo cards** — Mouse/touch tilt, shimmer & vignette
- **Background music** — Autoplay with mute toggle
- **20-second slides** — Live glowing progress bar per slide
- **Floating particles** — Gold & rose particles drifting up

---

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Personalise (`src/config.ts`)

### Photos
Upload to [imgur.com](https://imgur.com) → right-click → Copy image address

```ts
export const SLIDES = [
  { img: 'https://i.imgur.com/XXXXXXX.jpg', msg: "Your message here" },
  ...
]
```

### Music
Any direct `.mp3` URL:
```ts
export const MUSIC_URL = "https://your-link.mp3"
```

### Slide duration
```ts
export const SLIDE_DURATION_SECONDS = 20
```

---

## Deploy to GitHub Pages

**1. Install gh-pages**
```bash
npm install --save-dev gh-pages
```

**2. Update `vite.config.ts`** — add your repo name as base:
```ts
export default defineConfig({
  plugins: [react()],
  base: '/birthday-vite/',   // ← your GitHub repo name
})
```

**3. Add scripts to `package.json`**:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

**4. Push to GitHub and deploy**
```bash
git init
git add .
git commit -m "birthday app 🌹"
git remote add origin https://github.com/YOUR_USERNAME/birthday-vite.git
git push -u origin main
npm run deploy
```

**5. Enable GitHub Pages**

Go to your repo → **Settings → Pages → Source → gh-pages branch** → Save

Your app lives at: `https://YOUR_USERNAME.github.io/birthday-vite/`

---

## Project Structure

```
birthday-vite/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── config.ts           ← ★ Edit this
    ├── vite-env.d.ts
    └── components/
        ├── Particles.tsx
        ├── Landing.tsx
        ├── SmileGate.tsx
        ├── Card3D.tsx
        └── Slideshow.tsx
```
