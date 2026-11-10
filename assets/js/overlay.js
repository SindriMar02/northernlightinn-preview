import {lenis} from './lenis.js';
let lockCount=0,savedY=0;
// Locking pins the body, which makes the window report scroll 0. Scroll-linked motion is frozen first, so the page behind an
// open menu or sheet (and the header logo) stays exactly as it was instead of snapping back to its top-of-page state.
let frozen=[];
function lock(){if(lockCount++===0){savedY=scrollY;frozen=window.ScrollTrigger?ScrollTrigger.getAll().filter(t=>t.enabled):[];frozen.forEach(t=>t.disable(false));lenis?.stop();Object.assign(document.body.style,{position:'fixed',top:`-${savedY}px`,width:'100%'});}}
function unlock(){if(--lockCount===0){Object.assign(document.body.style,{position:'',top:'',width:''});window.scrollTo({top:savedY,behavior:'instant'});frozen.forEach(t=>t.enable(false));frozen=[];window.ScrollTrigger?.update();lenis?.start();window.dispatchEvent(new Event('overlay:closed'));}}
// Shared semantics, focus containment, and scroll ownership. One timeline per surface.
export function overlay({dialog,panel,trigger,closeButton,makeTimeline}){
 let timeline,opener,state='closed';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const finish=()=>{if(state!=='closing')return;state='closed';dialog.close();unlock();trigger?.setAttribute('aria-expanded','false');opener?.focus({preventScroll:true});};
 function create(){timeline?.kill();gsap.set([panel,...panel.querySelectorAll('*:not(.brand):not(.brand *)')],{clearProps:'transform,opacity,visibility,clipPath'});timeline=makeTimeline(reduce.matches);timeline.eventCallback('onReverseComplete',finish);}
 function open(event,prepare){
  opener=event.currentTarget||event.target;trigger?.setAttribute('aria-expanded','true');
  if(state==='closed'){prepare?.();dialog.showModal();lock();create();}
  state='opening';timeline.eventCallback('onComplete',()=>{state='open';});timeline.timeScale(1).play();
  const first=panel.querySelector('button,a[href]:not([aria-disabled="true"])');
  (event.detail===0?first:panel)?.focus({preventScroll:true});
 }
 function close(){if(state==='closed')return;state='closing';trigger?.setAttribute('aria-expanded','false');timeline.timeScale(reduce.matches?1:1.4).reverse();if(timeline.progress()===0)finish();}
 closeButton.addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusable=[...panel.querySelectorAll('a[href],button,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel)){e.preventDefault();first?.focus();}});
 reduce.addEventListener('change',()=>{if(state==='closed')return;const closing=state==='closing';create();timeline.progress(1);if(closing){state='closing';timeline.reverse();}else state='open';});
 return {open,close,get state(){return state;},get timeline(){return timeline;}};
}
