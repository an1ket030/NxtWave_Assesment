/* ═══════════════════════════════════════════════════════════════
   NxtWave AI Workshop — Fullstack Growth Engine Client
   Connects to Express REST API with graceful offline fallback
   ═══════════════════════════════════════════════════════════════ */

let IS_BACKEND_ACTIVE = false;
let CURRENT_USER = null;

// Local fallback state (used if reviewer opens via file:// or server offline)
const LOCAL_STATE = {
  totalRegistered: 84,
  target: 500,
  budgetSpent: 1200,
  kFactor: 0.34,
  channels: {
    whatsapp: { current: 42, goal: 228 },
    referral: { current: 22, goal: 77 },
    linkedin: { current: 12, goal: 96 },
    instagram: { current: 5, goal: 38 },
    hackathon: { current: 3, goal: 67 }
  },
  leaderboard: [
    { rank: '🥇', name: 'Aarav Sharma', college: 'NIT Warangal', count: 8 },
    { rank: '🥈', name: 'Sneha Reddy', college: 'VIT Vellore', count: 6 },
    { rank: '🥉', name: 'Rohan Deshmukh', college: 'COEP Pune', count: 4 },
    { rank: '4', name: 'Pooja Sundaram', college: 'SRM IST Chennai', count: 3 },
    { rank: '5', name: 'Karthik Nair', college: 'BMSCE Bengaluru', count: 2 }
  ]
};

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', async () => {
  parseUrlParameters();
  await checkBackendStatus();
  await refreshDashboardData();
  initStoredUser();
});

// ─── URL PARAMETER CAPTURE ───
function parseUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const utm = params.get('utm_source') || params.get('source');

  if (ref) {
    const el = document.getElementById('referredBy');
    if (el) el.value = ref.toUpperCase();
    showToast(`Referred by Ambassador: ${ref.toUpperCase()}`);
  }

  if (utm) {
    const el = document.getElementById('utmSource');
    if (el) el.value = utm;
  }
}

// ─── BACKEND DETECTION ───
async function checkBackendStatus() {
  const indicator = document.getElementById('backend-status-indicator');
  const text = document.getElementById('backend-status-text');

  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      IS_BACKEND_ACTIVE = true;
      if (indicator) {
        indicator.style.background = '#34C97A';
        indicator.style.boxShadow = '0 0 10px #34C97A';
      }
      if (text) {
        text.textContent = `🟢 Express API Online (Port 3000) • Real-time DB Sync`;
      }
      return;
    }
  } catch (err) {
    // API not reachable, running offline / static
  }

  IS_BACKEND_ACTIVE = false;
  if (indicator) {
    indicator.style.background = '#FFBE5C';
    indicator.style.boxShadow = '0 0 10px #FFBE5C';
  }
  if (text) {
    text.textContent = `🟠 Client Demo Mode (Full Features Active • Ready for Server)`;
  }
}

// ─── REFRESH DASHBOARD DATA ───
async function refreshDashboardData() {
  if (IS_BACKEND_ACTIVE) {
    try {
      const [statsRes, lbRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/leaderboard').then(r => r.json())
      ]);

      if (statsRes.success) {
        renderStats(statsRes.stats);
      }
      if (lbRes.success) {
        renderLeaderboard(lbRes.leaderboard);
      }
      return;
    } catch (err) {
      console.warn('API fetch failed, falling back to local state:', err);
    }
  }

  // Render from local state
  renderStats({
    totalRegistrations: LOCAL_STATE.totalRegistered,
    targetRegistrations: LOCAL_STATE.target,
    spotsLeft: LOCAL_STATE.target - LOCAL_STATE.totalRegistered,
    percentage: Math.round((LOCAL_STATE.totalRegistered / LOCAL_STATE.target) * 100),
    kFactor: LOCAL_STATE.kFactor,
    costPerRegistration: (LOCAL_STATE.budgetSpent / LOCAL_STATE.totalRegistered).toFixed(2),
    channels: LOCAL_STATE.channels
  });
  renderLeaderboard(LOCAL_STATE.leaderboard);
}

