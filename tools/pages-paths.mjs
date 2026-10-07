import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Astro handles bundled assets; editorial HTML and public fonts also need the repository prefix.
export default function pagesPaths(){return {name:'victoria-pages-paths',hooks:{'astro:build:done':async({dir})=>{
 const base=(process.env.PUBLIC_BASE_PATH||'/').replace(/\/$/,'');if(!base)return;
 const origin=(process.env.PUBLIC_SITE_URL||'').replace(/\/$/,'');
 const prefix=value=>value.startsWith('/')&&!value.startsWith('//')&&value!==base&&!value.startsWith(base+'/')?base+value:value;
 async function visit(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory()){await visit(file);continue;}if(!/\.(html|css|xml|txt)$/.test(file))continue;
  let text=await readFile(file,'utf8');
  if(file.endsWith('.html'))text=text.replace(/\b(href|src|srcset|data-original|data-deferred-src|data-deferred-srcset)="([^"]*)"/g,(_,attr,value)=>`${attr}="${value.replace(/(^|,\s*)(\/[^\s,]*)/g,(_match,space,url)=>space+prefix(url))}"`);
  if(file.endsWith('.css'))text=text.replace(/url\((["']?)(\/[^)'"\s]*)/g,(_,quote,url)=>`url(${quote}${prefix(url)}`);
  if(origin)text=text.replaceAll(origin+'/',origin+base+'/').replaceAll(origin+base+base+'/',origin+base+'/');
  await writeFile(file,text);
 }}await visit(fileURLToPath(dir));
}}};}
