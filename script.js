// Helpers rápidos
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- UI básica: burger, menú, talk ---------------- */
(() => {
  const body = document.body;
  const burger = $('#burger');
  const menu = $('#menu');
  const talkBtn = $('#talkBtn');

  burger.addEventListener('click', () => {
    body.classList.toggle('nav-open');
    const open = body.classList.contains('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  talkBtn.addEventListener('click', () => {
    alert('Escríbenos: hola@estudiodemo.dev (demo)');
  });

  // Cierra menú al hacer click en un link
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Newsletter (top & foot)
  ['newsletterTop','newsletterFoot'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('¡Gracias! (demo)');
      form.reset();
    });
  });
})();

/* ---------------- Animación de palabras en hero (si existen) --- */
(() => {
  const words = $$('#heroTitle .word');
  words.forEach((w, i) => {
    setTimeout(() => {
      w.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1), opacity .8s';
      w.style.transform = 'translateY(0) rotate(0)';
      w.style.opacity = '1';
    }, 250 + i * 120);
  });
})();

/* ---------------- Indicador de scroll -------------------------- */
(() => {
  const bar = $('#scrollBar');
  const onScroll = () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const p = Math.min(1, Math.max(0, h.scrollTop / max));
    bar.style.transform = `scaleY(${p})`;
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------------- Marquee de “Clientes” (logos SVG) ------------ */
(() => {
  const logo = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 64 64');
    const g = document.createElementNS(ns, 'g');

    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x','8'); r.setAttribute('y','16'); r.setAttribute('rx','8');
    r.setAttribute('width','48'); r.setAttribute('height','32'); r.setAttribute('fill','#2b2e3a');

    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx','20'); c.setAttribute('cy','32'); c.setAttribute('r','6'); c.setAttribute('fill','#fff');

    const t = document.createElementNS(ns, 'rect');
    t.setAttribute('x','30'); t.setAttribute('y','26'); t.setAttribute('width','22'); t.setAttribute('height','12'); t.setAttribute('fill','#fff');

    g.appendChild(r); g.appendChild(c); g.appendChild(t); s.appendChild(g);
    return s;
  };

  // Poblar carril 1 y clonar al 2
  const mq1 = $('#mq1');
  for (let i = 0; i < 9; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'client-logo';
    wrap.appendChild(logo());
    mq1.appendChild(wrap);
  }
  const mq2 = $('#mq2');
  mq2.innerHTML = mq1.innerHTML;
  $$('#mq2 .client-logo').forEach(el => { el.innerHTML = ''; el.appendChild(logo()); });

  let x1 = 0, x2 = 0;
  let last = performance.now();
  function tick(t) {
    const dt = Math.min(32, t - last); last = t;
    const speed = .03;
    x1 -= speed * dt * 60 / 16;
    x2 += speed * dt * 60 / 16;
    mq1.style.transform = `translateX(${x1}px)`;
    mq2.style.transform = `translateX(${x2}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------------- Overlay de video (YouTube Iframe API) -------- */
(() => {
  const overlay = $('#videoOverlay');
  const openBtn = $('#watchReel');
  const closeBtn = $('#voClose');
  const playBtn  = $('#voPlay');
  const prog = $('#voProg');
  let yt, duration = 0, playing = false, apiReady = false;

  // API global callback
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('yt', {
      events: {
        onReady: () => { apiReady = true; duration = yt.getDuration() || 0; },
        onStateChange: (e) => { playing = e.data === YT.PlayerState.PLAYING; }
      }
    });
  };

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (apiReady) { yt.playVideo(); playing = true; }
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (apiReady) { yt.pauseVideo(); playing = false; }
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  playBtn.addEventListener('click', () => {
    if (!apiReady) return;
    if (playing) yt.pauseVideo(); else yt.playVideo();
    playing = !playing;
  });

  setInterval(() => {
    if (!apiReady) return;
    duration = yt.getDuration() || 0;
    const t = yt.getCurrentTime() || 0;
    const p = duration ? (t / duration) : 0;
    prog.style.transform = `scaleX(${p})`;
  }, 250);
})();

/* ---------------- Año en footer -------------------------------- */
(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

/* ---------------- FX: gradiente que sigue el cursor ------------- */
window.addEventListener('pointermove', (e) => {
  document.body.style.setProperty('--mx', e.clientX + 'px');
  document.body.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });

/* ---------------- Observer para .reveal ------------------------- */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------------- Tilt 3D en tarjetas / media ------------------- */
(() => {
  const max = 12, perspective = 900;
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const rx = (-dy * max).toFixed(2), ry = (dx * max).toFixed(2);
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0)`;
    });
  });
})();

