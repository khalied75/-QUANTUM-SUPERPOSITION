
// ============================================================
// DATA
// ============================================================
const climates = [
  {
    id: 'normal',
    name: 'الأرض الطبيعية',
    emoji: '🌍',
    color: '#00d4ff',
    barColor: 'linear-gradient(90deg, #1565c0, #00d4ff)',
    prob: 38,
    desc: 'الأرض في حالتها المألوفة — مناخ معتدل، محيطات تمتد، قارات خضراء، وجو مناسب للحياة كما نعرفها.',
    log: 'OBSERVED: Earth-Normal — Standard biosphere, 21% O₂ atmosphere'
  },
  {
    id: 'ice',
    name: 'العصر الجليدي الكبير',
    emoji: '🧊',
    color: '#b3e5fc',
    barColor: 'linear-gradient(90deg, #0288d1, #e3f2fd)',
    prob: 18,
    desc: 'الأرض مكسوة بالجليد من القطبين حتى خط الاستواء تقريباً. درجات حرارة تحت الصفر في معظم المناطق، والمحيطات نصف مجمّدة.',
    log: 'OBSERVED: Snowball Earth — Global ice cover, T_avg = -42°C'
  },
  {
    id: 'desert',
    name: 'الكوكب المحترق',
    emoji: '🔥',
    color: '#ff6d00',
    barColor: 'linear-gradient(90deg, #e65100, #ff9800)',
    prob: 22,
    desc: 'ارتفع متوسط الحرارة 12 درجة مئوية. الجليد اختفى، المحيطات تبخرت جزئياً، والأرض أصبحت صحراء عملاقة بلا مياه عذبة.',
    log: 'OBSERVED: Scorched Earth — CO₂ runaway greenhouse, T_avg = +58°C'
  },
  {
    id: 'toxic',
    name: 'الكوكب السام',
    emoji: '☠️',
    color: '#76ff03',
    barColor: 'linear-gradient(90deg, #33691e, #76ff03)',
    prob: 12,
    desc: 'انفجارات بركانية هائلة ملأت الجو بالميثان وثاني أكسيد الكبريت. السماء خضراء مصفرة. الحياة كما نعرفها مستحيلة تماماً.',
    log: 'OBSERVED: Toxic Venus-like — SO₂ atmosphere, pH_rain = 1.2'
  },
  {
    id: 'ocean',
    name: 'كوكب المحيط الواحد',
    emoji: '🌊',
    color: '#00bcd4',
    barColor: 'linear-gradient(90deg, #006064, #00bcd4)',
    prob: 8,
    desc: 'ذاب الجليد القطبي وارتفع مستوى البحار حتى غرقت كل اليابسة. الأرض كلها محيط لا حدود له، بعمق يصل 4 كيلومترات.',
    log: 'OBSERVED: Ocean World — Sea level +4200m, landmass = 0%'
  },
  {
    id: 'void',
    name: 'الكوكب الميت',
    emoji: '🪐',
    color: '#9c27b0',
    barColor: 'linear-gradient(90deg, #4a148c, #9c27b0)',
    prob: 2,
    desc: 'ضربة نيزكية أو انفجار شمسي. لا غلاف جوي، لا مجال مغناطيسي. الأرض صخرة ميتة تدور في الفضاء كالمريخ تماماً.',
    log: 'OBSERVED: Dead Rock — No atmosphere, no magnetosphere, no life'
  }
];

// ============================================================
// STATE
// ============================================================
let currentClimateIndex = 0;
let isInSuperposition = false;
let isAnimating = false;
let observationCount = 0;

// ============================================================
// INIT
// ============================================================
window.addEventListener('load', () => {
  buildStarfield();
  buildProbBars();
  initFadeIn();
  setClimate(0, false);
  setTimeout(() => enterSuperposition(), 1800);
});

