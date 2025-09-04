// script.js (ESM para poder importar three.js y postprocesado)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

/* =========================
   UTILIDADES & UI
========================= */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Header / menú
(function header(){
  const body = document.body;
  const burger = $('#burger');
  const menu = $('#menu');
  const talkBtn = $('#talkBtn');
  burger.addEventListener('click', ()=>{
    body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(body.classList.contains('nav-open')));
  });
  talkBtn.addEventListener('click', ()=> alert('Escríbenos: hola@estudiodemo.dev (demo)'));
  menu.addEventListener('click', e=>{
    if(e.target.tagName === 'A'){
      body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Hero: aparición de palabras
(function heroAnim(){
  const words = $$('#heroTitle .word');
  words.forEach((w,i)=>{
    setTimeout(()=>{
      w.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1), opacity .8s';
      w.style.transform = 'translateY(0) rotate(0)';
      w.style.opacity = '1';
    }, 250 + i*120);
  });
})();

// Indicador scroll
(function scrollIndicator(){
  const bar = $('#scrollBar');
  const onScroll = ()=>{
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const p = Math.min(1, Math.max(0, h.scrollTop / max));
    bar.style.transform = `scaleY(${p})`;
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

// Marquee (logos SVG neutros y auto-scroll)
(function marquee(){
  const logo = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns,'svg');
    s.setAttribute('viewBox','0 0 64 64');
    const g = document.createElementNS(ns,'g');
    const r = document.createElementNS(ns,'rect'); r.setAttribute('x','8'); r.setAttribute('y','16'); r.setAttribute('rx','8'); r.setAttribute('width','48'); r.setAttribute('height','32'); r.setAttribute('fill','#2b2e3a');
    const c = document.createElementNS(ns,'circle'); c.setAttribute('cx','20'); c.setAttribute('cy','32'); c.setAttribute('r','6'); c.setAttribute('fill','#fff');
    const t = document.createElementNS(ns,'rect'); t.setAttribute('x','30'); t.setAttribute('y','26'); t.setAttribute('width','22'); t.setAttribute('height','12'); t.setAttribute('fill','#fff');
    g.appendChild(r); g.appendChild(c); g.appendChild(t); s.appendChild(g); return s;
  };
  $$('#mq1 .client-logo').forEach(el=>{ el.textContent=''; el.appendChild(logo()); });
  const mq2 = $('#mq2');
  mq2.innerHTML = $('#mq1').innerHTML;
  $$('#mq2 .client-logo').forEach(el=>{ el.textContent=''; el.appendChild(logo()); });

  let x1=0, x2=0; let last= performance.now();
  function tick(t){
    const dt = Math.min(32, t-last); last=t;
    const speed = .03; // px/ms
    x1 -= speed * dt * 60/16;
    x2 += speed * dt * 60/16;
    $('#mq1').style.transform = `translateX(${x1}px)`;
    $('#mq2').style.transform = `translateX(${x2}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Video overlay + API YouTube mínima
(function video(){
  const overlay = $('#videoOverlay');
  const openBtn = $('#watchReel');
  const closeBtn = $('#voClose');
  const playBtn = $('#voPlay');
  const prog = $('#voProg');
  const iframe = $('#yt');
  let yt, duration=0, playing=false, apiReady=false;

  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('yt', {
      events: {
        onReady: ()=>{ apiReady=true; duration = yt.getDuration() || 0; },
        onStateChange: (e)=>{ playing = e.data === YT.PlayerState.PLAYING; }
      }
    });
  };

  function open(){ overlay.classList.add('open'); document.body.style.overflow='hidden'; if(apiReady){ yt.playVideo(); playing=true; } }
  function close(){ overlay.classList.remove('open'); document.body.style.overflow=''; if(apiReady){ yt.pauseVideo(); playing=false; } }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  playBtn.addEventListener('click', ()=>{ if(!apiReady) return; if(playing){ yt.pauseVideo(); } else { yt.playVideo(); } playing=!playing; });

  setInterval(()=>{
    if(!apiReady) return; duration = yt.getDuration()||0; const t = yt.getCurrentTime()||0; const p = duration? (t/duration): 0; prog.style.transform = `scaleX(${p})`;
  }, 250);
})();

// Año footer
$('#year').textContent = new Date().getFullYear();

// Gradiente hero sigue al mouse
window.addEventListener('pointermove', (e)=>{
  document.body.style.setProperty('--mx', e.clientX + 'px');
  document.body.style.setProperty('--my', e.clientY + 'px');
});

// Reveal on scroll
(function reveal(){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold:.15 });
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
})();

// Tilt
(function tilt(){
  const max=12, perspective=900;
  document.querySelectorAll('.tilt').forEach(el=>{
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx)/(r.width/2), dy = (e.clientY - cy)/(r.height/2);
      const rx = (-dy*max).toFixed(2), ry = (dx*max).toFixed(2);
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('pointerleave', ()=>{ el.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0)`; });
  });
})();

// Botones magnéticos
(function magnetic(){
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
(function cursor(){
  if(!matchMedia('(pointer:fine)').matches) return;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let xr=0, yr=0, xd=0, yd=0;
  function loop(){ xr += (xd - xr)*0.15; yr += (yd - yr)*0.15; ring.style.transform = `translate(${xr}px, ${yr}px)`; requestAnimationFrame(loop); }
  window.addEventListener('pointermove', (e)=>{ xd = e.clientX-12; yd = e.clientY-12; dot.style.transform = `translate(${e.clientX-2}px, ${e.clientY-2}px)`; });
  document.addEventListener('mouseover', e=>{ if(e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.add('is-big'); });
  document.addEventListener('mouseout',  e=>{ if(e.target.closest('a, button, .tilt, .watch-btn')) ring.classList.remove('is-big'); });
  loop();
})();

/* =========================
   ESCENA 3D #1 (fx3d)
   Columnas vertebradas realistas + reacción a mouse
========================= */
let mouseX = 0, mouseY = 0;
addEventListener('pointermove', (e)=>{
  mouseX = (e.clientX / innerWidth) - 0.5;
  mouseY = (e.clientY / innerHeight) - 0.5;
},{passive:true});

function initSpinesScene(canvasId){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.08);

  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0, 0.2, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(4,6,3); scene.add(dir);

  const boneMat = new THREE.MeshPhysicalMaterial({ color:0xeadcc2, roughness:0.6, clearcoat:0.2, clearcoatRoughness:0.5 });
  const discMat = new THREE.MeshPhysicalMaterial({ color:0x8fc7ff, roughness:0.15, transmission:0.7, ior:1.35, thickness:0.35, clearcoat:0.6, clearcoatRoughness:0.15 });
  const tendonMat = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.05, transmission:0.45, ior:1.2, thickness:0.2 });

  const vertebraGeo = new THREE.CylinderGeometry(1, 1, 1, 28, 1, false);
  const discGeo     = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false);

  const sp1 = makeSpine({segments:64,length:7.2,baseRadius:0.18,vertebraH:0.22,discH:0.10,curvature:1.15,xOffset:-1.9,yOffset:-0.2,zOffset:-1.0,phase:0,vertebraGeo,discGeo,boneMat,discMat,tendonMat});
  const sp2 = makeSpine({segments:64,length:6.6,baseRadius:0.16,vertebraH:0.20,discH:0.09,curvature:0.95,xOffset: 1.8,yOffset: 0.15,zOffset: 0.2,phase:Math.PI/3,vertebraGeo,discGeo,boneMat,discMat,tendonMat});
  scene.add(sp1.group, sp2.group);

  function loop(t){
    const time = t*0.001;
    camera.position.x += ((mouseX*1.6) - camera.position.x) * 0.05;
    camera.position.y += ((-mouseY*1.0) - camera.position.y) * 0.05;
    camera.lookAt(0,0,0);
    sp1.update(time, mouseX, mouseY);
    sp2.update(time, mouseX, mouseY);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  addEventListener('resize', ()=>{
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  });

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
}
initSpinesScene('fx3d');

/* =========================
   ESCENA 3D #2 (fx3d-extra)
   Más figuras + bloom sutil + “cardumen” orgánico
========================= */
function initExtraScene(canvasId){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.10);

  const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
  camera.position.set(0.2, 0.1, 7.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.6, 0.85);
  composer.addPass(bloomPass);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.05).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.7));
  const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(-3,4,2); scene.add(dl);

  const bone   = new THREE.MeshPhysicalMaterial({ color:0xf0e6d2, roughness:0.55, clearcoat:0.25, clearcoatRoughness:0.35 });
  const disc   = new THREE.MeshPhysicalMaterial({ color:0x9fd2ff, roughness:0.2, transmission:0.65, ior:1.33, thickness:0.4, clearcoat:0.5 });
  const tendon = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:0.06, transmission:0.4, ior:1.2, thickness:0.2 });

  const gV = new THREE.CylinderGeometry(1,1,1,28,1,false);
  const gD = new THREE.CylinderGeometry(1,1,1,24,1,false);

  const sp1 = spine({segments:56,length:6.8,baseRadius:0.16,vertebraH:0.20,discH:0.09,curvature:1.25,xOffset:-1.2,yOffset:0,zOffset:-0.6,phase:0,gV,gD,bone,disc,tendon});
  const sp2 = spine({segments:64,length:7.6,baseRadius:0.17,vertebraH:0.22,discH:0.10,curvature:1.1,xOffset:1.4,yOffset:-0.2,zOffset:0.4,phase:Math.PI/2,gV,gD,bone,disc,tendon});
  scene.add(sp1.group, sp2.group);

  const school = makeSchool(18); scene.add(school.group);

  function loop(t){
    const time = t*0.001;
    camera.position.x += ((mouseX*1.2) - camera.position.x)*0.04;
    camera.position.y += ((-mouseY*0.8) - camera.position.y)*0.04;
    camera.lookAt(0,0,0);
    sp1.update(time); sp2.update(time); school.update(time);
    composer.render(); requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  addEventListener('resize', ()=>{
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    composer.setSize(innerWidth, innerHeight); bloomPass.setSize(innerWidth, innerHeight);
  });

  function spine({segments,length,baseRadius,vertebraH,discH,curvature,xOffset,yOffset,zOffset,phase,gV,gD,bone,disc,tendon}){
    const group = new THREE.Group();
    const vertebra = new THREE.InstancedMesh(gV, bone, segments);
    const discs = new THREE.InstancedMesh(gD, disc, Math.max(0,segments-1));
    const bead = new THREE.SphereGeometry(baseRadius*0.22, 12, 10);
    const tendL = new THREE.InstancedMesh(bead, tendon, segments*2);
    const tendR = new THREE.InstancedMesh(bead, tendon, segments*2);
    vertebra.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    discs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tendL.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tendR.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(vertebra, discs, tendL, tendR);

    const m=new THREE.Matrix4(), q=new THREE.Quaternion();
    const s=new THREE.Vector3(), pA=new THREE.Vector3(), pB=new THREE.Vector3();
    const tang=new THREE.Vector3(), bin=new THREE.Vector3(), nrm=new THREE.Vector3();

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
        pA.copy(posAt(t,time));
        const t2 = Math.min(1, t+1/(segments-1));
        pB.copy(posAt(t2,time));

        tang.copy(pB).sub(pA).normalize();
        q.setFromUnitVectors(new THREE.Vector3(0,1,0), tang);

        const radius = baseRadius * (0.9 + 0.35*Math.sin(t*6 + phase + time*1.0));
        s.set(radius*1.15, vertebraH, radius*1.15);
        m.compose(pA, q, s); vertebra.setMatrixAt(i, m);

        if(i<segments-1){
          const mid = pA.clone().lerp(pB,0.5);
          s.set(radius*1.05, discH, radius*1.05);
          m.compose(mid, q, s); discs.setMatrixAt(i, m);
        }

        bin.crossVectors(tang, new THREE.Vector3(0,1,0)); if(bin.lengthSq()<1e-6) bin.set(1,0,0); bin.normalize();
        nrm.crossVectors(bin, tang).normalize();

        const lateral = radius*1.6;
        for(let k=0;k<2;k++){
          const jitter = (k? -0.35:0.35) * (0.5+0.5*Math.sin(time*1.3 + i*0.3 + k));
          const offL = pA.clone().addScaledVector(nrm, lateral + jitter);
          const offR = pA.clone().addScaledVector(nrm, -lateral - jitter);
          const s2 = radius*0.55;
          m.compose(offL, q, new THREE.Vector3(s2,s2,s2)); tendL.setMatrixAt(i*2+k, m);
          m.compose(offR, q, new THREE.Vector3(s2,s2,s2)); tendR.setMatrixAt(i*2+k, m);
        }
      }
      vertebra.instanceMatrix.needsUpdate = true;
      discs.instanceMatrix.needsUpdate = true;
      tendL.instanceMatrix.needsUpdate = true;
      tendR.instanceMatrix.needsUpdate = true;
    }

    return { group, update };
  }

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

    function update(time){
      for(let i=0;i<count;i++){
        const r = R[i] + mouseX*0.9;
        const ang = time*S[i] + P[i];
        const ang2 = ang*0.9 + P[i]*0.6;
        pA.set(Math.cos(ang)*r, H[i] + Math.sin(ang2)*0.7 + mouseY*0.8, Math.sin(ang)*r);
        const d=0.03; const angN=(time+d)*S[i]+P[i]; const ang2N=angN*0.9+P[i]*0.6;
        pB.set(Math.cos(angN)*r, H[i] + Math.sin(ang2N)*0.7 + mouseY*0.8, Math.sin(angN)*r);
        v.copy(pB).sub(pA).normalize(); q.setFromUnitVectors(new THREE.Vector3(0,1,0), v);
        const sc = 0.9 + 0.4*Math.sin(time*3 + P[i]);
        m.compose(pA, q, new THREE.Vector3(0.9,1.2,0.9).multiplyScalar(sc*0.75));
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    return { group, update };
  }
}
initExtraScene('fx3d-extra');