/* ---------------- Botones “magnéticos” -------------------------- */
(() => {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const k = parseFloat(el.dataset.magnetic) || 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${mx*k}px, ${my*k}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
})();

/* ---------------- Cursor personalizado ------------------------- */
(() => {
  if (!matchMedia('(pointer:fine)').matches) return;
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let xr = 0, yr = 0, xd = 0, yd = 0;

  function loop() {
    xr += (xd - xr) * 0.15;
    yr += (yd - yr) * 0.15;
    ring.style.transform = `translate(${xr}px, ${yr}px)`;
    requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', (e) => {
    xd = e.clientX - 12; yd = e.clientY - 12;
    dot.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
  });

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.add('is-big');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.remove('is-big');
  });

  loop();
})();

/* ---------------- Partículas 2D (canvas extra) ------------------ */
(() => {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('fx3d-extra');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, last = performance.now();
  let particles = [];
  const mouse = { x: 0, y: 0, down: false };

  function resize() {
    W = canvas.width  = Math.floor(innerWidth * DPR);
    H = canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  addEventListener('resize', resize);

  addEventListener('pointermove', e => { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; }, { passive: true });
  addEventListener('pointerdown', () => mouse.down = true);
  addEventListener('pointerup',   () => mouse.down = false);

  const sections = [...document.querySelectorAll('section')];
  const palettes = {
    default: ['#00F0FF','#6CFF00','#FF00EA','#FFD000'],
    '#inicio':['#7CD9FF','#B38CFF','#7FFFB6'],
    '#proyectos':['#00FFFF','#00FF99','#00AAFF'],
    '#clientes':['#00EAFF','#FF00CC','#FFD200'],
    '#capacidades':['#BFFF00','#00FFD5','#B300FF'],
    '#contacto':['#00FFD0','#80FF00','#00AAFF']
  };
  let palette = palettes.default;

  function updatePalette() {
    const mid = innerHeight / 2;
    let id = 'default';
    for (const sec of sections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) { id = '#' + (sec.id || ''); break; }
    }
    palette = palettes[id] || palettes.default;
  }

  const MAX = Math.min(180, Math.floor((innerWidth * innerHeight) / 22000));
  function makeParticle() {
    const ang = Math.random() * Math.PI * 2;
    const speed = 0.04 + Math.random() * 0.25;
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
      size: 3 * (0.8 + Math.random()*2.2) * DPR,
      hue: palette[(Math.random() * palette.length) | 0],
      j: Math.random() * Math.PI * 2
    };
  }
  function spawn(n){ for (let i=0;i<n;i++) particles.push(makeParticle()); }
  spawn(MAX);

  const hexToRgba = (hex,a) => {
    const h = hex.replace('#',''); const num = parseInt(h,16);
    const r = (num>>16)&255, g = (num>>8)&255, b = num&255;
    return `rgba(${r},${g},${b},${a})`;
  };

  function tick(t) {
    const dt = Math.min(32, t - last); last = t;
    updatePalette();
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';

    for (let i=0;i<particles.length;i++) {
      const p = particles[i];
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d2 = dx*dx + dy*dy + 10000;
      const pull = 12000 / d2;
      const f = mouse.down ? -pull*2.2 : pull;
      p.vx += (dx>0?1:-1) * f * 0.001 * dt;
      p.vy += (dy>0?1:-1) * f * 0.001 * dt;
      p.vx += Math.cos(t*0.0010 + p.j) * 0.005;
      p.vy += Math.sin(t*0.0013 + p.j) * 0.005;
      p.vx *= 0.995; p.vy *= 0.995;
      p.x += p.vx * dt * 0.8; p.y += p.vy * dt * 0.8;

      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      const r = p.size * (1 + Math.sin(t*0.003 + p.j) * 0.25);
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*6);
      g.addColorStop(0, hexToRgba(p.hue, 0.9));
      g.addColorStop(1, hexToRgba(p.hue, 0.0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------------- Altura de header para scroll-margin ---------- */
(() => {
  const setHdr = () => {
    const h = document.querySelector('header').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--hdr', h + 'px');
  };
  setHdr();
  addEventListener('resize', setHdr);
})();

/* ---------------- Nav: activar link según sección --------------- */
(() => {
  const links = [...document.querySelectorAll('#menu a[href^="#"]')];
  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) map.set(el, a);
  });
  const activate = (a) => { links.forEach(l => l.classList.remove('is-active')); a && a.classList.add('is-active'); };
  const io = new IntersectionObserver(es => {
    es.forEach(en => {
      const a = map.get(en.target); if (!a) return;
      if (en.isIntersecting) activate(a);
    });
  }, { rootMargin:'-40% 0px -55% 0px', threshold:0 });
  map.forEach((a, el) => io.observe(el));
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) activate(map.get(el));
  }
})();

