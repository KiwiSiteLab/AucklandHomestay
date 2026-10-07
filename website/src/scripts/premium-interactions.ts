export function initPremiumInteractions(){
 const clickables='a[href],button:not(:disabled),summary,[role="button"],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)';
 const svgNS='http://www.w3.org/2000/svg';
 document.querySelectorAll<HTMLElement>(clickables).forEach(el=>{
  el.classList.add('ui-control');
  if(el.matches('.button,.text-link,.hero-secondary')&&!el.querySelector('img')){
   el.querySelectorAll('span').forEach(span=>{if(/^[↗→]$/.test(span.textContent?.trim()||''))span.remove();});
   const svg=document.createElementNS(svgNS,'svg');svg.classList.add('ui-arrow');svg.setAttribute('viewBox','0 0 18 14');svg.setAttribute('aria-hidden','true');
   const shaft=document.createElementNS(svgNS,'path');shaft.classList.add('ui-arrow-shaft');shaft.setAttribute('d','M2 7h12');
   const tip=document.createElementNS(svgNS,'path');tip.classList.add('ui-arrow-tip');tip.setAttribute('d','m10 3 4 4-4 4');svg.append(shaft,tip);el.append(svg);el.classList.add('ui-action');
  }
 });
 const aura=document.createElement('div');aura.className='cursor-aura';aura.setAttribute('aria-hidden','true');document.body.append(aura);
 type Motion={el:HTMLElement;x:number;y:number;vx:number;vy:number;tx:number;ty:number;kind:'control'|'image'};
 const motions=new Map<HTMLElement,Motion>();let active:HTMLElement|null=null,media:HTMLElement|null=null,frame=0,last=0,cx=0,cy=0,cvx=0,cvy=0,px=0,py=0,seen=false;
 const setTarget=(el:HTMLElement,tx:number,ty:number,kind:Motion['kind'])=>{let motion=motions.get(el);if(!motion){motion={el,x:0,y:0,vx:0,vy:0,tx,ty,kind};motions.set(el,motion);}motion.tx=tx;motion.ty=ty;};
 const reset=()=>{if(active){setTarget(active,0,0,'control');active.classList.remove('ui-hover');}if(media){setTarget(media,0,0,'image');media.classList.remove('ui-media-active');}active=null;media=null;aura.classList.remove('is-interactive');wake();};
 const step=(now:number)=>{
  const dt=Math.min((now-last||16.67)/16.67,2);last=now;let moving=false;
  cvx=(cvx+(px-cx)*.20*dt)*Math.pow(.66,dt);cvy=(cvy+(py-cy)*.20*dt)*Math.pow(.66,dt);cx+=cvx*dt;cy+=cvy*dt;aura.style.translate=`${cx}px ${cy}px`;
  if(Math.abs(px-cx)+Math.abs(py-cy)+Math.abs(cvx)+Math.abs(cvy)>.15)moving=true;
  motions.forEach(m=>{m.vx=(m.vx+(m.tx-m.x)*.14*dt)*Math.pow(.68,dt);m.vy=(m.vy+(m.ty-m.y)*.14*dt)*Math.pow(.68,dt);m.x+=m.vx*dt;m.y+=m.vy*dt;
   const prefix=m.kind==='image'?'--image':'--pointer';m.el.style.setProperty(prefix+'-x',`${m.x.toFixed(3)}px`);m.el.style.setProperty(prefix+'-y',`${m.y.toFixed(3)}px`);
   if(Math.abs(m.tx-m.x)+Math.abs(m.ty-m.y)+Math.abs(m.vx)+Math.abs(m.vy)>.03)moving=true;
   else if(!m.tx&&!m.ty){m.el.style.removeProperty(prefix+'-x');m.el.style.removeProperty(prefix+'-y');motions.delete(m.el);}
  });frame=moving?requestAnimationFrame(step):0;
 };
 function wake(){if(!frame){last=performance.now();frame=requestAnimationFrame(step);}}
 document.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  document.documentElement.dataset.pointerMode='mouse';px=event.clientX;py=event.clientY;if(!seen){cx=px;cy=py;seen=true;}aura.classList.add('is-visible');
  const node=event.target instanceof Element?event.target:null;if(!node)return;const next=node.closest<HTMLElement>(clickables);
  if(active!==next){if(active){setTarget(active,0,0,'control');active.classList.remove('ui-hover');}active=next;active?.classList.add('ui-hover');}
  aura.classList.toggle('is-interactive',!!active);
  if(active&&!active.matches('input,select,textarea')&&!active.querySelector('img')){
   const b=active.getBoundingClientRect(),m=motions.get(active);const dx=px-(b.left-(m?.x||0)+b.width/2),dy=py-(b.top-(m?.y||0)+b.height/2);
   setTarget(active,Math.max(-8,Math.min(8,dx*.12)),Math.max(-5,Math.min(5,dy*.16)),'control');
  }
  const nextMedia=node.closest<HTMLElement>('.property-photo,.gallery-item button,.experience-photo,.about-photo,.story-photo,.about-image,.story-image,.nav-property');
  if(nextMedia!==media){if(media){setTarget(media,0,0,'image');media.classList.remove('ui-media-active');}media=nextMedia;if(media){media.classList.add('ui-media','ui-media-active');}}
  if(media){const b=media.getBoundingClientRect();if(b.width&&b.height){setTarget(media,((px-b.left)/b.width-.5)*14,((py-b.top)/b.height-.5)*10,'image');media.style.setProperty('--light-x',`${(px-b.left)/b.width*100}%`);media.style.setProperty('--light-y',`${(py-b.top)/b.height*100}%`);}}
  wake();
 },{passive:true});
 document.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'){document.documentElement.dataset.pointerMode='touch';aura.classList.remove('is-visible');reset();}else aura.classList.add('is-pressed');});
 document.addEventListener('pointerup',()=>aura.classList.remove('is-pressed'));document.addEventListener('pointercancel',()=>{aura.classList.remove('is-pressed');reset();});
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget){reset();aura.classList.remove('is-visible');}});window.addEventListener('blur',()=>{reset();aura.classList.remove('is-visible');});document.addEventListener('scroll',reset,{passive:true});
 // Stripe-style anchored navigation: pointer, button and keyboard share the same panel state.
 const popover=document.querySelector<HTMLElement>('[data-nav-popover]');const triggers=[...document.querySelectorAll<HTMLButtonElement>('[data-nav-trigger]')],panels=[...document.querySelectorAll<HTMLElement>('[data-nav-panel]')];let closeTimer:ReturnType<typeof setTimeout>|undefined;
 function closeNav(){popover?.classList.remove('is-open');triggers.forEach(t=>t.setAttribute('aria-expanded','false'));panels.forEach(p=>p.inert=true);}
 function openNav(id:string){clearTimeout(closeTimer);popover?.classList.add('is-open');triggers.forEach(t=>t.setAttribute('aria-expanded',String(t.dataset.navTrigger===id)));panels.forEach(p=>{const selected=p.dataset.navPanel===id;p.classList.toggle('is-active',selected);p.inert=!selected;});}
 document.querySelectorAll<HTMLElement>('[data-nav-item]').forEach(item=>{item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')openNav(item.dataset.navItem!);});item.addEventListener('pointerleave',()=>{closeTimer=setTimeout(closeNav,180);});});
 popover?.addEventListener('pointerenter',()=>clearTimeout(closeTimer));popover?.addEventListener('pointerleave',()=>{closeTimer=setTimeout(closeNav,180);});
 triggers.forEach(t=>{t.addEventListener('click',event=>{if(event.detail>0)openNav(t.dataset.navTrigger!);else t.getAttribute('aria-expanded')==='true'?closeNav():openNav(t.dataset.navTrigger!);});t.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openNav(t.dataset.navTrigger!);panels.find(p=>p.dataset.navPanel===t.dataset.navTrigger)?.querySelector<HTMLElement>('a')?.focus();}});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popover?.classList.contains('is-open')){const trigger=triggers.find(t=>t.getAttribute('aria-expanded')==='true');closeNav();trigger?.focus();}});
 document.addEventListener('pointerdown',e=>{if(!(e.target as Element).closest('[data-nav-item],[data-nav-popover]'))closeNav();});
 document.addEventListener('focusin',e=>{if(!(e.target as Element).closest('[data-nav-item],[data-nav-popover]'))closeNav();});
}
