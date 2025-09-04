// ===== Utilidades =====
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* =========================
   UI BÁSICA
========================= */
(function header(){
  const body = document.body;
  const burger = $('#burger');
  const menu = $('#menu');
  const talkBtn = $('#talkBtn');
  burger.addEventListener('click', ()=>{
    body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(body.classList.contains('nav-open')));
  });
  menu.addEventListener('click', e=>{
    if(e.target.tagName === 'A'){ body.classList.remove('nav-open'); burger.setAttribute('aria-expanded','false'); }
  });
  talkBtn.addEventListener('click', ()=> alert('Escríbenos: hola@estudiodemo.dev (demo)'));
})();

(function heroWords(){
  const words = $$('#heroTitle .word');
  words.forEach((w,i)=> setTimeout(()=>{
    w.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1), opacity .8s';
    w.style.transform = 'translateY(0) rotate(0)';
    w.style.opacity = '1';
  }, 250 + i*120));
})();

(function scrollIndicator(){
  const bar = $('#scrollBar');
  const onScroll = ()=>{
    const h = document.documentElement;
    const p = Math.min(1, Math.max(0, h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)));
    bar.style.transform = `scaleY(${p})`;
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

(function marquee(){
  // SVG logo neutro
  const logo = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns,'svg'); s.setAttribute('viewBox','0 0 64 64');
    const g = document.createElementNS(ns,'g');
    const r = document.createElementNS(ns,'rect'); r.setAttribute('x','8'); r.setAttribute('y','16'); r.setAttribute('rx','8'); r.setAttribute('width','48'); r.setAttribute('height','32'); r.setAttribute('fill','#2b2e3a');
    const c = document.createElementNS(ns,'circle'); c.setAttribute('cx','20'); c.setAttribute('cy','32'); c.setAttribute('r','6'); c.setAttribute('fill','#fff');
    const t = document.createElementNS(ns,'rect'); t.setAttribute('x','30'); t.setAttribute('y','26'); t.setAttribute('width','22'); t.setAttribute('height','12'); t.setAttribute('fill','#fff');
    g.appendChild(r); g.appendChild(c); g.appendChild(t); s.appendChild(g); return s;
  };
  $$('#mq1 .client-logo').forEach(el=>{ el.textContent=''; el.appendChild(logo()); });
  const mq2 = $('#mq2'); mq2.innerHTML = $('#mq1').innerHTML;
  $$('#mq2 .client-logo').forEach(el=>{ el.textContent=''; el.appendChild(logo()); });

  let x1=0, x2=0; let last= performance.now();
  function tick(t){
    const dt = Math.min(32, t-last); last=t;
    const speed = .03;
    x1 -= speed * dt * 60/16; x2 += speed * dt * 60/16;
    $('#mq1').style.transform = `translateX(${x1}px)`;
    $('#mq2').style.transform = `translateX(${x2}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

(function video(){
  const overlay = $('#videoOverlay');
  const openBtn = $('#watchReel');
  const closeBtn = $('#voClose');
  const playBtn = $('#voPlay');
  const prog = $('#voProg');
  let yt, duration=0, playing=false, apiReady=false;

  const tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('yt', { events: {
      onReady: ()=>{ apiReady=true; duration = yt.getDuration() || 0; },
      onStateChange: e=>{ playing = e.data === YT.PlayerState.PLAYING; }
    }});
  };

  function open(){ overlay.classList.add('open'); document.body.style.overflow='hidden'; if(apiReady){ yt.playVideo(); playing=true; } }
  function close(){ overlay.classList.remove('open'); document.body.style.overflow=''; if(apiReady){ yt.pauseVideo(); playing=false; } }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  playBtn.addEventListener('click', ()=>{ if(!apiReady) return; playing? yt.pauseVideo(): yt.playVideo(); playing=!playing; });

  setInterval(()=>{ if(!apiReady) return; duration = yt.getDuration()||0; const t = yt.getCurrentTime()||0; const p = duration? (t/duration): 0; prog.style.transform = `scaleX(${p})`; }, 250);
})();

// Año footer
$('#year').textContent = new Date().getFullYear();

/* =========================
   MICROINTERACCIONES
========================= */
// Aurora reactiva (actualiza CSS vars)
(() => {
  let mx = innerWidth/2, my = innerHeight/2;
  window.addEventListener('pointermove', (e)=>{ mx = e.clientX; my = e.clientY; document.body.style.setProperty('--mx', mx + 'px'); document.body.style.setProperty('--my', my + 'px'); }, {passive:true});
  const bg = $('.improvements-bg');
  function loop(){ if(bg){ bg.style.setProperty('--x', (mx) + 'px'); bg.style.setProperty('--y', (my) + 'px'); } requestAnimationFrame(loop); }
  loop();
})();

// Reveal on scroll
(() => {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold:.15 });
  $$('.reveal').forEach(el=> io.observe(el));
})();

// Tilt
(() => {
  const max=12, perspective=900;
  $$('.tilt').forEach(el=>{
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx)/(r.width/2), dy = (e.clientY - cy)/(r.height/2);
      el.style.transform = `perspective(${perspective}px) rotateX(${(-dy*max).toFixed(2)}deg) rotateY(${(dx*max).toFixed(2)}deg)`;
    });
    el.addEventListener('pointerleave', ()=>{ el.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0)`; });
  });
})();

