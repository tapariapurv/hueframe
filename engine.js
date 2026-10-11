const DEV={Desktop:[3840,2160,'pD'],iPad:[2064,2752,'pT'],iPhone:[1320,2868,'pP']};
const QUAL={'4K':1,'6K':1.5,'8K':2};
// 4 anchors per palette, dark -> light; expanded to an 11-step ramp
const PAL={Charcoal:['#050505','#2a2a2a','#8c8c8c','#f5f5f5'],Stone:['#1a1714','#534e47','#9f9688','#ece6dc'],Blue:['#01052b','#0825c7','#58a3ff','#edf8ff'],
Sunrise:['#031c35','#0b4b7a','#ff7240','#fff0c8'],Fire:['#1a0000','#b30000','#ff9500','#fff1c2'],Purple:['#100014','#5c0085','#b84dff','#f7ebff'],
Toxic:['#050807','#1e3325','#86b326','#f6ffe0'],Arctic:['#081018','#33516a','#a7c2d3','#ffffff'],Neon:['#13051a','#3b2285','#2ca1e8','#e0fbfd'],
Forest:['#051214','#18524c','#68ba89','#c3ebd0'],Nebula:['#120414','#5c1a5c','#c85b98','#fff1f6'],Ocean:['#020c1b','#0d3b6e','#30a5b8','#d4fff2'],
'Blood Moon':['#000000','#330000','#880000','#ff3a2a'],Peach:['#3b1f2b','#c2566b','#f4a28c','#fff1e6'],Lavender:['#1a1530','#5a4a9e','#b9a3e8','#f6effd'],
Matcha:['#141a10','#4a5e32','#a3b86c','#f5f3e1'],Desert:['#2a160d','#8c4426','#e0a066','#faf0dc'],Candy:['#2b0f3a','#ff4fa3','#ffc46b','#fffbe6'],
Mint:['#06201d','#167d6e','#6fdcc0','#effcf7'],Gold:['#120d02','#5c4206','#d4a017','#fff6d6'],Synth:['#0d0221','#541388','#ff2a6d','#ffd319'],
Rose:['#1f0a14','#7d1d42','#e27aa3','#fde4ee'],Sky:['#0a1a33','#2e6bb8','#8cc8f2','#f2fbff'],Autumn:['#1a0d05','#7a2e12','#d9822b','#f7e3b5']};


// ---------- colour maths ----------
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const rgb2hex=a=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const hsl2rgb=(h,s,l)=>{h=(h%360+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l);return[0,8,4].map(n=>255*(l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1))))};
const rgb2hsl=(r,g,b)=>{r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m,l=(M+m)/2,s=d?d/(1-Math.abs(2*l-1)):0,h=!d?0:M==r?((g-b)/d+6)%6:M==g?(b-r)/d+2:(r-g)/d+4;return[h*60,s*100,l*100]};
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function ramp(st){const name=st.pal;
  if(name=="Custom"){const[h,s,l]=st.hsl,L=Math.min(.9,Math.max(.1,l/100));
    // ramp passes exactly through the picked colour at t=L
    return Array.from({length:11},(_,i)=>{const t=i/10,lt=t<L?4+(l-4)*t/L:l+(97-l)*(t-L)/(1-L);return hsl2rgb(h+(t-L)*25,s*(1-.35*Math.abs(t-L)),Math.min(98,Math.max(2,lt)))})}
  const A=PAL[name].map(hex2rgb);return Array.from({length:11},(_,i)=>{const x=i/10*3,j=Math.min(2,x|0);return lerp(A[j],A[j+1],x-j)})}
let RAMP,INV;
function col(t,a){t=Math.min(1,Math.max(0,INV?1-t:t))*10;const i=Math.min(9,t|0),[r,g,b]=lerp(RAMP[i],RAMP[i+1],t-i).map(Math.round);return a==null?`rgb(${r} ${g} ${b})`:`rgb(${r} ${g} ${b}/${a})`}

