import images from './user-backgrounds.json';
export const landscapes=images;
// 1.jpg is the user-pinned opening. Remaining scenes descend by measured luminance.
export const brandSlides=[landscapes.mountain,...Object.values(landscapes).filter(p=>p.id!=='mountain').sort((a,b)=>b.luminance-a.luminance)];
