/* ════════════════════════════════════════════════════════════════════
   TRENDMINT — Advanced Production Logic & Interactive Engine
   ════════════════════════════════════════════════════════════════════ */

'use strict';

// ── INITIAL DATA ─────────────────────────────────────────────────────────────
const BASE_TRENDS = [
  {
    id: 1, category: 'tech', emoji: '🤖',
    name: 'AI Wearables para mascotas con diagnóstico',
    desc: 'Collares inteligentes que monitorean constantes vitales en animales y alertan al veterinario automáticamente.',
    score: 87, price: 0.34, change: '+28%', up: true,
    urgency: 'hot', age: 'hace 1h', tags: ['IA', 'Pets', 'HealthTech'],
    history: [0.15, 0.18, 0.22, 0.26, 0.29, 0.31, 0.34]
  },
  {
    id: 2, category: 'food', emoji: '🍄',
    name: 'Proteína de hongos por fermentación masiva',
    desc: 'Sustituto cárnico de micelios sin crueldad animal. Textura y jugosidad 100% idénticas al vacuno.',
    score: 73, price: 0.89, change: '+61%', up: true,
    urgency: 'rising', age: 'hace 2h', tags: ['FoodTech', 'Sostenible'],
    history: [0.40, 0.45, 0.52, 0.65, 0.72, 0.80, 0.89]
  },
  {
    id: 3, category: 'culture', emoji: '🎭',
    name: 'Teatro inmersivo adaptado por IA en vivo',
    desc: 'Obras dramáticas donde el guión se altera en tiempo real según la reacción fisiológica del público.',
    score: 65, price: 1.20, change: '+12%', up: true,
    urgency: 'new', age: 'hace 4h', tags: ['Arte', 'IA', 'Entertainment'],
    history: [0.90, 0.95, 1.02, 1.08, 1.12, 1.15, 1.20]
  },
  {
    id: 4, category: 'finance', emoji: '💎',
    name: 'Microacciones de infraestructura urbana',
    desc: 'Cualquier persona invierte desde $1 en peajes, puentes y paneles solares comunitarios y cobra peajes.',
    score: 91, price: 0.18, change: '+94%', up: true,
    urgency: 'hot', age: 'hace 30m', tags: ['Finanzas', 'Infraestructura'],
    history: [0.08, 0.09, 0.11, 0.13, 0.15, 0.17, 0.18]
  },
  {
    id: 5, category: 'fashion', emoji: '👗',
    name: 'Ropa biodegradable con semillas botánicas',
    desc: 'Prendas compostables que al desecharlas en tierra fertilizan y germinan plantas silvestres.',
    score: 58, price: 2.10, change: '-4%', up: false,
    urgency: 'rising', age: 'hace 5h', tags: ['Moda', 'Bio', 'ZeroWaste'],
    history: [2.30, 2.25, 2.22, 2.20, 2.18, 2.15, 2.10]
  },
  {
    id: 6, category: 'tech', emoji: '🧠',
    name: 'Terapia cognitiva VR aprobada por la FDA',
    desc: 'Tratamientos inmersivos en realidad virtual clínicamente certificados para el manejo de la ansiedad.',
    score: 82, price: 0.67, change: '+45%', up: true,
    urgency: 'hot', age: 'hace 15m', tags: ['SaludMental', 'VR', 'MedTech'],
    history: [0.35, 0.40, 0.48, 0.53, 0.59, 0.62, 0.67]
  },
  {
    id: 7, category: 'culture', emoji: '🎵',
    name: 'Microconciertos hiper-locales en casa',
    desc: 'Músicos emergentes tocan recítales íntimos de 20 minutos emparejados mediante geolocalización.',
    score: 69, price: 1.50, change: '+33%', up: true,
    urgency: 'rising', age: 'hace 3h', tags: ['Música', 'Live', 'Comunidad'],
    history: [1.00, 1.10, 1.20, 1.30, 1.40, 1.45, 1.50]
  },
  {
    id: 8, category: 'food', emoji: '🧊',
    name: 'Suplementos criogénicos de liberación nocturna',
    desc: 'Cápsulas que reaccionan a la temperatura corporal profunda durante el ciclo REM para optimizar salud.',
    score: 44, price: 3.80, change: '+8%', up: true,
    urgency: 'new', age: 'hace 8h', tags: ['Biohacking', 'Sleep'],
    history: [3.40, 3.45, 3.50, 3.60, 3.65, 3.75, 3.80]
  },
  {
    id: 9, category: 'finance', emoji: '🌱',
    name: 'Créditos de carbono personales tokenizados',
    desc: 'Verificación IoT que permite a individuos certificar y vender su ahorro energético diario.',
    score: 76, price: 0.95, change: '+57%', up: true,
    urgency: 'hot', age: 'hace 2h', tags: ['Carbono', 'Web3', 'Eco'],
    history: [0.50, 0.58, 0.65, 0.72, 0.80, 0.88, 0.95]
  }
];

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Valentina K.', handle: '@vktrends', avatar: '👑', color: '#f59e0b', mints: 247, topGain: '+12,400%', portfolio: '$2.4M', badge: 'legend' },
  { rank: 2, name: 'Marcos T.', handle: '@m_hunter', avatar: '🦁', color: '#7c3aed', mints: 189, topGain: '+8,200%', portfolio: '$1.1M', badge: 'whale' },
  { rank: 3, name: 'Aiko S.', handle: '@aiko_mint', avatar: '🌸', color: '#06b6d4', mints: 312, topGain: '+6,800%', portfolio: '$890K', badge: 'whale' },
  { rank: 4, name: 'Diego R.', handle: '@dr_foresight', avatar: '⚡', color: '#10b981', mints: 134, topGain: '+4,100%', portfolio: '$456K', badge: 'hunter' },
  { rank: 5, name: 'Priya N.', handle: '@trendwitch', avatar: '🔮', color: '#a855f7', mints: 98, topGain: '+3,600%', portfolio: '$210K', badge: 'hunter' },
];