function buildStarfield() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 180; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --dur:${2+Math.random()*4}s; --op:${0.3+Math.random()*0.7};
    `;
    sf.appendChild(s);
  }
}

function buildProbBars() {
  const grid = document.getElementById('probGrid');
  climates.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'prob-bar-item' + (i === 0 ? ' active' : '');
    div.id = `prob-item-${i}`;
    div.onclick = () => forceClimate(i);
    div.innerHTML = `
      <div class="prob-bar-header">
        <span>${c.emoji} ${c.name}</span>
        <span class="prob-pct" id="pct-${i}">${c.prob}%</span>
      </div>
      <div class="prob-bar-track">
        <div class="prob-bar-fill" id="bar-${i}" style="width:${c.prob}%; background:${c.barColor};"></div>
      </div>
    `;
    grid.appendChild(div);
  });
}

function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ============================================================
// CLIMATE LOGIC
// ============================================================
function setClimate(index, animate = true) {
  const c = climates[index];
  const sphere = document.getElementById('earthSphere');
  const emoji  = document.getElementById('climateEmoji');
  const name   = document.getElementById('climateName');
  const desc   = document.getElementById('climateDesc');
  const pct    = document.getElementById('probValue');
  const badge  = document.getElementById('superposState');
  const badgeTxt = document.getElementById('superposText');

  // Remove all climate classes
  sphere.className = 'earth-sphere climate-' + c.id;

  // Animate emoji pop
  emoji.style.animation = 'none';
  emoji.offsetHeight;
  emoji.style.animation = 'emojiPop 0.5s ease';
  emoji.textContent = c.emoji;

  name.style.color = c.color;
  name.textContent = c.name;
  desc.textContent = c.desc;
  pct.textContent  = c.prob + '%';

  // Update active bar
  document.querySelectorAll('.prob-bar-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  badge.className = 'superpos-state known';
  badgeTxt.textContent = 'الحالة محددة — تمّ القياس';

  currentClimateIndex = index;
}

function enterSuperposition() {
  if (isAnimating) return;
  isInSuperposition = true;
  const sphere = document.getElementById('earthSphere');
  const wrapper = document.getElementById('earthWrapper');
  const badge   = document.getElementById('superposState');
  const badgeTxt= document.getElementById('superposText');
  const emoji   = document.getElementById('climateEmoji');
  const name    = document.getElementById('climateName');
  const desc    = document.getElementById('climateDesc');

  wrapper.classList.add('superposition-active');
  badge.className = 'superpos-state unknown';
  badgeTxt.textContent = 'حالة تراكب — كل المناخات في آنٍ واحد';
  emoji.textContent = '🌀';
  name.textContent = '؟ تراكب كمي ؟';
  name.style.color = '#a78bfa';
  desc.textContent = 'الأرض الآن في تراكب كمي. هي تحمل كل المناخات الممكنة في نفس الوقت. لا يمكنك معرفة أي مناخ ستجده حتى تُجري القياس!';

  addLog('[SUPERPOS] Wavefunction spreading across all climate states...');
  addLog('[ψ] |Earth⟩ = Σ cᵢ|climate_i⟩ — all states active');

  // Animate probability bars to show "uncertain"
  animateProbBarsUncertain();
  document.getElementById('headerCat').textContent = '🐱';
}

function animateProbBarsUncertain() {
  if (!isInSuperposition) return;
  climates.forEach((c, i) => {
    const bar = document.getElementById(`bar-${i}`);
    const pct = document.getElementById(`pct-${i}`);
    const randomProb = Math.floor(10 + Math.random() * 40);
    bar.style.width = randomProb + '%';
    pct.textContent = '??%';
  });
  if (isInSuperposition) setTimeout(animateProbBarsUncertain, 600);
}

// ============================================================
// OBSERVE (COLLAPSE)
// ============================================================
function observeQuantum() {
  if (isAnimating) return;
  isAnimating = true;
  observationCount++;

  const sphere = document.getElementById('earthSphere');
  const wrapper = document.getElementById('earthWrapper');
  const btn    = document.getElementById('observeBtn');

  addLog(`[MEASURE] Observer #${observationCount} performing wavefunction collapse...`);

  // Disable button
  btn.style.opacity = '0.5';
  btn.style.pointerEvents = 'none';

  // Exit superposition
  isInSuperposition = false;
  wrapper.classList.remove('superposition-active');

  // Collapse animation
  sphere.classList.add('collapsing');

  // Weighted random selection
  const chosen = weightedRandom();

  setTimeout(() => {
    sphere.classList.remove('collapsing');
    setClimate(chosen, true);

    // Restore prob bars with actual values
    climates.forEach((c, i) => {
      document.getElementById(`bar-${i}`).style.width = c.prob + '%';
      document.getElementById(`pct-${i}`).textContent = c.prob + '%';
    });

    // Particle burst
    spawnParticles(climates[chosen].color);

    addLog(`[RESULT] Collapsed to: ${climates[chosen].name} | P=${climates[chosen].prob}%`);
    addLog('[STATE] Wavefunction collapsed — single eigenstate selected');

    btn.textContent = '🔬 قِس مجدداً!';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    isAnimating = false;

    // Cat emoji based on result
    document.getElementById('headerCat').textContent =
      chosen === 5 ? '💀' : chosen === 3 ? '😱' : chosen === 1 ? '🥶' : '😺';

    // Re-enter superposition after delay
    setTimeout(() => {
      if (!isAnimating) enterSuperposition();
    }, 4000);
  }, 1300);
}

function weightedRandom() {
  const total = climates.reduce((s, c) => s + c.prob, 0);
  let r = Math.random() * total;
  for (let i = 0; i < climates.length; i++) {
    r -= climates[i].prob;
    if (r <= 0) return i;
  }
  return 0;
}

function forceClimate(index) {
  if (isAnimating) return;
  isInSuperposition = false;
  document.getElementById('earthWrapper').classList.remove('superposition-active');
  setClimate(index, true);
  spawnParticles(climates[index].color);
  climates.forEach((c, i) => {
    document.getElementById(`bar-${i}`).style.width = c.prob + '%';
    document.getElementById(`pct-${i}`).textContent = c.prob + '%';
  });
  addLog(`[FORCED] Manual observation → ${climates[index].name}`);
  document.getElementById('headerCat').textContent =
    index === 5 ? '💀' : index === 3 ? '😱' : index === 1 ? '🥶' : '😺';
  setTimeout(() => { if (!isAnimating) enterSuperposition(); }, 3500);
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles(color) {
  const container = document.getElementById('particleContainer');
  const sphere = document.getElementById('earthSphere');
  const rect = sphere.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 200;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${cx}px; top:${cy}px;
      background:${color};
      box-shadow: 0 0 6px ${color};
      --tx: ${Math.cos(angle)*dist}px;
      --ty: ${Math.sin(angle)*dist}px;
      --dur: ${0.6+Math.random()*0.8}s;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// ============================================================
// LOG
// ============================================================
function addLog(msg) {
  const log = document.getElementById('quantumLog');
  const line = document.createElement('span');
  line.className = 'log-line';
  const colors = ['rgba(0,212,255,0.8)', 'rgba(0,255,136,0.7)', 'rgba(124,58,237,0.8)', 'rgba(255,200,0,0.7)'];
  line.style.color = colors[Math.floor(Math.random()*colors.length)];
  const time = new Date().toLocaleTimeString('en',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  line.textContent = `[${time}] ${msg}`;
  log.appendChild(line);
  // Keep last 8 lines
  const lines = log.querySelectorAll('.log-line');
  if (lines.length > 8) lines[0].remove();
  log.scrollTop = log.scrollHeight;
}