// ---------- drawing helpers ----------
const rng=s=>()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const lg=(c,x0,y0,x1,y1,s)=>{const g=c.createLinearGradient(x0,y0,x1,y1);s.forEach((k,i)=>g.addColorStop(i/(s.length-1),k));return g};
const dot=(c,x,y,r,f)=>{c.fillStyle=f;c.beginPath();c.arc(x,y,Math.max(r,0),0,7);c.fill()};
const fill=(K,f)=>{K.c.fillStyle=f;K.c.fillRect(0,0,K.W,K.H)};
const sky=(K,a,b)=>fill(K,lg(K.c,0,0,0,K.H,[col(a),col(b)]));
const glow=(K,x,y,R,t)=>{const g=K.c.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,col(t,.85));g.addColorStop(1,col(t,0));fill(K,g)};
const stars=(K,n,maxY)=>{for(let i=0;i<n;i++)dot(K.c,K.r()*K.W,K.r()*K.H*maxY,K.u*.0013*(.4+K.r()),col(1,K.r()*.9))};
const ridge=(K,f,style)=>{const{c,W,H}=K;c.fillStyle=style;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W+W/500;x+=W/500)c.lineTo(x,f(x/W));c.lineTo(W,H);c.fill()};
const wave=(c,W,y,a,f,ph)=>{for(let x=0;x<=W;x+=W/150){const t=x/W*6.28*f;c.lineTo(x,y+a*Math.sin(t+ph)+a*.4*Math.sin(t*2.3+ph*1.7))}};
const shadow=(c,u,a=.35,dy=0)=>{c.shadowColor=`rgb(0 0 0/${a})`;c.shadowBlur=u*.035;c.shadowOffsetY=dy*u};

