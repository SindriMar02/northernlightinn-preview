// Motion identity: light arriving in the dark. Photos open with a sideways sweep (an aurora band crossing),
// headings rise out of line masks, the place name spreads. One ease. Rows MOTION.md M1 to M30.
export async function initMotion(gsap,ScrollTrigger){
 const root=document.documentElement,hero=document.querySelector('.hero,.page-hero');
 const reducedNow=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const arrivalTargets=['.hero-intro>*','.hero-thumb','.hero-cta','.page-hero-copy .eyebrow','.page-hero-copy .lede'];
 // Hold only the enhancement layers while fonts and the hero image decode. Content stays clickable.
 const hold=hero&&scrollY<40&&!reducedNow?gsap.context(()=>{
  gsap.set('.hero-photo,.page-hero-photo',{opacity:0});gsap.set('.hero .fit-line>span',{yPercent:105});gsap.set(arrivalTargets,{opacity:0});gsap.set('.page-hero h1 .line>*',{yPercent:105});
 }):null;
 await Promise.race([Promise.all([document.fonts.ready,hero?.querySelector('img')?.decode().catch(()=>{})]),wait(1400)]);
 hold?.revert();
 function fit(){
  document.querySelectorAll('.fit-line').forEach(line=>{
   if(!line.offsetParent)return;line.style.fontSize='';
   const letters=[...line.children],width=letters.reduce((s,l)=>s+l.getBoundingClientRect().width,0);
   if(width)line.style.fontSize=`${parseFloat(getComputedStyle(line).fontSize)*line.clientWidth/width}px`;
  });
  const spread=document.querySelector('.spread-word');
  if(spread){spread.style.fontSize='';const total=[...spread.children].reduce((n,el)=>n+el.getBoundingClientRect().width,0);if(total>spread.clientWidth)spread.style.fontSize=`${parseFloat(getComputedStyle(spread).fontSize)*spread.clientWidth/total*.98}px`;}
 }
 fit();document.fonts.ready.then(()=>{fit();ScrollTrigger.refresh();});
 let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{fit();ScrollTrigger.refresh();},150);});
 const header=document.querySelector('.site-header');
 // M5: header turns solid once the hero has passed. Independent of reduced motion.
 function headerState(){header.classList.toggle('is-solid',!hero||hero.getBoundingClientRect().bottom<=header.offsetHeight+1);}
 addEventListener('scroll',headerState,{passive:true});headerState();
 const mm=gsap.matchMedia();let arrived=false;
 mm.add({normal:'(prefers-reduced-motion: no-preference)',reduced:'(prefers-reduced-motion: reduce)',touch:'(pointer: coarse), (hover: none)',phone:'(max-width: 767px)'},ctx=>{
  if(ctx.conditions.reduced){root.classList.remove('js');return;}
  root.classList.add('js');const {touch,phone}=ctx.conditions;
  // A timed reveal plays once. A fast pass or a keyboard focus completes it, so nothing stays hidden.
  function reveal(trigger,tl,start='top 85%'){
   const threshold=parseFloat(start.split(' ')[1])/100;
   if(trigger.getBoundingClientRect().top<innerHeight*threshold&&trigger.getBoundingClientRect().bottom<0){tl.progress(1);return;}
   trigger.addEventListener('focusin',()=>tl.progress(1),{once:true});
   ScrollTrigger.create({trigger,start,end:'bottom top',onEnter:()=>tl.play(),onLeave:()=>tl.progress(1),onEnterBack:()=>tl.progress(1)});
  }
  if(hero){
   if(!arrived&&scrollY<40){
    const tl=gsap.timeline({defaults:{ease:'house'}});
    // M1 photo comes up out of the dark; M2 wordmark letters rise; M3 the small pieces follow.
    tl.fromTo('.hero-photo,.page-hero-photo',{opacity:0,scale:1.06},{opacity:1,scale:1,duration:1.8},0);
    if(document.querySelector('.hero .fit-line'))tl.fromTo('.hero .fit-line>span',{yPercent:105},{yPercent:0,duration:1,stagger:.03},.25);
    if(document.querySelector('.page-hero h1 .line'))tl.fromTo('.page-hero h1 .line>*',{yPercent:105},{yPercent:0,duration:1,stagger:.09},.2);
    const small=arrivalTargets.flatMap(s=>[...document.querySelectorAll(s)]);
    if(small.length)tl.fromTo(small,{y:16,opacity:0},{y:0,opacity:1,duration:.7,stagger:.08,clearProps:'transform'},.7);
    if(document.querySelector('.hero-thumb'))tl.fromTo('.hero-thumb',{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.8},.9);
    hero.addEventListener('focusin',()=>tl.progress(1),{once:true});
   }
   arrived=true;
   // M4: reversible scrub on its own layers.
   gsap.fromTo('.hero-drift,.page-hero-drift',{yPercent:0},{yPercent:10,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
   if(!touch&&document.querySelector('.wordmark-drift'))gsap.fromTo('.wordmark-drift',{y:0,opacity:1},{y:()=>-innerHeight*.1,opacity:.15,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
  }
  // M6 headings: authored line masks.
  document.querySelectorAll('[data-heading]').forEach(h=>reveal(h,gsap.fromTo(h.querySelectorAll('.line>*'),{yPercent:105},{yPercent:0,duration:.9,stagger:.08,ease:'house',paused:true})));
  // M7 text groups.
  document.querySelectorAll('[data-rise]').forEach(el=>reveal(el.parentElement,gsap.fromTo(el,{y:24,opacity:0},{y:0,opacity:1,duration:.8,ease:'house',paused:true})));
  // M8 photos: sideways light sweep, the image settles from the left and from slightly dim.
  document.querySelectorAll('[data-sweep]').forEach(group=>{
   const frames=group.matches('.photo-frame')?[group]:[...group.querySelectorAll('.photo-frame')];
   const tl=gsap.timeline({paused:true})
    .fromTo(frames,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.2,stagger:.15,ease:'house'},0)
    .fromTo(frames.map(f=>f.querySelector('img')),{xPercent:-6,scale:1.12,filter:'brightness(.55)'},{xPercent:0,scale:1,filter:'brightness(1)',duration:1.4,stagger:.15,ease:'house',clearProps:'filter'},0);
   reveal(group,tl,'top 82%');
  });
  // M9 drift on wrappers (never the swept frame itself).
  if(!touch)document.querySelectorAll('[data-drift]').forEach(el=>{const [from,to]=el.dataset.drift.split(',').map(Number);gsap.fromTo(el,{yPercent:from},{yPercent:to,ease:'none',scrollTrigger:{trigger:el.closest('section')||el,start:'top bottom',end:'bottom top',scrub:.8}});});
  // M10 card groups; phone rails start visible.
  document.querySelectorAll('[data-cards]').forEach(group=>{if(phone&&group.matches('.rail'))return;reveal(group,gsap.fromTo(group.children,{y:40,opacity:0},{y:0,opacity:1,duration:.9,stagger:.1,ease:'house',paused:true}),'top 82%');});
  // M11 rule rows: the hairline draws, then the row text lifts.
  document.querySelectorAll('[data-rows]').forEach(list=>[...list.children].forEach((row,i)=>{
   const rule=row.querySelector('.row-rule'),tl=gsap.timeline({paused:true,delay:Math.min(i,6)*.06});
   if(rule)tl.fromTo(rule,{scaleX:0},{scaleX:1,duration:.9,ease:'house'},0);
   tl.fromTo([...row.children].filter(c=>c!==rule),{y:14,opacity:0},{y:0,opacity:1,duration:.6,ease:'house'},.1);
   reveal(row,tl,'top 90%');
  }));
  // M12 signature: the place name gathers at the centre and spreads to the full width with the scroll.
  const spread=document.querySelector('.spread-word');
  if(spread){
   const letters=[...spread.children];
   const tween=gsap.fromTo(letters,{x:i=>{const r=letters[i].getBoundingClientRect(),c=spread.getBoundingClientRect();return (c.left+c.width/2)-(r.left+r.width/2)+Number(gsap.getProperty(letters[i],'x'));},opacity:.15},{x:0,opacity:1,ease:'none',stagger:0,scrollTrigger:{trigger:spread.closest('section'),start:'top 100%',end:phone?'top 40%':'top 20%',scrub:.8,invalidateOnRefresh:true}});
   ctx.add(()=>tween);
  }
  // M13 fitted wordmarks outside the hero (footer).
  document.querySelectorAll('.footer-wordmark').forEach(mark=>reveal(mark,gsap.fromTo(mark.querySelectorAll('.fit-line>span'),{yPercent:105},{yPercent:0,duration:1,stagger:.03,ease:'house',paused:true}),'top 96%'));
  ScrollTrigger.refresh();return()=>root.classList.remove('js');
 });
 addEventListener('load',()=>ScrollTrigger.refresh());
 addEventListener('pageshow',()=>{fit();ScrollTrigger.refresh();headerState();});
 document.querySelectorAll('img').forEach(img=>img.complete||img.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true}));
 return mm;
}