// Botones magnéticos
(() => {
  const els = document.querySelectorAll('[data-magnetic]');
  els.forEach(el=>{
    const k = parseFloat(el.dataset.magnetic)||0.35;
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top + r.height/2);
      el.style.transform = `translate(${mx*k}px, ${my*k}px)`;
    });
    el.addEventListener('pointerleave', ()=>{ el.style.transform = 'translate(0,0)'; });
  });
})();

// Cursor personalizado (punteros finos)
(() => {
  if(!matchMedia('(pointer:fine)').matches) return;
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  let xr=0, yr=0, xd=0, yd=0;
  function loop(){ xr += (xd - xr)*0.15; yr += (yd - yr)*0.15; ring.style.transform = `translate(${xr}px, ${yr}px)`; requestAnimationFrame(loop); }
  window.addEventListener('pointermove', (e)=>{ xd = e.clientX-12; yd = e.clientY-12; dot.style.transform = `translate(${e.clientX-2}px, ${e.clientY-2}px)`; });
  document.addEventListener('mouseover', e=>{ if(e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.add('is-big'); });
  document.addEventListener('mouseout',  e=>{ if(e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.remove('is-big'); });
  loop();
})();

/* =========================
   ESCENA 3D — Figuras realistas & vertebradas
   (Una sola escena con: 2 “spines” + 8 orbes de cristal + cardumen orgánico)
========================= */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/environments/RoomEnvironment.js';

const canvas = $('#fx3d');
let scene, camera, renderer;
let mouseX=0, mouseY=0;

addEventListener('pointermove', (e)=>{
  mouseX = (e.clientX / innerWidth) - 0.5;
  mouseY = (e.clientY / innerHeight) - 0.5;
},{passive:true});

function init3D(){
  if(!canvas) return;
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.085);

  camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 0.2, 8.8);

  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(4,6,3); scene.add(dir);

  // Materiales realistas
  const boneMat = new THREE.MeshPhysicalMaterial({ color:0xeadcc2, roughness:0.58, clearcoat:0.2, clearcoatRoughness:0.45 });
  const discMat = new THREE.MeshPhysicalMaterial({ color:0x8fc7ff, roughness:0.14, transmission:0.68, ior:1.35, thickness:0.35, clearcoat:0.6, clearcoatRoughness:0.15 });
  const tendonMat = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.06, transmission:0.42, ior:1.2, thickness:0.22 });

  // Geometrías base
  const vertebraGeo = new THREE.CylinderGeometry(1, 1, 1, 28, 1, false);
  const discGeo     = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false);

  // Spines (columnas vertebradas)
  const spA = makeSpine({segments:64,length:7.2,baseRadius:0.18,vertebraH:0.22,discH:0.10,curvature:1.15,xOffset:-1.9,yOffset:-0.2,zOffset:-1.0,phase:0,vertebraGeo,discGeo,boneMat,discMat,tendonMat});
  const spB = makeSpine({segments:64,length:6.6,baseRadius:0.16,vertebraH:0.20,discH:0.09,curvature:0.95,xOffset: 1.8,yOffset: 0.15,zOffset: 0.2,phase:Math.PI/3,vertebraGeo,discGeo,boneMat,discMat,tendonMat});
  scene.add(spA.group, spB.group);

  // Orbes de cristal (órbitas lissajous)
  const orbs = makeOrbs(8); scene.add(orbs.group);

  // Cardumen orgánico (cápsulas translúcidas)
  const school = makeSchool(18); scene.add(school.group);

  function loop(t){
    const time = t*0.001;
    camera.position.x += ((mouseX*1.4) - camera.position.x)*0.045;
    camera.position.y += ((-mouseY*0.9) - camera.position.y)*0.045;
    camera.lookAt(0,0,0);

    spA.update(time, mouseX, mouseY);
    spB.update(time, mouseX, mouseY);
    orbs.update(time, mouseX, mouseY);
    school.update(time, mouseX, mouseY);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  addEventListener('resize', ()=>{
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  });
}
init3D();

