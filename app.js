/* ═══════════════════════════════════════════════
   NxtWave AI Workshop — Application Logic
   Registration + Referral + Dashboard + Simulation
   ═══════════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────────
const STATE = {
  registrations: [],
  totalRegistered: 0,
  currentUser: null,
  simulationRunning: false,
  simInterval: null,
  channelCounts: { whatsapp: 0, referral: 0, linkedin: 0, direct: 0 },
  reach: 0,
};

const BASE_URL = window.location.href.split('?')[0];

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  readURLParams();
  loadFromStorage();
  updateLiveCount();
  startTypingAnimation();
  animateCounters();
  updateSpotText();
});

// ─── URL PARAMS ──────────────────────────────────
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const utm = params.get('utm_source') || params.get('source') || '';

  if (ref) {
    const el = document.getElementById('referred_by');
    if (el) el.value = ref;
  }
  if (utm) {
    const el = document.getElementById('utm_source');
    if (el) el.value = utm;
  }
}

// ─── LOCAL STORAGE ────────────────────────────────
function loadFromStorage() {
  try {
    const saved = localStorage.getItem('nxtwave_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      STATE.registrations = parsed.registrations || [];
      STATE.totalRegistered = parsed.totalRegistered || 0;
      STATE.channelCounts = parsed.channelCounts || STATE.channelCounts;
      STATE.reach = parsed.reach || 0;
      STATE.currentUser = parsed.currentUser || null;
    }

    // If user already registered, show referral section
    if (STATE.currentUser) {
      showReferralSection();
      updateReferralSection();
    }

    updateDashboard();
  } catch (e) {
    console.warn('Storage read failed:', e);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem('nxtwave_state', JSON.stringify({
      registrations: STATE.registrations,
      totalRegistered: STATE.totalRegistered,
      channelCounts: STATE.channelCounts,
      reach: STATE.reach,
      currentUser: STATE.currentUser,
    }));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

// ─── LIVE COUNT PILL ──────────────────────────────
function updateLiveCount() {
  const el = document.getElementById('live-count-text');
  if (!el) return;
  const n = STATE.totalRegistered;
  if (n === 0) {
    el.textContent = 'Be among the first 500 to register';
  } else {
    el.textContent = `${n} student${n > 1 ? 's' : ''} registered — ${500 - n} spots left`;
  }
}

function updateSpotText() {
  const el = document.getElementById('spots-left');
  if (!el) return;
  const remaining = Math.max(0, 500 - STATE.totalRegistered);
  if (remaining > 400) {
    el.textContent = 'Early registrations open — secure your spot now';
  } else if (remaining > 100) {
    el.textContent = `Only ${remaining} spots remaining`;
  } else if (remaining > 0) {
    el.textContent = `⚠️ Only ${remaining} spots left!`;
  } else {
    el.textContent = 'Workshop fully booked — join waitlist';
  }
}

// ─── MODAL ───────────────────────────────────────
function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-register').style.display = 'block';
  document.getElementById('modal-success').style.display = 'none';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── REGISTRATION ─────────────────────────────────
function handleRegistration(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submit-btn');

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    college: form.college.value.trim(),
    branch: form.branch.value,
    phone: form.phone.value.trim(),
    referred_by: form.referred_by.value.trim(),
    utm_source: form.utm_source.value.trim() || 'direct',
    timestamp: new Date().toISOString(),
    refCode: generateRefCode(form.name.value.trim()),
    refCount: 0,
  };

  // Prevent duplicate registration (same email)
  const alreadyRegistered = STATE.registrations.find(r => r.email === data.email);
  if (alreadyRegistered) {
    STATE.currentUser = alreadyRegistered;
    showSuccessModal(alreadyRegistered);
    return;
  }

  // Loading state
  btn.textContent = 'Registering…';
  btn.disabled = true;

  // Simulate async (as if hitting an API)
  setTimeout(() => {
    // Register
    STATE.registrations.push(data);
    STATE.totalRegistered++;
    STATE.currentUser = data;

    // Track channel
    const src = data.referred_by ? 'referral' : (data.utm_source || 'direct');
    if (src === 'referral') STATE.channelCounts.referral++;
    else if (src.includes('whatsapp')) STATE.channelCounts.whatsapp++;
    else if (src.includes('linkedin')) STATE.channelCounts.linkedin++;
    else STATE.channelCounts.direct++;

    STATE.reach += 1;

    // Credit referrer
    if (data.referred_by) {
      const referrer = STATE.registrations.find(r => r.refCode === data.referred_by);
      if (referrer) referrer.refCount++;
    }

    saveToStorage();
    updateDashboard();
    updateLiveCount();
    updateSpotText();

    showSuccessModal(data);
    btn.textContent = 'Build My AI Project — Register Free →';
    btn.disabled = false;
  }, 800);
}

function showSuccessModal(user) {
  document.getElementById('modal-register').style.display = 'none';
  document.getElementById('modal-success').style.display = 'block';

  const refLink = `${BASE_URL}?ref=${user.refCode}`;
  document.getElementById('modal-ref-link').textContent = refLink;
  document.getElementById('success-msg').textContent =
    `Hey ${user.name.split(' ')[0]}! You're registered. Workshop details will be sent to ${user.email}.`;
}

function showReferralSection() {
  const sec = document.getElementById('referral-section');
  if (sec) sec.style.display = 'block';
  updateReferralSection();
}

function updateReferralSection() {
  if (!STATE.currentUser) return;
  const u = STATE.currentUser;
  const firstName = u.name.split(' ')[0];

  const nameEl = document.getElementById('ref-display-name');
  if (nameEl) nameEl.textContent = `Hey ${firstName}, you're registered! 🎉`;

  const linkEl = document.getElementById('ref-link-display');
  if (linkEl) linkEl.textContent = `${BASE_URL}?ref=${u.refCode}`;

  const countEl = document.getElementById('ref-count-current');
  if (countEl) countEl.textContent = u.refCount || 0;

  // Update milestones
  const refCount = u.refCount || 0;
  if (refCount >= 1) document.getElementById('m1')?.classList.add('achieved');
  if (refCount >= 3) document.getElementById('m3')?.classList.add('achieved');
  if (refCount >= 5) document.getElementById('m5')?.classList.add('achieved');
}

// ─── REF CODE GEN ─────────────────────────────────
function generateRefCode(name) {
  const initials = name.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${initials}${rand}`;
}

// ─── COPY / SHARE ─────────────────────────────────
function copyRefLink() {
  if (!STATE.currentUser) return;
  const link = `${BASE_URL}?ref=${STATE.currentUser.refCode}`;
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copy-link-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

function copyModalRefLink() {
  if (!STATE.currentUser) return;
  const link = `${BASE_URL}?ref=${STATE.currentUser.refCode}`;
  navigator.clipboard.writeText(link);
}

function getShareText() {
  const name = STATE.currentUser?.name.split(' ')[0] || 'I';
  return `${name === 'I' ? 'I' : name} just registered for NxtWave's free workshop — "Build Your First AI Project in 60 Minutes" 🚀\n\nYou'll build a real, resume-ready AI project in just one hour. It's completely free.\n\nRegister here 👇\n${BASE_URL}?ref=${STATE.currentUser?.refCode || ''}`;
}

function shareWhatsApp() {
  const text = encodeURIComponent(getShareText());
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareLinkedIn() {
  const url = encodeURIComponent(`${BASE_URL}?ref=${STATE.currentUser?.refCode || ''}`);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function shareTelegram() {
  const text = encodeURIComponent(getShareText());
  window.open(`https://t.me/share/url?url=${encodeURIComponent(BASE_URL)}&text=${text}`, '_blank');
}

// ─── DASHBOARD ───────────────────────────────────
function updateDashboard() {
  const n = STATE.totalRegistered;
  const pct = Math.min(100, Math.round((n / 500) * 100));

  const el = document.getElementById('dash-registered');
  if (el) animateNum(el, parseInt(el.textContent.replace(/,/g, '') || 0), n, 600);

  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${pct}%`;

  const pctEl = document.getElementById('progress-pct');
  if (pctEl) pctEl.textContent = `${pct}%`;

  // Channel bars — proportional to total
  const channels = [
    { id: 'cnt-whatsapp', barId: 'ch-whatsapp', count: STATE.channelCounts.whatsapp, color: '#25D366' },
    { id: 'cnt-referral', barId: 'ch-referral', count: STATE.channelCounts.referral, color: '#7C3AED' },
    { id: 'cnt-linkedin', barId: 'ch-linkedin', count: STATE.channelCounts.linkedin, color: '#0A66C2' },
    { id: 'cnt-direct', barId: 'ch-direct', count: STATE.channelCounts.direct, color: '#F59E0B' },
  ];

  const maxCh = Math.max(...channels.map(c => c.count), 1);
  channels.forEach(ch => {
    const cntEl = document.getElementById(ch.id);
    if (cntEl) cntEl.textContent = ch.count;

    const rowEl = document.getElementById(ch.barId);
    if (rowEl) {
      const bar = rowEl.querySelector('.ch-bar');
      if (bar) bar.style.width = `${(ch.count / maxCh) * 100}%`;
    }
  });

  // Key metrics
  const reach = STATE.reach || n * 18;
  const ctr = n > 0 ? ((n / reach) * 100).toFixed(1) + '%' : '—';
  const conv = n > 0 ? ((n / Math.max(reach * 0.4, 1)) * 100).toFixed(1) + '%' : '—';
  const cpr = n > 0 ? '₹' + (2000 / n).toFixed(0) : '—';
  const refCount = STATE.channelCounts.referral;
  const kFactor = n > 0 ? (refCount / n).toFixed(2) : '—';

  setText('m-reach', reach > 0 ? reach.toLocaleString('en-IN') : '—');
  setText('m-ctr', ctr);
  setText('m-conv', conv);
  setText('m-cpr', cpr);
  setText('m-kfactor', kFactor);

  updateLeaderboard();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateLeaderboard() {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;

  const withRefs = STATE.registrations
    .filter(r => r.refCount > 0)
    .sort((a, b) => b.refCount - a.refCount)
    .slice(0, 5);

  if (withRefs.length === 0) {
    lb.innerHTML = '<div class="lb-empty">Top ambassadors will appear here</div>';
    return;
  }

  const ranks = ['🥇', '🥈', '🥉', '4', '5'];
  const rankClasses = ['gold', 'silver', 'bronze', '', ''];

  lb.innerHTML = withRefs.map((u, i) => `
    <div class="lb-row">
      <div class="lb-rank ${rankClasses[i]}">${ranks[i]}</div>
      <div style="flex:1;">
        <div class="lb-name">${u.name}</div>
        <div class="lb-college">${u.college}</div>
      </div>
      <div class="lb-refs">${u.refCount} ref${u.refCount > 1 ? 's' : ''}</div>
    </div>
  `).join('');
}

// ─── CAMPAIGN SIMULATION ─────────────────────────
/*
  Simulates 7-day campaign data to demonstrate the dashboard.
  Models realistic growth: slow start → word-of-mouth spike → FOMO close.
  Channel mix: WhatsApp 45%, Referral 30%, LinkedIn 15%, Direct 10%.
*/
const SIM_PLAN = {
  // Day → {registrations, reach, reachDelta}
  1: { regs: 18, reach: 800,   channels: [8, 3, 5, 2] },
  2: { regs: 42, reach: 2400,  channels: [19, 10, 8, 5] },
  3: { regs: 78, reach: 4200,  channels: [35, 25, 12, 6] },
  4: { regs: 110,reach: 6800,  channels: [50, 35, 17, 8] },
  5: { regs: 130,reach: 9500,  channels: [58, 42, 20, 10] },
  6: { regs: 80, reach: 11200, channels: [36, 25, 14, 5] },
  7: { regs: 42, reach: 12500, channels: [19, 13, 7, 3] },
};

