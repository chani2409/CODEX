// ===== Utilidades =====
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
// duplicar fila para efecto continuo
const mq2 = $('#mq2');
mq2.innerHTML = $('#mq1').innerHTML; $$('#mq2 .client-logo').forEach(el=>{ el.textContent=''; el.appendChild(logo()); });


let x1=0, x2=0; let last= performance.now();
function tick(t){
const dt = Math.min(32, t-last); last=t;
const speed = .03; // px/ms
x1 -= speed * dt * 60/16; x2 += speed * dt * 60/16; // opuestas
$('#mq1').style.transform = `translateX(${x1}px)`;
$('#mq2').style.transform = `translateX(${x2}px)`;
requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();


// ===== Video overlay (YouTube API mínima) =====
(function video(){
const overlay = $('#videoOverlay');
const openBtn = $('#watchReel');
const closeBtn = $('#voClose');
const playBtn = $('#voPlay');
const prog = $('#voProg');
const iframe = $('#yt');
let yt, duration=0, playing=false, apiReady=false;


// Cargar API de YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
window.onYouTubeIframeAPIReady = () => {
yt = new YT.Player('yt', {
events: {
onReady: (e)=>{ apiReady=true; duration = yt.getDuration() || 0; },
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


// progreso simple
setInterval(()=>{
if(!apiReady) return; duration = yt.getDuration()||0; const t = yt.getCurrentTime()||0; const p = duration? (t/duration): 0; prog.style.transform = `scaleX(${p})`;
}, 250);
})();


// Año footer
$('#year').textContent = new Date().getFullYear();