// Fabricador de “spine”
function makeSpine({segments,length,baseRadius,vertebraH,discH,curvature,xOffset,yOffset,zOffset,phase,vertebraGeo,discGeo,boneMat,discMat,tendonMat}){
  const group = new THREE.Group();
  const up = new THREE.Vector3(0,1,0);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const tangent = new THREE.Vector3();

  const vertebraMesh = new THREE.InstancedMesh(vertebraGeo, boneMat, segments);
  const discMesh     = new THREE.InstancedMesh(discGeo,     discMat, Math.max(0,segments-1));
  vertebraMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  discMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(vertebraMesh, discMesh);

  const bead = new THREE.SphereGeometry(baseRadius*0.22, 12, 10);
  const tendL = new THREE.InstancedMesh(bead, tendonMat, segments*2);
  const tendR = new THREE.InstancedMesh(bead, tendonMat, segments*2);
  tendL.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  tendR.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(tendL, tendR);

  function posAt(t, time){
    const wob = 0.6 + 0.3*Math.sin(time*0.9 + phase + t*4.2 + mouseX*2.0);
    const ang = t*curvature*Math.PI*2 + phase + mouseX*1.4;
    const x = xOffset + Math.sin(ang)*0.55*wob;
    const y = yOffset + (t-0.5)*length;
    const z = zOffset + Math.cos(ang)*0.32*wob + Math.sin(time*0.5 + t*7 + phase)*0.05;
    return new THREE.Vector3(x,y,z);
  }

  function update(time){
    for(let i=0;i<segments;i++){
      const t = i/(segments-1);
      p0.copy(posAt(t,time));
      const t2 = Math.min(1, t+1/(segments-1));
      p1.copy(posAt(t2,time));

      tangent.copy(p1).sub(p0).normalize();
      q.setFromUnitVectors(up, tangent);

      const radius = baseRadius * (0.9 + 0.35*Math.sin(t*6 + phase + time*1.0));
      s.set(radius*1.15, vertebraH, radius*1.15);
      m.compose(p0, q, s); vertebraMesh.setMatrixAt(i, m);

      if(i<segments-1){
        const mid = p0.clone().lerp(p1,0.5);
        s.set(radius*1.05, discH, radius*1.05);
        m.compose(mid, q, s); discMesh.setMatrixAt(i, m);
      }

      // tendones laterales
      const bin = new THREE.Vector3().crossVectors(tangent, up); if(bin.lengthSq()<1e-6) bin.set(1,0,0); bin.normalize();
      const nrm = new THREE.Vector3().crossVectors(bin, tangent).normalize();
      const lateral = radius*1.6;

      for(let k=0;k<2;k++){
        const jitter = (k? -0.35:0.35) * (0.5+0.5*Math.sin(time*1.3 + i*0.3 + k));
        const offL = p0.clone().addScaledVector(nrm, lateral + jitter);
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

// Orbes de cristal
function makeOrbs(count=8){
  const group = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(0.18, 3);
  const mat = new THREE.MeshPhysicalMaterial({ color:0x99ddff, roughness:0.15, transmission:0.55, ior:1.25, thickness:0.45, clearcoat:0.35 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(mesh);

  const A = new Float32Array(count), B = new Float32Array(count), R = new Float32Array(count), P = new Float32Array(count);
  for(let i=0;i<count;i++){ A[i]=0.9+Math.random()*1.2; B[i]=1.2+Math.random()*1.3; R[i]=1.1+Math.random()*1.8; P[i]=Math.random()*Math.PI*2; }
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), p=new THREE.Vector3(), p2=new THREE.Vector3(), v=new THREE.Vector3();

  function update(time, mx, my){
    for(let i=0;i<count;i++){
      const x = Math.sin(time*A[i] + P[i])*R[i]*(1+mx*0.6);
      const y = Math.cos(time*B[i] + P[i]*0.7)*0.8 + my*0.8;
      const z = Math.cos(time*A[i]*0.8 + P[i])*R[i]*0.7;
      p.set(x,y,z);
      p2.set(Math.sin((time+0.02)*A[i]+P[i])*R[i], Math.cos((time+0.02)*B[i]+P[i]*0.7)*0.8, Math.cos((time+0.02)*A[i]*0.8+P[i])*R[i]*0.7);
      v.copy(p2).sub(p).normalize(); q.setFromUnitVectors(up,v);
      const s=(0.9+0.3*Math.sin(time*2 + P[i]))*0.9;
      m.compose(p,q,new THREE.Vector3(s,s,s)); mesh.setMatrixAt(i,m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  return { group, update };
}

// Cardumen de cápsulas
function makeSchool(count=18){
  const group = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(0.085, 0.26, 8, 16);
  const mat = new THREE.MeshPhysicalMaterial({ color:0x77ddff, roughness:0.28, transmission:0.22, clearcoat:0.35, ior:1.2, thickness:0.15 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(mesh);

  const R = new Float32Array(count), H = new Float32Array(count), S = new Float32Array(count), P = new Float32Array(count);
  for(let i=0;i<count;i++){ R[i]=1.4+Math.random()*2.4; H[i]=(Math.random()*2-1)*1.2; S[i]=0.6+Math.random()*0.9; P[i]=Math.random()*Math.PI*2; }
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), pA=new THREE.Vector3(), pB=new THREE.Vector3(), v=new THREE.Vector3();

  function update(time, mx, my){
    for(let i=0;i<count;i++){
      const r = R[i] + mx*0.9;
      const ang = time*S[i] + P[i];
      const ang2 = ang*0.9 + P[i]*0.6;
      pA.set(Math.cos(ang)*r, H[i] + Math.sin(ang2)*0.7 + my*0.8, Math.sin(ang)*r);
      const d=0.03; const angN=(time+d)*S[i]+P[i]; const ang2N=angN*0.9+P[i]*0.6;
      pB.set(Math.cos(angN)*r, H[i] + Math.sin(ang2N)*0.7 + my*0.8, Math.sin(angN)*r);
      v.copy(pB).sub(pA).normalize(); q.setFromUnitVectors(new THREE.Vector3(0,1,0), v);
      const sc = 0.9 + 0.4*Math.sin(time*3 + P[i]);
      m.compose(pA, q, new THREE.Vector3(0.9,1.2,0.9).multiplyScalar(sc*0.75));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  return { group, update };
}
