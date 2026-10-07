import type {createHeroCinema} from './hero-cinema';
export function initHeroSlideshow(hero:HTMLElement){
 const slides=[...hero.querySelectorAll<HTMLElement>('[data-slide]')],dots=[...hero.querySelectorAll<HTMLButtonElement>('[data-slide-to]')],pause=hero.querySelector<HTMLButtonElement>('[data-hero-pause]'),counter=hero.querySelector<HTMLElement>('[data-scene-count]'),caption=hero.querySelector<HTMLElement>('[data-scene-caption]');
 let index=0,paused=false,inView=true,timer:ReturnType<typeof setTimeout>|undefined,busy=false,queued:number|null=null;
 let cinema:ReturnType<typeof createHeroCinema>=null,cinemaAttempted=false;
 const ready=new Map<number,Promise<void>>();
 const load=(i:number)=>{if(ready.has(i))return ready.get(i)!;const pending=Promise.all([...slides[i].querySelectorAll<HTMLImageElement>('img')].map(async img=>{if(img.dataset.deferredSrc){img.closest('picture')?.querySelectorAll<HTMLSourceElement>('source[data-deferred-srcset]').forEach(source=>{source.srcset=source.dataset.deferredSrcset||'';delete source.dataset.deferredSrcset;});img.loading='eager';img.srcset=img.dataset.deferredSrcset||'';img.src=img.dataset.deferredSrc;delete img.dataset.deferredSrc;delete img.dataset.deferredSrcset;}await img.decode();})).then(()=>{});ready.set(i,pending);pending.catch(()=>ready.delete(i));return pending;};
 const schedule=()=>{clearTimeout(timer);if(!paused&&!document.hidden&&inView)timer=setTimeout(()=>void change((index+1)%slides.length),11000);};
 const update=()=>{hero.dataset.scene=slides[index].dataset.scene;hero.dataset.index=String(index);slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));if(counter)counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;if(caption)caption.textContent=slides[index].dataset.caption||'';};
 const syncPause=()=>{hero.dataset.paused=String(paused);pause?.setAttribute('aria-pressed',String(paused));pause?.setAttribute('aria-label',paused?'播放背景轮播':'暂停背景轮播');if(pause)pause.textContent=paused?'播放':'暂停';};
 async function change(next:number){if(next===index&&!busy){schedule();return;}if(busy){queued=next;return;}busy=true;clearTimeout(timer);hero.setAttribute('aria-busy','true');
  try{await load(next);if(!cinemaAttempted){cinemaAttempted=true;try{const engine=await import('./hero-cinema');cinema=engine.createHeroCinema(hero);}catch{hero.dataset.renderer='css';}}
   let gpu=false;if(cinema&&!document.hidden)gpu=await cinema.transition(slides[index],slides[next],next===0?4000:3200);
   if(gpu)hero.classList.add('gpu-switch');index=next;update();
   if(gpu)requestAnimationFrame(()=>{cinema?.hide();requestAnimationFrame(()=>hero.classList.remove('gpu-switch'));});
   else await new Promise(resolve=>setTimeout(resolve,3200));
  }catch{/* Keep the current decoded image in place if a future asset fails. */}
  finally{hero.removeAttribute('aria-busy');busy=false;const requested=queued;queued=null;if(requested!==null&&requested!==index)void change(requested);else{schedule();void load((index+1)%slides.length).catch(()=>{});}}
 }
 document.addEventListener('visibilitychange',schedule);new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.05}).observe(hero);
 window.addEventListener('pagehide',event=>{clearTimeout(timer);if(!event.persisted)cinema?.destroy();});
 window.addEventListener('pageshow',event=>{if(event.persisted)schedule();});
 update();syncPause();schedule();setTimeout(()=>void load(1).catch(()=>{}),3000);
}