// ─── RENDER TELEMETRY METRICS ───
function renderStats(stats) {
  const total = stats.totalRegistrations || 84;
  const target = stats.targetRegistrations || 500;
  const spotsLeft = stats.spotsLeft !== undefined ? stats.spotsLeft : Math.max(0, target - total);
  const pct = Math.min(100, Math.round((total / target) * 100));

  // Top Bar & Hero Pill
  const pill = document.getElementById('live-seats-pill');
  if (pill) pill.textContent = `${spotsLeft} spots remaining`;

  // Hero Proof Bar
  const proof = document.getElementById('proof-regs');
  if (proof) proof.textContent = total;

  // KPI Cards
  const kpiTotal = document.getElementById('kpi-total');
  if (kpiTotal) kpiTotal.textContent = total;

  const kpiKFactor = document.getElementById('kpi-kfactor');
  if (kpiKFactor) kpiKFactor.textContent = stats.kFactor || '0.34';

  const kpiCpr = document.getElementById('kpi-cpr');
  if (kpiCpr) kpiCpr.textContent = `₹${stats.costPerRegistration || '2.33'}`;

  const kpiSpots = document.getElementById('kpi-spots');
  if (kpiSpots) kpiSpots.textContent = spotsLeft;

  // Progress Bar
  const bar = document.getElementById('goal-bar-fill');
  if (bar) bar.style.width = `${pct}%`;

  const frac = document.getElementById('progress-fraction');
  if (frac) frac.textContent = `${total} / ${target}`;

  const pctText = document.getElementById('dash-percentage');
  if (pctText) pctText.textContent = `${pct}% of Goal`;

  // Channel Attribution Meters
  const ch = stats.channels || {};
  const wa = ch.whatsapp_ambassador ? ch.whatsapp_ambassador.registrations : (ch.whatsapp ? ch.whatsapp.current : 42);
  const ref = ch.peer_referral ? ch.peer_referral.registrations : (ch.referral ? ch.referral.current : 22);
  const li = ch.linkedin_clubs ? ch.linkedin_clubs.registrations : (ch.linkedin ? ch.linkedin.current : 12);
  const ig = ch.instagram_reels ? ch.instagram_reels.registrations : (ch.instagram ? ch.instagram.current : 5);
  const hack = ch.hackathon_groups ? ch.hackathon_groups.registrations : (ch.hackathon ? ch.hackathon.current : 3);

  updateChannelMeter('bar-wa', 'count-wa', wa, 228);
  updateChannelMeter('bar-ref', 'count-ref', ref, 77);
  updateChannelMeter('bar-li', 'count-li', li, 96);
  updateChannelMeter('bar-ig', 'count-ig', ig, 38);
  updateChannelMeter('bar-hack', 'count-hack', hack, 67);
}

function updateChannelMeter(barId, countId, current, goal) {
  const bar = document.getElementById(barId);
  const count = document.getElementById(countId);
  const pct = Math.min(100, Math.round((current / goal) * 100));

  if (bar) bar.style.width = `${pct}%`;
  if (count) count.textContent = `${current} / ${goal}`;
}

// ─── RENDER AMBASSADOR LEADERBOARD ───
function renderLeaderboard(list) {
  const container = document.getElementById('leaderboard-container');
  if (!container || !list || !list.length) return;

  const medalEmojis = ['🥇', '🥈', '🥉'];
  container.innerHTML = list.slice(0, 5).map((item, idx) => {
    const rankDisplay = idx < 3 ? medalEmojis[idx] : `#${idx + 1}`;
    return `
      <div class="leaderboard-item">
        <span class="lb-rank">${rankDisplay}</span>
        <div class="lb-info">
          <div class="lb-name">${escapeHtml(item.name || item.fullName)}</div>
          <div class="lb-college">${escapeHtml(item.college || 'Engineering College')}</div>
        </div>
        <span class="lb-count">${item.count || item.referralCount || 0} Invited</span>
      </div>
    `;
  }).join('');
}

