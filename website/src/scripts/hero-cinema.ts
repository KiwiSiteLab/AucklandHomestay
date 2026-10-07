/** Adapted from the user's love and peace/js/cinematic-background.js:
 * FBM fog dissolve, restrained displacement, two textures, CSS still fallback.
 * Render only during a transition; the idle photograph stays at native DOM resolution.
 */
type Scene=HTMLElement;
export function createHeroCinema(hero:HTMLElement){
 const canvas=hero.querySelector<HTMLCanvasElement>('.hero-canvas');if(!canvas)return null;
 let gl:WebGLRenderingContext|null=null;try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});}catch{return null;}if(!gl)return null;
 const gpu=gl;const vertex=`attribute vec2 aPosition;varying vec2 vUv;void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
 const fragment=`precision mediump float;
 varying vec2 vUv;uniform sampler2D uCurrent,uNext;uniform vec2 uResolution,uCurrentSize,uNextSize,uCurrentPosition,uNextPosition;uniform float uProgress,uCurrentScale,uNextScale,uCurrentPortrait,uNextPortrait;
 float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=noise(p)*a;p=p*2.03+vec2(7.2,3.4);a*=.5;}return v;}
 vec2 cover(vec2 uv,vec2 size,vec2 pos){float va=uResolution.x/uResolution.y,ia=size.x/size.y;vec2 s=ia>va?vec2(va/ia,1.):vec2(1.,ia/va);return clamp(uv*s+vec2(pos.x,1.-pos.y)*(1.-s),.001,.999);}
 vec3 photo(sampler2D tex,vec2 uv,vec2 size,vec2 pos,float scale,float portrait){
  uv=(uv-.5)/scale+.5;
  if(portrait>.5&&uResolution.x/uResolution.y>1.05){
   vec2 bg=cover(uv,size,vec2(.6,.5));vec3 ambient=vec3(0.);
   for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)ambient+=texture2D(tex,clamp(bg+vec2(float(x),float(y))*.018,.001,.999)).rgb/9.;
   ambient*=.52;float w=(size.x/size.y)/(uResolution.x/uResolution.y);float left=.95-w;vec2 sharp=vec2((uv.x-left)/w,uv.y);
   float mask=smoothstep(0.,.12,sharp.x)*(1.-smoothstep(.90,1.,sharp.x));
   return mix(ambient,texture2D(tex,clamp(sharp,.001,.999)).rgb,mask);
  }
  return texture2D(tex,cover(uv,size,pos)).rgb;
 }
 void main(){float p=uProgress;float pulse=sin(3.14159265*p);vec2 uv=vUv;vec2 flow=vec2(fbm(uv*3.1+1.7),fbm(uv*3.1+6.4))-.5;
 float fog=fbm(vec2(uv.x*3.6,uv.y*4.2));float edge=clamp(fog*.55+uv.y*.25+.12,0.,1.);
 float mask=smoothstep(edge-.20,edge+.20,p*1.4-.2);
 if(p<.001)mask=0.;if(p>.999)mask=1.;
 vec3 a=photo(uCurrent,uv+flow*.007*pulse,uCurrentSize,uCurrentPosition,uCurrentScale,uCurrentPortrait);
 vec3 b=photo(uNext,uv-flow*.006*pulse,uNextSize,uNextPosition,uNextScale,uNextPortrait);
 gl_FragColor=vec4(mix(a,b,mask),1.);}`;
 const compile=(type:number,source:string)=>{const shader=gpu.createShader(type)!;gpu.shaderSource(shader,source);gpu.compileShader(shader);if(!gpu.getShaderParameter(shader,gpu.COMPILE_STATUS))throw Error(gpu.getShaderInfoLog(shader)||'Shader failed');return shader;};
 let program:WebGLProgram;try{program=gpu.createProgram()!;const vs=compile(gpu.VERTEX_SHADER,vertex),fs=compile(gpu.FRAGMENT_SHADER,fragment);gpu.attachShader(program,vs);gpu.attachShader(program,fs);gpu.linkProgram(program);gpu.deleteShader(vs);gpu.deleteShader(fs);if(!gpu.getProgramParameter(program,gpu.LINK_STATUS))throw Error('Program failed');}catch{hero.dataset.renderer='css';return null;}
 gpu.useProgram(program);const buffer=gpu.createBuffer();gpu.bindBuffer(gpu.ARRAY_BUFFER,buffer);gpu.bufferData(gpu.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gpu.STATIC_DRAW);const attribute=gpu.getAttribLocation(program,'aPosition');gpu.enableVertexAttribArray(attribute);gpu.vertexAttribPointer(attribute,2,gpu.FLOAT,false,0,0);
 const uniform=(name:string)=>gpu.getUniformLocation(program,name);const textures:WebGLTexture[]=[];let frame=0,finish:((ok:boolean)=>void)|null=null,lost=false;
 const release=()=>{textures.splice(0).forEach(texture=>gpu.deleteTexture(texture));};
 const hide=()=>{canvas.classList.remove('is-rendering');};
 const stop=(ok:boolean)=>{cancelAnimationFrame(frame);const resolve=finish;finish=null;if(!ok)hide();resolve?.(ok);};
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;hero.dataset.renderer='css';stop(false);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&finish)stop(false);});
 const transition=(from:Scene,to:Scene,duration=3200)=>new Promise<boolean>(resolve=>{
  if(lost){resolve(false);return;}stop(false);release();finish=resolve;
  const box=hero.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5),factor=Math.min(dpr,2200/box.width);canvas.width=Math.round(box.width*factor);canvas.height=Math.round(box.height*factor);gpu.viewport(0,0,canvas.width,canvas.height);gpu.uniform2f(uniform('uResolution'),box.width,box.height);
  try{[from,to].forEach((scene,index)=>{const img=scene.querySelector<HTMLImageElement>('.hero-sharp img')!;const texture=gpu.createTexture()!;textures.push(texture);gpu.activeTexture(gpu.TEXTURE0+index);gpu.bindTexture(gpu.TEXTURE_2D,texture);gpu.pixelStorei(gpu.UNPACK_FLIP_Y_WEBGL,1);gpu.texParameteri(gpu.TEXTURE_2D,gpu.TEXTURE_WRAP_S,gpu.CLAMP_TO_EDGE);gpu.texParameteri(gpu.TEXTURE_2D,gpu.TEXTURE_WRAP_T,gpu.CLAMP_TO_EDGE);gpu.texParameteri(gpu.TEXTURE_2D,gpu.TEXTURE_MIN_FILTER,gpu.LINEAR);gpu.texParameteri(gpu.TEXTURE_2D,gpu.TEXTURE_MAG_FILTER,gpu.LINEAR);gpu.texImage2D(gpu.TEXTURE_2D,0,gpu.RGB,gpu.RGB,gpu.UNSIGNED_BYTE,img);const prefix=index?'uNext':'uCurrent';gpu.uniform1i(uniform(prefix),index);gpu.uniform2f(uniform(prefix+'Size'),img.naturalWidth,img.naturalHeight);const positions=getComputedStyle(img).objectPosition.split(' ').map(v=>parseFloat(v)/100);gpu.uniform2f(uniform(prefix+'Position'),positions[0],positions[1]);gpu.uniform1f(uniform(prefix+'Scale'),1);gpu.uniform1f(uniform(prefix+'Portrait'),scene.dataset.portrait==='true'?1:0);});}catch{stop(false);return;}
  const start=performance.now();let previous=0;canvas.classList.add('is-rendering');hero.dataset.renderer='webgl';
  const render=(now:number)=>{if(lost)return;const elapsed=now-start,t=Math.min(1,elapsed/duration);if(now-previous>=30||t===1){previous=now;const p=t*t*(3-2*t);gpu.uniform1f(uniform('uProgress'),p);gpu.drawArrays(gpu.TRIANGLES,0,6);}if(t<1)frame=requestAnimationFrame(render);else stop(true);};render(start);
 });
 return {transition,hide,destroy(){stop(false);release();gpu.deleteBuffer(buffer);gpu.deleteProgram(program);}};
}
