# NxtWave Growth Intern Challenge — Fullstack Growth Engine

## "Build Your First AI Project in 60 Minutes"
### Goal: 500 Final-Year Engineering Student Registrations · Budget: ₹2,000 · 7-Day Sprint

---

## 🚀 Live System Architecture (Frontend + Backend)

This is not just a static landing page — it is a **complete, fullstack registration + viral referral growth engine** built to solve the 500-student acquisition challenge.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend API** | Node.js + Express (`server.js`) | REST API handling registrations, referral attribution, live analytics, and 7-day cohort simulation |
| **Database** | File-backed JSON store (`data/db.json`) | Persistent storage for candidate records, referral graphs, channel attribution, and milestones |
| **Frontend UI** | Modern Vanilla JS + CSS3 | High-converting warm sunset glassmorphism design with interactive terminal and project previewer |
| **Strategy Core** | `growth_strategy.md` | Full 6-output strategic plan (slide deck, distribution engine, funnel math, video script, defenses) |

---

## 🎨 Warm Earthy Luxury Design Palette

The visual presentation uses a tailored warm earthy palette inspired by cozy natural tones:

| Token | Hex Value | Role & Usage |
|-------|-----------|--------------|
| **Deep Espresso** | `#2A1C16` | Luxurious dark background base, dark surface cards, and deep contrast layers |
| **Warm Sienna** | `#6C3720` | Ambient mesh glow layers, card borders, and deep accent highlights |
| **Rich Caramel** | `#A67149` | Primary CTA buttons, progress bar fills, active pill highlights, and hover states |
| **Warm Sand** | `#BDA389` | Secondary buttons, subtle borders, tech stack chips, and secondary labels |
| **Warm Linen Cream** | `#E6D4B9` | High-contrast typography, crisp headings, and luminous foreground text |

---

## ⚡ How to Run

### Option 1: Fullstack Node.js Mode (Recommended)
```bash
# 1. Install dependencies (Express + CORS)
npm install

# 2. Start the Express server
npm start
```
Open **`http://localhost:3000`** in your browser.
- Live backend sync with status: `🟢 Express API Online (Port 3000) • Real-time DB Sync`
- Full REST endpoints active at `/api/stats`, `/api/register`, `/api/referral/:code`, `/api/leaderboard`, `/api/simulate`

### Option 2: Zero-Install Static Mode
Simply double-click **`index.html`** or open it directly in any web browser.
- Built with an automatic graceful fallback layer: all features (registration, project preview, and 7-day simulation) function seamlessly offline using client-side state.

---

## 🎯 What the Working Asset Does

1. **Output-First Value Proposition:** Converts placement-pressured final-year students with a concrete promise: *"Build a working AI project in 60 minutes. Leave with a live GitHub link on your resume."*
2. **Interactive 60-Minute Project Previewer:** Allows candidates to preview the 3 deployable workshop projects (Smart Resume Screener, Domain Mock Interviewer Bot, and AI Data & Code Explainer) with live simulated outputs.
3. **Interactive Hero Code Terminal:** Click `▶ Run Demo` to simulate a live automated AI deployment pipeline directly in the browser.
4. **Frictionless 5-Field Registration:** Fast modal capturing Name, College Email, WhatsApp Number, College, and Graduation Year with instant validation and duplicate protection.
5. **Post-Registration Viral Referral Hub:**
   - Automatically issues a unique, traceable referral code (e.g. `REF-ANI646`).
   - 1-Tap pre-formatted sharing for **WhatsApp, LinkedIn, and Telegram**.
   - 3 Career-Accelerating Milestones:
     - **Milestone 1 (1 Referral):** Priority Workshop Seat & Starter Repo Access
     - **Milestone 2 (3 Referrals):** AI Project Recruiter Scorecard & Code Evaluation
     - **Milestone 3 (5 Referrals):** 1-on-1 Mentor Placement Resume Review
6. **Live Campaign & Growth Command Center:**
   - Real-time KPI metrics: Registrations, Viral K-Factor (`0.34`), Cost Per Registration (`₹2.33`), and Spots Left.
   - Channel attribution meters (WhatsApp Ambassadors, Peer Referrals, LinkedIn & Tech Clubs, Instagram Reels, Hackathons).
   - Live Campus Ambassador Leaderboard with real-time rankings.
   - **Interactive 7-Day Compounding Simulation:** Click `▶ Run 7-Day Campaign Simulation` to watch the day-by-day compounding flywheel achieve **516 registrations** with ₹800 budget surplus.

---

## 📊 Growth Strategy & Funnel Economics

```
DISCOVERY (24,370+ reach)
  WhatsApp Campus Ambassadors (20 Colleges) → LinkedIn Tech Clubs → Hackathon Communities → 1 Instagram Reel
              ↓
LANDING PAGE (3,000+ visits)
  Warm Sunset UI · Output-first headline · 3 project demos · Zero-friction form
              ↓
REGISTRATION (500 target)
  Unique referral code auto-generated per candidate
              ↓
VIRAL REFERRAL LOOP (target 30% share rate)
  1-Tap WhatsApp share · 3 career milestones · Ambassador leaderboard
              ↓
COMPOUNDING SIGNUPS (Viral K-Factor: 0.34)
```

| Channel | Reach | CTR | Conv % | Projected Regs | Allocated Budget |
|---------|------:|----:|-------:|---------------:|-----------------:|
| WhatsApp Communities | 4,000 | 15% | 38% | 228 | ₹600 |
| Peer Referral (Viral Loop) | 570 | 30% | 45% | 77 | ₹0 |
| LinkedIn + Tech Clubs | 3,000 | 8% | 40% | 96 | ₹0 |
| Instagram Reel (Micro-Creator) | 12,000 | 5% | 25% | 38 | ₹400 |
| Hackathon Groups | 4,800 | 4% | 35% | 67 | ₹0 |
| **Total** | **24,370** | | | **516** | **₹1,200** |

- **Projected CPR:** **₹2.33**
- **Budget Reserve:** **₹800** held as risk contingency
- **Viral K-Factor:** **0.34** (every 3 signups bring in 1+ peer organically)

---

## 📁 Repository Structure

```
├── server.js              # Express backend server (REST APIs, simulation engine, static server)
├── package.json           # Node.js configuration and start scripts
├── index.html             # High-converting landing page & referral growth system
├── styles.css             # Warm sunset design system (#8B2346, #F05A28, #FFBE5C, #FFE8B2)
├── app.js                 # Client-side controller (dual-mode: Express API + local fallback)
├── data/
│   └── db.json            # Persistent JSON database (registrations, channels, leaderboard)
├── growth_strategy.md     # Complete strategy document (all 6 challenge outputs)
├── README.md              # Project documentation and architectural overview
└── .gitignore             # Git ignore rules (node_modules, local answer files)
```

---

*Submitted for NxtWave Growth Intern — Growth Challenge Round 1.*