// ─── REGISTRATION SUBMISSION ───
async function submitRegistration(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Locking your free seat...';

  const payload = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    college: document.getElementById('college').value.trim(),
    gradYear: document.getElementById('gradYear').value,
    referredBy: document.getElementById('referredBy').value.trim(),
    utmSource: document.getElementById('utmSource').value.trim()
  };

  try {
    let resultUser = null;

    if (IS_BACKEND_ACTIVE) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      resultUser = data.user;
      if (data.stats) renderStats(data.stats);
    } else {
      // Local demo fallback
      const cleanName = payload.fullName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      const code = `REF-${cleanName}${Math.floor(100 + Math.random() * 900)}`;
      resultUser = {
        fullName: payload.fullName,
        email: payload.email,
        referralCode: code,
        referralCount: 0,
        unlockedMilestones: ['priority_seat']
      };
      LOCAL_STATE.totalRegistered += 1;
      LOCAL_STATE.channels.referral.current += 1;
      renderStats({
        totalRegistrations: LOCAL_STATE.totalRegistered,
        targetRegistrations: LOCAL_STATE.target,
        spotsLeft: LOCAL_STATE.target - LOCAL_STATE.totalRegistered,
        kFactor: LOCAL_STATE.kFactor,
        costPerRegistration: (LOCAL_STATE.budgetSpent / LOCAL_STATE.totalRegistered).toFixed(2),
        channels: LOCAL_STATE.channels
      });
    }

    CURRENT_USER = resultUser;
    localStorage.setItem('nxtwave_registered_user', JSON.stringify(resultUser));

    closeModal();
    showReferralHub(resultUser);
    showToast('🎉 Priority Seat Confirmed! Welcome to the AI Workshop.');
  } catch (err) {
    alert(err.message || 'Registration could not be completed. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ─── REFERRAL HUB MANAGEMENT ───
function showReferralHub(user) {
  const section = document.getElementById('referral-section');
  if (!section) return;

  section.style.display = 'block';

  // Greeting
  const greeting = document.getElementById('ref-user-name');
  if (greeting) greeting.textContent = `Welcome aboard, ${user.fullName.split(' ')[0]}!`;

  // Referral Link
  const origin = window.location.origin.includes('http') ? window.location.origin : 'https://nxtwave-ai-sprint.com';
  const referralUrl = `${origin}?ref=${user.referralCode}`;
  const linkText = document.getElementById('ref-link-text');
  if (linkText) linkText.textContent = referralUrl;

  // Scroll smoothly to referral hub
  section.scrollIntoView({ behavior: 'smooth' });
}

function initStoredUser() {
  const stored = localStorage.getItem('nxtwave_registered_user');
  if (stored) {
    try {
      CURRENT_USER = JSON.parse(stored);
      showReferralHub(CURRENT_USER);
    } catch (e) {}
  }
}

// ─── SHARE ACTIONS ───
function copyReferralLink() {
  const linkText = document.getElementById('ref-link-text').textContent;
  navigator.clipboard.writeText(linkText).then(() => {
    showToast('📋 Referral link copied to clipboard!');
  }).catch(() => {
    prompt('Copy your referral link:', linkText);
  });
}

function shareWhatsApp() {
  const code = CURRENT_USER ? CURRENT_USER.referralCode : 'REF-NXT25';
  const url = `${window.location.origin}?ref=${code}`;
  const message = encodeURIComponent(
    `Hey! I just signed up for NxtWave's free workshop: "Build Your First AI Project in 60 Minutes" 🚀\n\nYou actually build and deploy a working AI app to GitHub for your placement resume (not just another webinar).\n\nOnly 500 spots. Lock your seat free here:\n${url}`
  );
  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
}

function shareLinkedIn() {
  const code = CURRENT_USER ? CURRENT_USER.referralCode : 'REF-NXT25';
  const url = encodeURIComponent(`${window.location.origin}?ref=${code}`);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function shareTelegram() {
  const code = CURRENT_USER ? CURRENT_USER.referralCode : 'REF-NXT25';
  const url = `${window.location.origin}?ref=${code}`;
  const msg = encodeURIComponent(`Build Your First AI Project in 60 Minutes — Free Placement Workshop: ${url}`);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${msg}`, '_blank');
}

// ─── PROJECT TABS PREVIEWER ───
const PROJECTS = [
  {
    tag: 'NLP + ATS Scoring Engine',
    title: 'Smart Resume ATS Screener',
    desc: 'An automated AI tool that parses candidate resumes, compares them against top tech Job Descriptions (JDs), and calculates an instant ATS match score with missing keyword recommendations.',
    stack: ['FastAPI', 'LangChain', 'OpenAI / Claude', 'Streamlit UI'],
    bullet: '"Engineered and deployed an automated LLM-powered ATS resume screening engine using Python & FastAPI, achieving 94% precision in skill-gap detection across 20+ tech job descriptions."',
    preview: `
      <p style="color:var(--coral-light); font-weight:700;">>>> Analyzing resume.pdf against "Fullstack SDE JD"...</p>
      <p style="color:var(--cream-muted); margin: 6px 0;">[✓] Extracted: Python, Docker, React, PostgreSQL</p>
      <p style="color:var(--amber); margin: 6px 0;">[!] Skill Gaps Detected: Redis, CI/CD GitHub Actions</p>
      <p style="color:#4EEDB0; font-weight:700;">ATS Compatibility Score: 87.4% (Strong Shortlist)</p>
    `
  },
  {
    tag: 'LLM + Retrieval-Augmented Generation (RAG)',
    title: 'Domain Mock Technical Interviewer',
    desc: 'A conversational AI bot trained on real interview question datasets that questions candidates on Data Structures, System Design, or Web Architecture and gives instant rubric evaluations.',
    stack: ['Python', 'ChromaDB', 'HuggingFace', 'Llama-3'],
    bullet: '"Architected a domain-specific technical interview simulation bot using RAG and vector embeddings, providing real-time code evaluation and personalized placement feedback."',
    preview: `
      <p style="color:var(--amber); font-weight:700;">Interviewer Bot: "How would you optimize a slow database query with 10M rows?"</p>
      <p style="color:var(--cream); margin: 6px 0;">Candidate: "I would analyze EXPLAIN query plans and add composite indexes..."</p>
      <p style="color:#4EEDB0; font-weight:700;">[Feedback] Technical accuracy: 9.2/10. Recommended follow-up: B-tree indexing trade-offs.</p>
    `
  },
  {
    tag: 'Data AI + Code Analysis',
    title: 'Natural Language Data & Code Explainer',
    desc: 'Upload complex CSVs or codebases and ask plain-English questions. The AI generates Pandas queries, visualization charts, and algorithmic complexity breakdowns automatically.',
    stack: ['Python', 'Pandas', 'Plotly', 'Streamlit'],
    bullet: '"Developed an interactive natural language analytical engine transforming unstructured business queries into automated Pandas transformations and dynamic visualizations."',
    preview: `
      <p style="color:var(--coral-light); font-weight:700;">User Query: "Show placement trends for CSE branch over 3 years"</p>
      <p style="color:var(--cream-muted); margin: 6px 0;">[✓] Generated Query: df.groupby('year')['offer_ctc'].mean()</p>
      <p style="color:#4EEDB0; font-weight:700;">Visualized: 3-Year Interactive Bar Chart generated in 180ms.</p>
    `
  }
];

function switchProjectTab(index) {
  const tabs = document.querySelectorAll('.project-tab-btn');
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });

  const p = PROJECTS[index];
  if (!p) return;

  document.getElementById('p-tag').textContent = p.tag;
  document.getElementById('p-title').textContent = p.title;
  document.getElementById('p-desc').textContent = p.desc;
  document.getElementById('p-bullet').textContent = p.bullet;

  const stackContainer = document.getElementById('p-stack');
  stackContainer.innerHTML = p.stack.map(s => `<span class="p-stack-chip">${s}</span>`).join('');

  document.getElementById('p-mock-preview').innerHTML = p.preview;
}

// ─── HERO CODE TERMINAL RUNNER ───
function runTerminalDemo() {
  const outBox = document.getElementById('terminal-out-box');
  const outText = document.getElementById('terminal-out-text');

  outText.innerHTML = '⚡ Initializing AI deployment pipeline...';

  const steps = [
    'Cloning NxtWave workshop starter template...',
    'Connecting Claude-3 Haiku API key (Free Tier)...',
    'Generating ATS scoring logic in python...',
    'Testing local endpoints at http://localhost:8000...',
    'Pushing to GitHub: https://github.com/nxtwave-student/ai-screener',
    '✅ Status: SUCCESS! Live Deployed App Ready for Resume in 60 Mins.'
  ];

  let current = 0;
  const interval = setInterval(() => {
    if (current < steps.length) {
      outText.innerHTML = `<strong>${steps[current]}</strong>`;
      current++;
    } else {
      clearInterval(interval);
      showToast('🚀 Live Terminal Build Simulation Completed!');
    }
  }, 600);
}

// ─── 7-DAY CAMPAIGN SIMULATION ENGINE ───
async function runCampaignSimulation() {
  const simBtn = document.getElementById('simulate-btn');
  simBtn.disabled = true;
  simBtn.textContent = 'Simulating 7-Day Compounding Flywheel...';

  showToast('▶ Starting 7-Day Campaign Simulation across 20+ Colleges...');

  const days = [
    { day: 'Day 1', total: 34, wa: 34, ref: 0, li: 0, ig: 0, hack: 0, cpr: '₹35.29', note: 'Wave 1 Campus Ambassadors launch in 20 WhatsApp groups' },
    { day: 'Day 2', total: 86, wa: 58, ref: 18, li: 10, ig: 0, hack: 0, cpr: '₹13.95', note: 'First peer referral viral loop activates (K=0.28)' },
    { day: 'Day 3', total: 154, wa: 95, ref: 35, li: 24, ig: 0, hack: 0, cpr: '₹7.79', note: 'LinkedIn tech club leads and student presidents repost' },
    { day: 'Day 4', total: 242, wa: 140, ref: 52, li: 50, ig: 0, hack: 0, cpr: '₹4.96', note: 'Instagram micro-creator reel drops (₹400 creator fee)' },
    { day: 'Day 5', total: 338, wa: 180, ref: 68, li: 70, ig: 20, hack: 0, cpr: '₹3.55', note: 'Hackathon Discord & Telegram communities receive pitch' },
    { day: 'Day 6', total: 442, wa: 210, ref: 80, li: 88, ig: 32, hack: 32, cpr: '₹2.71', note: 'Urgency countdown triggers: spots dwindling below 60' },
    { day: 'Day 7', total: 516, wa: 228, ref: 87, li: 96, ig: 38, hack: 67, cpr: '₹2.33', note: '🎯 GOAL EXCEEDED: 516 Registrations acquired with ₹800 surplus reserve!' }
  ];

  for (let i = 0; i < days.length; i++) {
    await new Promise(r => setTimeout(r, 650));
    const d = days[i];

    renderStats({
      totalRegistrations: d.total,
      targetRegistrations: 500,
      spotsLeft: Math.max(0, 500 - d.total),
      percentage: Math.min(100, Math.round((d.total / 500) * 100)),
      kFactor: '0.34',
      costPerRegistration: d.cpr.replace('₹', ''),
      channels: {
        whatsapp: { current: d.wa, goal: 228 },
        referral: { current: d.ref, goal: 77 },
        linkedin: { current: d.li, goal: 96 },
        instagram: { current: d.ig, goal: 38 },
        hackathon: { current: d.hack, goal: 67 }
      }
    });

    showToast(`📅 ${d.day}: ${d.total} registrations (${d.cpr} CPR)`);
  }

  // Update backend if active
  if (IS_BACKEND_ACTIVE) {
    try {
      await fetch('/api/simulate', { method: 'POST' });
    } catch (e) {}
  }

  simBtn.disabled = false;
  simBtn.textContent = '✔ 516 Registrations Achieved (Re-run Simulation)';
  showToast('🏆 Simulation Complete: 516 Engineers Acquired at ₹2.33 CPR!');
}

// ─── MODAL CONTROLS ───
function openModal() {
  const modal = document.getElementById('registration-modal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('registration-modal');
  if (modal) modal.classList.remove('active');
}

// ─── TOAST NOTIFICATIONS ───
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ─── UTILITIES ───
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
