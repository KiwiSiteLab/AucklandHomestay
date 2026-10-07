import catalog from './image-catalog.json';
export type Photo = { id:string; src:string; original:string; width:number; height:number; srcset:string; avifSrcset?:string; alt:string; caption:string; position?:string };
export type Property = {
  id:string; slug:string; name:string; chineseName:string; location:string; area:string; address:string;
  shortDescription:string; description:string[]; heroImage:Photo; gallery:Photo[];
  bedrooms:number|null; bathrooms:number|null; guests:number|null; amenities:string[];
  map:{query:string; searchUrl:string; embedUrl:string}; priceFrom:number|null;
  bookingUrl:string|null; paymentUrl:string|null; featured:boolean; mood:string;
};
const scenes:Record<string,string[]>={
  room1:['自然光里的厨房','厨具与收纳细节','明亮的卫浴空间','洗衣设备','窗外的奥克兰城市景观','街区与建筑入口','旧版宣传图片','建筑入口信息','重复入口信息'],
  room2:['暮色里的卧室','用餐空间与厨房','窗边的自然光','卧室另一侧','阳台与城市景观','厨房全景','窗外的海湾','卫浴空间','淋浴与洗漱空间'],
  room3:['天空塔旁的卧室','床边的天空塔景观','落地窗与城市暮色','明亮的卫浴','卫浴细节']
};
export const photos:Record<string,Photo[]> = Object.fromEntries(catalog.map(room=>[room.id,room.photos.map((p,i)=>({
  ...p,id:`${room.id}-${i+1}`,src:`/${p.src}`,original:`/${p.original}`,
  srcset:p.srcset.split(', ').map(v=>`/${v}`).join(', '),avifSrcset:p.avifSrcset?.split(', ').map(v=>`/${v}`).join(', '),
  alt:`${room.name} 住宿实拍：${scenes[room.id]?.[i]||p.alt}`,caption:scenes[room.id]?.[i]||p.alt
}))]));
const address='147 Victoria Street West, Auckland, New Zealand';
const query=encodeURIComponent(address);
const map={query:address,searchUrl:`https://www.google.com/maps/search/?api=1&query=${query}`,embedUrl:`https://maps.google.com/maps?q=${query}&z=16&output=embed`};
const shared={location:'Auckland CBD',area:'CBD',address,map,bedrooms:null,bathrooms:null,guests:null,priceFrom:null,bookingUrl:null,paymentUrl:null,amenities:['家具家电','水电包含','网络包含','明亮居住空间','临近超市','靠近高速','靠近天空塔'],featured:true};
export const properties:Property[]=[
  {...shared,id:'room1',slug:'victoria-residence',name:'Victoria Residence',chineseName:'维多利亚公寓',shortDescription:'明亮的生活空间，让城市日常舒展一些。',description:['从自然光里的厨房，到窗外的城市景观，维多利亚公寓为日常生活留出舒适的空间。家具家电与水电网络已包含，适合上班族或学生了解入住。','位于 147 Victoria Street West，靠近天空塔、高速及各大超市。房间干净明亮；租期、人数与具体入住安排，请联系我们确认。'],heroImage:photos.room1[0],gallery:photos.room1.slice(0,6),mood:'Light & everyday comfort'},
  {...shared,id:'room2',slug:'golden-hour-residence',name:'Golden Hour Residence',chineseName:'暖光公寓',shortDescription:'窗边的光，用餐的空间，属于自己的生活节奏。',description:['卧室窗边的暮色、用餐区与厨房，让暖光公寓拥有温和的居住氛围。家具家电与水电网络已包含，房间干净明亮。','同样位于 147 Victoria Street West。出行与采购方便，适合上班族或学生。请告诉我们你的入住日期，了解房源、费用与租期。'],heroImage:photos.room2[0],gallery:photos.room2,mood:'Natural light & quiet evenings'},
  {...shared,id:'room3',slug:'skyline-residence',name:'Skyline Residence',chineseName:'天空塔景公寓',shortDescription:'让天空塔与城市暮色，成为窗外的风景。',description:['落地窗将卧室与奥克兰的城市景观连接起来。天空塔景公寓拥有干净明亮的房间，家具家电、水电网络包含在内。','位于 147 Victoria Street West，靠近高速及各大超市，生活与出行便利。适合上班族或学生，欢迎联系了解具体入住安排。'],heroImage:{...photos.room3[0],position:'70% 50%'},gallery:photos.room3,mood:'City views & private moments'}
];
export const featuredProperties=properties.filter(p=>p.featured);
const propertyIds=new Set<string>(),slugs=new Set<string>();
for(const property of properties){
  if(propertyIds.has(property.id)||slugs.has(property.slug))throw new Error(`Duplicate property id or slug: ${property.id}`);
  if(!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(property.slug))throw new Error(`Property slug must be a lowercase URL name: ${property.slug}`);
  if(!property.heroImage||!property.gallery.length)throw new Error(`Property requires a hero image and gallery: ${property.id}`);
  for(const key of ['guests','bedrooms','bathrooms','priceFrom'] as const){const value=property[key];if(value!==null&&(!Number.isFinite(value)||value<0||(key==='guests'&&value<1)))throw new Error(`Invalid ${key} on ${property.id}`);}
  for(const key of ['bookingUrl','paymentUrl'] as const){if(property[key]&&!safeExternalUrl(property[key]))throw new Error(`Provide an HTTPS ${key} on ${property.id}`);}
  propertyIds.add(property.id);slugs.add(property.slug);
}
export const brandSlides=[
  {...photos.room2[1],position:'50% 45%'},
  {...photos.room1[4],position:'50% 45%'},
  {...photos.room2[0],position:'55% 45%'}
];
export const editorialPhotos=[photos.room2[2],photos.room1[4],photos.room3[1],photos.room2[1],photos.room2[4],photos.room1[0],photos.room1[5],photos.room2[6]];
export function propertyUrl(p:Property){return `/stays/${p.slug}/`;}
export function enquiryUrl(p:Property){return `/contact/?property=${encodeURIComponent(p.id)}`;}
export function safeExternalUrl(value:string|null){if(!value)return null;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
