// "Your stay": nights, then treatments, spa and dinner per day, then a deposit step.
// Prototype: nothing is sent to the hotel and no payment is taken. State lives in this tab only (sessionStorage).
import {overlay} from './overlay.js';
import {icons} from './icons.js';
const KEY='nli-stay-v1';
export function initStay(){
 const D=window.NLI,dialog=document.querySelector('.stay-dialog');if(!D||!dialog)return null;
 const t=D.t,panel=dialog.querySelector('.stay-sheet'),body=dialog.querySelector('.stay-body'),foot=dialog.querySelector('.stay-foot'),backdrop=dialog.querySelector('.sheet-backdrop'),stepsEl=dialog.querySelector('.stay-steps');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
 const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d);};
 const today=iso(new Date());
 const N=D.dates,cap=w=>w[0].toUpperCase()+w.slice(1);
 const fmtDay=s=>{const d=parse(s);return `${cap(N.wd[d.getDay()])} ${d.getDate()}${N.dot} ${N.mo[d.getMonth()]}`;};
 const fmtLong=s=>{const d=parse(s);return `${cap(N.wdLong[d.getDay()])} ${d.getDate()}${N.dot} ${N.moLong[d.getMonth()]}`;};
 const money=n=>D.lang==='is'?`${n.toLocaleString('de-DE')} kr.`:`${n.toLocaleString('en-US')} ISK`;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fresh=()=>({arrival:null,nights:2,guests:2,room:null,items:[],step:1,month:null,pending:null,open:null,done:false});
 let S=fresh();
 try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(saved&&(!saved.arrival||saved.arrival>=today))S={...fresh(),...saved,open:null,done:false,step:Math.min(saved.step||1,3)};}catch{}
 const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(S));}catch{}syncStarters();};
 const extra=id=>D.extras.find(x=>x.id===id);
 const option=(x,id)=>x.options.find(o=>o.id===id)||x.options[0];
 const days=()=>Array.from({length:S.nights+1},(_,i)=>addDays(S.arrival,i));
 const pkgPrice=p=>{const r=p.rules.find(r=>(!r.room||r.room===S.room)&&(!r.guests||r.guests===S.guests));return r.pp?r.price*S.guests:r.price;};
 const myPackages=()=>[...S.items.filter(it=>it.extra==='package').map(it=>it.opt),...(S.pending?.extra==='package'?[S.pending.opt]:[])].map(id=>D.packages.find(p=>p.id===id)).filter(Boolean);
 const gMin=()=>Math.max(1,...myPackages().map(p=>p.minGuests||1)),gMax=()=>Math.min(D.maxGuests,...myPackages().map(p=>p.maxGuests||D.maxGuests));
 const pl=n=>n?money(n):t.free;
 const gl=n=>`${n} ${esc(n===1?t.guestOne:t.guestsShort)}`;
 const itemPrice=it=>{if(it.extra==='package'){const p=D.packages.find(p=>p.id===it.opt);return p?pkgPrice(p):0;}const x=extra(it.extra),o=option(x,it.opt);return o.price*(x.perPerson?it.qty:1);};
 const total=()=>S.items.reduce((n,it)=>n+itemPrice(it),0);
 const itemLabel=it=>{if(it.extra==='package'){const p=D.packages.find(p=>p.id===it.opt);return p?p.name:'';}const x=extra(it.extra),o=option(x,it.opt);return x.options.length>1||o.label!==x.name?`${x.name}, ${o.label}`:x.name;};
 // Sample availability: stable per day and extra, so the same day always shows the same free times.
 const taken=(day,x,time)=>{let h=0;for(const c of `${day}${x.id}${time}`)h=(h*31+c.charCodeAt(0))%997;return h%4===0;};
 function clampItems(){const max=S.nights;S.items=S.items.filter(it=>it.day<=max);}
 // ---------- render ----------
 function stepper(name,value,min,max,label){return `<div class="stepper" role="group" aria-label="${esc(label)}"><button type="button" class="step-btn" data-step="${name}:-1" aria-label="${esc(t.fewer)} ${esc(label)}" ${value<=min?'disabled':''}>${icons.minus}</button><output aria-live="polite">${value}</output><button type="button" class="step-btn" data-step="${name}:1" aria-label="${esc(t.more)} ${esc(label)}" ${value>=max?'disabled':''}>${icons.plus}</button></div>`;}
 function calendar(){
  const base=parse(S.month||S.arrival||today);base.setDate(1);const y=base.getFullYear(),m=base.getMonth();
  const first=(new Date(y,m,1).getDay()+6)%7,count=new Date(y,m+1,0).getDate();
  const end=S.arrival?addDays(S.arrival,S.nights):null;
  const names=N.narrow;
  let cells='';for(let i=0;i<first;i++)cells+='<span></span>';
  for(let d=1;d<=count;d++){const s=iso(new Date(y,m,d)),past=s<today,cls=[s===S.arrival?'is-start':'',end&&s===end?'is-end':'',S.arrival&&s>S.arrival&&s<end?'is-between':''].join(' ').trim();
   cells+=`<button type="button" class="cal-day ${cls}" data-date="${s}" ${past?'disabled':''} aria-pressed="${s===S.arrival}" aria-label="${esc(fmtLong(s))}">${d}</button>`;}
  const title=`${cap(N.moLong[m])} ${y}`;
  const prevOff=iso(new Date(y,m,1))<=today.slice(0,8)+'01';
  return `<div class="cal"><div class="cal-head"><button type="button" class="icon-btn" data-month="-1" aria-label="${esc(t.prevMonth)}" ${prevOff?'disabled':''}>${icons.prev}</button><p class="cal-title" aria-live="polite">${esc(title)}</p><button type="button" class="icon-btn" data-month="1" aria-label="${esc(t.nextMonth)}">${icons.next}</button></div><div class="cal-grid cal-names" aria-hidden="true">${names.map(n=>`<span>${n}</span>`).join('')}</div><div class="cal-grid">${cells}</div></div>`;
 }
 function step1(){
  const range=S.arrival?`${fmtDay(S.arrival)} ${t.to} ${fmtDay(addDays(S.arrival,S.nights))}`:t.pickArrival;
  const pend=S.pending?`<p class="stay-note">${icons.plus}<span>${esc(t.pendingNote.replace('{item}',pendingLabel()))}</span></p>`:'';
  return `<h2 id="stay-title" class="stay-h">${t.s1Title}</h2>${pend}${calendar()}<p class="stay-range" aria-live="polite">${icons.calendar}<span>${esc(range)}</span></p>
  <div class="stay-pair"><div class="stay-field"><span class="eyebrow">${icons.moon}${t.nights}</span>${stepper('nights',S.nights,1,14,t.nights)}</div><div class="stay-field"><span class="eyebrow">${icons.guests}${t.guests}</span>${stepper('guests',S.guests,gMin(),gMax(),t.guests)}</div></div>
  <fieldset class="stay-rooms"><legend class="eyebrow">${icons.bed}${t.room}</legend>${D.rooms.map(r=>`<label class="room-opt"><input type="radio" name="room" value="${r.id}" ${S.room===r.id?'checked':''} ${r.max<S.guests?'disabled':''}><span class="room-opt-name">${esc(r.name)}</span><span class="room-opt-meta small">${esc(r.meta)}</span><span class="room-opt-mark">${icons.check}</span></label>`).join('')}</fieldset>
  <p class="small muted stay-engine">${esc(t.engineNote)}</p>`;
 }
 function pendingLabel(){const p=S.pending;if(!p)return '';if(p.extra==='package')return D.packages.find(x=>x.id===p.opt)?.name||'';const x=extra(p.extra);return p.opt&&x.options.length>1?`${x.name}, ${option(x,p.opt).label}`:x.name;}
 function chooser(day,i){
  const o=S.open;if(!o||o.day!==i)return '';
  const x=extra(o.extra),opt=option(x,o.opt);
  const opts=x.options.length>1?`<div class="seg" role="radiogroup" aria-label="${esc(x.name)}">${x.options.map(op=>`<button type="button" role="radio" aria-checked="${op.id===opt.id}" class="seg-btn" data-opt="${op.id}">${esc(op.label)}<span>${pl(op.price)}</span></button>`).join('')}</div>`:'';
  const times=x.times.map(tm=>{const off=taken(day,x,tm);return `<button type="button" class="time-btn" data-time="${tm}" aria-pressed="${o.time===tm}" ${off?`disabled aria-label="${tm}, ${esc(t.taken)}"`:''}>${tm}</button>`;}).join('');
  const qty=x.perPerson?`<div class="stay-field stay-field--row"><span class="small">${esc(t.forGuests)}</span>${stepper('qty',o.qty,1,S.guests,t.guests)}</div>`:'';
  const price=opt.price*(x.perPerson?o.qty:1);
  return `<div class="chooser" data-chooser><div class="chooser-in"><p class="chooser-title"><span>${icons[x.icon]}${esc(x.name)}</span><span class="small muted">${esc(x.note||'')}</span></p>${opts}${x.times.length?`<p class="eyebrow chooser-label">${t.time} <span class="sample-tag">${t.sample}</span></p><div class="times">${times}</div>`:''}${qty}<div class="chooser-actions"><button type="button" class="btn-quiet" data-cancel>${t.cancel}</button><button type="button" class="btn-solid" data-confirm ${o.time||!x.times.length?'':'disabled'}>${t.add}${price?`<span>${money(price)}</span>`:''}</button></div></div></div>`;
 }
 function step2(){
  const list=days().map((day,i)=>{
   const mine=S.items.filter(it=>it.day===i).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
   const chips=mine.map(it=>`<li class="item-chip"><span class="item-chip-icon">${icons[it.extra==='package'?'package':extra(it.extra).icon]}</span><span class="item-chip-text"><b>${esc(itemLabel(it))}</b><span class="small">${it.time?`${it.time} · `:''}${it.qty>1&&it.extra!=='package'?`${gl(it.qty)} · `:''}${pl(itemPrice(it))}</span></span><button type="button" class="icon-btn" data-remove="${it.id}" aria-label="${esc(t.remove)} ${esc(itemLabel(it))}">${icons.close}</button></li>`).join('');
   const label=i===0?t.arrivalDay:i===S.nights?t.departureDay:`${t.day} ${i+1}`;
   const adds=D.extras.map(x=>x.includedRooms?.includes(S.room)?`<button type="button" class="add-btn is-included" disabled>${icons[x.icon]}<span>${esc(x.short)}</span><small>${esc(t.includedShort)}</small></button>`:x.closed?`<button type="button" class="add-btn" disabled title="${esc(x.closedNote)}">${icons[x.icon]}<span>${esc(x.short)}</span><small>${esc(t.closedShort)}</small></button>`:`<button type="button" class="add-btn" data-add="${x.id}" data-day="${i}" aria-expanded="${S.open?.day===i&&S.open.extra===x.id}">${icons[x.icon]}<span>${esc(x.short)}</span></button>`).join('');
   return `<li class="day-row" data-day-row="${i}"><div class="day-head"><p class="day-date">${esc(fmtDay(day))}</p><p class="eyebrow muted">${esc(label)}</p></div>${chips?`<ul class="day-items">${chips}</ul>`:''}<div class="day-adds" role="group" aria-label="${esc(t.addTo)} ${esc(fmtLong(day))}">${adds}</div>${chooser(day,i)}</li>`;
  }).join('');
  const room=D.rooms.find(r=>r.id===S.room);
  return `<h2 id="stay-title" class="stay-h">${t.s2Title}</h2><p class="stay-sub small muted">${icons.calendar}<span>${esc(fmtDay(S.arrival))} ${t.to} ${esc(fmtDay(addDays(S.arrival,S.nights)))} · ${S.nights} ${S.nights===1?t.night:t.nights.toLowerCase()} · ${gl(S.guests)}${room?` · ${esc(room.name)}`:''}</span></p><ol class="day-list">${list}</ol>`;
 }
 function summaryRows(){
  return days().map((day,i)=>{const mine=S.items.filter(it=>it.day===i).sort((a,b)=>(a.time||'').localeCompare(b.time||''));if(!mine.length)return '';
   return `<li class="sum-day"><p class="eyebrow muted">${esc(fmtDay(day))}</p><ul>${mine.map(it=>`<li><span>${esc(itemLabel(it))}${it.time?`, ${it.time}`:''}${it.qty>1&&it.extra!=='package'?`, ${gl(it.qty)}`:''}</span><span>${pl(itemPrice(it))}</span></li>`).join('')}</ul></li>`;}).join('');
 }
 function step3(){
  const room=D.rooms.find(r=>r.id===S.room),sum=total(),dep=Math.round(sum*D.depositRate/100)*100;
  const roomLine=`<li class="sum-day"><p class="eyebrow muted">${esc(t.room)}</p><ul><li><span>${esc(room?room.name:t.roomAny)}, ${S.nights} ${S.nights===1?t.night:t.nights.toLowerCase()}, ${gl(S.guests)}</span><span class="small muted">${esc(t.roomRate)}</span></li></ul></li>`;
  return `<h2 id="stay-title" class="stay-h">${t.s3Title}</h2><ul class="sum">${roomLine}${summaryRows()||`<li class="sum-day"><p class="small muted">${esc(t.nothingAdded)}</p></li>`}</ul>
  <dl class="sum-total"><div><dt>${t.extrasTotal}</dt><dd>${money(sum)}</dd></div><div class="sum-deposit"><dt>${t.depositToday} <span class="sample-tag">${D.depositRate*100}% · ${t.sample}</span></dt><dd>${money(dep)}</dd></div><div><dt>${t.atHotel}</dt><dd>${money(sum-dep)}</dd></div></dl>
  <div class="stay-form"><label><span class="eyebrow">${t.name}</span><input type="text" name="name" autocomplete="name"></label><label><span class="eyebrow">${t.email}</span><input type="email" name="email" autocomplete="email" inputmode="email" spellcheck="false" autocapitalize="off"></label></div>
  <p class="small muted">${esc(t.depositNote)}</p>`;
 }
 function step4(){
  return `<div class="stay-done"><p class="done-mark">${icons.check}</p><h2 id="stay-title" class="stay-h">${t.doneTitle}</h2><p>${esc(t.doneBody)}</p><ul class="sum">${summaryRows()}</ul><p class="small muted">${esc(t.doneRoom)}</p><a class="btn-quiet btn-quiet--line" href="${D.bookUrl}" target="_blank" rel="noopener">${t.openEngine}${icons.arrow}</a></div>`;
 }
 function renderFoot(){
  const sum=total(),n=S.items.length;
  if(S.done){foot.innerHTML=`<button type="button" class="btn-quiet" data-reset>${t.startOver}</button><button type="button" class="btn-solid" data-close>${t.close}</button>`;return;}
  const next=S.step===1?t.next1:S.step===2?t.next2:t.pay;
  const ok=S.step===1?!!S.arrival:true;
  foot.innerHTML=`<p class="foot-total" aria-live="polite"><span class="small muted">${n?`${n} ${n===1?t.itemOne:t.itemMany}`:t.noItems}</span><b>${money(sum)}</b></p>${S.step>1?`<button type="button" class="icon-btn foot-back" data-back aria-label="${esc(t.back)}">${icons.back}</button>`:''}<button type="button" class="btn-solid" data-next ${ok?'':'disabled'}>${next}${icons.arrow}</button>`;
 }
 function renderSteps(){stepsEl.innerHTML=[t.step1,t.step2,t.step3].map((label,i)=>`<li class="${S.done||S.step>i+1?'is-done':S.step===i+1?'is-now':''}" ${S.step===i+1&&!S.done?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('');}
 function render(){body.innerHTML=S.done?step4():S.step===1?step1():S.step===2?step2():step3();renderFoot();renderSteps();}
 // Step change: the old content leaves to the left, the new arrives from the right (reversed when going back).
 let stepTween;
 function go(step,dir=1){
  S.step=step;S.open=null;save();
  if(reduce.matches||!window.gsap||dialog.open===false){render();panel.scrollTop=0;return;}
  stepTween?.kill();
  stepTween=gsap.timeline({defaults:{ease:'house'}}).to(body,{x:-24*dir,opacity:0,duration:.22,ease:'power2.in'}).add(()=>{render();panel.scrollTop=0;}).fromTo(body,{x:24*dir,opacity:0},{x:0,opacity:1,duration:.45,clearProps:'transform,opacity'});
 }
 // Chooser opens and closes by height; a quick second tap reverses from where it is.
 function openChooser(i,id,trigger){
  const same=S.open&&S.open.day===i&&S.open.extra===id;
  const closeOld=cb=>{const old=body.querySelector('[data-chooser]');if(!old||reduce.matches){cb();return;}gsap.to(old,{height:0,opacity:0,duration:.3,ease:'house',onComplete:cb});};
  closeOld(()=>{
   if(same){S.open=null;render();focusAdd(i,id);return;}
   const x=extra(id);S.open={day:i,extra:id,opt:S.pendingOpt||x.options[0].id,time:null,qty:x.perPerson?S.guests:1};S.pendingOpt=null;render();
   const el=body.querySelector('[data-chooser]');
   if(el&&!reduce.matches)gsap.fromTo(el,{height:0,opacity:0},{height:'auto',opacity:1,duration:.45,ease:'house',clearProps:'height,opacity'});
   const keyboard=trigger===true;(keyboard?el?.querySelector('button:not([disabled])'):el)?.focus?.({preventScroll:true});
   el?.scrollIntoView({block:'nearest',behavior:reduce.matches?'auto':'smooth'});
  });
 }
 const focusAdd=(i,id)=>body.querySelector(`[data-add="${id}"][data-day="${i}"]`)?.focus({preventScroll:true});
 function updateChooser(){const y=panel.scrollTop;render();panel.scrollTop=y;}
 // ---------- events ----------
 body.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;const key=e.detail===0;
  if(b.dataset.date){S.arrival=b.dataset.date;S.month=b.dataset.date;save();render();body.querySelector('.cal-day.is-start')?.focus({preventScroll:true});}
  else if(b.dataset.month){const d=parse(S.month||S.arrival||today);d.setDate(1);d.setMonth(d.getMonth()+Number(b.dataset.month));S.month=iso(d);render();body.querySelector(`[data-month="${b.dataset.month}"]`)?.focus({preventScroll:true});}
  else if(b.dataset.step){const [name,delta]=b.dataset.step.split(':');
   if(name==='qty'){S.open.qty=Math.max(1,Math.min(S.guests,S.open.qty+Number(delta)));updateChooser();}
   else{S[name]=name==='nights'?Math.max(1,Math.min(14,S.nights+Number(delta))):Math.max(gMin(),Math.min(gMax(),S.guests+Number(delta)));if(name==='guests'){const r=D.rooms.find(r=>r.id===S.room);if(r&&r.max<S.guests)S.room=null;S.items.forEach(it=>{it.qty=Math.min(it.qty,S.guests);});}clampItems();save();render();}
   body.querySelector(`[data-step="${b.dataset.step}"]:not([disabled])`)?.focus({preventScroll:true});}
  else if(b.dataset.add)openChooser(Number(b.dataset.day),b.dataset.add,key);
  else if(b.dataset.opt){S.open.opt=b.dataset.opt;updateChooser();body.querySelector(`[data-opt="${b.dataset.opt}"]`)?.focus({preventScroll:true});}
  else if(b.dataset.time){S.open.time=b.dataset.time;updateChooser();body.querySelector(`[data-time="${b.dataset.time}"]`)?.focus({preventScroll:true});}
  else if('cancel' in b.dataset){const {day,extra:id}=S.open;openChooser(day,id);}
  else if('confirm' in b.dataset){const o=S.open;S.items.push({id:`${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`,day:o.day,extra:o.extra,opt:o.opt,time:o.time,qty:o.qty});S.open=null;save();render();
   const row=body.querySelector(`[data-day-row="${o.day}"] .item-chip:last-child`);if(row&&!reduce.matches)gsap.fromTo(row,{opacity:0,x:-16},{opacity:1,x:0,duration:.5,ease:'house',clearProps:'transform,opacity'});focusAdd(o.day,o.extra);}
  else if(b.dataset.remove){const chip=b.closest('.item-chip'),done=()=>{S.items=S.items.filter(it=>it.id!==b.dataset.remove);save();const y=panel.scrollTop;render();panel.scrollTop=y;panel.focus({preventScroll:true});};
   if(reduce.matches)done();else gsap.to(chip,{opacity:0,x:16,height:0,paddingBlock:0,marginBlock:0,duration:.3,ease:'house',onComplete:done});}
 });
 body.addEventListener('change',e=>{if(e.target.name==='room'){S.room=e.target.value;S.items=S.items.filter(it=>it.extra==='package'||!extra(it.extra).includedRooms?.includes(S.room));save();renderFoot();}});
 foot.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if('next' in b.dataset){
   if(S.step===1){const p=S.pending;S.pending=null;
    if(p?.extra==='package'){const pk=D.packages.find(x=>x.id===p.opt);if(pk&&!S.items.some(it=>it.extra==='package'&&it.opt===pk.id))S.items.push({id:`p${Date.now().toString(36)}`,day:0,extra:'package',opt:pk.id,time:null,qty:1});go(2);}
    else if(p){S.pendingOpt=p.opt;go(2);setTimeout(()=>openChooser(0,p.extra),reduce.matches?0:320);}
    else go(2);}
   else if(S.step===2)go(3);
   else{S.done=true;go(3);} // step stays 3; the reply replaces the form
  }
  else if('back' in b.dataset)go(S.step-1,-1);
  else if('reset' in b.dataset){S=fresh();save();go(1,-1);}
  else if('close' in b.dataset)api.close();
 });
 // ---------- sheet ----------
 const api=overlay({dialog,panel,closeButton:dialog.querySelector('.stay-close'),makeTimeline:reduced=>{
  const tl=gsap.timeline({paused:true,defaults:{ease:'house'}});
  if(reduced)return tl.fromTo(backdrop,{opacity:0},{opacity:.6,duration:.2},0).fromTo(panel,{opacity:0},{opacity:1,duration:.2},0);
  const phone=matchMedia('(max-width:767px)').matches;
  return tl.fromTo(backdrop,{opacity:0},{opacity:.6,duration:.4},0).fromTo(panel,phone?{yPercent:100}:{xPercent:100},phone?{yPercent:0,duration:.7}:{xPercent:0,duration:.7},0).fromTo([dialog.querySelector('.stay-top'),body,foot],{y:18,opacity:0},{y:0,opacity:1,duration:.4,stagger:.07,clearProps:'transform,opacity'},.28);
 }});
 backdrop.addEventListener('click',api.close);
 // On-screen keyboard (iOS pans the visual viewport and keeps the dialog at full height): fit the sheet to the visible area,
 // keep its top and foot in view, and bring the focused field clear of the sticky foot.
 const vv=window.visualViewport;
 if(vv){
  const reveal=()=>{const el=document.activeElement;if(!el||!panel.contains(el)||!el.matches('input,textarea'))return;const r=el.getBoundingClientRect(),top=dialog.querySelector('.stay-top').getBoundingClientRect().bottom,bottom=foot.getBoundingClientRect().top;if(r.top<top+12||r.bottom>bottom-12)panel.scrollTop+=r.top-(top+(bottom-top-r.height)/2);};
  // iOS may shrink the layout viewport too, so the keyboard is detected against the tallest height seen while the sheet is open.
  let tall=vv.height;
  const typing=()=>{const el=document.activeElement;return !!el&&panel.contains(el)&&el.matches('input,textarea');};
  const fitKeyboard=()=>{if(!typing())tall=vv.height;if(!dialog.open)return;const kb=typing()&&tall-vv.height>120&&matchMedia('(max-width:767px)').matches;dialog.classList.toggle('has-keyboard',kb);
   // Safari moves fixed layers while the keyboard animates, so the sheet is corrected against where it actually is, not where it should be.
   if(kb){panel.style.bottom='auto';panel.style.height=`${Math.round(vv.height)}px`;const delta=vv.offsetTop-panel.getBoundingClientRect().top;if(Math.abs(delta)>1)panel.style.top=`${Math.round((parseFloat(panel.style.top)||panel.offsetTop)+delta)}px`;requestAnimationFrame(reveal);}
   else{panel.style.height=panel.style.top=panel.style.bottom='';}};
  const settle=()=>{for(const ms of [0,120,300,600,1000])setTimeout(fitKeyboard,ms);};
  vv.addEventListener('resize',settle);vv.addEventListener('scroll',fitKeyboard);addEventListener('scroll',fitKeyboard,{passive:true});
  body.addEventListener('focusin',e=>{if(e.target.matches('input,textarea'))settle();});
  body.addEventListener('focusout',()=>setTimeout(fitKeyboard,150));
 }
 function open(e,intent={}){
  if(S.done){S=fresh();}
  if(intent.arrival)S.arrival=intent.arrival;if(intent.nights)S.nights=intent.nights;if(intent.guests)S.guests=intent.guests;if(intent.room)S.room=intent.room;
  if(intent.month)S.month=intent.month;
  let after=null;
  if(intent.add){const [id,opt]=intent.add.split(':');
   if(id==='package'){const [pid,date]=opt.split('@');const pk=D.packages.find(x=>x.id===pid);if(date){S.arrival=date;S.month=date;if(pk?.nights)S.nights=pk.nights;}S.items=S.items.filter(it=>it.extra!=='package');S.pending={extra:'package',opt:pid};S.guests=Math.max(gMin(),Math.min(gMax(),S.guests));const r=D.rooms.find(r=>r.id===S.room);if(r&&r.max<S.guests)S.room=null;S.step=1;}
   else if(S.arrival){S.step=2;S.pendingOpt=opt||null;after=()=>openChooser(0,id);}
   else{S.pending={extra:id,opt:opt||null};S.step=1;}}
  else if(intent.step)S.step=S.arrival?intent.step:1;
  else if(!S.arrival)S.step=1;
  S.open=null;clampItems();save();
  api.open({currentTarget:e.target.closest?.('[data-stay-open]')||e.currentTarget,detail:e.detail},()=>{render();panel.scrollTop=0;});
  panel.scrollTop=0;
  if(after)setTimeout(after,reduce.matches?0:450);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-stay-open]');if(!b)return;e.preventDefault();
  const intent={add:b.dataset.stayAdd,room:b.dataset.stayRoom,step:b.dataset.stayStep?Number(b.dataset.stayStep):undefined};
  open(e,intent);});
 // ---------- starter band (home) ----------
 function syncStarters(){
  document.querySelectorAll('.starter').forEach(el=>{
   el.querySelector('[data-starter-arrival]').textContent=S.arrival?fmtDay(S.arrival):t.pickDate;
   for(const name of ['nights','guests']){const box=el.querySelector(`[data-starter="${name}"]`);box.querySelector('output').textContent=S[name];box.querySelector('[data-starter-step="-1"]').disabled=S[name]<=(name==='nights'?1:gMin());box.querySelector('[data-starter-step="1"]').disabled=S[name]>=(name==='nights'?14:gMax());}
  });
  document.querySelectorAll('[data-stay-count]').forEach(el=>{const n=S.items.length;el.textContent=n||'';el.hidden=!n;});
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-starter-step]');if(!b)return;const name=b.closest('[data-starter]').dataset.starter;S[name]=name==='nights'?Math.max(1,Math.min(14,S.nights+Number(b.dataset.starterStep))):Math.max(gMin(),Math.min(gMax(),S.guests+Number(b.dataset.starterStep)));clampItems();save();});
 syncStarters();
 return {open,close:api.close,get state(){return api.state;},get data(){return S;},reset(){S=fresh();save();}};
}
