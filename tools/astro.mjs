import {spawn} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../website');
const child=spawn(process.execPath,[path.join(root,'node_modules/astro/bin/astro.mjs'),...process.argv.slice(2)],{cwd:root,env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'inherit',windowsHide:true});
child.on('exit',code=>process.exit(code??1));child.on('error',error=>{process.stderr.write(error.message);process.exit(1);});