// ---------- styles (first 9 shown, rest behind "see more") ----------
const STY=[
['Hills',K=>{const{c,W,H,u,r,n1}=K;sky(K,.12,.5);const x=W*(.2+r()*.6),y=H*(.25+r()*.12);glow(K,x,y,u*.5,.85);dot(c,x,y,u*.055,col(.97));
  for(let i=0;i<6;i++){const o=r()*99;ridge(K,t=>H*(.45+i*.085)+n1(t*(1.6+i*.5)+o)*u*(.32-i*.03),col(.44-i*.075))}}],
['Mountains',K=>{const{c,W,H,u,r,n1}=K;sky(K,.05,.5);const x=W*(.15+r()*.7),y=H*(.15+r()*.12);glow(K,x,y,u*.35,.75);dot(c,x,y,u*.045,col(.97));
  for(let i=0;i<5;i++){const o=r()*99;ridge(K,t=>H*(.52+i*.1)-Math.abs(n1(t*(2+i*.8)+o,8))*u*(.9-i*.13),col(.46-i*.09))}}],
['Forest',K=>{const{c,W,H,u,r,n1}=K;sky(K,.1,.5);const sx=W*(.2+r()*.6),sy=H*(.2+r()*.1);glow(K,sx,sy,u*.45,.85);dot(c,sx,sy,u*.05,col(.97));
  for(let i=0;i<5;i++){const cl=col(.46-i*.09),o=r()*99,f=t=>H*(.5+i*.1)+n1(t*(1.5+i*.4)+o)*u*.22,s=u*(.022+i*.01);ridge(K,f,cl);c.fillStyle=cl;c.beginPath();
    for(let x=-s;x<W+s;x+=s*(.4+r()*.6)){const y=f(x/W)+s*.4,h=s*(2.2+r()*1.6);for(let k=0;k<3;k++){const ty=y-h*k*.27,w=s*(.6-k*.15);c.moveTo(x,ty-h*.46);c.lineTo(x+w,ty);c.lineTo(x-w,ty)}}c.fill()}}],
['Waves',K=>{const{c,H,u,r}=K;const f=.5+r()*1.2,ph=r()*6,a=u*(.03+r()*.05);shadow(c,u,.4,-.006);
  for(let i=0;i<9;i++){const y0=H*(.1+i*.1);ridge(K,x=>y0+a*Math.sin(x*6.28*f+ph+i*.7)+a*.5*Math.sin(x*14+ph*2+i),col(.12+i*.1))}}],
['Dunes',K=>{const{c,W,H,u,r}=K;sky(K,.3,.75);const x=W*(.2+r()*.6),y=H*(.25+r()*.1);glow(K,x,y,u*.45,.98);dot(c,x,y,u*.065,col(1));
  for(let i=0;i<5;i++){const y0=H*(.5+i*.11),a=u*(.04+r()*.05),f=.4+r()*.8,ph=r()*6,t=.62-i*.13;ridge(K,x=>y0+a*Math.sin(x*6.28*f+ph)+a*.3*Math.sin(x*17+ph),lg(c,0,y0-a,W*.6,y0+a*4,[col(t+.14),col(t),col(t-.1)]))}}],
['Arcs',K=>{const{c,W,H,u,r}=K;const cx=W*(.15+r()*.7),cy=H*(r()<.5?1.02:.75+r()*.2),n=8+(r()*6|0),st=Math.hypot(W,H)*1.05/n;shadow(c,u,.35);
  for(let k=n;k>0;k--)dot(c,cx,cy,k*st,col(.08+.9*(1-k/n)))}],
['Mesh',K=>{const{c,W,H,u,r}=K;fill(K,col(.15));c.filter=`blur(${u*.14}px)`;for(let i=0;i<9;i++)dot(c,r()*W,r()*H,u*(.2+r()*.4),col(.15+r()*.85))}],
['Aurora',K=>{const{c,W,H,u,r,n1}=K;sky(K,0,.22);stars(K,260,.8);c.globalCompositeOperation='lighter';c.filter=`blur(${u*.035}px)`;
  for(let i=0;i<7;i++){const o=r()*99,y0=H*(.2+r()*.35),a=u*(.25+r()*.3);c.strokeStyle=col(.55+r()*.45,.35);c.lineWidth=u*(.03+r()*.1);c.beginPath();for(let x=-.1;x<=1.1;x+=.005)c.lineTo(x*W,y0+n1(x*2+o,3)*a);c.stroke()}
  c.globalCompositeOperation='source-over';c.filter='none';ridge(K,x=>H*.86+n1(x*3+r()*9)*u*.14,col(.02))}],
['Silk',K=>{const{c,W,H,u,r}=K;fill(K,col(.04));const n=80,a=u*(.1+r()*.2),f=.5+r(),ph=r()*6,dp=(r()-.5)*.05,y0=H*(.35+r()*.3),sp=u*(.003+r()*.004);
  c.lineWidth=u*.0018;c.strokeStyle=lg(c,0,0,W,H,[col(.35),col(.7),col(1)]);for(let i=0;i<n;i++){c.globalAlpha=.15+.85*Math.sin(i/n*3.14);c.beginPath();wave(c,W,y0+(i-n/2)*sp,a*(1+i/n*.5),f,ph+i*dp);c.stroke()}}],
['Topo',K=>{const{c,W,H,u,r}=K;fill(K,col(.05));const cx=r()*W,cy=r()*H,a1=r()*6,a2=r()*6,a3=r()*6,g=u*.025;c.globalAlpha=.8;
  for(let k=1;k*g*.7<Math.hypot(W,H);k++){const hi=k%5==0;c.strokeStyle=col(hi?.75:.35);c.lineWidth=u*(hi?.0035:.0018);c.beginPath();
    for(let a=0;a<6.3;a+=.015){const m=1+.18*Math.sin(a*3+a1+k*.05)+.1*Math.sin(a*5+a2-k*.08)+.06*Math.sin(a*2+a3);c.lineTo(cx+Math.cos(a)*k*g*m,cy+Math.sin(a)*k*g*m)}c.closePath();c.stroke()}}],
['Bokeh',K=>{const{c,W,H,u,r}=K;fill(K,lg(c,0,0,W,H,[col(.02),col(.28)]));c.globalCompositeOperation='screen';
  for(let l=0;l<3;l++){c.filter=`blur(${u*.012*(2-l)}px)`;for(let i=0;i<16;i++){c.globalAlpha=.15+r()*.35;dot(c,r()*W,r()*H,u*(.02+r()*.07)*(3-l)/1.5,col(.5+r()*.5))}}}],
['Bauhaus',K=>{const{c,W,H,u,r}=K;const s=u/(3+(r()*4|0)),q=()=>col((r()*5|0)/4*.9+.05);
  for(let y=0;y<H;y+=s)for(let x=0;x<W;x+=s){const b=q();let f;do f=q();while(f==b);c.fillStyle=b;c.fillRect(x,y,s+1,s+1);c.save();c.beginPath();c.rect(x,y,s,s);c.clip();const t=r()*4|0,k=r()*4|0;
    if(t==0)dot(c,x+(k&1)*s,y+(k>>1)*s,s,f);else if(t==1)dot(c,x+[s/2,s,s/2,0][k],y+[0,s/2,s,s/2][k],s/2,f);else if(t==2)dot(c,x+s/2,y+s/2,s*.38,f);c.restore()}}],
['Synthwave',K=>{const{c,W,H,u,r}=K;const hz=H*.62,sk=lg(c,0,0,0,hz,[col(0),col(.45)]),sx=W*(.3+r()*.4),R=u*.28,sy=hz-R*.3;c.fillStyle=sk;c.fillRect(0,0,W,hz);stars(K,120,.45);glow(K,sx,sy,R*2.2,.75);
  dot(c,sx,sy,R,lg(c,0,sy-R,0,sy+R,[col(1),col(.62)]));c.fillStyle=sk;for(let k=0;k<7;k++)c.fillRect(sx-R,sy+R*(.05+k*.14),2*R,R*(.015+k*.018));
  c.fillStyle=lg(c,0,hz,0,H,[col(.06),col(.22)]);c.fillRect(0,hz,W,H-hz);c.strokeStyle=col(.85,.85);c.lineWidth=u*.0022;c.shadowColor=col(.9);c.shadowBlur=u*.012;c.beginPath();
  for(let k=1;k<30;k++){const y=hz+(H-hz)*Math.pow(k/14,2.2);if(y>H)break;c.moveTo(0,y);c.lineTo(W,y)}c.moveTo(0,hz);c.lineTo(W,hz);
  for(let k=-40;k<=40;k++){c.moveTo(sx+k*u*.03,hz);c.lineTo(sx+k*u*.4,H)}c.stroke()}],
['Night',K=>{const{c,W,H,u,r,n1}=K;sky(K,0,.38);stars(K,450,.8);const x=W*(.15+r()*.7),y=H*(.15+r()*.2);glow(K,x,y,u*.32,.9);dot(c,x,y,u*.045,col(1));
  const o=r()*9;ridge(K,t=>H*.72+n1(t*2+o)*u*.25,col(.14));ridge(K,t=>H*.84+n1(t*3+o+5)*u*.18,col(.04))}],
['Ripples',K=>{const{c,W,H,u,r}=K;fill(K,col(.03));c.globalCompositeOperation='lighter';c.lineWidth=u*.004;const g=u*.022,D=Math.hypot(W,H);
  for(let j=0;j<2;j++){const cx=r()*W,cy=r()*H;c.strokeStyle=col(.55+j*.35,.55);for(let k=1;k*g<D;k++){c.beginPath();c.arc(cx,cy,k*g,0,7);c.stroke()}}}],
['Nested',K=>{const{c,W,H,u,r,n2}=K;fill(K,col(.04));const cx=W*(.3+r()*.4),cy=H*(.3+r()*.4),o=r()*99,D=Math.hypot(W,H);shadow(c,u,.45);
  for(let k=12;k>0;k--){const R=D*.62*k/12;c.fillStyle=col(.08+.9*(1-k/12));c.beginPath();for(let a=0;a<6.29;a+=.02){const m=R*(1+.45*n2(Math.cos(a)*1.3+o+k*.06,Math.sin(a)*1.3+o));c.lineTo(cx+Math.cos(a)*m,cy+Math.sin(a)*m)}c.fill()}}],
['Spheres',K=>{const{c,W,H,u,r}=K;fill(K,lg(c,0,0,0,H,[col(.04),col(.22)]));shadow(c,u,.5,.015);const B=[];for(let i=0;i<14;i++)B.push([r()*W,r()*H,u*(.03+r()*r()*.25),r()]);B.sort((a,b)=>a[2]-b[2]);
  for(const[x,y,R,t]of B){const g=c.createRadialGradient(x-R*.35,y-R*.4,R*.05,x,y,R);g.addColorStop(0,col(1));g.addColorStop(.5,col(.35+t*.5));g.addColorStop(1,col(.1+t*.3));dot(c,x,y,R,g)}}],
['Papercut',K=>{const{c,H,u,r,n1}=K;fill(K,col(.95));shadow(c,u,.4,-.008);for(let i=0;i<10;i++){const o=r()*99,y0=H*(.06+i*.1);ridge(K,x=>y0+n1(x*(1.2+r()*.01)+o,4)*u*.3,col(.9-i*.09))}}],
['Halftone',K=>{const{c,W,H,u,r,n2}=K;fill(K,col(.04));const s=u*.024,o=r()*9;for(let y=s/2;y<H;y+=s)for(let x=s/2;x<W;x+=s){const v=Math.min(1,Math.max(0,n2(x/u*2+o,y/u*2)*1.4+.5));dot(c,x,y,s*.48*v,col(.25+.75*v))}}],
['Flow',K=>{const{c,W,H,u,r,n2}=K;fill(K,col(.03));c.lineWidth=u*.0016;c.lineCap='round';const o=r()*9;
  for(let i=0;i<900;i++){let x=r()*W,y=r()*H;c.strokeStyle=col(.3+r()*.7,.65);c.beginPath();c.moveTo(x,y);for(let s=0;s<60;s++){const a=n2(x/u*1.4+o,y/u*1.4)*10;x+=Math.cos(a)*u*.006;y+=Math.sin(a)*u*.006;c.lineTo(x,y)}c.stroke()}}],
['Gradient',K=>{const{c,W,H,r}=K;const a=r()*6.28,x=Math.cos(a)*W/2,y=Math.sin(a)*H/2;fill(K,lg(c,W/2-x,H/2-y,W/2+x,H/2+y,[col(0),col(.3),col(.65),col(.95)]));
  c.globalCompositeOperation='soft-light';const g=c.createRadialGradient(W*(.2+r()*.6),H*(.2+r()*.6),0,W/2,H/2,Math.max(W,H));g.addColorStop(0,'#fff');g.addColorStop(1,'#000');fill(K,g)}],
['Low Poly',K=>{const{c,W,H,u,r,n2}=K;const cs=Math.ceil(8*W/u),rs=Math.ceil(8*H/u),sx=W/cs,sy=H/rs,P=[];
  for(let j=0;j<=rs;j++)for(let i=0;i<=cs;i++)P.push([i*sx+(i%cs?(r()-.5)*sx*.8:0),j*sy+(j%rs?(r()-.5)*sy*.8:0)]);
  const tri=(a,b,d)=>{const mx=(a[0]+b[0]+d[0])/3,my=(a[1]+b[1]+d[1])/3,t=(1-my/H)*.75+n2(mx/u*2,my/u*2)*.6+.1;c.fillStyle=c.strokeStyle=col(t);c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(...d);c.fill();c.stroke()};
  for(let j=0;j<rs;j++)for(let i=0;i<cs;i++){const p=j*(cs+1)+i,a=P[p],b=P[p+1],d=P[p+cs+1],e=P[p+cs+2];if(r()<.5){tri(a,b,e);tri(a,e,d)}else{tri(a,b,d);tri(b,e,d)}}}],
['Planet',K=>{const{c,W,H,u,r}=K;sky(K,0,.15);stars(K,350,1);const x=W*(.3+r()*.4),y=H*(.35+r()*.3),R=u*(.22+r()*.12),tilt=-.35+r()*.7;glow(K,x,y,R*1.9,.55);
  const ring=(a0,a1)=>{c.save();c.translate(x,y);c.rotate(tilt);c.scale(1,.24);c.strokeStyle=col(.8,.75);c.lineWidth=R*.14;c.beginPath();c.arc(0,0,R*1.65,a0,a1);c.stroke();c.restore()};
  ring(Math.PI,2*Math.PI);const g=c.createRadialGradient(x-R*.4,y-R*.4,R*.1,x,y,R);g.addColorStop(0,col(.92));g.addColorStop(.6,col(.45));g.addColorStop(1,col(.08));dot(c,x,y,R,g);ring(0,Math.PI)}],
['Rays',K=>{const{c,W,H,u,r}=K;const cx=W*(.2+r()*.6),cy=H*(r()<.5?1.02:.4+r()*.3),n=20+(r()*20|0),D=Math.hypot(W,H)*1.5;
  for(let k=0;k<n;k++){c.fillStyle=col(k%2?.12:.24);c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,D,k/n*6.2832,(k+1)/n*6.2832+.002);c.fill()}glow(K,cx,cy,u*.9,.75);dot(c,cx,cy,u*.07,col(1))}],