const SCORE_METRICS = [
  { name: '💎 Microacciones de Infraestructura Urbana', score: 91, badges: ['🔥 HOT', '⚡ RÁPIDO CRECIMIENTO', '💰 ALTO ROI'] },
  { name: '🏠 Casas impresas 3D con IA Local', score: 88, badges: ['🚀 EXPLOSIVO', '🌍 GLOBAL'] },
  { name: '🤖 AI Wearables para mascotas', score: 87, badges: ['🐾 PET TECH', '📈 TENDENCIA MUNDIAL'] },
  { name: '🧠 Terapia Cognitiva VR', score: 82, badges: ['🏥 SALUD MENTAL', '🟢 FDA CERT'] },
];

// ── APP STATE ─────────────────────────────────────────────────────────────────
let allTrends = [...BASE_TRENDS];
let userBalance = parseFloat(localStorage.getItem('tm_user_balance')) || 10000.00;
let userPortfolio = JSON.parse(localStorage.getItem('tm_user_portfolio')) || [];
let activeFilter = 'all';
let searchQuery = '';
let currentSort = 'score';
let selectedTrendForTrade = null;
let currentTradeMode = 'buy'; // 'buy' or 'sell'
let lastScannedTrend = null;
let scoreMeterIndex = 0;

// ── AUDIO FX (WEB AUDIO API) ──────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'buy') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'scan') {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

// ── INITIALIZATION ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadCustomTrends();
  updateBalanceUI();
  initParticles();
  initNav();
  initTicker();
  renderTrendsGrid();
  initSearchAndFilter();
  renderLeaderboard();
  initScoreMeter();
  initCounters();
  initAIScanner();
  initTradeModal();
  initPortfolioModal();
  initModalGeneral();
  simulateLivePrices();

  // Load More button
  document.getElementById('load-more')?.addEventListener('click', () => {
    showToast('✨ Todas las tendencias del mercado están cargadas en vivo.');
  });

  // Demo watch button
  document.getElementById('btn-watch')?.addEventListener('click', () => {
    showToast('🎬 La simulación interactiva está lista. Haz clic en "Comprar TC" en cualquier tarjeta.');
  });
});

// ── LOCAL STORAGE SYNC ────────────────────────────────────────────────────────
function saveState() {
  localStorage.setItem('tm_user_balance', userBalance.toFixed(2));
  localStorage.setItem('tm_user_portfolio', JSON.stringify(userPortfolio));
}

function loadCustomTrends() {
  const saved = JSON.parse(localStorage.getItem('tm_custom_trends')) || [];
  if (saved.length > 0) {
    allTrends = [...BASE_TRENDS, ...saved];
  }
}

