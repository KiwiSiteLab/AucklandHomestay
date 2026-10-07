import {initPremiumInteractions} from './premium-interactions';
import {initHeroSlideshow} from './hero-slideshow';
const $=<T extends HTMLElement=HTMLElement>(selector:string,scope:ParentNode=document)=>scope.querySelector<T>(selector);
const $$=<T extends HTMLElement=HTMLElement>(selector:string,scope:ParentNode=document)=>[...scope.querySelectorAll<T>(selector)];
let returnFocus:HTMLElement|null=null;
let toastTimer:ReturnType<typeof setTimeout>;
function toast(message:string){const node=$('#toast');if(!node)return;node.textContent=message;node.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('is-visible'),3500);}
function closeDialog(dialog:HTMLDialogElement){
 if(dialog.dataset.closing||!dialog.open)return;dialog.dataset.closing='true';
 const motion=dialog.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(10px) scale(.985)'}],{duration:230,easing:'cubic-bezier(.22,1.18,.36,1)'});
 motion.finished.catch(()=>{}).then(()=>{dialog.close();delete dialog.dataset.closing;});
}
function openDialog(dialog:HTMLDialogElement){if(!(document.activeElement as HTMLElement)?.closest('dialog'))returnFocus=document.activeElement as HTMLElement;$$<HTMLDialogElement>('dialog[open]').forEach(other=>closeDialog(other));dialog.showModal();if(!matchMedia('(prefers-reduced-motion:reduce)').matches||matchMedia('(pointer:coarse)').matches){dialog.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.22,1.18,.36,1)'});if(dialog.id==='mobile-menu')dialog.querySelectorAll('nav a').forEach((link,i)=>link.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:50+i*45,fill:'backwards',easing:'cubic-bezier(.22,1.18,.36,1)'}));}document.body.classList.add('modal-open');}
$$<HTMLDialogElement>('dialog').forEach(dialog=>{dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});dialog.addEventListener('close',()=>{if(!$$('dialog[open]').length){document.body.classList.remove('modal-open');returnFocus?.focus();}$('.menu-toggle')?.setAttribute('aria-expanded','false');});dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});});
document.addEventListener('click',event=>{const target=event.target as HTMLElement;if(target.closest('[data-close]')){const dialog=target.closest('dialog');if(dialog)closeDialog(dialog);}if(target.closest('[data-wechat]')){const dialog=$<HTMLDialogElement>('#wechat-dialog');if(dialog)openDialog(dialog);}});
$('.menu-toggle')?.addEventListener('click',()=>{const menu=$<HTMLDialogElement>('#mobile-menu');if(menu){openDialog(menu);$('.menu-toggle')?.setAttribute('aria-expanded','true');}});
const header=$('#site-header');
const marker=document.createElement('div');marker.setAttribute('aria-hidden','true');marker.style.cssText='position:absolute;top:50px;height:1px;width:1px;pointer-events:none';document.body.prepend(marker);
new IntersectionObserver(entries=>header?.classList.toggle('is-scrolled',!entries[0].isIntersecting)).observe(marker);
const hero=$('[data-hero]');
$$<HTMLButtonElement>('[data-location-to]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.locationTo;$$('[data-location-to]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));$$('[data-location-panel]').forEach(item=>{item.hidden=item.dataset.locationPanel!==id;});}));
if(hero)initHeroSlideshow(hero);
const lightbox=$<HTMLDialogElement>('#lightbox');let group:HTMLButtonElement[]=[],imageIndex=0;
function showPhoto(){const button=group[imageIndex];if(!button)return;const image=$<HTMLImageElement>('#lightbox-image');if(image){image.src=button.dataset.original||'';image.alt=button.dataset.alt||'';if(!matchMedia('(prefers-reduced-motion:reduce)').matches)image.animate([{opacity:.25,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:400,easing:'cubic-bezier(.22,1.18,.36,1)'});}const caption=$('#lightbox-caption');if(caption)caption.textContent=button.dataset.caption||'';const count=$('#lightbox-counter');if(count)count.textContent=`${imageIndex+1} / ${group.length}`;const original=$<HTMLAnchorElement>('#lightbox-original');if(original)original.href=button.dataset.original||'';const next=new Image();next.src=group[(imageIndex+1)%group.length]?.dataset.original||'';}
function movePhoto(direction:number){if(!group.length)return;imageIndex=(imageIndex+direction+group.length)%group.length;showPhoto();}
$$<HTMLButtonElement>('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{const parent=button.closest('[data-gallery-group]');if(!parent||!lightbox)return;group=$$<HTMLButtonElement>('[data-lightbox]',parent);imageIndex=group.indexOf(button);const title=$('#lightbox-title');if(title)title.textContent=(parent as HTMLElement).dataset.galleryTitle||'Victoria House';showPhoto();openDialog(lightbox);}));
$('.lightbox-prev')?.addEventListener('click',()=>movePhoto(-1));$('.lightbox-next')?.addEventListener('click',()=>movePhoto(1));lightbox?.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}});
let swipe:{x:number;y:number}|null=null;
$('.lightbox-stage')?.addEventListener('touchstart',event=>{const e=event as TouchEvent;swipe={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});$('.lightbox-stage')?.addEventListener('touchend',event=>{if(!swipe)return;const e=event as TouchEvent;const dx=e.changedTouches[0].clientX-swipe.x,dy=e.changedTouches[0].clientY-swipe.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)movePhoto(dx<0?1:-1);swipe=null;},{passive:true});
$$<HTMLButtonElement>('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.galleryFilter;$$('[data-gallery-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));$$('[data-collection-property]').forEach(item=>{item.hidden=filter!=='all'&&item.dataset.collectionProperty!==filter;});}));
const enquiry=$<HTMLFormElement>('#enquiry-form');
const dateIn=$<HTMLInputElement>('#checkin'),dateOut=$<HTMLInputElement>('#checkout');
function dateString(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
if(dateIn){dateIn.min=dateString(new Date());dateIn.addEventListener('change',()=>{if(dateOut&&dateIn.value){const next=new Date(`${dateIn.value}T12:00:00`);next.setDate(next.getDate()+1);dateOut.min=dateString(next);}});}
if(enquiry){const select=$<HTMLSelectElement>('#property');const id=new URLSearchParams(location.search).get('property');if(select&&id&&[...select.options].some(option=>option.value===id))select.value=id;
enquiry.addEventListener('input',()=>{const result=$('#enquiry-result');if(result)result.hidden=true;const error=$('#form-error');if(error)error.hidden=true;});
enquiry.addEventListener('submit',event=>{event.preventDefault();const values=new FormData(enquiry),error=$('#form-error');if(dateOut?.value&&dateIn?.value&&dateOut.value<=dateIn.value){if(error){error.textContent='离开日期需晚于入住日期，请重新选择。';error.hidden=false;}dateOut.focus();return;}if(!enquiry.reportValidity())return;const property=select?.selectedOptions[0].textContent||'想先了解一下';const text=`你好，我想咨询 Victoria House 的入住安排。\n姓名：${values.get('name')}\n邮箱：${values.get('email')}\n电话：${values.get('phone')||'未填写'}\n住宿：${property}\n入住：${values.get('checkin')}\n离开：${values.get('checkout')||'待确认'}\n人数：${values.get('guests')}\n留言：${values.get('message')||'请帮忙确认房源、租期与费用，谢谢。'}`;const field=$<HTMLTextAreaElement>('#enquiry-text'),result=$('#enquiry-result');if(field)field.value=text;if(result){result.hidden=false;result.scrollIntoView({block:'nearest',behavior:'smooth'});}});}
async function copy(value:string){try{await navigator.clipboard.writeText(value);toast('咨询内容已复制，请通过微信发送。');}catch{const field=$<HTMLTextAreaElement>('#enquiry-text');field?.focus();field?.select();toast('请使用系统复制功能，复制选中的咨询内容。');}}
$('#copy-enquiry')?.addEventListener('click',()=>copy($<HTMLTextAreaElement>('#enquiry-text')?.value||''));

// Reveal only offscreen content; the initial viewport and no-JS pages stay immediately readable.
const motionPreference=matchMedia('(prefers-reduced-motion:reduce)');
if(!motionPreference.matches){
 const targets=$$('[data-reveal], .section-intro, .experience-copy, .values-list>div, .gallery-item, .story-copy, .about-copy, .property-description');
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-in-view');observer.unobserve(entry.target);}}, {threshold:.06,rootMargin:'0px 0px -25px 0px'});
 targets.forEach(element=>{element.dataset.reveal='';if(element.getBoundingClientRect().top>innerHeight){element.classList.add('reveal-ready');observer.observe(element);}});
 motionPreference.addEventListener('change',event=>{if(event.matches){observer.disconnect();targets.forEach(element=>element.classList.add('is-in-view'));}});
}

initPremiumInteractions();
