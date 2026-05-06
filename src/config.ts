// ╔══════════════════════════════════════════════════════╗
// ║         🌹  YOUR PERSONAL CONFIGURATION  🌹          ║
// ╚══════════════════════════════════════════════════════╝
import carino from './assets/carino.jpeg'
import carino1 from './assets/carino1.jpeg'
import carino2 from './assets/carino2.jpeg'
import carino3 from './assets/carino3.jpeg'
import carino4 from './assets/carino4.jpeg'
import Umbrella from './assets/Umbrella.mp3'
import meee from './assets/meee.jpeg'
export interface Slide {
  img: string | null
  msg: string
}

// ── SLIDES ──────────────────────────────────────────────
// Set `img` to a direct image URL for each slide.
//
// Easy options:
//  • imgur.com  → upload → right-click image → "Copy image address"
//  • Dropbox    → share link → change ?dl=0 to ?dl=1
//  • Google Drive → share "anyone with link" →
//    https://drive.google.com/uc?export=download&id=FILE_ID
//
// Leave as null to show the rose placeholder.
export const SLIDES: Slide[] = [
  {
    img: carino,
    msg: "From the moment I saw you, my world quietly changed.  ❤️",
  },
  {
    img: meee,
    msg: "Do you know ur crime? is dating a tech boy whose always obsessed with youu nd always want make you happy in a modern tech way?  🥹",},
  {
    img: carino1,
    msg: "You’re not just beautiful… you’re peace, joy, and everything I didn’t know I needed. you such calm nd cute",
  },
  {
    img: carino2,
    msg: "Every moment with you feels like my favourite memory playing on repeat. 🎞️",
  },
  {
    img: carino3,
    msg: "You walked into my life and made everything make sense.",
  },
  {
    img: carino4,
    msg: "Happy Birthday, my love. 🎂 You deserve the softest love, the loudest happiness, and all of me.",
  },
 
]
// ── MUSIC ───────────────────────────────────────────────
// Direct .mp3 URL. Free tracks: https://pixabay.com/music
export const MUSIC_URL =
  Umbrella

// ── SLIDE DURATION ──────────────────────────────────────
// Seconds each slide shows before auto-advancing
export const SLIDE_DURATION_SECONDS = 8

// ── SMILE THRESHOLD ─────────────────────────────────────
// 0 = no smile needed, 1 = biggest possible smile
export const SMILE_THRESHOLD = 0.68

export const LETTER = {
  title: "To the one who holds my whole heart",

  paragraphs: [
    "Happy Birthday, my love. Today isn’t just about celebrating the day you were born… it’s about celebrating the day the world was blessed with someone as special as you.",

    "You came into my life and changed things in ways I can’t even fully explain. You made simple moments feel special, and hard days feel lighter just by being there. Loving you feels natural… like something my heart already knew how to do.",

    "I don’t just love you for how you look, but for who you are — your kindness, your smile, your energy, and the way you make me feel like I matter. You’re my peace, my happiness, and my favorite person.",

    "On your birthday, I just want you to know this — I’m grateful for you, I appreciate you, and I’ll always choose you. No matter what."
  ],

  signoff: "Forever yours, always. ❤️",
}