function updateBalanceUI() {
  const usdEl = document.getElementById('user-balance-usd');
  if (usdEl) {
    usdEl.textContent = `$${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  }
}

// ── PARTICLES BACKGROUND ──────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.1,
    hue: Math.random() > 0.5 ? 270 : 190
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ── NAV & SCROLL ──────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── TICKER ────────────────────────────────────────────────────────────────────
function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const items = [...allTrends, ...allTrends];
  track.innerHTML = items.map(t => `
    <div class="ticker-item">
      <span class="tick-name">${t.emoji} ${t.name.substring(0, 24)}...</span>
      <span class="tick-val">🪙 ${t.price.toFixed(2)} TC</span>
      <span class="${t.up ? 'tick-up' : 'tick-down'}">${t.change}</span>
    </div>
  `).join('');
}

// ── TRENDS GRID & FILTER/SEARCH/SORT ──────────────────────────────────────────
function renderTrendsGrid() {
  const grid = document.getElementById('trends-grid');
  if (!grid) return;

  // Filter
  let list = allTrends.filter(t => {
    const matchFilter = activeFilter === 'all' ? true :
                        activeFilter === 'custom' ? t.isCustom :
                        t.category === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = searchQuery === '' || 
                        t.name.toLowerCase().includes(q) || 
                        t.desc.toLowerCase().includes(q) ||
                        t.tags.some(tag => tag.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  // Sort
  if (currentSort === 'score') {
    list.sort((a, b) => b.score - a.score);
  } else if (currentSort === 'change') {
    list.sort((a, b) => parseFloat(b.change) - parseFloat(a.change));
  } else if (currentSort === 'recent') {
    list.sort((a, b) => b.id - a.id);
  } else if (currentSort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  }

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">No se encontraron tendencias con ese criterio. ¡Usa el Escáner IA abajo para crearla!</div>`;
    return;
  }

  grid.innerHTML = list.map(t => {
    const scoreClass = t.score >= 80 ? 'score-hi' : t.score >= 60 ? 'score-mid' : 'score-lo';
    const urgencyLabel = t.urgency === 'hot' ? '🔥 HOT' : t.urgency === 'new' ? '✨ NUEVO' : '📈 RISING';
    return `
      <div class="trend-card" data-id="${t.id}">
        <div class="trend-card-header">
          <span class="trend-category">${t.emoji} ${t.category.toUpperCase()}</span>
          <span class="urgency-badge ${t.urgency}">${urgencyLabel}</span>
        </div>
        <div class="trend-name">${t.name}</div>
        <div class="trend-desc">${t.desc}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
          ${t.tags.map(tag => `<span style="font-size:0.68rem;padding:3px 9px;border-radius:50px;background:rgba(255,255,255,0.05);color:#94a3b8;border:1px solid rgba(255,255,255,0.08)">#${tag}</span>`).join('')}
        </div>
        <div class="trend-card-footer">
          <div class="trend-score-wrap">
            <div class="trend-score-bar">
              <div class="trend-score-fill ${scoreClass}" style="width:${t.score}%"></div>
            </div>
            <span class="trend-score-num">${t.score}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="trend-price">🪙 ${t.price.toFixed(2)} TC</span>
            <span class="trend-change ${t.up ? 'change-up' : 'change-down'}">${t.change}</span>
            <button class="trend-mint-btn" data-id="${t.id}">Comprar TC</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Event handlers for cards & mint buttons
  grid.querySelectorAll('.trend-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      openTradeModal(id);
    });
  });
}

function initSearchAndFilter() {
  const searchInput = document.getElementById('trend-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderTrendsGrid();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderTrendsGrid();
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderTrendsGrid();
    });
  });
}

