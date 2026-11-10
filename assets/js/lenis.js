import Lenis from '../vendor/lenis.mjs';
export let lenis=null;
// Smooth wheel scrolling on fine pointers only; touch and reduced motion keep native scrolling.
export function initLenis(gsap,ScrollTrigger){
 const media=matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
 let tick;
 const sync=()=>{
  if(lenis){gsap.ticker.remove(tick);lenis.destroy();lenis=null;}
  if(media.matches){lenis=new Lenis({lerp:.1,wheelMultiplier:1,autoRaf:false});lenis.on('scroll',ScrollTrigger.update);tick=t=>lenis?.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);}
 };
 sync();media.addEventListener('change',sync);
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a)return;
  const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
  const target=document.getElementById(url.hash.slice(1));if(!target)return;e.preventDefault();
  const head=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||0;
  const move=()=>{if(lenis){lenis.resize();lenis.scrollTo(target,{offset:-head,immediate:e.detail===0});}else window.scrollTo({top:target.getBoundingClientRect().top+scrollY-head,behavior:'instant'});};
  if(document.body.style.position==='fixed')window.addEventListener('overlay:closed',move,{once:true});else move();
  history.replaceState(null,'',url.hash);
 });
}