['City',K=>{const{c,W,H,u,r}=K;sky(K,.04,.48);stars(K,150,.5);const x0=W*(.1+r()*.8),y0=H*(.12+r()*.15);glow(K,x0,y0,u*.3,.9);dot(c,x0,y0,u*.04,col(1));
  for(let l=0;l<3;l++)for(let x=-u*.02;x<W;){const w=u*(.04+r()*.07),h=u*(.12+r()*.4)*(1.25-l*.25)+H*.12;c.fillStyle=col(.34-l*.14);c.fillRect(x,H-h,w,h);
    if(l){const ws=w/5;for(let y=H-h+ws;y<H-ws;y+=ws*1.6)for(let k=0;k<2;k++)if(r()<.35){c.fillStyle=col(.95,.85);c.fillRect(x+ws*(1+k*2),y,ws,ws*.8)}}x+=w+u*.004}}],
['Clouds',K=>{const{c,W,H,u,r}=K;sky(K,.25,.65);const x=W*(.2+r()*.6),y=H*(.2+r()*.1);glow(K,x,y,u*.5,.98);
  for(let l=0;l<6;l++){const y0=H*(.38+l*.12),cl=col(.92-l*.13);for(let x=-u*.1;x<W+u*.1;x+=u*(.05+r()*.06))dot(c,x,y0+(r()-.5)*u*.05,u*(.06+r()*.07),cl);c.fillRect(0,y0,W,H-y0)}}],