// ── AI SCANNER LOGIC ──────────────────────────────────────────────────────────
function initAIScanner() {
  const scanBtn = document.getElementById('btn-scan-now');
  const inputEl = document.getElementById('scanner-input');
  const loadingEl = document.getElementById('scanner-loading');
  const resultEl = document.getElementById('scanner-result');
  const mintScannedBtn = document.getElementById('btn-mint-scanned');

  if (!scanBtn || !inputEl) return;

  scanBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) {
      showToast('⚠️ Escribe una idea o tendencia para analizar.');
      return;
    }

    playSound('scan');
    resultEl.style.display = 'none';
    loadingEl.style.display = 'flex';
    scanBtn.disabled = true;

    // Simulate AI scan processing
    const statusText = document.getElementById('scanner-status-text');
    const steps = [
      'Escaneando menciones en TikTok y X...',
      'Procesando curva de adopción y volumen de búsqueda...',
      'Calculando TrendScore™ y proyección de rentabilidad...'
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        statusText.textContent = steps[stepIdx];
      } else {
        clearInterval(interval);
        finishScan(text);
      }
    }, 600);
  });

  function finishScan(ideaText) {
    loadingEl.style.display = 'none';
    scanBtn.disabled = false;
    resultEl.style.display = 'block';

    const calculatedScore = Math.floor(Math.random() * 25) + 72; // 72 to 97
    const initialPrice = parseFloat((Math.random() * 0.4 + 0.15).toFixed(2));

    lastScannedTrend = {
      id: Date.now(),
      category: 'tech',
      emoji: '🌟',
      name: ideaText,
      desc: `Idea analizada en tiempo real por IA: "${ideaText}". Alta tracción identificada en redes.`,
      score: calculatedScore,
      price: initialPrice,
      change: '+100%',
      up: true,
      urgency: 'hot',
      age: 'Recién escaneada',
      tags: ['IA', 'Escaneada', 'Oportunidad'],
      isCustom: true,
      history: [initialPrice * 0.5, initialPrice * 0.7, initialPrice * 0.8, initialPrice]
    };

    document.getElementById('res-title').textContent = ideaText;
    document.getElementById('res-score-badge').textContent = `TrendScore™: ${calculatedScore}/100`;
    document.getElementById('res-price').textContent = `🪙 ${initialPrice.toFixed(2)} TC ($${initialPrice.toFixed(2)})`;
    document.getElementById('res-summary').textContent = `Excelente oportunidad temprana. Nuestra IA proyecta un ROI superior al +350% en los próximos 90 días debido a la baja saturación del mercado.`;

    showToast('✅ ¡Análisis completado con éxito!');
  }

  mintScannedBtn?.addEventListener('click', () => {
    if (!lastScannedTrend) return;
    
    // Add to trends
    allTrends.unshift(lastScannedTrend);
    const customList = JSON.parse(localStorage.getItem('tm_custom_trends')) || [];
    customList.unshift(lastScannedTrend);
    localStorage.setItem('tm_custom_trends', JSON.stringify(customList));

    renderTrendsGrid();
    initTicker();
    
    showToast(`🚀 "${lastScannedTrend.name}" ha sido minteada y agregada al mercado en vivo.`);
    resultEl.style.display = 'none';
    inputEl.value = '';
    
    // Scroll to grid
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── TRADE MODAL & CANVAS CHART ────────────────────────────────────────────────
function initTradeModal() {
  const overlay = document.getElementById('trade-modal-overlay');
  const closeBtn = document.getElementById('trade-modal-close');
  const tabBuy = document.getElementById('tab-buy');
  const tabSell = document.getElementById('tab-sell');
  const qtyInput = document.getElementById('trade-qty');
  const execBtn = document.getElementById('btn-execute-trade');

  closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  tabBuy?.addEventListener('click', () => {
    currentTradeMode = 'buy';
    tabBuy.classList.add('active');
    tabSell.classList.remove('active');
    execBtn.textContent = '🪙 Ejecutar Orden de Compra';
    updateTradeTotal();
  });

  tabSell?.addEventListener('click', () => {
    currentTradeMode = 'sell';
    tabSell.classList.add('active');
    tabBuy.classList.remove('active');
    execBtn.textContent = '💸 Ejecutar Orden de Venta';
    updateTradeTotal();
  });

  qtyInput?.addEventListener('input', updateTradeTotal);

  execBtn?.addEventListener('click', executeTrade);
}

function openTradeModal(trendId) {
  const trend = allTrends.find(t => t.id === trendId);
  if (!trend) return;
  selectedTrendForTrade = trend;

  document.getElementById('tm-category').textContent = `${trend.emoji} ${trend.category.toUpperCase()}`;
  document.getElementById('tm-title').textContent = trend.name;
  document.getElementById('tm-tags').textContent = trend.tags.map(t => '#' + t).join(' ');
  document.getElementById('tm-score').textContent = trend.score;
  document.getElementById('tm-live-price').textContent = `🪙 ${trend.price.toFixed(2)} TC`;

  updateTradeTotal();
  drawChartCanvas(trend.history || [trend.price * 0.7, trend.price]);

  document.getElementById('trade-modal-overlay')?.classList.add('open');
}

function updateTradeTotal() {
  if (!selectedTrendForTrade) return;
  const qty = parseInt(document.getElementById('trade-qty').value) || 1;
  const totalUSD = qty * selectedTrendForTrade.price;
  document.getElementById('trade-total-usd').textContent = `$${totalUSD.toFixed(2)} USD`;
}

function drawChartCanvas(history) {
  const canvas = document.getElementById('price-chart-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth || 500;
  canvas.height = 180;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 20;
  const w = canvas.width - padding * 2;
  const h = canvas.height - padding * 2;

  const maxVal = Math.max(...history) * 1.1;
  const minVal = Math.min(...history) * 0.9;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  // Draw smooth line
  const points = history.map((val, idx) => {
    const x = padding + (w / (history.length - 1)) * idx;
    const y = padding + h - ((val - minVal) / (maxVal - minVal)) * h;
    return { x, y };
  });

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
  grad.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
  ctx.lineTo(points[0].x, canvas.height - padding);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line stroke
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw points
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
  });
}

function executeTrade() {
  if (!selectedTrendForTrade) return;
  const qty = parseInt(document.getElementById('trade-qty').value) || 1;
  const totalCostUSD = qty * selectedTrendForTrade.price;

  if (currentTradeMode === 'buy') {
    if (userBalance < totalCostUSD) {
      showToast('⚠️ Saldo insuficiente para completar la compra.');
      return;
    }

    userBalance -= totalCostUSD;
    
    // Add to portfolio
    const existing = userPortfolio.find(p => p.trendId === selectedTrendForTrade.id);
    if (existing) {
      existing.qty += qty;
    } else {
      userPortfolio.push({
        trendId: selectedTrendForTrade.id,
        trendName: selectedTrendForTrade.name,
        qty: qty,
        buyPriceTC: selectedTrendForTrade.price
      });
    }

    playSound('buy');
    showToast(`🎉 Compraste ${qty} TC de "${selectedTrendForTrade.name}" por $${totalCostUSD.toFixed(2)} USD.`);
  } else {
    // Sell mode
    const existing = userPortfolio.find(p => p.trendId === selectedTrendForTrade.id);
    if (!existing || existing.qty < qty) {
      showToast('⚠️ No posees suficientes TrendCoins de esta tendencia para vender.');
      return;
    }

    existing.qty -= qty;
    if (existing.qty <= 0) {
      userPortfolio = userPortfolio.filter(p => p.trendId !== selectedTrendForTrade.id);
    }
    userBalance += totalCostUSD;
    showToast(`💸 Vendiste ${qty} TC de "${selectedTrendForTrade.name}" y recibiste $${totalCostUSD.toFixed(2)} USD.`);
  }

  saveState();
  updateBalanceUI();
  document.getElementById('trade-modal-overlay')?.classList.remove('open');
}

// ── PORTFOLIO MODAL ───────────────────────────────────────────────────────────
function initPortfolioModal() {
  const btnBtn = document.getElementById('btn-portfolio');
  const overlay = document.getElementById('portfolio-modal-overlay');
  const closeBtn = document.getElementById('portfolio-modal-close');

  btnBtn?.addEventListener('click', () => {
    renderPortfolioTable();
    overlay?.classList.add('open');
  });

  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay?.classList.remove('open'); });
}

