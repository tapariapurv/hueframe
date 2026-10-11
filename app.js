const $=id=>document.getElementById(id),$$=(s,el=document)=>[...el.querySelectorAll(s)];
const rand=()=>Math.random()*1e9|0;
const S={style:0,pal:'Sunrise',seed:rand(),inv:false,grain:true,hsl:[18,100,63],q:'4K',dev:'Desktop',clock:true,finish:null};

// Approximate finish colours of popular devices
const DEVICES={
  'MacBook Air':{'Sky Blue':'#c5d9e5',Silver:'#e3e4e6',Starlight:'#e6ddce',Midnight:'#2e3641'},
  'MacBook Pro':{'Space Black':'#2b2b2d',Silver:'#e3e4e6'},
  iMac:{Blue:'#3f6fa8',Green:'#4f8f6e',Pink:'#e4767f',Silver:'#d7d8da',Yellow:'#f4c64b',Orange:'#ef7f3d',Purple:'#8a73b8'},
  'iPhone 17 Pro':{'Cosmic Orange':'#f2762e','Deep Blue':'#2f3d58',Silver:'#e3e3e1'},
  'iPhone Air':{'Sky Blue':'#cfe0ea','Light Gold':'#ead9b8','Cloud White':'#f3f3f1','Space Black':'#1f1f21'},
  'iPhone 17':{Lavender:'#c9bde3','Mist Blue':'#a9bfd6',Sage:'#b8c6a6',White:'#f2f2f0',Black:'#2a2a2c'},
  'iPad Air':{Blue:'#9db5cf',Purple:'#b8a9d1',Starlight:'#e6ddce','Space Gray':'#5b5d61'},
  'iPad Pro':{Silver:'#e3e4e6','Space Black':'#2b2b2d'},
  'Pixel 10':{Indigo:'#3c3f6b',Frost:'#d9e4ec',Lemongrass:'#d9e08a',Obsidian:'#202124'},
  'Galaxy S25':{Icyblue:'#bcd3e6',Mint:'#cfe6d6',Navy:'#27324a','Silver Shadow':'#c7c9cc'},
};
// ponytail: curated picks, a real community feed needs a database + submissions
const COMMUNITY=[['Golden Hour','Hills','Sunrise',101],['Neon Drive','Synthwave','Synth',7],['Glacier','Mountains','Arctic',33,1],['Deep Field','Planet','Nebula',4],
  ['Matcha Latte','Waves','Matcha',12,1],['Ember Rings','Arcs','Fire',8],['Midnight Pines','Forest','Ocean',21],['Rose Quartz','Nested','Rose',5],
  ['Toxic Flow','Flow','Toxic',9],['Paper Dunes','Dunes','Desert',3,1],['Moonrise','Night','Blue',77],['Candy Grid','Bauhaus','Candy',2],
  ['Lavender Haze','Mesh','Lavender',14],['Northern Lights','Aurora','Mint',40],['Gold Leaf','Topo','Gold',6],['After Hours','City','Purple',18]]
  .map(([name,style,pal,seed,inv])=>({name,style:STY.findIndex(s=>s[0]==style),pal,seed,inv:!!inv,grain:true,hsl:S.hsl}));
const link=st=>`#/create?style=${encodeURIComponent(STY[st.style][0])}&pal=${encodeURIComponent(st.pal)}&seed=${st.seed}&tone=${st.inv?'light':'dark'}`;
const tick=()=>new Promise(requestAnimationFrame);
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t.t);t.t=setTimeout(()=>t.classList.remove('show'),1800)};