['Folds',K=>{const{c,W,H,r}=K;const D=Math.hypot(W,H),n=6+(r()*8|0),w=D/n;c.translate(W/2,H/2);c.rotate((r()-.5)*1.4+(r()<.5?0:1.57));
  for(let k=0;k<n;k++){const x=-D/2+k*w,t=k/n*.8+.08;c.fillStyle=lg(c,x,0,x+w,0,[col(t),col(t+.16)]);c.fillRect(x,-D/2,w+1,D)}}],
['Mosaic',K=>{const{c,W,H,u,r,n2}=K;fill(K,col(.02));const s=u/(10+(r()*12|0)),g=s*.06,o=r()*9;
  for(let y=0;y<H;y+=s)for(let x=0;x<W;x+=s){const v=Math.min(1,Math.max(0,n2(x/u*2+o,y/u*2)*1.4+.5));c.fillStyle=col(Math.round(v*6)/6*.85+.1);c.fillRect(x+g,y+g,s-2*g,s-2*g)}}],
['Horizon',K=>{const{c,W,H,u,r}=K;const hz=H*(.55+r()*.15),sx=W*(.3+r()*.4),R=u*.075;c.fillStyle=lg(c,0,0,0,hz,[col(.08),col(.55),col(.88)]);c.fillRect(0,0,W,hz);
  glow(K,sx,hz,u*.55,.95);dot(c,sx,hz-R*.35,R,col(1));c.fillStyle=lg(c,0,hz,0,H,[col(.45),col(.06)]);c.fillRect(0,hz,W,H-hz);
  for(let k=0;k<70;k++){const t=k/70,y=hz+(H-hz)*t**1.5,w=R*(1.5+t*5)*(.4+r());c.fillStyle=col(.97,.7*(1-t));c.fillRect(sx-w/2+(r()-.5)*R*t*3,y,w,u*.003*(1+t*3))}}],