function renderPortfolioTable() {
  const listEl = document.getElementById('portfolio-list');
  const cashEl = document.getElementById('port-cash');
  const investedEl = document.getElementById('port-invested');
  const pnlEl = document.getElementById('port-pnl');

  if (!listEl) return;

  cashEl.textContent = `$${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

  let totalInvestedUSD = 0;
  let totalCurrentUSD = 0;

  if (userPortfolio.length === 0) {
    listEl.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">No tienes inversiones activas aún. ¡Mintea tu primera tendencia!</td></tr>`;
    investedEl.textContent = `$0.00 USD`;
    pnlEl.textContent = `+$0.00 (0%)`;
    return;
  }

  listEl.innerHTML = userPortfolio.map(item => {
    const trend = allTrends.find(t => t.id === item.trendId) || { price: item.buyPriceTC };
    const currentValUSD = item.qty * trend.price;
    const originalValUSD = item.qty * item.buyPriceTC;
    
    totalInvestedUSD += originalValUSD;
    totalCurrentUSD += currentValUSD;

    return `
      <tr>
        <td><strong>${item.trendName}</strong></td>
        <td>${item.qty} TC</td>
        <td>$${item.buyPriceTC.toFixed(2)}</td>
        <td><strong style="color:var(--gold)">$${trend.price.toFixed(2)}</strong></td>
        <td>$${currentValUSD.toFixed(2)}</td>
        <td><button class="btn-sell-small" onclick="sellPortfolioItem(${item.trendId})">Vender</button></td>
      </tr>
    `;
  }).join('');

  const pnl = totalCurrentUSD - totalInvestedUSD;
  const pnlPct = totalInvestedUSD > 0 ? (pnl / totalInvestedUSD) * 100 : 0;

  investedEl.textContent = `$${totalCurrentUSD.toFixed(2)} USD`;
  pnlEl.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct.toFixed(1)}%)`;
  pnlEl.style.color = pnl >= 0 ? 'var(--green)' : 'var(--red)';
}

window.sellPortfolioItem = function(trendId) {
  openTradeModal(trendId);
  document.getElementById('portfolio-modal-overlay')?.classList.remove('open');
};

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const body = document.getElementById('lb-body');
  if (!body) return;
  body.innerHTML = LEADERBOARD_DATA.map(u => `
    <div class="lb-row">
      <span class="lb-rank ${u.rank <= 3 ? 'top' : ''}">${u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}</span>
      <div class="lb-user">
        <div class="lb-avatar" style="background:${u.color}22;color:${u.color}">${u.avatar}</div>
        <div>
          <div class="lb-name">${u.name}</div>
          <div class="lb-handle">${u.handle}</div>
        </div>
      </div>
      <span class="lb-cell">${u.mints} trends</span>
      <span class="lb-gain">${u.topGain}</span>
      <span class="lb-portfolio">${u.portfolio}</span>
      <span class="lb-badge badge-${u.badge}">${u.badge}</span>
    </div>
  `).join('');
}

// ── SCORE METER ───────────────────────────────────────────────────────────────
function initScoreMeter() {
  const svgEl = document.querySelector('.score-ring');
  if (!svgEl) return;

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
  `;
  svgEl.prepend(defs);

  updateScoreMeter(0);

  document.getElementById('score-next')?.addEventListener('click', () => {
    scoreMeterIndex = (scoreMeterIndex + 1) % SCORE_METRICS.length;
    updateScoreMeter(scoreMeterIndex);
  });
}