const SIM_NAMES = [
  ['Arjun Mehta','IIT Bombay'],['Priya Nair','VIT Vellore'],
  ['Rohit Singh','BITS Pilani'],['Ananya Iyer','NIT Trichy'],
  ['Karan Patel','NSUT Delhi'],['Shreya Joshi','IIT Madras'],
  ['Vikram Rao','Manipal Inst.'],['Divya Kumar','SRM Chennai'],
  ['Aditya Shah','IIIT Hyderabad'],['Pooja Reddy','Amrita Coimbatore'],
];

function simulateCampaign() {
  if (STATE.simulationRunning) {
    clearInterval(STATE.simInterval);
    STATE.simulationRunning = false;
    document.getElementById('sim-btn').textContent = '▶ Simulate Campaign Growth (Demo)';
    return;
  }

  // Reset
  STATE.registrations = [];
  STATE.totalRegistered = 0;
  STATE.channelCounts = { whatsapp: 0, referral: 0, linkedin: 0, direct: 0 };
  STATE.reach = 0;
  updateDashboard();
  updateLiveCount();
  updateSpotText();

  STATE.simulationRunning = true;
  document.getElementById('sim-btn').textContent = '⏹ Stop Simulation';

  let day = 1;
  let totalSoFar = 0;

  // Reset experiment statuses
  document.querySelectorAll('.exp-status').forEach(el => {
    el.className = 'exp-status running';
    el.textContent = 'Running';
  });
  document.getElementById('exp1-winner').textContent = '—';
  document.getElementById('exp2-winner').textContent = '—';
  document.getElementById('exp3-winner').textContent = '—';

  const runDay = () => {
    if (day > 7) {
      clearInterval(STATE.simInterval);
      STATE.simulationRunning = false;
      document.getElementById('sim-btn').textContent = '▶ Simulate Again';
      concludeExperiments();
      saveToStorage();
      return;
    }

    const plan = SIM_PLAN[day];
    const [wa, ref, li, di] = plan.channels;

    STATE.totalRegistered += plan.regs;
    STATE.reach = plan.reach;
    STATE.channelCounts.whatsapp += wa;
    STATE.channelCounts.referral += ref;
    STATE.channelCounts.linkedin += li;
    STATE.channelCounts.direct += di;

    // Inject fake registrations for leaderboard
    if (day <= 3) {
      const person = SIM_NAMES[day - 1];
      const fake = {
        name: person[0],
        email: `${person[0].replace(' ','').toLowerCase()}@nxtwave.io`,
        college: person[1],
        refCode: generateRefCode(person[0]),
        refCount: Math.floor(Math.random() * 12) + 2,
        utm_source: 'whatsapp',
      };
      STATE.registrations.push(fake);
    }

    totalSoFar = STATE.totalRegistered;
    updateDashboard();
    updateLiveCount();
    updateSpotText();

    // Reveal experiment results on day 4
    if (day === 4) {
      revealExperiment('exp1-winner', 'Variant B — "Build AI Project"');
      revealExperiment('exp2-winner', 'Variant B — "Build My AI Project"');
    }
    if (day === 6) {
      revealExperiment('exp3-winner', 'Variant B — Project Evaluation');
    }

    day++;
  };

  // Run each "day" every 1.5 seconds
  runDay();
  STATE.simInterval = setInterval(runDay, 1500);
}

