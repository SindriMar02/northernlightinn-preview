import {overlay} from './overlay.js';
// Full-screen menu at every width. One reversible timeline: a sage edge leads a basalt curtain down from the top, the hamburger
// turns into a cross in place, the page names rise out of masks, the photo opens. Closing plays the same film backwards.
export function initMenu(){
 const dialog=document.querySelector('.menu-panel'),trigger=document.querySelector('.menu-toggle');if(!dialog||!trigger)return null;
 const q=s=>dialog.querySelectorAll(s),[lineA,lineB]=q('.menu-close .burger i'),shots=[...q('.menu-shot')];
 window.CustomEase?.create('menuCurtain','.76,0,.24,1');
 const api=overlay({dialog,panel:dialog,trigger,closeButton:document.createElement('button'),makeTimeline:reduced=>{
  const tl=gsap.timeline({paused:true});
  if(reduced)return tl.set([lineA,lineB],{top:5,rotate:i=>i?-45:45}).fromTo(dialog,{opacity:0},{opacity:1,duration:.2});
  const desktop=matchMedia('(min-width:1024px)').matches;
  tl.fromTo('.menu-curtain--lead',{scaleY:0},{scaleY:1,duration:.85,ease:'menuCurtain'},0)
   .fromTo('.menu-curtain:not(.menu-curtain--lead)',{scaleY:0},{scaleY:1,duration:.85,ease:'menuCurtain'},.09)
   // hamburger to cross: the lines meet, then turn
   .fromTo(lineA,{top:0,rotate:0},{top:5,rotate:45,duration:.6,ease:'power3.inOut'},.05)
   .fromTo(lineB,{top:10.5,rotate:0,scaleX:.62},{top:5,rotate:-45,scaleX:1,duration:.6,ease:'power3.inOut'},.05)
   // nothing inside shows before the curtain has passed it
   .fromTo(q('.menu-body,.menu-foot'),{autoAlpha:0},{autoAlpha:1,duration:.2,ease:'none'},.38)
   .fromTo(q('.menu-word'),{yPercent:112,rotate:5},{yPercent:0,rotate:0,duration:1.05,ease:'expo.out',stagger:.07},.4)
   .fromTo(q('.menu-num'),{opacity:0,x:-8},{opacity:1,x:0,duration:.6,ease:'power2.out',stagger:.07},.5)
   .fromTo(q('.menu-foot>*'),{y:14,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out',stagger:.05},.62);
  if(desktop)tl.fromTo('.menu-photo-frame',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'menuCurtain'},.28)
   .fromTo(shots,{scale:1.22},{scale:1,duration:1.5,ease:'expo.out'},.28);
  return tl;
 }});
 const sync=()=>{const on=api.state!=='closed';trigger.classList.toggle('is-open',on);};
 // The close button sits exactly where the hamburger is; a second tap during the close reopens from the current point.
 const toggle=e=>{api.state==='closed'||api.state==='closing'?api.open(e):api.close();sync();};
 trigger.addEventListener('click',toggle);dialog.querySelector('.menu-close').addEventListener('click',toggle);
 dialog.addEventListener('cancel',()=>setTimeout(sync));addEventListener('overlay:closed',sync);
 q('nav a,.menu-foot a,.menu-top .brand').forEach(a=>a.addEventListener('click',()=>api.close()));
 // Photos load when the visitor first reaches for the menu, so the frame never opens empty.
 const warm=()=>q('.menu-shot img').forEach(img=>{img.loading='eager';});
 for(const t of ['pointerenter','focus','touchstart'])trigger.addEventListener(t,warm,{once:true,passive:true});
 // Pointer or keyboard on a page name: the others step back and its photo comes forward.
 const nav=dialog.querySelector('nav'),home=shots.find(s=>s.classList.contains('is-on'));
 const show=key=>shots.forEach(s=>s.classList.toggle('is-on',key?s.dataset.shot===key:s===home));
 q('nav a').forEach(a=>{
  a.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){nav.dataset.active=a.dataset.menu;a.classList.add('is-active');show(a.dataset.menu);}});
  a.addEventListener('pointerleave',()=>{a.classList.remove('is-active');delete nav.dataset.active;show(null);});
  a.addEventListener('focus',()=>{if(a.matches(':focus-visible')){nav.dataset.active=a.dataset.menu;a.classList.add('is-active');show(a.dataset.menu);}});
  a.addEventListener('blur',()=>{a.classList.remove('is-active');delete nav.dataset.active;show(null);});
 });
 return api;
}