function updateScoreMeter(idx) {
  const data = SCORE_METRICS[idx];
  const ringFill = document.getElementById('ring-fill');
  const scoreNum = document.getElementById('score-number');
  const scoreName = document.getElementById('score-trend-name');
  const scoreBadges = document.getElementById('score-badges');
  if (!ringFill || !scoreNum) return;

  const offset = 565 - (data.score / 100) * 565;
  ringFill.style.strokeDashoffset = offset;
  scoreNum.textContent = data.score;
  scoreName.textContent = data.name;
  scoreBadges.innerHTML = data.badges.map(b => `<span style="font-size:0.7rem;padding:4px 10px;border-radius:50px;background:rgba(124,58,237,0.15);color:#a855f7;font-weight:700">${b}</span>`).join('');
}

// ── COUNTERS ─────────────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let curr = 0;
        const timer = setInterval(() => {
          curr += Math.ceil(target / 40);
          if (curr >= target) { curr = target; clearInterval(timer); }
          el.textContent = curr.toLocaleString('es-ES');
        }, 30);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ── SIGNUP MODAL ─────────────────────────────────────────────────────────────
function initModalGeneral() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  
  document.getElementById('btn-login')?.addEventListener('click', () => overlay?.classList.add('open'));
  document.getElementById('btn-signup')?.addEventListener('click', () => overlay?.classList.add('open'));
  document.querySelectorAll('.btn-trigger-signup').forEach(b => b.addEventListener('click', () => overlay?.classList.add('open')));

  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay?.classList.remove('open'); });

  document.getElementById('modal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    overlay?.classList.remove('open');
    showToast('🎉 ¡Cuenta creada con éxito! Bienvenido a TrendMint PRO.');
  });

  document.getElementById('btn-cta-join')?.addEventListener('click', () => {
    const email = document.getElementById('cta-email')?.value;
    if (email && email.includes('@')) {
      showToast('🎉 Acceso prioritario reservado para ' + email);
      document.getElementById('cta-email').value = '';
    } else {
      showToast('⚠️ Ingresa un email válido.');
    }
  });
}

// ── LIVE PRICE FLUCTUATION & ORDER FEED SIMULATION ───────────────────────────
function simulateLivePrices() {
  setInterval(() => {
    allTrends.forEach(t => {
      const delta = (Math.random() - 0.46) * 0.03;
      t.price = Math.max(0.05, parseFloat((t.price + delta).toFixed(2)));
      t.history.push(t.price);
      if (t.history.length > 10) t.history.shift();
    });
    renderTrendsGrid();
    initTicker();
  }, 4000);
}

// ── TOAST NOTIFICATIONS ──────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