function revealExperiment(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
  // Mark parent status as complete
  const row = el.closest('tr');
  if (row) {
    const status = row.querySelector('.exp-status');
    if (status) {
      status.className = 'exp-status complete';
      status.textContent = 'Complete';
    }
  }
}

function concludeExperiments() {
  document.querySelectorAll('.exp-status').forEach(el => {
    el.className = 'exp-status complete';
    el.textContent = 'Complete';
  });
}

// ─── TYPING ANIMATION ─────────────────────────────
const typingOutputs = [
  'Resume-ready AI project ✓',
  'GitHub link generated ✓',
  'Certificate issued ✓',
  'Deployed to web ✓',
];
let tyIdx = 0;
let charIdx = 0;
let typing = true;

function startTypingAnimation() {
  const el = document.getElementById('typing-out');
  if (!el) return;

  setInterval(() => {
    const target = typingOutputs[tyIdx];
    if (typing) {
      el.textContent = target.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx >= target.length) {
        typing = false;
        setTimeout(() => { typing = true; }, 1600);
      }
    } else {
      el.textContent = target.substring(0, Math.max(0, charIdx - 1));
      charIdx--;
      if (charIdx <= 0) {
        typing = true;
        tyIdx = (tyIdx + 1) % typingOutputs.length;
      }
    }
  }, 60);
}

// ─── COUNTER ANIMATION ────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.target === '0' ? '₹' : '';
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + Math.round(current);
      if (current >= target) {
        el.textContent = prefix + target;
        clearInterval(timer);
      }
    }, 30);
  });
}

function animateNum(el, from, to, duration) {
  const steps = 30;
  const stepVal = (to - from) / steps;
  let current = from;
  let count = 0;
  const timer = setInterval(() => {
    current += stepVal;
    count++;
    el.textContent = Math.round(current);
    if (count >= steps) {
      el.textContent = to;
      clearInterval(timer);
    }
  }, duration / steps);
}

// ─── NAV SCROLL ─────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    if (window.scrollY > 40) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }
});