['Spiral',K=>{const{c,W,H,u,r}=K;fill(K,col(.04));const cx=W*(.3+r()*.4),cy=H*(.3+r()*.4),n=1600,s=Math.hypot(W,H)*.62/Math.sqrt(n),ga=2.39996+(r()-.5)*.004;
  for(let i=0;i<n;i++){const a=i*ga,d=s*Math.sqrt(i);dot(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d,s*.36*(.3+i/n),col(.97-.75*i/n))}}],
];

let noise;
function grain(c,W,H){if(!noise){noise=document.createElement('canvas');noise.width=noise.height=256;const x=noise.getContext('2d'),d=x.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i+1]=d.data[i+2]=Math.random()*255;d.data[i+3]=255}x.putImageData(d,0,0)}
  c.globalAlpha=.06;c.globalCompositeOperation='overlay';c.fillStyle=c.createPattern(noise,'repeat');c.fillRect(0,0,W,H)}

function draw(cv,W,H,st){
  RAMP=ramp(st);INV=st.inv;cv.width=W;cv.height=H;const c=cv.getContext("2d"),r=rng(st.seed),tb=Array.from({length:512},r);
  const vn=x=>{const i=Math.floor(x),f=x-i,s=f*f*(3-2*f);return tb[i&511]+(tb[(i+1)&511]-tb[i&511])*s};
  const n1=(x,o=5)=>{let v=0,a=.5;for(let k=0;k<o;k++){v+=a*(vn(x)-.5);x=x*2+17.3;a*=.5}return v};
  const h=(i,j)=>tb[(i+j*57)&511];
  const vn2=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),f=x-i,g=y-j,s=f*f*(3-2*f),t=g*g*(3-2*g),a=h(i,j)+(h(i+1,j)-h(i,j))*s,b=h(i,j+1)+(h(i+1,j+1)-h(i,j+1))*s;return a+(b-a)*t};
  const n2=(x,y)=>(vn2(x,y)-.5)*.6+(vn2(x*2+5,y*2+3)-.5)*.3+(vn2(x*4+9,y*4+1)-.5)*.15;
  const K={c,W,H,u:Math.min(W,H),r,n1,n2};
  c.save();fill(K,col(0));STY[st.style][1](K);c.restore();
  if(st.grain){c.save();grain(c,W,H);c.restore()}
  return c}

function clock(c,W,H,kind){
  const p=c.getImageData(W/2|0,H*.2|0,1,1).data,dark=p[0]*.3+p[1]*.59+p[2]*.11>150,d=new Date();
  c.fillStyle=dark?'rgba(0,0,0,.75)':'rgba(255,255,255,.92)';c.textAlign='center';c.textBaseline='middle';
  const time=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false}),date=d.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
  const D=kind=='Desktop',f='-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif';
  c.font=`500 ${H*(D?.04:.02)}px ${f}`;c.fillText(date,W/2,H*(D?.12:.11));
  c.font=`700 ${H*(D?.17:.1)}px ${f}`;c.fillText(time,W/2,H*(D?.24:.19))}

