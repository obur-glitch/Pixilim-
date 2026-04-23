/* ═══════════════════════════════════════════════════════════════
   PIXILIM V2 — Tam JavaScript Mantığı
   Minecraft Doku Paketi Stüdyosu
   Three.js 3D Önizleme + Prosedürel Araçlar + Türkçe Arayüz
═══════════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════════════════
// DURUM (STATE)
// ═══════════════════════════════════════════════════════════════
const State = {
  packName: 'Harika Paketim',
  packDesc: 'Bir Pixilim kaynak paketi',
  packFormat: 18,
  iconDataURL: null,
  canvasW: 16, canvasH: 16,
  zoom: 1,
  showGrid: true,
  activeTool: 'pencil',
  fgColor: '#00ffcc',
  bgColor: '#000000',
  brushSize: 1,
  pixelPerfect: false,
  mirrorH: false,
  mirrorV: false,
  layers: [],
  activeLayerIndex: 0,
  animated: false,
  frames: [],
  activeFrameIndex: 0,
  onionSkin: false,
  defaultFrametime: 2,
  undoStack: [],
  redoStack: [],
  MAX_UNDO: 50,
  packQueue: [],
  isDrawing: false,
  lastX: -1, lastY: -1,
  startX: -1, startY: -1,
  snapshotBeforeDraw: null,
  dragLayerIndex: null,
  gradientStart: null,
};

// ═══════════════════════════════════════════════════════════════
// MİNECRAFT RENK PALETİ
// ═══════════════════════════════════════════════════════════════
const MC_PALETTE = [
  '#ffffff','#d4d4d4','#a8a8a8','#7c7c7c','#505050','#323232','#1e1e1e','#000000',
  '#ffd5d5','#ff8888','#ff0000','#cc0000','#880000','#550000','#330000','#1a0000',
  '#ffd5aa','#ffaa55','#ff7700','#cc5500','#883300','#552200','#331100','#1a0800',
  '#ffff99','#ffff44','#ffff00','#cccc00','#888800','#555500','#333300','#1a1a00',
  '#d5ffaa','#88ff44','#44cc00','#228800','#115500','#0a3300','#051a00','#020d00',
  '#aaffaa','#55ff55','#00ff00','#00cc00','#008800','#005500','#003300','#001a00',
  '#aaffdd','#55ffbb','#00ffaa','#00cc88','#008855','#005533','#003322','#001a11',
  '#aaffff','#55ffff','#00ffff','#00cccc','#008888','#005555','#003333','#001a1a',
  '#aaddff','#55bbff','#0088ff','#0055cc','#003388','#002255','#001133','#000a1a',
  '#aaaaff','#5555ff','#0000ff','#0000cc','#000088','#000055','#000033','#00001a',
  '#ddaaff','#bb55ff','#8800ff','#6600cc','#440088','#330055','#1a0033','#0d001a',
  '#ffaaff','#ff55ff','#ff00ff','#cc00cc','#880088','#550055','#330033','#1a001a',
  '#ffaad5','#ff55aa','#ff0088','#cc0066','#880044','#550033','#330022','#1a0011',
  '#8B4513','#6B3410','#c19a6b','#f5deb3','#ffe4c4','#deb887','#d2691e','#a0522d',
  '#228B22','#006400','#32CD32','#90EE90','#98FB98','#00ff7f','#7CFC00','#ADFF2F',
  '#4682B4','#6495ED','#00bfff','#87CEEB','#87CEFA','#add8e6','#b0e0e6','#b0c4de',
];

// ═══════════════════════════════════════════════════════════════
// DOM YARDIMCILARI
// ═══════════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

let mainCanvas, mainCtx, onionCanvas, onionCtx, overlayCanvas, overlayCtx;
let iconCanvas, iconCtx;
let previewCanvas, previewCtx;
let iconTool = 'pencil';
let iconPainting = false;

// ═══════════════════════════════════════════════════════════════
// AÇILIŞ EKRANI (SPLASH SCREEN)
// ═══════════════════════════════════════════════════════════════
function initSplash() {
  const splash = $('splash-screen');
  const barFill = $('splash-bar-fill');
  const barText = $('splash-bar-text');
  const messages = [
    'Doku motoru başlatılıyor...',
    'Minecraft paletleri yükleniyor...',
    'Three.js 3D motoru hazırlanıyor...',
    'Glassmorphism katmanları oluşturuluyor...',
    'Stüdyo hazır!'
  ];

  // Parçacık efekti
  const container = $('splash-particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: hsl(${Math.random() > 0.5 ? 174 : (Math.random() > 0.5 ? 210 : 330)}, 100%, 65%);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.1};
      animation: particleFloat ${Math.random() * 6 + 4}s ease-in-out ${Math.random() * 3}s infinite alternate;
      box-shadow: 0 0 ${Math.random() * 8 + 2}px currentColor;
    `;
    container.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(${(Math.random()-0.5)*40}px, ${(Math.random()-0.5)*40}px) scale(${Math.random()+0.5}); }
    }
  `;
  document.head.appendChild(style);

  let progress = 0;
  let msgIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress > 100) progress = 100;
    barFill.style.width = progress + '%';

    const newIdx = Math.min(Math.floor(progress / 20), messages.length - 1);
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      barText.textContent = messages[msgIdx];
    }

    if (progress >= 100) {
      clearInterval(interval);
      barText.textContent = messages[messages.length - 1];
      setTimeout(() => {
        splash.classList.add('fade-out');
        splash.addEventListener('animationend', () => {
          splash.remove();
          $('wizard-overlay').classList.remove('hidden');
        }, { once: true });
      }, 600);
    }
  }, 120);
}

// ═══════════════════════════════════════════════════════════════
// THREE.JS 3D ÖNİZLEME
// ═══════════════════════════════════════════════════════════════
let threeRenderer, threeScene, threeCamera, threeMesh, threeTexture;
let threeDragging = false, threeLastX = 0, threeLastY = 0;
let threeRotX = 0.4, threeRotY = 0.4;
let threeAnimating = true;

function initThreeJS() {
  const container = $('threed-container');
  const canvas = $('threed-canvas');
  if (!container || !canvas || !window.THREE) return;

  const w = container.clientWidth || 240;
  const h = container.clientHeight || 240;

  // Renderer
  threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  threeRenderer.setSize(w, h);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  threeRenderer.setClearColor(0x000000, 0);

  // Sahne
  threeScene = new THREE.Scene();

  // Kamera
  threeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  threeCamera.position.set(0, 0, 3);

  // Işık
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  threeScene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 5, 5);
  threeScene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.3);
  rimLight.position.set(-5, -3, -5);
  threeScene.add(rimLight);

  // Doku
  threeTexture = new THREE.Texture();
  threeTexture.magFilter = THREE.NearestFilter;
  threeTexture.minFilter = THREE.NearestFilter;
  threeTexture.needsUpdate = true;

  buildThreeModel('cube');

  // Mouse olayları
  canvas.addEventListener('mousedown', e => {
    threeDragging = true;
    threeLastX = e.clientX;
    threeLastY = e.clientY;
  });
  canvas.addEventListener('mousemove', e => {
    if (!threeDragging) return;
    const dx = e.clientX - threeLastX;
    const dy = e.clientY - threeLastY;
    threeRotY += dx * 0.01;
    threeRotX += dy * 0.01;
    threeLastX = e.clientX;
    threeLastY = e.clientY;
  });
  canvas.addEventListener('mouseup', () => { threeDragging = false; });
  canvas.addEventListener('mouseleave', () => { threeDragging = false; });

  // 3D model seçici
  const modelSel = $('threed-model');
  if (modelSel) modelSel.addEventListener('change', e => buildThreeModel(e.target.value));

  const rotateTog = $('threed-rotate');
  if (rotateTog) rotateTog.addEventListener('change', e => { threeAnimating = e.target.checked; });

  threeAnimate();
}

function buildThreeModel(type) {
  if (!threeScene) return;
  if (threeMesh) {
    threeScene.remove(threeMesh);
    threeMesh.geometry.dispose();
  }

  let geometry;
  if (type === 'cube') {
    geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  } else if (type === 'item') {
    geometry = new THREE.PlaneGeometry(1.4, 1.4);
  } else if (type === 'flat') {
    geometry = new THREE.BoxGeometry(1.8, 1.8, 0.05);
  }

  const material = new THREE.MeshLambertMaterial({
    map: threeTexture,
    transparent: true,
    alphaTest: 0.01,
    side: THREE.DoubleSide,
  });

  threeMesh = new THREE.Mesh(geometry, material);
  threeScene.add(threeMesh);
}

function updateThreeTexture() {
  if (!threeTexture || !mainCanvas) return;
  threeTexture.image = mainCanvas;
  threeTexture.needsUpdate = true;
}

function threeAnimate() {
  requestAnimationFrame(threeAnimate);
  if (!threeRenderer || !threeMesh) return;

  if (threeAnimating && !threeDragging) {
    threeRotY += 0.008;
  }

  threeMesh.rotation.x = threeRotX;
  threeMesh.rotation.y = threeRotY;

  threeRenderer.render(threeScene, threeCamera);
}

// ═══════════════════════════════════════════════════════════════
// INDEXEDDB
// ═══════════════════════════════════════════════════════════════
let db = null;
const DB_NAME = 'pixilim_db';
const DB_VERSION = 1;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('projects')) {
        d.createObjectStore('projects', { keyPath: 'name' });
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

function saveProjectToDB() {
  if (!db) return;
  const data = buildSaveData();
  const tx = db.transaction('projects', 'readwrite');
  tx.objectStore('projects').put({ name: State.packName || 'project', ...data });
  tx.oncomplete = () => showToast('Proje kaydedildi ✓', 'success');
  tx.onerror = () => showToast('Kayıt başarısız', 'error');
}

function loadProjectFromDB(name) {
  if (!db) return;
  const tx = db.transaction('projects', 'readonly');
  const req = tx.objectStore('projects').get(name);
  req.onsuccess = () => {
    if (req.result) {
      restoreSaveData(req.result);
      showToast('Proje yüklendi ✓', 'success');
    } else {
      showToast('Kayıtlı proje bulunamadı', 'info');
    }
  };
}

function listProjects(cb) {
  if (!db) return cb([]);
  const tx = db.transaction('projects', 'readonly');
  const req = tx.objectStore('projects').getAllKeys();
  req.onsuccess = () => cb(req.result || []);
  req.onerror = () => cb([]);
}

function buildSaveData() {
  const layerData = State.layers.map(l => ({
    name: l.name, visible: l.visible, locked: l.locked,
    opacity: l.opacity, blendMode: l.blendMode,
    imageData: l.canvas.toDataURL(),
  }));
  const frameData = State.frames.map(f => ({
    frametime: f.frametime, index: f.index,
    layerData: f.layers.map(l => ({
      name: l.name, visible: l.visible, locked: l.locked,
      opacity: l.opacity, blendMode: l.blendMode,
      imageData: l.canvas.toDataURL(),
    })),
  }));
  return {
    packName: State.packName, packDesc: State.packDesc,
    packFormat: State.packFormat, iconDataURL: State.iconDataURL,
    canvasW: State.canvasW, canvasH: State.canvasH,
    animated: State.animated, defaultFrametime: State.defaultFrametime,
    packQueue: State.packQueue, fgColor: State.fgColor,
    layers: layerData, frames: frameData,
    activeLayerIndex: State.activeLayerIndex,
    activeFrameIndex: State.activeFrameIndex,
  };
}

function restoreSaveData(data) {
  State.packName = data.packName || 'Proje';
  State.packDesc = data.packDesc || '';
  State.packFormat = data.packFormat || 18;
  State.iconDataURL = data.iconDataURL || null;
  State.canvasW = data.canvasW || 16;
  State.canvasH = data.canvasH || 16;
  State.animated = data.animated || false;
  State.defaultFrametime = data.defaultFrametime || 2;
  State.packQueue = data.packQueue || [];
  State.fgColor = data.fgColor || '#00ffcc';

  initCanvases(State.canvasW, State.canvasH);

  State.layers = [];
  const layerArr = data.layers || [];
  layerArr.forEach(ld => {
    const l = createLayerObject(ld.name);
    l.visible = ld.visible; l.locked = ld.locked;
    l.opacity = ld.opacity; l.blendMode = ld.blendMode;
    const img = new Image();
    img.onload = () => { l.ctx.drawImage(img, 0, 0); compositeAll(); };
    img.src = ld.imageData;
    State.layers.push(l);
  });
  State.activeLayerIndex = data.activeLayerIndex || 0;

  if (State.animated && data.frames) {
    State.frames = [];
    data.frames.forEach(fd => {
      const f = createFrameObject(fd.frametime, fd.index);
      fd.layerData.forEach(ld => {
        const l = createLayerObject(ld.name);
        l.visible = ld.visible; l.locked = ld.locked;
        l.opacity = ld.opacity; l.blendMode = ld.blendMode;
        const img = new Image();
        img.onload = () => { l.ctx.drawImage(img, 0, 0); };
        img.src = ld.imageData;
        f.layers.push(l);
      });
      State.frames.push(f);
    });
  }

  $('pack-name-display').textContent = State.packName;
  renderLayersList();
  renderFramesList();
  compositeAll();
  updatePackQueue();
}

// ═══════════════════════════════════════════════════════════════
// KATMAN SİSTEMİ
// ═══════════════════════════════════════════════════════════════
function createLayerObject(name = 'Katman') {
  const c = document.createElement('canvas');
  c.width = State.canvasW;
  c.height = State.canvasH;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, State.canvasW, State.canvasH);
  return { canvas: c, ctx, name, visible: true, locked: false, opacity: 100, blendMode: 'normal' };
}

function createFrameObject(frametime = 2, index = 0) {
  const l = createLayerObject('Katman 1');
  return { frametime, index, layers: [l] };
}

function addLayer(name) {
  const l = createLayerObject(name || `Katman ${State.layers.length + 1}`);
  State.layers.splice(State.activeLayerIndex, 0, l);
  renderLayersList(); compositeAll(); pushUndoState('Katman Ekle');
  return l;
}

function deleteLayer() {
  if (State.layers.length <= 1) { showToast('Son katman silinemez', 'error'); return; }
  State.layers.splice(State.activeLayerIndex, 1);
  State.activeLayerIndex = Math.max(0, State.activeLayerIndex - 1);
  renderLayersList(); compositeAll(); pushUndoState('Katman Sil');
}

function duplicateLayer() {
  const src = State.layers[State.activeLayerIndex];
  const l = createLayerObject(src.name + ' Kopya');
  l.opacity = src.opacity; l.blendMode = src.blendMode;
  l.ctx.drawImage(src.canvas, 0, 0);
  State.layers.splice(State.activeLayerIndex, 0, l);
  renderLayersList(); compositeAll();
}

function mergeDown() {
  if (State.activeLayerIndex >= State.layers.length - 1) { showToast('Altında katman yok', 'error'); return; }
  const above = State.layers[State.activeLayerIndex];
  const below = State.layers[State.activeLayerIndex + 1];
  below.ctx.globalAlpha = above.opacity / 100;
  below.ctx.globalCompositeOperation = above.blendMode;
  below.ctx.drawImage(above.canvas, 0, 0);
  below.ctx.globalAlpha = 1;
  below.ctx.globalCompositeOperation = 'source-over';
  State.layers.splice(State.activeLayerIndex, 1);
  State.activeLayerIndex = Math.max(0, State.activeLayerIndex - 1);
  renderLayersList(); compositeAll(); pushUndoState('Aşağıyla Birleştir');
}

function renderLayersList() {
  const list = $('layers-list');
  list.innerHTML = '';
  State.layers.forEach((layer, i) => {
    const item = document.createElement('div');
    item.className = 'layer-item' + (i === State.activeLayerIndex ? ' active' : '');
    item.draggable = true;
    item.dataset.index = i;

    const thumb = document.createElement('canvas');
    thumb.className = 'layer-thumb';
    thumb.width = 24; thumb.height = 24;
    const tctx = thumb.getContext('2d');
    tctx.drawImage(layer.canvas, 0, 0, 24, 24);

    const visBtn = document.createElement('button');
    visBtn.className = 'layer-vis-btn';
    visBtn.textContent = layer.visible ? '👁' : '🚫';
    visBtn.title = layer.visible ? 'Gizle' : 'Göster';
    visBtn.addEventListener('click', e => {
      e.stopPropagation();
      layer.visible = !layer.visible;
      visBtn.textContent = layer.visible ? '👁' : '🚫';
      compositeAll();
    });

    const nameEl = document.createElement('span');
    nameEl.className = 'layer-name';
    nameEl.textContent = layer.name;
    nameEl.addEventListener('dblclick', e => {
      e.stopPropagation();
      const inp = document.createElement('input');
      inp.className = 'layer-name-input';
      inp.value = layer.name;
      inp.addEventListener('blur', () => { layer.name = inp.value || layer.name; renderLayersList(); });
      inp.addEventListener('keydown', e2 => { if (e2.key === 'Enter') inp.blur(); });
      nameEl.replaceWith(inp);
      inp.focus(); inp.select();
    });

    const lockBtn = document.createElement('button');
    lockBtn.className = 'layer-lock-btn';
    lockBtn.textContent = layer.locked ? '🔒' : '🔓';
    lockBtn.title = layer.locked ? 'Kilidi Aç' : 'Kilitle';
    lockBtn.addEventListener('click', e => {
      e.stopPropagation();
      layer.locked = !layer.locked;
      lockBtn.textContent = layer.locked ? '🔒' : '🔓';
    });

    item.appendChild(thumb); item.appendChild(visBtn);
    item.appendChild(nameEl); item.appendChild(lockBtn);

    item.addEventListener('click', () => {
      State.activeLayerIndex = i;
      const opEl = $('layer-opacity');
      opEl.value = layer.opacity;
      $('layer-opacity-display').textContent = layer.opacity + '%';
      $('layer-blend').value = layer.blendMode;
      renderLayersList();
    });

    item.addEventListener('dragstart', e => {
      State.dragLayerIndex = i;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => { item.classList.remove('dragging'); State.dragLayerIndex = null; });
    item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (State.dragLayerIndex === null || State.dragLayerIndex === i) return;
      const moved = State.layers.splice(State.dragLayerIndex, 1)[0];
      State.layers.splice(i, 0, moved);
      State.activeLayerIndex = i;
      renderLayersList(); compositeAll();
    });

    list.appendChild(item);
  });
}

// ═══════════════════════════════════════════════════════════════
// KARE SİSTEMİ
// ═══════════════════════════════════════════════════════════════
function addFrame() {
  const f = createFrameObject(State.defaultFrametime, State.frames.length);
  State.frames.push(f);
  renderFramesList();
  showToast(`Kare ${State.frames.length} eklendi`);
}

function deleteFrame() {
  if (State.frames.length <= 1) { showToast('Son kare silinemez', 'error'); return; }
  State.frames.splice(State.activeFrameIndex, 1);
  State.activeFrameIndex = Math.max(0, State.activeFrameIndex - 1);
  loadFrame(State.activeFrameIndex);
  renderFramesList();
}

function saveCurrentFrame() {
  if (!State.animated || State.frames.length === 0) return;
  const f = State.frames[State.activeFrameIndex];
  f.layers = State.layers.map(l => {
    const nl = createLayerObject(l.name);
    nl.visible = l.visible; nl.locked = l.locked;
    nl.opacity = l.opacity; nl.blendMode = l.blendMode;
    nl.ctx.drawImage(l.canvas, 0, 0);
    return nl;
  });
}

function loadFrame(idx) {
  State.activeFrameIndex = idx;
  const f = State.frames[idx];
  State.layers = f.layers.map(l => {
    const nl = createLayerObject(l.name);
    nl.visible = l.visible; nl.locked = l.locked;
    nl.opacity = l.opacity; nl.blendMode = l.blendMode;
    nl.ctx.drawImage(l.canvas, 0, 0);
    return nl;
  });
  State.activeLayerIndex = 0;
  renderLayersList(); compositeAll(); drawOnionSkin();
}

function drawOnionSkin() {
  onionCtx.clearRect(0, 0, State.canvasW, State.canvasH);
  if (!State.onionSkin || !State.animated || State.activeFrameIndex === 0) return;
  const prevFrame = State.frames[State.activeFrameIndex - 1];
  if (!prevFrame) return;
  const tempC = document.createElement('canvas');
  tempC.width = State.canvasW; tempC.height = State.canvasH;
  const tempCtx = tempC.getContext('2d');
  prevFrame.layers.forEach(l => {
    if (!l.visible) return;
    tempCtx.globalAlpha = l.opacity / 100;
    tempCtx.globalCompositeOperation = l.blendMode;
    tempCtx.drawImage(l.canvas, 0, 0);
  });
  onionCtx.drawImage(tempC, 0, 0);
}

function renderFramesList() {
  const list = $('frames-list');
  if (!list) return;
  list.innerHTML = '';
  State.frames.forEach((frame, i) => {
    const item = document.createElement('div');
    item.className = 'frame-item' + (i === State.activeFrameIndex ? ' active' : '');

    const thumb = document.createElement('canvas');
    thumb.className = 'frame-thumb';
    thumb.width = 32; thumb.height = 32;
    const tctx = thumb.getContext('2d');
    frame.layers.forEach(l => {
      if (!l.visible) return;
      tctx.globalAlpha = l.opacity / 100;
      tctx.drawImage(l.canvas, 0, 0, 32, 32);
    });
    tctx.globalAlpha = 1;

    const info = document.createElement('div');
    info.className = 'frame-info';
    info.innerHTML = `<div class="frame-num">Kare ${i + 1}</div><div class="frame-time-badge">${frame.frametime} tick</div>`;

    item.appendChild(thumb); item.appendChild(info);
    item.addEventListener('click', () => {
      saveCurrentFrame();
      loadFrame(i);
      renderFramesList();
      $('frame-time-input').value = State.frames[i].frametime;
      $('frame-index-input').value = State.frames[i].index;
    });
    list.appendChild(item);
  });
}

// ═══════════════════════════════════════════════════════════════
// CANVAS BAŞLATMA
// ═══════════════════════════════════════════════════════════════
function initCanvases(w, h) {
  State.canvasW = w; State.canvasH = h;
  [mainCanvas, onionCanvas, overlayCanvas].forEach(c => {
    if (c) { c.width = w; c.height = h; }
  });
  mainCtx.imageSmoothingEnabled = false;
  onionCtx.imageSmoothingEnabled = false;
  overlayCtx.imageSmoothingEnabled = false;
  setZoom(State.zoom);
  $('canvas-size-display').textContent = `${w}×${h}`;
}

function setZoom(z) {
  State.zoom = Math.max(0.25, Math.min(64, z));
  const container = $('canvas-container');
  const pw = State.canvasW * State.zoom;
  const ph = State.canvasH * State.zoom;
  container.style.width = pw + 'px';
  container.style.height = ph + 'px';
  [mainCanvas, onionCanvas, overlayCanvas].forEach(c => {
    c.style.width = pw + 'px';
    c.style.height = ph + 'px';
  });
  $('zoom-display').textContent = Math.round(State.zoom * 100) + '%';
}

function fitToView() {
  const vp = $('canvas-viewport');
  const vw = vp.clientWidth - 40;
  const vh = vp.clientHeight - 40;
  setZoom(Math.min(vw / State.canvasW, vh / State.canvasH));
}

// ═══════════════════════════════════════════════════════════════
// KATMANları BİRLEŞTİRME (COMPOSITE)
// ═══════════════════════════════════════════════════════════════
function compositeAll() {
  mainCtx.clearRect(0, 0, State.canvasW, State.canvasH);
  State.layers.forEach(layer => {
    if (!layer.visible) return;
    mainCtx.globalAlpha = layer.opacity / 100;
    mainCtx.globalCompositeOperation = layer.blendMode;
    mainCtx.drawImage(layer.canvas, 0, 0);
  });
  mainCtx.globalAlpha = 1;
  mainCtx.globalCompositeOperation = 'source-over';
  drawGrid();
  updatePreview();
  updateLayerThumbnails();
  updateThreeTexture();
}

function drawGrid() {
  overlayCtx.clearRect(0, 0, State.canvasW, State.canvasH);
  if (!State.showGrid) return;
  overlayCtx.strokeStyle = 'rgba(255,255,255,0.08)';
  overlayCtx.lineWidth = 1 / State.zoom;
  for (let x = 0; x <= State.canvasW; x++) {
    overlayCtx.beginPath();
    overlayCtx.moveTo(x, 0); overlayCtx.lineTo(x, State.canvasH);
    overlayCtx.stroke();
  }
  for (let y = 0; y <= State.canvasH; y++) {
    overlayCtx.beginPath();
    overlayCtx.moveTo(0, y); overlayCtx.lineTo(State.canvasW, y);
    overlayCtx.stroke();
  }
}

function updateLayerThumbnails() {
  const items = $$('.layer-item');
  items.forEach((item, i) => {
    const thumb = item.querySelector('.layer-thumb');
    if (thumb && State.layers[i]) {
      const tctx = thumb.getContext('2d');
      tctx.clearRect(0, 0, 24, 24);
      tctx.drawImage(State.layers[i].canvas, 0, 0, 24, 24);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// CANLI ÖNİZLEME
// ═══════════════════════════════════════════════════════════════
function updatePreview() {
  const tab = document.querySelector('.right-tab.active');
  if (!tab || tab.dataset.rtab !== 'preview') return;
  if (!previewCtx) return;
  const s = 96;
  previewCanvas.width = s; previewCanvas.height = s;
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.clearRect(0, 0, s, s);
  previewCtx.drawImage(mainCanvas, 0, 0, s, s);
}

// ═══════════════════════════════════════════════════════════════
// RENK YARDIMCıLARI
// ═══════════════════════════════════════════════════════════════
function hexToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length === 6) hex += 'ff';
  const n = parseInt(hex, 16);
  return { r: (n >> 24) & 255, g: (n >> 16) & 255, b: (n >> 8) & 255, a: n & 255 };
}

function rgbaToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function setFGColor(hex) {
  State.fgColor = hex;
  $('fg-color-swatch').style.background = hex;
  $('fg-color-input').value = hex;
  $('hex-input').value = hex.toUpperCase();
  const { r, g, b } = hexToRgba(hex);
  $('r-input').value = r; $('g-input').value = g; $('b-input').value = b;
  $('a-input').value = 255;
  $('status-color-dot').style.background = hex;
  const cs = $('active-color-display');
  const dot = cs.querySelector('span');
  if (dot) { dot.style.background = hex; cs.lastChild.textContent = hex.toUpperCase(); }
  $$('.palette-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === hex.toLowerCase()));
}

function updateColorFromRGBA() {
  const r = parseInt($('r-input').value) || 0;
  const g = parseInt($('g-input').value) || 0;
  const b = parseInt($('b-input').value) || 0;
  setFGColor(rgbaToHex(r, g, b));
}

// ═══════════════════════════════════════════════════════════════
// ÇİZİM MOTORU
// ═══════════════════════════════════════════════════════════════
function getPixelCoords(e) {
  const rect = mainCanvas.getBoundingClientRect();
  const scaleX = State.canvasW / rect.width;
  const scaleY = State.canvasH / rect.height;
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY),
  };
}

function setPixel(ctx, x, y, color) {
  if (x < 0 || y < 0 || x >= State.canvasW || y >= State.canvasH) return;
  if (color === null || color === 'erase') {
    ctx.clearRect(x, y, 1, 1);
  } else {
    ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1);
  }
}

function setPixelBrush(ctx, x, y, color, size) {
  const half = Math.floor(size / 2);
  for (let dy = -half; dy < size - half; dy++)
    for (let dx = -half; dx < size - half; dx++)
      setPixel(ctx, x + dx, y + dy, color);
}

function mirroredCoords(x, y) {
  const points = [[x, y]];
  if (State.mirrorH) points.push([State.canvasW - 1 - x, y]);
  if (State.mirrorV) points.push([x, State.canvasH - 1 - y]);
  if (State.mirrorH && State.mirrorV) points.push([State.canvasW - 1 - x, State.canvasH - 1 - y]);
  return points;
}

function paintAt(x, y, color, isErase = false) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const ctx = layer.ctx;
  const points = mirroredCoords(x, y);
  const finalColor = isErase ? null : color;
  if (State.activeTool === 'dither') {
    if ((x + y) % 2 !== 0) return;
  }
  points.forEach(([px, py]) => setPixelBrush(ctx, px, py, finalColor, State.brushSize));
}

function drawLine(ctx, x0, y0, x1, y1, color, size, isErase) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    mirroredCoords(x0, y0).forEach(([px, py]) => setPixelBrush(layer.ctx, px, py, isErase ? null : color, size));
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

function pixelPerfectLine(ctx, x0, y0, x1, y1, color, size) {
  const pts = [];
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    pts.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  const filtered = pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const prev = pts[i - 1], next = pts[i + 1];
    if (prev[0] !== p[0] && p[1] !== next[1]) return true;
    if (prev[1] !== p[1] && p[0] !== next[0]) return true;
    return !(prev[0] !== p[0] && prev[1] !== p[1]);
  });
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  filtered.forEach(([px, py]) => {
    mirroredCoords(px, py).forEach(([mx, my]) => setPixelBrush(layer.ctx, mx, my, color, size));
  });
}

function drawRect(x0, y0, x1, y1, color, fill = false) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const lx = Math.min(x0, x1), rx = Math.max(x0, x1);
  const ty = Math.min(y0, y1), by = Math.max(y0, y1);
  if (fill) {
    for (let y = ty; y <= by; y++)
      for (let x = lx; x <= rx; x++) setPixel(layer.ctx, x, y, color);
  } else {
    for (let x = lx; x <= rx; x++) { setPixel(layer.ctx, x, ty, color); setPixel(layer.ctx, x, by, color); }
    for (let y = ty; y <= by; y++) { setPixel(layer.ctx, lx, y, color); setPixel(layer.ctx, rx, y, color); }
  }
}

function drawEllipse(x0, y0, x1, y1, color) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
  if (rx < 1 || ry < 1) return;
  const steps = Math.max(rx, ry) * 8;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    setPixel(layer.ctx, Math.round(cx + rx * Math.cos(a)), Math.round(cy + ry * Math.sin(a)), color);
  }
}

function floodFill(startX, startY, fillColor) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const ctx = layer.ctx;
  const idata = ctx.getImageData(0, 0, State.canvasW, State.canvasH);
  const data = idata.data;
  const getIdx = (x, y) => (y * State.canvasW + x) * 4;
  const si = getIdx(startX, startY);
  const tr = data[si], tg = data[si+1], tb = data[si+2], ta = data[si+3];
  const { r: fr, g: fg, b: fb } = hexToRgba(fillColor);
  const fa = 255;
  if (tr === fr && tg === fg && tb === fb && ta === fa) return;
  const stack = [[startX, startY]];
  const visited = new Uint8Array(State.canvasW * State.canvasH);
  function colorMatch(i) {
    return data[i] === tr && data[i+1] === tg && data[i+2] === tb && data[i+3] === ta;
  }
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= State.canvasW || y < 0 || y >= State.canvasH) continue;
    const flatIdx = y * State.canvasW + x;
    if (visited[flatIdx]) continue;
    const ci = getIdx(x, y);
    if (!colorMatch(ci)) continue;
    visited[flatIdx] = 1;
    data[ci] = fr; data[ci+1] = fg; data[ci+2] = fb; data[ci+3] = fa;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(idata, 0, 0);
}

function pickColor(x, y) {
  const idata = mainCtx.getImageData(x, y, 1, 1).data;
  if (idata[3] === 0) return;
  setFGColor(rgbaToHex(idata[0], idata[1], idata[2]));
  showToast(`Renk seçildi: ${State.fgColor}`, 'info');
}

// Gradyan Doldurma
function applyGradient(x0, y0, x1, y1) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const ctx = layer.ctx;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, State.fgColor);
  grad.addColorStop(1, State.bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, State.canvasW, State.canvasH);
}

// Gürültü Uygula
function applyNoiseBrush(x, y) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  const { r, g, b } = hexToRgba(State.fgColor);
  const radius = State.brushSize * 2;
  for (let i = 0; i < 12; i++) {
    const nx = x + Math.floor((Math.random() - 0.5) * radius * 2);
    const ny = y + Math.floor((Math.random() - 0.5) * radius * 2);
    const nr = Math.min(255, Math.max(0, r + Math.floor((Math.random() - 0.5) * 60)));
    const ng = Math.min(255, Math.max(0, g + Math.floor((Math.random() - 0.5) * 60)));
    const nb = Math.min(255, Math.max(0, b + Math.floor((Math.random() - 0.5) * 60)));
    setPixel(layer.ctx, nx, ny, rgbaToHex(nr, ng, nb));
  }
}

// ─── Şekil Önizleme ─────────────────────────────────────────
function previewShape(x1, y1) {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked || !State.snapshotBeforeDraw) return;
  layer.ctx.putImageData(State.snapshotBeforeDraw, 0, 0);
  const x0 = State.startX, y0 = State.startY;
  if (State.activeTool === 'line') {
    if (State.pixelPerfect) pixelPerfectLine(layer.ctx, x0, y0, x1, y1, State.fgColor, State.brushSize);
    else drawLine(layer.ctx, x0, y0, x1, y1, State.fgColor, State.brushSize, false);
  } else if (State.activeTool === 'rect') {
    drawRect(x0, y0, x1, y1, State.fgColor, false);
  } else if (State.activeTool === 'ellipse') {
    drawEllipse(x0, y0, x1, y1, State.fgColor);
  }
  compositeAll();
}

// ═══════════════════════════════════════════════════════════════
// GERI AL / YİNELE
// ═══════════════════════════════════════════════════════════════
function captureUndoSnapshot() {
  return State.layers.map(l => ({
    data: l.ctx.getImageData(0, 0, State.canvasW, State.canvasH),
    visible: l.visible, locked: l.locked, opacity: l.opacity, blendMode: l.blendMode, name: l.name,
  }));
}

function pushUndoState(label = 'İşlem') {
  if (State.undoStack.length >= State.MAX_UNDO) State.undoStack.shift();
  State.undoStack.push({ label, snapshot: captureUndoSnapshot() });
  State.redoStack = [];
}

function undo() {
  if (State.undoStack.length === 0) { showToast('Geri alınacak bir şey yok', 'info'); return; }
  State.redoStack.push({ snapshot: captureUndoSnapshot() });
  const entry = State.undoStack.pop();
  applySnapshot(entry.snapshot);
  showToast(`Geri alındı: ${entry.label}`);
}

function redo() {
  if (State.redoStack.length === 0) { showToast('Yinelenecek bir şey yok', 'info'); return; }
  State.undoStack.push({ snapshot: captureUndoSnapshot() });
  const entry = State.redoStack.pop();
  applySnapshot(entry.snapshot);
  showToast('Yinelendi');
}

function applySnapshot(snapshot) {
  snapshot.forEach((s, i) => {
    if (!State.layers[i]) return;
    State.layers[i].ctx.putImageData(s.data, 0, 0);
    State.layers[i].visible = s.visible; State.layers[i].locked = s.locked;
    State.layers[i].opacity = s.opacity; State.layers[i].blendMode = s.blendMode;
  });
  compositeAll(); renderLayersList();
}

// ═══════════════════════════════════════════════════════════════
// CANVAS OLAYLARı
// ═══════════════════════════════════════════════════════════════
function onCanvasPointerDown(e) {
  e.preventDefault();
  if (e.button !== 0 && e.button !== 2) return;
  const { x, y } = getPixelCoords(e);
  if (x < 0 || x >= State.canvasW || y < 0 || y >= State.canvasH) return;

  State.isDrawing = true;
  State.startX = x; State.startY = y;
  State.lastX = x; State.lastY = y;

  State.snapshotBeforeDraw = State.layers[State.activeLayerIndex]
    ? State.layers[State.activeLayerIndex].ctx.getImageData(0, 0, State.canvasW, State.canvasH)
    : null;

  const color = e.button === 2 ? State.bgColor : State.fgColor;

  if (State.activeTool === 'eyedropper') {
    pickColor(x, y); State.isDrawing = false; return;
  }
  if (State.activeTool === 'fill') {
    floodFill(x, y, color); compositeAll(); pushUndoState('Doldur'); State.isDrawing = false; return;
  }
  if (State.activeTool === 'gradient') {
    State.gradientStart = { x, y }; return;
  }
  if (['pencil','eraser','dither','noise'].includes(State.activeTool)) {
    if (State.activeTool === 'noise') {
      applyNoiseBrush(x, y);
    } else {
      paintAt(x, y, color, State.activeTool === 'eraser');
    }
    compositeAll();
  }
  mainCanvas.setPointerCapture(e.pointerId);
}

function onCanvasPointerMove(e) {
  const { x, y } = getPixelCoords(e);
  $('cursor-pos').textContent = `${x}, ${y}`;

  if (!State.isDrawing) return;
  if (x < 0 || x >= State.canvasW || y < 0 || y >= State.canvasH) return;

  const color = State.fgColor;
  const isErase = State.activeTool === 'eraser';

  if (['line','rect','ellipse'].includes(State.activeTool)) {
    previewShape(x, y);
  } else if (['pencil','eraser','dither'].includes(State.activeTool)) {
    drawLine(State.layers[State.activeLayerIndex]?.ctx, State.lastX, State.lastY, x, y, isErase ? null : color, State.brushSize, isErase);
    compositeAll();
  } else if (State.activeTool === 'noise') {
    applyNoiseBrush(x, y); compositeAll();
  }

  State.lastX = x; State.lastY = y;
}

function onCanvasPointerUp(e) {
  if (!State.isDrawing && State.activeTool !== 'gradient') return;

  const { x, y } = getPixelCoords(e);
  const layer = State.layers[State.activeLayerIndex];
  const color = State.fgColor;

  if (State.activeTool === 'gradient' && State.gradientStart) {
    applyGradient(State.gradientStart.x, State.gradientStart.y, x, y);
    compositeAll(); pushUndoState('Gradyan');
    State.gradientStart = null;
    State.isDrawing = false;
    return;
  }

  State.isDrawing = false;

  if (['line','rect','ellipse'].includes(State.activeTool)) {
    if (layer && !layer.locked) {
      layer.ctx.putImageData(State.snapshotBeforeDraw, 0, 0);
      if (State.activeTool === 'line') {
        if (State.pixelPerfect) pixelPerfectLine(layer.ctx, State.startX, State.startY, x, y, color, State.brushSize);
        else drawLine(layer.ctx, State.startX, State.startY, x, y, color, State.brushSize, false);
      } else if (State.activeTool === 'rect') {
        drawRect(State.startX, State.startY, x, y, color, e.shiftKey);
      } else if (State.activeTool === 'ellipse') {
        drawEllipse(State.startX, State.startY, x, y, color);
      }
    }
    compositeAll();
  }

  pushUndoState(State.activeTool);
  if (State.animated) { saveCurrentFrame(); renderFramesList(); }
}

// ═══════════════════════════════════════════════════════════════
// PROSEDÜREL FİLTRELER
// ═══════════════════════════════════════════════════════════════
function applyNoiseFilter() {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  pushUndoState('Gürültü Filtresi');
  const idata = layer.ctx.getImageData(0, 0, State.canvasW, State.canvasH);
  const data = idata.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    const noise = (Math.random() - 0.5) * 60;
    data[i]   = Math.min(255, Math.max(0, data[i]   + noise));
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
  }
  layer.ctx.putImageData(idata, 0, 0);
  compositeAll();
  showToast('Gürültü uygulandı ✓', 'success');
}

function applyContrastFilter() {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  pushUndoState('Kontrast Filtresi');
  const idata = layer.ctx.getImageData(0, 0, State.canvasW, State.canvasH);
  const data = idata.data;
  const factor = 1.5;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    data[i]   = Math.min(255, Math.max(0, factor * (data[i]   - 128) + 128));
    data[i+1] = Math.min(255, Math.max(0, factor * (data[i+1] - 128) + 128));
    data[i+2] = Math.min(255, Math.max(0, factor * (data[i+2] - 128) + 128));
  }
  layer.ctx.putImageData(idata, 0, 0);
  compositeAll();
  showToast('Kontrast dengelendi ✓', 'success');
}

function applyPixelateFilter() {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  pushUndoState('Pikselize Filtre');
  const size = 3;
  const idata = layer.ctx.getImageData(0, 0, State.canvasW, State.canvasH);
  const data = idata.data;
  const W = State.canvasW, H = State.canvasH;
  const getIdx = (x, y) => (y * W + x) * 4;
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      const ci = getIdx(x, y);
      const cr = data[ci], cg = data[ci+1], cb = data[ci+2], ca = data[ci+3];
      for (let dy = 0; dy < size && y+dy < H; dy++) {
        for (let dx = 0; dx < size && x+dx < W; dx++) {
          const ni = getIdx(x+dx, y+dy);
          data[ni] = cr; data[ni+1] = cg; data[ni+2] = cb; data[ni+3] = ca;
        }
      }
    }
  }
  layer.ctx.putImageData(idata, 0, 0);
  compositeAll();
  showToast('Pikselize edildi ✓', 'success');
}

function applyRandomTexture() {
  const layer = State.layers[State.activeLayerIndex];
  if (!layer || layer.locked) return;
  pushUndoState('Rastgele Doku');
  const { r, g, b } = hexToRgba(State.fgColor);
  for (let y = 0; y < State.canvasH; y++) {
    for (let x = 0; x < State.canvasW; x++) {
      const n = Math.random();
      const noiseR = Math.min(255, Math.max(0, r + (n - 0.5) * 120));
      const noiseG = Math.min(255, Math.max(0, g + (n - 0.5) * 80));
      const noiseB = Math.min(255, Math.max(0, b + (n - 0.5) * 100));
      setPixel(layer.ctx, x, y, rgbaToHex(Math.round(noiseR), Math.round(noiseG), Math.round(noiseB)));
    }
  }
  compositeAll();
  showToast('Rastgele doku oluşturuldu ✓', 'success');
}

// ═══════════════════════════════════════════════════════════════
// SİMGE CANVAS OLAYLARı
// ═══════════════════════════════════════════════════════════════
function setupIconCanvas() {
  iconCanvas = $('icon-canvas');
  iconCtx = iconCanvas.getContext('2d');

  function getIconCoords(e) {
    const rect = iconCanvas.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) * (64 / rect.width)),
      y: Math.floor((e.clientY - rect.top) * (64 / rect.height)),
    };
  }

  function iconPaint(e, down = false) {
    if (!iconPainting && !down) return;
    const { x, y } = getIconCoords(e);
    const color = $('icon-color').value;
    if (iconTool === 'pencil') { iconCtx.fillStyle = color; iconCtx.fillRect(x, y, 1, 1); }
    else if (iconTool === 'eraser') { iconCtx.clearRect(x, y, 1, 1); }
    else if (iconTool === 'fill' && down) { iconFloodFill(x, y, color); }
  }

  iconCanvas.addEventListener('mousedown', e => { iconPainting = true; iconPaint(e, true); });
  iconCanvas.addEventListener('mousemove', e => iconPaint(e));
  iconCanvas.addEventListener('mouseup', () => { iconPainting = false; });
  iconCanvas.addEventListener('mouseleave', () => { iconPainting = false; });

  function iconFloodFill(startX, startY, fillColor) {
    const idata = iconCtx.getImageData(0, 0, 64, 64);
    const data = idata.data;
    const getIdx = (x, y) => (y * 64 + x) * 4;
    const si = getIdx(startX, startY);
    const tr = data[si], tg = data[si+1], tb = data[si+2], ta = data[si+3];
    const tmp = document.createElement('canvas'); tmp.width = 1; tmp.height = 1;
    const tc = tmp.getContext('2d'); tc.fillStyle = fillColor; tc.fillRect(0,0,1,1);
    const fc = tc.getImageData(0,0,1,1).data;
    const fr = fc[0], fg2 = fc[1], fb = fc[2];
    if (tr === fr && tg === fg2 && tb === fb && ta === 255) return;
    const stack = [[startX, startY]];
    const visited = new Uint8Array(64 * 64);
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= 64 || y < 0 || y >= 64) continue;
      const fi = y * 64 + x;
      if (visited[fi]) continue;
      const ci = getIdx(x, y);
      if (data[ci] !== tr || data[ci+1] !== tg || data[ci+2] !== tb || data[ci+3] !== ta) continue;
      visited[fi] = 1;
      data[ci] = fr; data[ci+1] = fg2; data[ci+2] = fb; data[ci+3] = 255;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    iconCtx.putImageData(idata, 0, 0);
  }

  $('icon-pencil-btn').addEventListener('click', () => { iconTool = 'pencil'; $$('.icon-tool-btn').forEach(b => b.classList.remove('active')); $('icon-pencil-btn').classList.add('active'); });
  $('icon-eraser-btn').addEventListener('click', () => { iconTool = 'eraser'; $$('.icon-tool-btn').forEach(b => b.classList.remove('active')); $('icon-eraser-btn').classList.add('active'); });
  $('icon-fill-btn').addEventListener('click', () => { iconTool = 'fill'; $$('.icon-tool-btn').forEach(b => b.classList.remove('active')); $('icon-fill-btn').classList.add('active'); });
  $('icon-clear-btn').addEventListener('click', () => { iconCtx.clearRect(0, 0, 64, 64); });

  const uploadZone = $('icon-upload-zone');
  const fileInput = $('icon-file-input');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.style.borderColor = 'var(--neon-cyan)'; });
  uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) loadIconFile(file);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadIconFile(fileInput.files[0]); });

  function loadIconFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => { iconCtx.clearRect(0,0,64,64); iconCtx.drawImage(img, 0, 0, 64, 64); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Varsayılan simge
  const grad = iconCtx.createLinearGradient(0, 0, 64, 64);
  grad.addColorStop(0, '#0088ff');
  grad.addColorStop(1, '#00ffcc');
  iconCtx.fillStyle = grad;
  iconCtx.fillRect(0, 0, 64, 64);
  iconCtx.fillStyle = '#000';
  iconCtx.font = 'bold 20px monospace';
  iconCtx.fillText('Px', 16, 42);
}

// ═══════════════════════════════════════════════════════════════
// KURULUM SİHİRBAZI
// ═══════════════════════════════════════════════════════════════
function setupWizard() {
  setupIconCanvas();

  $$('.wizard-next').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.next)));
  });
  $$('.wizard-back').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prev)));
  });

  $$('.version-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.version-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      State.packFormat = parseInt(card.dataset.format);
    });
  });

  // Animasyon toggle
  const toggleSwitch = $('anim-toggle-switch');
  const toggleInput = $('animated-toggle');
  toggleSwitch.addEventListener('click', () => {
    const checked = !toggleInput.checked;
    toggleInput.checked = checked;
    toggleSwitch.classList.toggle('on', checked);
    $('anim-options').classList.toggle('hidden', !checked);
    State.animated = checked;
  });

  $('wizard-launch-btn').addEventListener('click', launchStudio);
}

function goToStep(n) {
  $$('.wizard-step').forEach(s => s.classList.remove('active'));
  $('wizard-step-' + n).classList.add('active');
  $$('.step-dot').forEach(d => {
    const sn = parseInt(d.dataset.step);
    d.classList.toggle('active', sn === n);
    d.classList.toggle('done', sn < n);
  });
}

function launchStudio() {
  State.packName = $('pack-name').value.trim() || 'Harika Paketim';
  State.packDesc = $('pack-desc').value.trim() || '';
  State.iconDataURL = iconCanvas.toDataURL('image/png');

  const frameCount = parseInt($('frame-count').value) || 4;
  State.defaultFrametime = parseInt($('default-frametime').value) || 2;

  const tmpl = $('texture-template').value;
  let w = parseInt($('canvas-resolution').value) || 16;
  let h = w;
  if (tmpl === 'armor') { w = 64; h = 32; }
  else if (tmpl === 'font') { w = 256; h = 256; }

  State.canvasW = w; State.canvasH = h;

  mainCanvas = $('main-canvas'); mainCtx = mainCanvas.getContext('2d');
  onionCanvas = $('onion-canvas'); onionCtx = onionCanvas.getContext('2d');
  overlayCanvas = $('overlay-canvas'); overlayCtx = overlayCanvas.getContext('2d');
  previewCanvas = $('preview-canvas'); previewCtx = previewCanvas.getContext('2d');

  mainCtx.imageSmoothingEnabled = false;
  onionCtx.imageSmoothingEnabled = false;
  overlayCtx.imageSmoothingEnabled = false;

  initCanvases(w, h);

  if (State.animated) {
    State.frames = [];
    for (let i = 0; i < frameCount; i++) State.frames.push(createFrameObject(State.defaultFrametime, i));
    State.layers = State.frames[0].layers.map(l => {
      const nl = createLayerObject(l.name);
      nl.ctx.drawImage(l.canvas, 0, 0);
      return nl;
    });
    $('frames-static').classList.add('hidden');
    $('frames-dynamic').classList.remove('hidden');
    renderFramesList();
  } else {
    State.layers = [createLayerObject('Arka Plan')];
  }

  applyTemplate(tmpl, State.layers[0].ctx, w, h);
  State.activeLayerIndex = 0;

  $('wizard-overlay').classList.add('hidden');
  $('app').classList.remove('hidden');

  $('pack-name-display').textContent = State.packName;
  $('canvas-size-display').textContent = `${w}×${h}`;

  setupMCPalette();
  renderLayersList();
  compositeAll();
  fitToView();
  setupCanvasEvents();
  pushUndoState('Başlangıç');
  updatePathDisplay();
  updatePreview();

  // Three.js başlat
  setTimeout(() => initThreeJS(), 100);
}

function applyTemplate(tmpl, ctx, w, h) {
  if (tmpl === 'blank') return;
  ctx.clearRect(0, 0, w, h);
  if (tmpl === 'block') {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = ((x + y) % 2 === 0) ? '#1a1a2e' : '#13131f';
        ctx.fillRect(x, y, 1, 1);
      }
  } else if (tmpl === 'armor') {
    ctx.fillStyle = 'rgba(80,80,120,0.15)'; ctx.fillRect(0, 0, 64, 32);
    ctx.strokeStyle = 'rgba(0,255,204,0.2)'; ctx.lineWidth = 0.5;
    [[0,0,8,8],[8,0,8,8],[16,0,8,8],[24,0,8,8],[16,16,8,12],[0,16,4,12],[36,16,4,12]].forEach(([x,y,w2,h2]) => ctx.strokeRect(x,y,w2,h2));
  } else if (tmpl === 'entity') {
    ctx.fillStyle = 'rgba(60,60,100,0.12)'; ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = 'rgba(0,136,255,0.2)'; ctx.lineWidth = 0.5;
    [[0,0,8,8],[8,0,8,8],[16,0,8,8],[24,0,8,8],[16,16,8,12],[0,16,4,12],[36,16,4,12]].forEach(([x,y,w2,h2]) => ctx.strokeRect(x,y,w2,h2));
  } else if (tmpl === 'font') {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    const gs = 256 / 16;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath(); ctx.moveTo(i * gs, 0); ctx.lineTo(i * gs, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * gs); ctx.lineTo(256, i * gs); ctx.stroke();
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MC PALETİ KURULUM
// ═══════════════════════════════════════════════════════════════
function setupMCPalette() {
  const el = $('mc-palette');
  el.innerHTML = '';
  MC_PALETTE.forEach(color => {
    const s = document.createElement('div');
    s.className = 'palette-swatch';
    s.dataset.color = color;
    s.style.background = color;
    s.title = color;
    s.addEventListener('click', () => setFGColor(color));
    el.appendChild(s);
  });
}

// ═══════════════════════════════════════════════════════════════
// CANVAS OLAYLARı KURULUM
// ═══════════════════════════════════════════════════════════════
function setupCanvasEvents() {
  mainCanvas.addEventListener('pointerdown', onCanvasPointerDown);
  mainCanvas.addEventListener('pointermove', onCanvasPointerMove);
  mainCanvas.addEventListener('pointerup', onCanvasPointerUp);
  mainCanvas.addEventListener('pointercancel', onCanvasPointerUp);
  mainCanvas.addEventListener('contextmenu', e => e.preventDefault());

  $('canvas-viewport').addEventListener('wheel', e => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom(State.zoom * (e.deltaY > 0 ? 0.85 : 1.15));
    }
  }, { passive: false });
}

// ═══════════════════════════════════════════════════════════════
// ARAÇ ÇUBUĞU KURULUM
// ═══════════════════════════════════════════════════════════════
function setupToolbar() {
  $$('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.activeTool = btn.dataset.tool;
      const toolNames = {
        pencil: 'Kalem', eraser: 'Silgi', fill: 'Doldur', eyedropper: 'Renk Seçici',
        line: 'Çizgi', rect: 'Dikdörtgen', ellipse: 'Elips', dither: 'Tarama',
        gradient: 'Gradyan', noise: 'Gürültü'
      };
      $('active-tool-display').textContent = toolNames[State.activeTool] || State.activeTool;
    });
  });

  $('btn-grid').addEventListener('click', () => {
    State.showGrid = !State.showGrid;
    $('btn-grid').style.color = State.showGrid ? 'var(--neon-cyan)' : '';
    $('btn-grid').style.borderColor = State.showGrid ? 'rgba(0,255,204,0.3)' : '';
    compositeAll();
  });

  $('btn-zoom-in').addEventListener('click', () => setZoom(State.zoom * 1.5));
  $('btn-zoom-out').addEventListener('click', () => setZoom(State.zoom / 1.5));
  $('btn-zoom-fit').addEventListener('click', fitToView);

  $('btn-undo').addEventListener('click', undo);
  $('btn-redo').addEventListener('click', redo);

  $('btn-save-project').addEventListener('click', saveProjectToDB);
  $('btn-load-project').addEventListener('click', () => {
    listProjects(keys => {
      if (keys.length === 0) { showToast('Kayıtlı proje yok', 'info'); return; }
      const name = keys.length === 1 ? keys[0] : prompt('Yüklenecek proje:\n' + keys.join('\n'), keys[0]);
      if (name) loadProjectFromDB(name);
    });
  });

  $('btn-export').addEventListener('click', openExportModal);
  $('btn-close-export').addEventListener('click', () => $('export-modal').classList.add('hidden'));
  $('btn-download-zip').addEventListener('click', doExportZip);

  $('btn-new-project').addEventListener('click', () => {
    if (confirm('Yeni proje başlatılsın mı? Kaydedilmemiş değişiklikler kaybolacak.')) location.reload();
  });

  $('pixel-perfect-mode').addEventListener('change', e => { State.pixelPerfect = e.target.checked; });
  $('mirror-h').addEventListener('change', e => { State.mirrorH = e.target.checked; });
  $('mirror-v').addEventListener('change', e => { State.mirrorV = e.target.checked; });

  const brushSlider = $('brush-size');
  brushSlider.addEventListener('input', () => {
    State.brushSize = parseInt(brushSlider.value);
    $('brush-size-display').textContent = State.brushSize + 'px';
    brushSlider.style.setProperty('--val', ((State.brushSize - 1) / 15 * 100) + '%');
  });

  // Renk kontrolleri
  $('fg-color-swatch').addEventListener('click', () => $('fg-color-input').click());
  $('bg-color-swatch').addEventListener('click', () => $('bg-color-input').click());
  $('fg-color-input').addEventListener('input', e => setFGColor(e.target.value));
  $('bg-color-input').addEventListener('input', e => {
    State.bgColor = e.target.value;
    $('bg-color-swatch').style.background = State.bgColor;
  });
  $('hex-input').addEventListener('change', e => {
    let v = e.target.value;
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setFGColor(v);
  });
  $('r-input').addEventListener('input', updateColorFromRGBA);
  $('g-input').addEventListener('input', updateColorFromRGBA);
  $('b-input').addEventListener('input', updateColorFromRGBA);
  $('a-input').addEventListener('input', updateColorFromRGBA);

  // Renkleri değiştir butonu
  document.querySelector('.swap-btn').addEventListener('click', () => {
    const tmp = State.fgColor;
    State.fgColor = State.bgColor; State.bgColor = tmp;
    setFGColor(State.fgColor);
    $('bg-color-swatch').style.background = State.bgColor;
    $('bg-color-input').value = State.bgColor;
  });

  $('add-custom-color').addEventListener('click', () => {
    const container = $('custom-palette');
    const s = document.createElement('div');
    s.className = 'custom-swatch';
    s.style.background = State.fgColor;
    s.title = State.fgColor;
    s.addEventListener('click', () => setFGColor(s.title));
    s.addEventListener('contextmenu', e => { e.preventDefault(); s.remove(); });
    container.insertBefore(s, $('add-custom-color'));
  });

  // Katman kontrolleri
  $('btn-add-layer').addEventListener('click', () => addLayer());
  $('btn-duplicate-layer').addEventListener('click', duplicateLayer);
  $('btn-merge-down').addEventListener('click', mergeDown);
  $('btn-delete-layer').addEventListener('click', deleteLayer);

  $('layer-opacity').addEventListener('input', e => {
    const v = parseInt(e.target.value);
    State.layers[State.activeLayerIndex].opacity = v;
    $('layer-opacity-display').textContent = v + '%';
    e.target.style.setProperty('--val', v + '%');
    compositeAll();
  });
  $('layer-blend').addEventListener('change', e => {
    State.layers[State.activeLayerIndex].blendMode = e.target.value;
    compositeAll();
  });

  // Kare kontrolleri
  $('btn-add-frame').addEventListener('click', addFrame);
  $('btn-delete-frame').addEventListener('click', deleteFrame);
  $('onion-skin-toggle').addEventListener('change', e => { State.onionSkin = e.target.checked; drawOnionSkin(); });
  $('frame-time-input').addEventListener('change', e => {
    if (!State.animated) return;
    State.frames[State.activeFrameIndex].frametime = parseInt(e.target.value) || 1;
    renderFramesList();
  });
  $('frame-index-input').addEventListener('change', e => {
    if (!State.animated) return;
    State.frames[State.activeFrameIndex].index = parseInt(e.target.value) || 0;
  });

  // Sağ sekmeler
  $$('.right-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.right-tab').forEach(t => t.classList.remove('active'));
      $$('.right-panel-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $('rtab-' + tab.dataset.rtab).classList.add('active');
      if (tab.dataset.rtab === 'preview') updatePreview();
      if (tab.dataset.rtab === 'threed') {
        setTimeout(() => {
          if (!threeRenderer) initThreeJS();
        }, 50);
      }
    });
  });

  $('preview-bg').addEventListener('change', e => { updatePreviewBG(e.target.value); updatePreview(); });

  $('texture-category').addEventListener('change', updatePathDisplay);
  $('texture-filename').addEventListener('input', updatePathDisplay);
  $('btn-add-to-pack').addEventListener('click', addToPackQueue);

  // Prosedürel filtreler
  $('btn-noise-filter').addEventListener('click', applyNoiseFilter);
  $('btn-contrast-filter').addEventListener('click', applyContrastFilter);
  $('btn-pixelate-filter').addEventListener('click', applyPixelateFilter);
  $('btn-random-texture').addEventListener('click', applyRandomTexture);

  document.addEventListener('keydown', onKeyDown);
}

// ═══════════════════════════════════════════════════════════════
// KLAVYE KISA YOLLARI
// ═══════════════════════════════════════════════════════════════
function onKeyDown(e) {
  const tag = document.activeElement.tagName.toLowerCase();
  if (['input','textarea','select'].includes(tag)) return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProjectToDB(); return; }

  const toolMap = { p: 'pencil', e: 'eraser', f: 'fill', i: 'eyedropper', d: 'dither', l: 'line', r: 'rect', o: 'ellipse', g: 'gradient', n: 'noise' };
  if (toolMap[e.key]) { selectTool(toolMap[e.key]); return; }

  if (e.key === '+' || e.key === '=') setZoom(State.zoom * 1.25);
  if (e.key === '-') setZoom(State.zoom / 1.25);
  if (e.key === '[') { State.brushSize = Math.max(1, State.brushSize - 1); $('brush-size').value = State.brushSize; $('brush-size-display').textContent = State.brushSize + 'px'; }
  if (e.key === ']') { State.brushSize = Math.min(16, State.brushSize + 1); $('brush-size').value = State.brushSize; $('brush-size-display').textContent = State.brushSize + 'px'; }
  if (e.key === 'x') {
    const tmp = State.fgColor; State.fgColor = State.bgColor; State.bgColor = tmp;
    setFGColor(State.fgColor); $('bg-color-swatch').style.background = State.bgColor;
    $('bg-color-input').value = State.bgColor;
  }
}

function selectTool(name) {
  State.activeTool = name;
  $$('.tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === name));
  const toolNames = { pencil: 'Kalem', eraser: 'Silgi', fill: 'Doldur', eyedropper: 'Renk Seçici', line: 'Çizgi', rect: 'Dikdörtgen', ellipse: 'Elips', dither: 'Tarama', gradient: 'Gradyan', noise: 'Gürültü' };
  $('active-tool-display').textContent = toolNames[name] || name;
}

// ═══════════════════════════════════════════════════════════════
// ÖNİZLEME ARKAPLANı
// ═══════════════════════════════════════════════════════════════
function updatePreviewBG(type) {
  const area = $('preview-area');
  if (type === 'transparent') area.style.background = 'repeating-conic-gradient(#1a1a2e 0% 25%, #0d0d1a 0% 50%) 0 0 / 8px 8px';
  else if (type === 'grass') area.style.background = 'linear-gradient(to bottom, #87CEEB 50%, #567d46 50%)';
  else if (type === 'dark') area.style.background = '#111';
  else if (type === 'light') area.style.background = '#eee';
  else if (type === 'checker') area.style.background = 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px';
}

// ═══════════════════════════════════════════════════════════════
// YOL GÖSTERGESI
// ═══════════════════════════════════════════════════════════════
function updatePathDisplay() {
  const cat = $('texture-category').value;
  const fname = ($('texture-filename').value || 'texture').replace(/\.png$/, '');
  let path;
  if (cat === 'armor') path = `assets/minecraft/textures/models/armor/${fname}.png`;
  else if (cat === 'entity') path = `assets/minecraft/textures/entity/${fname}.png`;
  else if (cat === 'font') path = `assets/minecraft/textures/font/${fname}.png`;
  else if (cat === 'gui') path = `assets/minecraft/textures/gui/${fname}.png`;
  else if (cat === 'misc') path = `assets/minecraft/textures/misc/${fname}.png`;
  else path = `assets/minecraft/textures/${cat}/${fname}.png`;
  $('path-display').textContent = path;
}

// ═══════════════════════════════════════════════════════════════
// PACK KUYRUĞU
// ═══════════════════════════════════════════════════════════════
function addToPackQueue() {
  const path = $('path-display').textContent;
  if (!path) return;
  if (State.packQueue.find(q => q.path === path)) { showToast('Zaten kuyrukta', 'info'); return; }
  const snap = mainCanvas.toDataURL('image/png');
  const mcmeta = State.animated ? buildMcmeta() : null;
  State.packQueue.push({ path, snap, mcmeta });
  updatePackQueue();
  showToast(`Eklendi: ${path.split('/').pop()}`, 'success');
}

function updatePackQueue() {
  const list = $('pack-queue-list');
  list.innerHTML = '';
  State.packQueue.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'queue-item';
    const short = item.path.replace('assets/minecraft/textures/', '');
    div.innerHTML = `<span class="queue-item-path" title="${item.path}">${short}</span>`;
    const btn = document.createElement('button');
    btn.className = 'queue-remove-btn'; btn.textContent = '✕';
    btn.addEventListener('click', () => { State.packQueue.splice(i, 1); updatePackQueue(); });
    div.appendChild(btn); list.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════════
// MCMETA ÜRETIMI
// ═══════════════════════════════════════════════════════════════
function buildMcmeta() {
  if (!State.animated) return null;
  return {
    animation: {
      interpolate: false, frametime: State.defaultFrametime,
      frames: State.frames.map(f => ({ index: f.index, time: f.frametime })),
    },
  };
}

function buildPackMcmeta() {
  return { pack: { pack_format: State.packFormat, description: State.packDesc || State.packName } };
}

function buildSpriteSheet() {
  const w = State.canvasW, h = State.canvasH, numFrames = State.frames.length;
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = w; sheetCanvas.height = h * numFrames;
  const sheetCtx = sheetCanvas.getContext('2d');
  sheetCtx.imageSmoothingEnabled = false;
  State.frames.forEach((frame, i) => {
    frame.layers.forEach(l => {
      if (!l.visible) return;
      sheetCtx.globalAlpha = l.opacity / 100;
      sheetCtx.globalCompositeOperation = l.blendMode;
      sheetCtx.drawImage(l.canvas, 0, i * h);
    });
    sheetCtx.globalAlpha = 1; sheetCtx.globalCompositeOperation = 'source-over';
  });
  return sheetCanvas;
}

// ═══════════════════════════════════════════════════════════════
// DIŞA AKTAR MODALI
// ═══════════════════════════════════════════════════════════════
function openExportModal() {
  if (State.animated) saveCurrentFrame();
  const summary = $('export-summary');
  let html = `<span class="dir-entry">📦 ${State.packName || 'Pixilim_Pack'}.zip</span>\n`;
  html += `<span class="file-entry">  ├── pack.png</span>\n`;
  html += `<span class="file-entry">  ├── pack.mcmeta</span>\n`;
  State.packQueue.forEach((item, i) => {
    const isLast = i === State.packQueue.length - 1;
    html += `<span class="file-entry">  ${isLast ? '└──' : '├──'} ${item.path}</span>\n`;
    if (item.mcmeta) html += `<span class="file-entry">  ${isLast ? ' ' : '│'} └── ${item.path}.mcmeta</span>\n`;
  });
  if (State.packQueue.length === 0) {
    const fname = ($('texture-filename').value || 'texture').replace(/\.png$/, '');
    const cat = $('texture-category').value;
    html += `<span class="file-entry">  └── assets/minecraft/textures/${cat}/${fname}.png (mevcut canvas)</span>\n`;
  }
  summary.innerHTML = html;
  $('export-modal').classList.remove('hidden');
}

async function doExportZip() {
  const zip = new JSZip();
  const iconBlob = await (await fetch(State.iconDataURL || iconCanvas.toDataURL())).blob();
  zip.file('pack.png', iconBlob);
  zip.file('pack.mcmeta', JSON.stringify(buildPackMcmeta(), null, 2));

  if (State.packQueue.length > 0) {
    for (const item of State.packQueue) {
      const blob = await (await fetch(item.snap)).blob();
      zip.file(item.path, blob);
      if (item.mcmeta) zip.file(item.path + '.mcmeta', JSON.stringify(item.mcmeta, null, 2));
    }
  } else {
    const fname = ($('texture-filename').value || 'texture').replace(/\.png$/, '');
    const cat = $('texture-category').value;
    let texPath;
    if (cat === 'armor') texPath = `assets/minecraft/textures/models/armor/${fname}.png`;
    else if (cat === 'entity') texPath = `assets/minecraft/textures/entity/${fname}.png`;
    else if (cat === 'font') texPath = `assets/minecraft/textures/font/${fname}.png`;
    else if (cat === 'gui') texPath = `assets/minecraft/textures/gui/${fname}.png`;
    else if (cat === 'misc') texPath = `assets/minecraft/textures/misc/${fname}.png`;
    else texPath = `assets/minecraft/textures/${cat}/${fname}.png`;

    if (State.animated) {
      saveCurrentFrame();
      const sheet = buildSpriteSheet();
      const sheetBlob = await new Promise(res => sheet.toBlob(res, 'image/png'));
      zip.file(texPath, sheetBlob);
      const mcmeta = buildMcmeta();
      if (mcmeta) zip.file(texPath + '.mcmeta', JSON.stringify(mcmeta, null, 2));
    } else {
      const blob = await new Promise(res => mainCanvas.toBlob(res, 'image/png'));
      zip.file(texPath, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = (State.packName || 'Pixilim_Pack').replace(/[^a-zA-Z0-9_-]/g, '_') + '.zip';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  $('export-modal').classList.add('hidden');
  showToast('Paket başarıyla dışa aktarıldı! ✓', 'success');
}

// ═══════════════════════════════════════════════════════════════
// BİLDİRİM (TOAST)
// ═══════════════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, type = 'success') {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast ' + type + ' show';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// ═══════════════════════════════════════════════════════════════
// BAŞLATMA
// ═══════════════════════════════════════════════════════════════
async function init() {
  // Splash ekranını başlat
  initSplash();

  // DB'yi arka planda başlat
  try {
    await initDB();
  } catch (e) {
    console.warn('IndexedDB kullanılamıyor:', e);
  }

  // Toolbar sadece wizard'dan sonra kurulur
  // setupWizard splash sonrası çağrılır
}

// Splash ekranı kaldırıldıktan sonra wizard kurulumu
const origRemove = Element.prototype.remove;
document.addEventListener('DOMContentLoaded', () => {
  const splashEl = $('splash-screen');
  if (splashEl) {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(splashEl)) {
        observer.disconnect();
        setupWizard();
        setupToolbar();
        setFGColor('#00ffcc');
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  init();
});