import type {APIRoute} from 'astro';
export const GET:APIRoute=({site})=>new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',site||'http://127.0.0.1:4173').href}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