// ---------- theme + routing ----------
$('theme').onclick=()=>{const t=document.documentElement.dataset.theme=='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.theme=t}catch{}};
function route(){
  const[v,q]=location.hash.slice(2).split('?'),view=v=='create'?'create':'home';
  $$('.view').forEach(e=>e.hidden=e.id!=view);$$('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v==view));
  if(view=='create'){if(q)load(new URLSearchParams(q));render(true)}else home();
  scrollTo(0,0)}
addEventListener('hashchange',route);
function load(p){
  const i=STY.findIndex(s=>s[0]==p.get('style'));if(i>=0)S.style=i;
  if(p.get('hex')){setColor(rgb2hsl(...hex2rgb('#'+p.get('hex'))));S.pal='Custom';tab('custom')}else if(PAL[p.get('pal')])S.pal=p.get('pal');
  if(p.get('seed'))S.seed=+p.get('seed')|0;S.inv=p.get('tone')=='light'}
function save(){const p=new URLSearchParams({style:STY[S.style][0],pal:S.pal,seed:S.seed,tone:S.inv?'light':'dark'});
  if(S.pal=='Custom'){p.delete('pal');p.set('hex',$('hex').value.slice(1))}history.replaceState(null,'','#/create?'+p)}

// ---------- home ----------
let homeReady=false,heroI=0;
async function home(){
  if(homeReady)return;homeReady=true;const pals=Object.keys(PAL);
  const styles=STY.map((s,i)=>({style:i,pal:pals[i*7%pals.length],seed:i*97+11,inv:false,grain:true,hsl:S.hsl}));
  $('homeStyles').innerHTML=styles.map(st=>`<a class="card" href="${link(st)}"><canvas width="420" height="262"></canvas><span>${STY[st.style][0]}<em>Open →</em></span></a>`).join('');
  $('community').innerHTML=COMMUNITY.map(st=>`<a class="wp" href="${link(st)}"><canvas width="300" height="650"></canvas><b>${st.name}</b><small>${STY[st.style][0]} · ${st.pal}</small></a>`).join('');
  hero();setInterval(()=>{if(!$('home').hidden)hero()},5000);
  const jobs=[...$$('#homeStyles canvas').map((c,i)=>[c,styles[i]]),...$$('#community canvas').map((c,i)=>[c,COMMUNITY[i]])];
  for(let i=0;i<jobs.length;i++){const[c,st]=jobs[i];draw(c,c.width,c.height,st);if(i%3==2)await tick()}}
function hero(){
  const st=COMMUNITY[heroI++%COMMUNITY.length];
  for(const[id,kind]of[['heroD','Desktop'],['heroP','iPhone']]){const cv=$(id),c=draw(cv,cv.width,cv.height,st);clock(c,cv.width,cv.height,kind);cv.animate([{opacity:.3},{opacity:1}],{duration:700,easing:'ease-out'})}
  $('now').innerHTML=`Now showing <a href="${link(st)}">${st.name}</a> · ${STY[st.style][0]} in ${st.pal}`}
$('explore').onclick=()=>$('styleSec').scrollIntoView({behavior:'smooth'});

// ---------- editor ----------
let thumbsDirty=true,queued=0;
function render(thumbs){thumbsDirty||=!!thumbs;if(queued)return;queued=requestAnimationFrame(()=>{queued=0;
  const dpr=Math.min(2,devicePixelRatio||1);
  for(const k in DEV){const[w,h,id]=DEV[k],cv=$(id),ph=(cv.clientHeight||300)*dpr,c=draw(cv,Math.round(w*ph/h),Math.round(ph),S);if(S.clock)clock(c,cv.width,cv.height,k)}
  if(thumbsDirty)$$('#styles canvas').forEach((cv,i)=>draw(cv,200,125,{...S,style:i}));thumbsDirty=false;
  const name=STY[S.style][0],q=QUAL[S.q],[w,h]=DEV[S.dev];
  $('sname').textContent=name;$('pname').textContent=`${S.pal=='Custom'?(S.finish||'Custom '+$('hex').value):S.pal} · ${S.inv?'Light':'Dark'} tone · variation #${S.seed%10000}`;
  $$('.st').forEach((b,i)=>b.classList.toggle('on',i==S.style));
  $$('.sw').forEach(b=>b.classList.toggle('on',b.title==S.pal));
  $$('.finish').forEach(b=>b.classList.toggle('on',S.pal=='Custom'&&S.finish==b.dataset.n));
  $$('#tone button').forEach(b=>b.classList.toggle('on',+b.dataset.v==S.inv));
  $$('[data-d]').forEach(b=>b.classList.toggle(b.classList.contains('dev')?'sel':'on',b.dataset.d==S.dev));
  $('dl').innerHTML=`Download <small>${Math.round(w*q)}×${Math.round(h*q)}</small>`;
  save()})}
const set=(o,thumbs=true)=>{Object.assign(S,o);render(thumbs)};

$('styles').innerHTML=STY.map(s=>`<button class="st"><canvas width="200" height="125"></canvas>${s[0]}</button>`).join('');
$('styles').onclick=e=>{const b=e.target.closest('.st');if(b)set({style:$$('.st').indexOf(b)},false)};
const moreLabel=()=>$('more').textContent=$('styles').classList.contains('collapsed')?`Show all ${STY.length} styles`:'Show fewer';
$('more').onclick=()=>{$('styles').classList.toggle('collapsed');moreLabel()};moreLabel();

$('swatches').innerHTML=Object.keys(PAL).map(k=>`<button class="sw" title="${k}" style="background:linear-gradient(135deg,${PAL[k].join(',')})"></button>`).join('');
$('swatches').onclick=e=>{const b=e.target.closest('.sw');if(b)set({pal:b.title})};
const tab=t=>{$$('#ctabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));$$('.pane').forEach(p=>p.hidden=p.dataset.p!=t)};
$('ctabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;tab(t);if(t!='pal'&&S.pal!='Custom')set({pal:'Custom'})};

// colour picker: S.hsl is the source of truth, every control syncs from it
const wc=$('wc').getContext('2d');
if(wc.createConicGradient){const g=wc.createConicGradient(0,132,132);for(let i=0;i<=12;i++)g.addColorStop(i/12,`hsl(${i*30} 100% 50%)`);wc.fillStyle=g;wc.fillRect(0,0,264,264)}
{const g=wc.createRadialGradient(132,132,0,132,132,132);g.addColorStop(0,'#fff');g.addColorStop(1,'rgb(255 255 255/0)');wc.fillStyle=g;wc.fillRect(0,0,264,264)}
function setColor(hsl,from,finish=null){
  S.hsl=hsl.map(v=>Math.round(v*10)/10);S.finish=finish;const[h,s,l]=S.hsl,rgb=hsl2rgb(h,s,l).map(Math.round),hex=rgb2hex(rgb);
  if(from!='hex')$('hex').value=hex;if(from!='rgb')['cr','cg','cb'].forEach((id,i)=>$(id).value=rgb[i]);$('native').value=hex;
  [['sh',h],['ss',s],['sl',l]].forEach(([id,v])=>{$(id).value=v;$('v'+id[1]).textContent=Math.round(v)});
  $('sh').style.background='linear-gradient(90deg,'+[0,60,120,180,240,300,360].map(x=>`hsl(${x} ${s}% ${l}%)`)+')';
  $('ss').style.background=`linear-gradient(90deg,hsl(${h} 0% ${l}%),hsl(${h} 100% ${l}%))`;
  $('sl').style.background=`linear-gradient(90deg,#000,hsl(${h} ${s}% 50%),#fff)`;
  const a=h*Math.PI/180;Object.assign($('mark').style,{left:66+Math.cos(a)*s/100*66+'px',top:66+Math.sin(a)*s/100*66+'px',background:hex});
  if(from)set({pal:'Custom'})}
const fromRGB=(rgb,from,finish)=>setColor(rgb2hsl(...rgb),from,finish);
$('hex').oninput=e=>{let v=e.target.value.trim();if(v[0]!='#')v='#'+v;if(/^#[0-9a-f]{3}$/i.test(v))v='#'+[...v.slice(1)].map(x=>x+x).join('');if(/^#[0-9a-f]{6}$/i.test(v))fromRGB(hex2rgb(v),'hex')};
['cr','cg','cb'].forEach(id=>$(id).oninput=()=>fromRGB(['cr','cg','cb'].map(i=>Math.min(255,Math.max(0,+$(i).value||0))),'rgb'));
['sh','ss','sl'].forEach(id=>$(id).oninput=()=>setColor(['sh','ss','sl'].map(i=>+$(i).value),'slider'));
$('native').oninput=e=>fromRGB(hex2rgb(e.target.value),'native');
const wheel=e=>{const b=$('wheel').getBoundingClientRect(),dx=e.clientX-b.left-66,dy=e.clientY-b.top-66;setColor([(Math.atan2(dy,dx)*180/Math.PI+360)%360,Math.min(100,Math.hypot(dx,dy)/66*100),S.hsl[2]],'wheel')};
$('wheel').onpointerdown=e=>{$('wheel').setPointerCapture(e.pointerId);wheel(e);$('wheel').onpointermove=wheel};
$('wheel').onpointerup=()=>$('wheel').onpointermove=null;
// EyeDropper samples anywhere on screen (Chrome/Edge); elsewhere open the OS picker, which has its own eyedropper
$('drop').onclick=async()=>{if(!window.EyeDropper)return $('native').click();try{fromRGB(hex2rgb((await new EyeDropper().open()).sRGBHex),'drop')}catch{}};
setColor(S.hsl);

let model=Object.keys(DEVICES)[0];
function devices(){
  $('models').innerHTML=Object.keys(DEVICES).map(m=>`<button class="chip ${m==model?'on':''}">${m}</button>`).join('');
  $('finishes').innerHTML=Object.entries(DEVICES[model]).map(([n,h])=>`<button class="finish" data-n="${model} ${n}" data-hex="${h}"><i style="background:${h}"></i>${n}</button>`).join('');render()}
$('models').onclick=e=>{if(e.target.matches('.chip')){model=e.target.textContent;devices()}};
$('finishes').onclick=e=>{const b=e.target.closest('.finish');if(b){fromRGB(hex2rgb(b.dataset.hex),'device',b.dataset.n);toast(`Matched ${b.dataset.n}`)}};
devices();

$('tone').onclick=e=>{if(e.target.dataset.v)set({inv:e.target.dataset.v=='1'})};
$('grain').onchange=e=>set({grain:e.target.checked});
$('clock').onchange=e=>set({clock:e.target.checked},false);
$$('[data-d]').forEach(b=>b.onclick=()=>set({dev:b.dataset.d},false));
$('qual').onchange=e=>set({q:e.target.value},false);
const remix=()=>{$('remix').classList.remove('spin');void $('remix').offsetWidth;$('remix').classList.add('spin');set({seed:rand()})};
$('remix').onclick=remix;
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied')}catch{toast('Copy the address bar to share')}};
addEventListener('keydown',e=>{if($('create').hidden||e.target.matches('input,select'))return;
  if(e.key==' '){e.preventDefault();remix()}else if(e.key=='ArrowRight'||e.key=='ArrowLeft'){e.preventDefault();set({style:(S.style+(e.key=='ArrowRight'?1:STY.length-1))%STY.length},false)}});
$('dl').onclick=()=>{const b=$('dl'),q=QUAL[S.q],[w,h]=DEV[S.dev];b.textContent='Rendering…';
  setTimeout(()=>{const cv=document.createElement('canvas');draw(cv,Math.round(w*q),Math.round(h*q),S);
    cv.toBlob(blob=>{render();if(!blob)return toast('Too large for this browser, try 4K');
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`hueframe-${STY[S.style][0]}-${S.dev}-${S.q}.png`.toLowerCase().replace(/ /g,'-');a.click();toast('Saved to your downloads')},'image/png')},30)};
addEventListener('resize',()=>render());
route();