/* ---------------- Cards flip en móvil (tap) --------------------- */
(() => {
  if (matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('click', () => c.classList.toggle('is-flipped'));
  });
})();

/* ---------------- Three.js escena (canvas #fx3d) ---------------- */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/environments/RoomEnvironment.js';

(() => {
  let scene, camera, renderer;
  const canvas = document.getElementById('fx3d');
  let mx = 0, my = 0;

  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth) - 0.5;
    my = (e.clientY / innerHeight) - 0.5;
  }, { passive: true });

  function init() {
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
    camera.position.set(0, 0.2, 9);

    renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
    scene.environment = envTex;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(4, 6, 3);
    scene.add(dir);

    const boneMat   = new THREE.MeshPhysicalMaterial({ color:0xeadcc2, roughness:0.6, metalness:0.0, clearcoat:0.2, clearcoatRoughness:0.5 });
    const discMat   = new THREE.MeshPhysicalMaterial({ color:0x8fc7ff, roughness:0.15, metalness:0.0, transmission:0.7, ior:1.35, thickness:0.35, clearcoat:0.6, clearcoatRoughness:0.15 });
    const tendonMat = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.05, metalness:0.0, transmission:0.45, ior:1.2, thickness:0.2 });

    const vertebraGeo = new THREE.CylinderGeometry(1,1,1,28,1,false);
    const discGeo     = new THREE.CylinderGeometry(1,1,1,24,1,false);

    const spines = [];
    spines.push(makeSpine({segments:64,length:7.2,baseRadius:0.18,vertebraH:0.22,discH:0.10,curvature:1.15,xOffset:-1.9,yOffset:-0.2,zOffset:-1.0,phase:0.0,vertebraGeo,discGeo,boneMat,discMat,tendonMat}));
    spines.push(makeSpine({segments:64,length:6.6,baseRadius:0.16,vertebraH:0.20,discH:0.09,curvature:0.95,xOffset:1.8,yOffset:0.15,zOffset:0.2,phase:Math.PI/3,vertebraGeo,discGeo,boneMat,discMat,tendonMat}));

    spines.forEach(g => scene.add(g.group));

    let last = performance.now();
    function animate(t) {
      const dt = Math.min(32, t - last); last = t;
      camera.position.x += (((mx*1.6) - camera.position.x) * 0.05);
      camera.position.y += (((-my*1.0) - camera.position.y) * 0.05);
      camera.lookAt(0,0,0);

      for (const s of spines) s.update(t*0.001, mx, my);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    addEventListener('resize', () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth/innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  function makeSpine({segments=60,length=6.0,baseRadius=0.16,vertebraH=0.20,discH=0.09,curvature=1.0,xOffset=0,yOffset=0,zOffset=0,phase=0,vertebraGeo,discGeo,boneMat,discMat,tendonMat}) {
    const group = new THREE.Group();
    const up = new THREE.Vector3(0,1,0);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const tangent = new THREE.Vector3();

    const vertebraMesh = new THREE.InstancedMesh(vertebraGeo, boneMat, segments);
    const discMesh     = new THREE.InstancedMesh(discGeo, discMat, Math.max(0, segments-1));
    vertebraMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    discMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(vertebraMesh, discMesh);

    const beadGeo = new THREE.SphereGeometry(baseRadius*0.22, 12, 10);
    const tendL = new THREE.InstancedMesh(beadGeo, tendonMat, segments*2);
    const tendR = new THREE.InstancedMesh(beadGeo, tendonMat, segments*2);
    tendL.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tendR.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(tendL, tendR);

    function posAt(t, time) {
      const wob = 0.6 + 0.3*Math.sin(time*0.9 + phase + t*4.2);
      const ang = t*curvature*Math.PI*2 + phase;
      const x = xOffset + Math.sin(ang)*0.55*wob;
      const y = yOffset + (t-0.5)*length;
      const z = zOffset + Math.cos(ang)*0.32*wob + Math.sin(time*0.5 + t*7 + phase)*0.05;
      return new THREE.Vector3(x,y,z);
    }

    function update(time) {
      for (let i=0;i<segments;i++){
        const t = i/(segments-1);
        p0.copy(posAt(t,time));

        const t2 = Math.min(1, t + 1/(segments-1));
        p1.copy(posAt(t2,time));

        tangent.copy(p1).sub(p0).normalize();
        q.setFromUnitVectors(up, tangent);

        const radius = baseRadius*(0.9 + 0.35*Math.sin(t*6 + phase + time*1.0));
        s.set(radius*1.15, vertebraH, radius*1.15);
        m.compose(p0, q, s);
        vertebraMesh.setMatrixAt(i, m);

        if (i < segments-1) {
          const mid = p0.clone().lerp(p1,0.5);
          s.set(radius*1.05, discH, radius*1.05);
          m.compose(mid, q, s);
          discMesh.setMatrixAt(i, m);
        }

        const bin = new THREE.Vector3().crossVectors(tangent, up);
        if (bin.lengthSq() < 1e-6) bin.set(1,0,0);
        bin.normalize();
        const nrm = new THREE.Vector3().crossVectors(bin, tangent).normalize();
        const lateral = radius*1.6;

        for (let k=0;k<2;k++){
          const jitter = (k ? -0.35 : 0.35) * (0.5 + 0.5*Math.sin(time*1.3 + i*0.3 + k));
          const offL = p0.clone().addScaledVector(nrm,  lateral + jitter);
          const offR = p0.clone().addScaledVector(nrm, -lateral - jitter);
          const s2 = radius*0.55;

          m.compose(offL, q, new THREE.Vector3(s2,s2,s2)); tendL.setMatrixAt(i*2+k, m);
          m.compose(offR, q, new THREE.Vector3(s2,s2,s2)); tendR.setMatrixAt(i*2+k, m);
        }
      }
      vertebraMesh.instanceMatrix.needsUpdate = true;
      discMesh.instanceMatrix.needsUpdate = true;
      tendL.instanceMatrix.needsUpdate = true;
      tendR.instanceMatrix.needsUpdate = true;
    }

    return { group, update };
  }

  init();
})();
