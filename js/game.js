
const stages=[{name:'Under the Bridge',rent:0,next:'Studio Apartment',cost:120000},{name:'Studio Apartment',rent:6000,next:'City Apartment',cost:85000},{name:'City Apartment',rent:12000,next:'Modern Condo',cost:350000},{name:'Modern Condo',rent:25000,next:'My First Home',cost:1500000},{name:'My First Home',rent:0,next:null,cost:0}];
const items=[{id:'bed',name:'Bed',emoji:'🛏️',cost:50,rate:1},{id:'fridge',name:'Mini Fridge',emoji:'🧊',cost:200,rate:3},{id:'stove',name:'Electric Stove',emoji:'🍳',cost:600,rate:8},{id:'shower',name:'Shower',emoji:'🚿',cost:1500,rate:20},{id:'chair',name:'Office Chair',emoji:'🪑',cost:3000,rate:35},{id:'plants',name:'Plants',emoji:'🪴',cost:6500,rate:70},{id:'sofa',name:'Sofa',emoji:'🛋️',cost:14000,rate:150},{id:'tv',name:'Television',emoji:'📺',cost:32000,rate:350}];
let s={money:0,stage:0,owned:[],levels:{},skill:0,last:Date.now()};
try{let old=JSON.parse(localStorage.getItem('kris-home-v2'));if(old&&typeof old.money==='number')s={...s,...old}}catch(e){}s.stage=Math.max(0,Math.min(4,s.stage));s.owned=Array.isArray(s.owned)?s.owned:[];s.levels=(s.levels&&typeof s.levels==='object')?s.levels:{};const fmt=n=>'₱'+Math.floor(n).toLocaleString('en-US');const mult=()=>Math.pow(8,s.stage);const rate=()=>items.filter(x=>s.owned.includes(x.id)).reduce((a,x)=>a+x.rate*mult()*Math.pow(2.1,Math.max(0,(s.levels[x.id]||1)-1)),0);const tap=()=>1+s.skill*2;const skillCost=()=>Math.round(100*Math.pow(2.4,s.skill));const save=()=>{s.last=Date.now();try{localStorage.setItem('kris-home-v2',JSON.stringify(s))}catch(e){}};
// Animation and scene are visual only; existing economy and save schema remain unchanged.
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
// A full in-game day lasts 20 real minutes. The clock persists across reloads.
const DAY_MS=20*60*1000;
const CLOCK_KEY='kris-home-day-cycle-v1';
let dayStart=Date.now();
try{const saved=Number(localStorage.getItem(CLOCK_KEY));if(Number.isFinite(saved)&&saved>0&&saved<=Date.now())dayStart=saved}catch(e){}
function gameClock(){
 const elapsed=Math.max(0,Date.now()-dayStart),day=Math.floor(elapsed/DAY_MS)+1;
 const minutes=Math.floor((elapsed%DAY_MS)/DAY_MS*1440);
 return {day,hour:Math.floor(minutes/60),minute:minutes%60,phase:minutes/1440};
}
function timeLabel(){const c=gameClock(),h=c.hour;return 'Day '+c.day+' · '+String(h%12||12).padStart(2,'0')+':'+String(c.minute).padStart(2,'0')+' '+(h<12?'AM':'PM')+' · '+(h>=6&&h<17?'☀️ Day':h>=17&&h<20?'🌇 Sunset':h>=5&&h<6?'🌄 Dawn':'🌙 Night');}
function paintDayNight(){
 const h=gameClock().phase*24;
 // Soft transitions at sunrise and sunset; do not alter furniture sprites or positions.
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const daylight=smooth((h-5)/2)*(1-smooth((h-17)/3));
 const evening=smooth((h-16)/2)*(1-smooth((h-20)/2));
 ctx.save();
 if(daylight>0){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,230,185,'+(0.24*daylight).toFixed(3)+')';ctx.fillRect(0,0,640,360)}
 if(evening>0){ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(238,116,81,'+(0.17*evening).toFixed(3)+')';ctx.fillRect(0,0,640,360)}
 const darkness=0.30*(1-daylight)*(1-evening*.55);
 ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(9,17,47,'+darkness.toFixed(3)+')';ctx.fillRect(0,0,640,360);
 ctx.restore();
}
try{localStorage.setItem(CLOCK_KEY,String(dayStart))}catch(e){}

const scene=document.getElementById('room');let kris={x:260,y:326,target:260,action:'idle',until:0,step:0,face:1,pending:null};let lastFrame=performance.now(),nextAction=performance.now()+2500;
const palettes=[['#9aadb0','#806b65','#6a5b58'],['#a8b6b7','#ac8975','#806b62'],['#a7c1d4','#a48977','#7b655b'],['#c9b9b3','#9b8d80','#71685f'],['#d4cdb5','#c6a47b','#967b58']];
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function outline(x,y,w,h,c='#273044'){rect(x-2,y-2,w+4,h+4,c)}
function furniture(id){return s.owned.includes(id)}
const bridgeNames={bed:['Cardboard Box','Old Mattress','Wooden Bed','Comfort Bed','Luxury Bed','Dream Bed'],fridge:['Ice Cooler','Used Cooler','Mini Fridge','Fridge','Smart Fridge','Luxury Fridge'],stove:['Wood Campfire','Portable Stove','Gas Stove','Electric Stove','Modern Kitchen','Chef Kitchen'],shower:['Bucket Bath','Curtain Shower','Basic Shower','Modern Shower','Spa Shower','Luxury Spa'],chair:['Plastic Crate','Old Chair','Office Chair','Ergonomic Chair','Premium Chair','Luxury Chair'],plants:['Tin Can Flower','Potted Plant','Indoor Plant','Decorative Garden','Rare Plant','Luxury Garden'],sofa:['Broken Sofa','Used Sofa','Soft Sofa','Modern Sofa','Luxury Sofa','Designer Sofa'],tv:['Cardboard TV','Old Television','Flat Screen','Smart TV','Cinema TV','Home Theater']};
function level(id){return s.levels[id]||1}
function upgradeCost(x){return Math.round(x.cost*mult()*Math.pow(7,level(x.id)))}
function itemName(x){return s.stage===0?(bridgeNames[x.id]?.[Math.min(5,level(x.id)-1)]||x.name):x.name}

function line(x,y,w,h,c){rect(x,y,w,h,c)}
function tile(x,y,w,h,base,light,shade){rect(x,y,w,h,shade);rect(x+2,y+2,w-4,h-4,base);rect(x+3,y+3,w-6,2,light)}
const nightWindowSheet=new Image();nightWindowSheet.src='assets/sprites/furniture/window_night_sheet.png';
function windowArt(t){
 if(nightWindowSheet.complete&&nightWindowSheet.naturalWidth){
  const frame=Math.floor(t/220)%6;
  ctx.drawImage(nightWindowSheet,frame*140,0,140,122,103,9,125,103);
 }else{
  rect(111,19,103,83,'#614b75');rect(115,22,95,76,'#122648');
  rect(159,24,5,72,'#b78d70');rect(118,57,89,5,'#b78d70');
 }
}
const deskPixel=new Image();deskPixel.src='assets/sprites/furniture/desk_pixel.png';
function drawDesk(t){
 if(deskPixel.complete && deskPixel.naturalWidth){
  ctx.drawImage(deskPixel,0,0,438,435,8,98,108,106);
  const pulse=.10+.17*(.5+.5*Math.sin(t/420));
  ctx.fillStyle=`rgba(85,235,255,${pulse})`;ctx.fillRect(47,130,29,14);
  ctx.fillStyle=`rgba(190,250,255,${pulse*.6})`;ctx.fillRect(51,133,21,2);
 }else{rect(10,158,99,7,'#50344c');rect(13,151,96,8,'#b67b65');rect(18,163,6,37,'#704d56');rect(95,163,6,37,'#704d56');tile(30,109,58,40,'#384976','#77b8cc','#292c52')}
}
function drawBed(t){
 rect(126,168,91,41,'#6c4a6a');rect(130,163,83,35,'#8b647d');rect(134,166,77,31,'#d68ca9');rect(135,166,29,12,'#f4d5c5');
 rect(165,170,44,25,'#e6a2b7');for(let i=0;i<5;i++)rect(170+i*8,171,2,22,'#f2c0c1');rect(129,200,89,7,'#493751');
 rect(119,209,102,4,'#d9a8b4');rect(121,213,98,2,'#835f80');
}
const fridgeSheet=new Image();fridgeSheet.src='assets/sprites/furniture/fridge_sheet.png';
function drawFridge(t){
 const using=kris.action==='fridge' && !kris.pending;
 const frame=using ? Math.floor(t/170)%8 : 0;
 if(fridgeSheet.complete && fridgeSheet.naturalWidth===1520){
  ctx.drawImage(fridgeSheet,frame*190,0,190,232,455,149,109,183);
 }else{tile(455,149,109,183,'#c6d7dc','#f6eff1','#5d6685');}
}
const ovenSheet=new Image();ovenSheet.src='assets/sprites/furniture/oven_sheet.png';
function drawStove(t){
 if(ovenSheet.complete && ovenSheet.naturalWidth===288){
  const cooking=kris.action==='cook' || kris.pending==='cook';
  const frame=cooking ? 1+(Math.floor(t/240)%5) : 0;
  ctx.drawImage(ovenSheet,frame*48,0,48,64,277,145,48,64);
 } else {rect(279,145,37,54,'#777487');rect(284,166,27,24,'#34313f');}
}
// The user-supplied animated shower is converted into a canvas-compatible 8-frame atlas.
const showerAnimation=new Image();showerAnimation.src='assets/sprites/furniture/shower_animated_v28.png';
function drawShower(t){
 if(showerAnimation.complete && showerAnimation.naturalWidth){
  const bathing=(activeAction?.id==='shower') || (!activeAction && kris.action==='shower');
  // Frames 4 and 5 show the character washing with soap; frame 0 is the closed, idle shower.
  const frame=bathing ? 4+(Math.floor(t/520)%2) : 0;
  ctx.drawImage(showerAnimation,frame*130,0,130,200,265,13,66,126);
 }else{tile(275,19,39,109,'#85b5c6','#bde4e6','#536784')}
}
const chairSprite=new Image();chairSprite.src='assets/sprites/furniture/office_chair.png';
function drawChair(){
 if(chairSprite.complete&&chairSprite.naturalWidth){
  ctx.drawImage(chairSprite,94,151,39,48);
 }else{rect(109,157,7,30,'#49415c');rect(99,157,24,25,'#58567e');rect(101,162,20,16,'#79789e');rect(102,186,21,4,'#46445f');rect(112,190,3,7,'#45445c')}
}
const plantSwaySheet=new Image();plantSwaySheet.src='assets/sprites/furniture/plant_sway_sheet.png';
function drawPlant(x,y,t){
 if(plantSwaySheet.complete&&plantSwaySheet.naturalWidth){
  const frame=Math.floor(t/220)%6;
  ctx.drawImage(plantSwaySheet,frame*80,0,80,84,x-12,y-20,58,65);
 }else{rect(x+8,y+24,16,15,'#b46f66');rect(x+5,y+22,22,5,'#dc9a7e');rect(x+15,y+4,3,20,'#47794f')}
}
const sofaBackSheet=new Image();sofaBackSheet.src='assets/sprites/furniture/sofa_back_sheet.png';
const sofaRelaxSheet=new Image();sofaRelaxSheet.src='assets/sprites/furniture/sofa_kris_no_tv_sheet.png';
const tvSheet=new Image();tvSheet.src='assets/sprites/furniture/tv_sheet.png';
function drawSofa(t){
 const relaxing=(activeAction?.id==='sofa');
 const sheet=relaxing&&sofaRelaxSheet.complete&&sofaRelaxSheet.naturalWidth?sofaRelaxSheet:sofaBackSheet;
 if(sheet.complete&&sheet.naturalWidth){
  const frame=Math.floor(t/(relaxing?360:250))%8;
  if(sheet===sofaRelaxSheet)ctx.drawImage(sheet,frame*424,0,424,360,108,97,125,106);
  else ctx.drawImage(sheet,frame*150,0,150,102,108,132,125,90);
 }else{rect(120,179,98,24,'#4b4666');rect(123,167,92,31,'#6b97a1');rect(122,199,97,6,'#3c4562')}
}
function drawTV(t){
 if(tvSheet.complete&&tvSheet.naturalWidth){
  const frame=Math.floor(t/250)%8;
  ctx.drawImage(tvSheet,frame*94,0,94,84,210,48,76,69);
 }else{tile(222,69,49,36,'#3d678e','#83c4d2','#323750');rect(231,76,30,18,'#75b8bd')}
}
// Larger 640x360 room. All furniture is anchored to dedicated positions.
function place(draw,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);draw();ctx.restore()}
// Room v1.5: larger kitchen appliances against the right wall; plants moved left.
const bedSleepSheet=new Image();bedSleepSheet.src='assets/sprites/furniture/bed_sleep_sheet.png';
const bedEmpty=new Image();bedEmpty.src='assets/sprites/furniture/bed_empty.png';
function drawVerticalBed(t){
 if(bedSleepSheet.complete&&bedSleepSheet.naturalWidth){
  let sleeping=(activeAction?.id==='sleep')||(kris.action==='sleep'&&!kris.pending);
  if(!sleeping && bedEmpty.complete && bedEmpty.naturalWidth){
   ctx.drawImage(bedEmpty,263,170,116,160);
  }else if(sleeping){
   let frame=Math.floor(t/220)%8;
   ctx.drawImage(bedSleepSheet,frame*116,0,116,160,263,170,116,160);
  }else{ctx.drawImage(bedSleepSheet,0,0,116,160,263,170,116,160);}
 }else{
  rect(263,170,116,160,'#63445d');rect(270,175,102,147,'#9d6889');
  rect(277,181,88,46,'#e6b1bf');rect(281,186,80,34,'#f9dbe0');
  rect(275,222,92,94,'#c87b9c');rect(280,227,82,80,'#e69fba');
 }
}
function drawSleepingKris(){/* Kris is included in the bed animation sprite. */}
// Layout coordinates are in the 640 x 360 canvas, saved separately per home.
const EDIT_KEY='kris-home-layout-v1';
const TEMPLATE_KEY='kris-home-default-layout-v1';
const defaults={
 kris:{x:0,y:0,scale:1,width:1,height:1},
 desk:{x:26,y:0,scale:1},chair:{x:0,y:0,scale:1},
 bed:{x:0,y:0,scale:1},fridge:{x:0,y:0,scale:1},
 stove:{x:0,y:0,scale:1},plants:{x:0,y:0,scale:1},
 shower:{x:0,y:0,scale:1},tv:{x:0,y:0,scale:1},sofa:{x:0,y:0,scale:1},
 window:{x:0,y:0,scale:1}
};
let savedLayouts={};try{savedLayouts=JSON.parse(localStorage.getItem(EDIT_KEY))||{}}catch(e){}
let layoutTemplates={};try{layoutTemplates=JSON.parse(localStorage.getItem(TEMPLATE_KEY))||{}}catch(e){}
function storeTemplates(){try{localStorage.setItem(TEMPLATE_KEY,JSON.stringify(layoutTemplates))}catch(e){alert('Unable to save layout on this device. Export a backup instead.')}}
function normalizeLayout(data){
 const result={};if(!data||typeof data!=='object')return result;
 for(const id of Object.keys(defaults)){
  const raw=data[id];if(!raw||typeof raw!=='object')continue;
  const clean={};for(const prop of ['x','y','scale',...(id==='kris'?['width','height']:[])]){
   if(Number.isFinite(raw[prop]))clean[prop]=prop==='scale'||prop==='width'||prop==='height'?Math.max(.3,Math.min(3,raw[prop])):Math.max(-1200,Math.min(1200,raw[prop]));
  }
  if(id==='kris')clean.locked=!!raw.locked;
  result[id]=clean;
 }
 return result;
}
// Templates are separate from the game save and persist when a new game is started.
// Existing room layouts remain untouched when upgrading from v2.3.
function templateForStage(stage){return layoutTemplates[String(stage)]||null}
function exportTemplates(){
 const data={format:'my-first-home-layout',version:1,homes:layoutTemplates};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kris-default-room-layouts.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function applyTemplateToCurrentRoom(){
 const template=templateForStage(s.stage);if(!template)return false;
 savedLayouts[String(s.stage)]=structuredClone(template);storeLayout();return true;
}

let editMode=false,selected='desk',dragging=false,dragStart=null;
const editable=[
 ['kris','Kris (Character)',{x:196,y:203,w:128,h:134}],
 ['desk','Desk', {x:26,y:0,w:160,h:210}],
 ['chair','Office Chair',{x:120,y:275,w:50,h:75}],
 ['bed','Bed',{x:263,y:170,w:116,h:165}],
 ['fridge','Mini Fridge',{x:455,y:149,w:109,h:183}],
 ['stove','Electric Stove',{x:567,y:163,w:91,h:125}],
 ['plants','Plants',{x:65,y:65,w:85,h:80}],
 ['shower','Shower',{x:40,y:25,w:60,h:150}],
 ['tv','Television',{x:175,y:110,w:75,h:55}],
 ['sofa','Sofa',{x:70,y:240,w:100,h:75}],
 ['window','Window',{x:228,y:53,w:170,h:160}]
];
const boxes=Object.fromEntries(editable.map(([id,n,b])=>[id,b]));
// Actual sprite rectangles in the 640x360 scene, AFTER each place() transform.
// These are distinct from the old logical anchors, which are kept unchanged to
// preserve every existing user layout and exported template.
const spriteBounds={
 desk:{x:26,y:156.8,w:172.8,h:169.6},
 chair:{x:112.4,y:265.6,w:62.4,h:76.8},
 bed:{x:263,y:170,w:116,h:160},
 fridge:{x:455,y:149,w:109,h:183},
 stove:{x:567.15,y:162.75,w:93.6,h:124.8},
 shower:{x:104.5,y:16.9,w:85.8,h:163.8},
 tv:{x:191.5,y:95.2,w:87.4,h:79.35},
 sofa:{x:58,y:197,w:125,h:90},
 window:{x:222.95,y:67.85,w:206.25,h:169.95},
 plants:{x:65,y:65,w:85,h:190}
};

function currentLayout(){let key=String(s.stage);if(!savedLayouts[key])savedLayouts[key]=templateForStage(s.stage)?JSON.parse(JSON.stringify(templateForStage(s.stage))):{};return savedLayouts[key]}
function layout(id){return {...defaults[id],...(currentLayout()[id]||{})}}
function storeLayout(){try{localStorage.setItem(EDIT_KEY,JSON.stringify(savedLayouts))}catch(e){}}
function adjustable(id,fn){let v=layout(id);ctx.save();ctx.translate(v.x,v.y);ctx.translate(boxes[id].x,boxes[id].y);ctx.scale(v.scale,v.scale);ctx.translate(-boxes[id].x,-boxes[id].y);fn();ctx.restore()}
function characterLayout(){return layout('kris')}
function getBox(id){
 const v=layout(id);
 if(id==='kris'){
  // The character art occupies less than its full 128px drawing cell.
  // Keep the box anchored to the same feet as paintKris().
  const w=70*v.scale*(v.width||1),h=126*v.scale*(v.height||1);
  return {x:kris.x+v.x-w/2,y:FLOOR_Y+v.y-h,w,h};
 }
 // adjustable() scales about the ORIGINAL box anchor, not the sprite's corner.
 // Apply the identical transform to the actual sprite bounds.
 const anchor=boxes[id],art=spriteBounds[id]||anchor;
 return {
  x:anchor.x+v.x+(art.x-anchor.x)*v.scale,
  y:anchor.y+v.y+(art.y-anchor.y)*v.scale,
  w:art.w*v.scale,h:art.h*v.scale
 };
}
function available(id){return ['desk','window','kris'].includes(id)||furniture(id)}
function refreshEditor(){
 document.getElementById('editPanel').hidden=!editMode;
 document.getElementById('editToggle').textContent=editMode?'Done Editing':'✏️ Edit Room';
 scene.classList.toggle('editing',editMode);
 if(!editMode)return;
 let picker=document.getElementById('editItem');
 picker.innerHTML=editable.filter(([id])=>available(id)).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
 if(!available(selected))selected='desk';picker.value=selected;
 let v=layout(selected);document.getElementById('editScale').value=Math.round(v.scale*100);
 document.getElementById('characterDimensions').hidden=selected!=='kris';
 if(selected==='kris'){
  document.getElementById('editWidth').value=Math.round((v.width||1)*100);
  document.getElementById('editHeight').value=Math.round((v.height||1)*100);
  document.getElementById('keepProportions').checked=!!v.locked;
  document.getElementById('widthValue').textContent=Math.round((v.width||1)*100)+'%';
  document.getElementById('heightValue').textContent=Math.round((v.height||1)*100)+'%';
 }
 document.getElementById('editSizeValue').textContent=Math.round(v.scale*100)+'%';
 document.getElementById('editCoords').textContent='X '+Math.round(v.x)+' · Y '+Math.round(v.y);
}
function bridgeBackdrop(t){
 // Living World: deterministic, lightweight ambient animation; no game-state changes.
 const h=gameClock().phase*24;
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const sun=smooth((h-5)/2)*(1-smooth((h-17)/3));
 const night=1-sun;
 const dusk=smooth((h-16)/2)*(1-smooth((h-20)/2));
 const sky=sun>.5?'#577d98':'#17283d';
 rect(0,0,640,360,sky);rect(0,0,640,90,sun>.5?'#7ca7ba':'#263d55');
 // Distant moon and sun travel behind the skyline.
 const celestialX=60+(h/24)*520;
 if(sun>.08){ctx.save();ctx.globalAlpha=sun*.75;rect(celestialX,27+Math.sin(h/24*Math.PI*2)*19,19,19,'#f9df9d');ctx.restore()}
 else{rect(celestialX,32,13,13,'#e9e7cb');rect(celestialX+6,28,13,13,sky)}
 // Buildings and their windows; each window has its own light schedule.
 for(let i=0;i<24;i++){
  let x=i*29-6,height=28+(i*19%48);
  rect(x,125-height,25,height,sun>.5?'#3c627a':'#223448');
  for(let j=0;j<3;j++){
   const phase=((i*17+j*31)%100)/100;
   const lit=(Math.sin(t/2300+i*2.9+j*4.7)>-.30+phase*.55);
   rect(x+4+j*7,135-height+8+(i%3)*4,3,5,night>.25&&lit?'#e3b56d':sun>.5?'#5d8394':'#34495c');
  }
 }
 // Water currents and moonlight reflections.
 rect(0,135,640,62,sun>.5?'#497d8b':'#294b58');
 for(let i=0;i<30;i++){
  let x=((i*79+t*(.012+i%3*.004))%730)-60;
  let y=144+(i*13)%51;
  rect(x,y,13+(i%4)*7,2,i%5===0&&night>.5?'#8b9b9d':sun>.5?'#8bb2b2':'#50727b');
 }
 // Occasional vehicle lights travelling on the far road.
 rect(0,127,640,8,sun>.5?'#455762':'#233541');
 for(let i=0;i<3;i++){
  let x=((t*(.020+i*.009)+i*231)%800)-80;
  rect(x,130,14,3,sun>.5?'#48565b':'#263442');
  rect(x+1,129,3,2,night>.3?'#fff0b1':'#b6c0bd');
  rect(x+12,129,2,2,'#e67865');
 }
 // Bridge beams, columns and pavement (preserve existing room geometry).
 rect(0,0,640,34,'#77646e');rect(0,31,640,11,'#514454');for(let i=0;i<16;i++)rect(i*43,3,3,28,'#69727a');
 rect(0,40,57,198,'#7d7078');rect(9,48,40,177,'#958087');rect(570,40,70,200,'#756970');rect(580,48,46,178,'#94838a');
 rect(0,219,640,141,'#73615f');rect(0,219,640,9,'#393e43');for(let i=0;i<34;i++){let x=(i*83)%640,y=235+(i*37)%110;rect(x,y,13,3,i%2?'#797064':'#4f504d')}
 rect(0,333,640,27,'#4c514a');for(let i=0;i<20;i++){let x=i*37;rect(x,323+i%3*5,2,11,'#4e7155');rect(x+3,329,2,7,'#66835b')}
 rect(35,207,160,8,'#444a4a');rect(36,211,7,23,'#34383d');rect(185,211,7,23,'#34383d');
 rect(280,220,140,5,'#b1a08b');rect(285,226,130,5,'#746b61');
 // Breeze: drifting paper and tiny grass tips.
 for(let i=0;i<5;i++){const x=((t*(.006+i*.002)+i*163)%760)-65;const y=304+(i*11)%32+Math.sin(t/680+i)*3;rect(x,y,5,2,'#a5a196')}
 for(let i=0;i<12;i++){let x=i*54+5;rect(x+Math.sin(t/950+i)*2,326+i%3*4,2,5,'#78916b')}
 // Day birds, night stars and occasional fireflies.
 if(sun>.25){ctx.save();ctx.globalAlpha=sun;for(let i=0;i<3;i++){let x=((t*.014+i*173)%720)-40,y=62+i*17+Math.sin(t/500+i)*5;rect(x,y,5,2,'#283c4b');rect(x+5,y+2,4,2,'#283c4b');rect(x+9,y,5,2,'#283c4b')}ctx.restore()}
 else{ctx.save();ctx.globalAlpha=night*.7;for(let i=0;i<14;i++){let x=(i*79+11)%620,y=48+(i*23)%73;rect(x,y,2,2,Math.sin(t/950+i*2)>.1?'#e6e9dc':'#6e8593')}for(let i=0;i<5;i++){let x=80+i*101+Math.sin(t/1200+i)*9,y=280+i%3*13+Math.cos(t/760+i)*8;rect(x,y,3,3,'#b6c77b')}ctx.restore()}
}

// Cozy Pixel Life: painted environmental details, deliberately separate from editable furniture.
// Colors shift with the existing 20-minute day/night clock; no changes to save schema.
function cozyRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function cozyLantern(x,y,t,light){
 const sway=Math.sin(t/1550+x)*1.6;
 const xx=x+sway;
 cozyRect(xx-1,y-22,2,20,'#4c344a');
 cozyRect(xx-6,y-3,12,4,'#815269');cozyRect(xx-7,y+1,14,15,'#493746');
 cozyRect(xx-5,y+2,10,11,'#ffd28c');cozyRect(xx-3,y+3,6,9,'#ffe6ae');
 cozyRect(xx-6,y+16,12,3,'#ac6e62');
 ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(xx,y+8,1,xx,y+8,31);g.addColorStop(0,'rgba(255,194,108,'+(.27+Math.sin(t/290+x)*.06)*light+')');g.addColorStop(1,'rgba(255,194,108,0)');ctx.fillStyle=g;ctx.fillRect(xx-32,y-24,64,64);ctx.restore();
}
function cozyPlant(x,y,t,scale=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 const sway=Math.sin(t/1100+x)*2;
 cozyRect(-9,0,18,16,'#a76579');cozyRect(-11,-2,22,4,'#c9858e');cozyRect(-7,14,14,3,'#6a4b69');
 cozyRect(-1,-27,3,26,'#48765f');
 for(let j=0;j<5;j++){
   const yp=-9-j*5;
   const dir=j%2?1:-1;
   const bx=sway*.35+dir*(8+j%2*3);
   cozyRect(bx-(dir>0?7:0),yp,8,4,j%2?'#63946f':'#8cb276');
   cozyRect(bx-(dir>0?3:4),yp+4,6,3,'#416d5c');
 }
 ctx.restore();
}
function cozyDetailsBack(t){
 if(s.stage!==0)return;
 const h=gameClock().phase*24;
 const smoothstep=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const daylight=smoothstep((h-5)/2)*(1-smoothstep((h-17)/3));
 const warm=.55+.45*(1-daylight);
 // Pastel colored concrete, shadows and warm surface texture.
 ctx.save();ctx.globalAlpha=.24;
 for(let i=0;i<56;i++){
   const x=(i*83+19)%640,y=228+(i*47)%119;
   cozyRect(x,y,2+(i%4)*2,2,i%4===0?'#dcc0a1':'#c99b9c');
 }
 ctx.restore();
 // Worn rugs and a few tiny pink blossoms at the base of the wall.
 cozyRect(185,281,174,40,'#77536a');cozyRect(190,286,164,30,'#b47c8e');
 for(let i=0;i<17;i++){cozyRect(191+i*9,287+(i%3)*8,7,2,i%2?'#ecb6a6':'#df9da9')}
 for(let i=0;i<22;i++){const x=186+i*8;cozyRect(x,323,2,5,'#dfad90')}
 // Wall dressing, faded flag and wooden shelf (decorations, not interactive furniture).
 cozyRect(18,80,6,118,'#6d535d');cozyRect(24,90,50,35,'#f1ded0');
 cozyRect(24,90,50,17,'#3c64a3');cozyRect(24,107,50,18,'#d85e70');
 ctx.fillStyle='#f8e6b5';ctx.beginPath();ctx.moveTo(24,90);ctx.lineTo(46,108);ctx.lineTo(24,125);ctx.fill();
 cozyRect(64,145,105,6,'#76515d');cozyRect(72,151,6,11,'#63414e');cozyRect(157,151,6,11,'#63414e');
 for(let i=0;i<5;i++)cozyRect(79+i*17,130-(i%2)*6,12,15+(i%2)*6,['#cc8292','#f1bc8d','#81a897','#a48cb7','#d59da4'][i]);
 // A delicate string of fairy lights hung beneath the bridge.
 ctx.strokeStyle='#3e344a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(63,64);ctx.quadraticCurveTo(260,123,415,75);ctx.stroke();
 const bulbs=[[97,78],[150,87],[206,91],[265,91],[327,85],[387,74]];
 for(let i=0;i<bulbs.length;i++){
  const [bx,by]=bulbs[i];cozyRect(bx-1,by-5,2,5,'#4f3648');
  cozyRect(bx-3,by,6,8,i%2?'#ffd697':'#ffe7ad');
  ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(bx,by+4,1,bx,by+4,22);g.addColorStop(0,'rgba(255,212,133,'+(.22*warm)+')');g.addColorStop(1,'rgba(255,212,133,0)');ctx.fillStyle=g;ctx.fillRect(bx-22,by-18,44,44);ctx.restore();
 }
 // Vines hanging near the overhead beams; gently sway in the wind.
 for(let j=0;j<5;j++){
   const bx=75+j*101, len=25+(j%3)*9, bend=Math.sin(t/1800+j)*3;
   cozyRect(bx,28,3,len,'#466954');
   for(let k=0;k<4;k++){
     const yy=33+k*7,off=bend*(k/4);
     cozyRect(bx-8+off,yy,9,5,k%2?'#6b9a64':'#8daf74');
     cozyRect(bx+3+off,yy+3,8,5,k%2?'#5f8c65':'#a1bb7c');
   }
 }
 // Riverside greenery low enough to preserve the view of the distant city.
 for(let i=0;i<14;i++){
   const x=445+i*14,y=209-(i*17%25);
   cozyRect(x,y,8,9,i%2?'#598465':'#83a46c');
   cozyRect(x+3,y-6,3,7,'#5b8f6a');
 }
 // A couple of warm lanterns on the concrete pillars.
 cozyLantern(26,172,t,warm);
 cozyLantern(614,174,t,warm);
 // Small handmade art on the side wall, set well behind furniture.
 cozyRect(475,64,54,32,'#996c7e');cozyRect(479,68,46,24,'#d8b0a4');
 cozyRect(484,72,16,14,'#7697ad');cozyRect(504,78,18,8,'#e2b889');
}
function cozyDetailsFront(t){
 if(s.stage!==0)return;
 // Floor greenery and flowers are intentionally low and don't cover furniture or Kris.
 cozyPlant(21,324,t,.72);
 cozyPlant(621,326,t,.84);
 for(let j=0;j<10;j++){
   const x=13+j*62,y=348-(j%3)*4;
   cozyRect(x,y,3,3,j%3?'#db9aa0':'#dfbb89');
 }
 // Subtle fireflies after sunset, independent of the fire animation.
 const h=gameClock().phase*24;
 if(h>=18||h<5){
  for(let j=0;j<8;j++){
   const x=450+(j*23)%170+Math.sin(t/1300+j)*6;
   const y=210+(j*31)%93+Math.cos(t/1000+j)*5;
   ctx.save();ctx.globalAlpha=.32+.27*(.5+.5*Math.sin(t/370+j));cozyRect(x,y,2,2,'#ffdb91');ctx.restore();
  }
 }
}

function bridgeFireLight(t){
 if(s.stage!==0||!furniture('stove'))return;
 const flicker=.75+.12*Math.sin(t/120)+.09*Math.sin(t/63);
 ctx.save();ctx.globalCompositeOperation='screen';
 const g=ctx.createRadialGradient(600,279,3,600,279,116);
 g.addColorStop(0,'rgba(255,176,62,'+(0.21*flicker)+')');g.addColorStop(1,'rgba(255,133,30,0)');
 ctx.fillStyle=g;ctx.fillRect(450,165,190,190);ctx.restore();
}

const bridgeBoxSleep=new Image();bridgeBoxSleep.src='assets/sprites/furniture/bridge_box_sleep_sheet.png';
const bridgeBoxIdle=new Image();bridgeBoxIdle.src='assets/sprites/furniture/bridge_box_idle.png';
const bridgeCampfire=new Image();bridgeCampfire.src='assets/sprites/furniture/bridge_campfire_fire_sheet.png';
const bridgeCooking=new Image();bridgeCooking.src='assets/sprites/furniture/bridge_campfire_cooking_sheet.png';
function bridgeFurniture(id,t){
 const lv=level(id);
 if(lv>=3)return false;
 if(id==='desk'){rect(39,198,91,9,'#55565b');rect(43,181,83,17,'#31343c');rect(46,183,76,12,'#46667c');rect(45,202,79,3,'#a0a2a1');rect(33,211,102,5,'#8c8073');return true}
 if(id==='bed'){
  const sleeping=(activeAction?.id==='sleep')||(kris.action==='sleep'&&!kris.pending);
  if(lv===1 && sleeping && bridgeBoxSleep.complete && bridgeBoxSleep.naturalWidth){
    const frame=Math.floor(t/360)%8;
    ctx.drawImage(bridgeBoxSleep,frame*439,0,439,439,251,174,149,153);
  }else if(lv===1 && bridgeBoxIdle.complete && bridgeBoxIdle.naturalWidth){
    ctx.drawImage(bridgeBoxIdle,0,0,443,443,251,174,149,153);
  }else{
    rect(269,251,113,72,'#a07c55');rect(273,257,104,60,'#bd986a');rect(277,264,98,47,lv===1?'#8c725b':'#9c9aa0');rect(284,269,36,18,'#c2b3a0');rect(280,309,95,6,'#765b4d');for(let i=0;i<4;i++)rect(270+i*30,246,17,5,'#73563d');
  }return true}
 if(id==='fridge'){rect(475,250,92,64,'#8ca9b0');rect(481,253,80,52,'#b6d5dc');rect(488,260,64,35,'#cde9f2');rect(503,267,39,23,'#e1f8ff');rect(475,303,92,8,'#526b72');return true}
 if(id==='stove'){
  const cooking=activeAction?.id==='cook';
  if(cooking && bridgeCooking.complete && bridgeCooking.naturalWidth){
    const frame=Math.floor(t/240)%8;
    // One complete animation: Kris, pot, tripod and fire in matching proportions.
    ctx.drawImage(bridgeCooking,frame*180,0,180,180,511,169,129,148);
  }else if(bridgeCampfire.complete&&bridgeCampfire.naturalWidth){
    const frame=Math.floor(t/210)%8;
    ctx.drawImage(bridgeCampfire,frame*200,0,200,155,556,219,93,91);
  }else{
    rect(575,286,54,6,'#6b4731');rect(590,269,24,11,'#ef9138');rect(596,257,13,20,'#ffce68');
  }
  return true;
 }
 if(id==='shower'){rect(46,115,4,125,'#72716b');rect(96,115,4,125,'#72716b');rect(46,115,54,5,'#a8a397');rect(50,122,45,94,'#727c80');rect(58,222,35,10,'#647d8d');rect(60,218,31,4,'#b1c9d2');return true}
 if(id==='chair'){rect(103,273,45,26,'#876f5d');rect(108,299,5,21,'#55453b');rect(139,299,5,21,'#55453b');return true}
 if(id==='plants'){rect(78,171,23,29,'#8c9397');rect(83,166,3,6,'#5b8467');rect(91,158,4,14,'#6c9c76');rect(97,164,3,9,'#76926b');rect(75,181,30,4,'#b6a9a0');return true}
 if(id==='sofa'){rect(121,270,114,43,'#67546c');rect(127,275,102,34,'#846d7e');rect(136,277,35,17,'#ab8990');rect(183,277,35,17,'#ab8990');rect(136,305,10,12,'#4e454d');rect(208,305,10,12,'#4e454d');for(let i=0;i<4;i++)rect(156+i*10,296,3,11,'#c9c3b7');return true}
 if(id==='tv'){rect(215,156,71,49,'#a18b72');rect(220,161,61,37,'#d0bb94');rect(228,171,46,18,'#555a62');rect(234,175,33,2,'#a9b4b6');rect(244,179,11,7,'#89918b');return true}
 return false;
}
function paintScene(t){
 if(s.stage===0){bridgeBackdrop(t);cozyDetailsBack(t)}else{
 const walls=['#d7a6b3','#d7aeb6','#b3b8d1','#c7b8c9','#e1c8aa'];
 const floors=['#b98885','#c99a92','#a9a0ad','#b7a49b','#d6b595'];
 rect(0,0,640,360,walls[s.stage]);rect(0,0,640,15,'#655071');rect(0,17,640,4,'#e6c2b9');
 rect(0,225,640,135,floors[s.stage]);rect(0,220,640,7,'#71546b');
 for(let y=238;y<360;y+=30){rect(0,y,640,2,'#8e6d77');for(let x=(Math.floor(y/30)%2)*32;x<640;x+=64)rect(x,y,2,30,'#97777c')}
 }
 // The bridge is open-air; indoor windows only appear after moving.
 if(s.stage!==0)adjustable('window',()=>place(()=>windowArt(t),53,20,1.65));
 if(s.stage>0){rect(20,70,70,9,'#80566b');for(let i=0;i<5;i++)rect(28+i*12,43,8,27,['#8e5c75','#f3d1a8','#789c9b','#d1a4a4','#7a86b7'][i]);}
 if(furniture('shower'))adjustable('shower',()=>{if(!(s.stage===0&&bridgeFurniture('shower',t)))place(()=>drawShower(t),-240,0,1.3)});
 if(furniture('tv'))adjustable('tv',()=>{if(!(s.stage===0&&bridgeFurniture('tv',t)))place(()=>drawTV(t),-50,40,1.15)});
 // Desk is included from day one; chair is ONLY drawn after purchase.
 adjustable('desk',()=>{if(s.stage!==0)place(()=>drawDesk(t),10,0,1.6);else bridgeFurniture('desk',t)});
 if(furniture('chair'))adjustable('chair',()=>{if(!(s.stage===0&&bridgeFurniture('chair',t)))place(()=>drawChair(),-38,24,1.6)});
 if(furniture('bed'))adjustable('bed',()=>{if(!(s.stage===0&&bridgeFurniture('bed',t)))drawVerticalBed(t)});
 if(furniture('sofa'))adjustable('sofa',()=>{if(!(s.stage===0&&bridgeFurniture('sofa',t)))place(()=>drawSofa(t),-50,65,1.0)});
 // Larger appliances flush against the back/right wall.
 if(furniture('fridge'))adjustable('fridge',()=>{if(!(s.stage===0&&bridgeFurniture('fridge',t)))drawFridge(t)});
 if(furniture('stove'))adjustable('stove',()=>{if(!(s.stage===0&&bridgeFurniture('stove',t)))place(()=>drawStove(t),27,-120,1.95)});
 if(furniture('plants'))adjustable('plants',()=>{if(s.stage===0){if(!bridgeFurniture('plants',t))drawPlant(8,180,t);return;}
  // Plants are placed on the left wall shelf, away from the cooking area.
  rect(65,111,83,7,'#795069');rect(69,118,6,9,'#5c4057');rect(137,118,6,9,'#5c4057');
  place(()=>drawPlant(0,0,t),86,57,1.35);drawPlant(8,180,t);
 });
 // Hide the walking character while actually asleep, draw in-bed instead.
 if(activeAction){drawActionKris(t)}else if(kris.action==='sleep' && !kris.pending && furniture('bed')){/* Bed sprite owns the sleeping pose. */}
 else paintKris(t);
 paintDayNight();
 bridgeFireLight(t);
 cozyDetailsFront(t);
 if(editMode){for(const [id] of editable){if(!available(id))continue;let b=getBox(id);ctx.strokeStyle=id===selected?'#ffe17c':'#d6e7ff88';ctx.lineWidth=id===selected?4:2;ctx.strokeRect(b.x,b.y,b.w,b.h);if(id===selected){ctx.fillStyle='#ffe17c';ctx.fillRect(b.x+b.w-7,b.y+b.h-7,14,14)}}}
 rect(0,350,640,3,'#886d80');
 for(let i=0;i<7;i++){let x=(i*97+Math.floor(t/1900)*7)%625+4,y=30+i*29;rect(x,y,2,2,'#fbe1bf66')}
}
// Main playable character from Character_Design_Kris-Idle (1).zip.
// Atlas: 6 columns, 3 rows, 80x80 transparent cells.
const krisAtlas=new Image();krisAtlas.src='assets/sprites/kris_main.png';
// Activity sprites from the user-supplied Kris cooking and sleeping packs.
const activitySprites={};
for(const [activity,folder] of Object.entries({cook:'cooking',sleep:'sleeping'})){
 activitySprites[activity]={};
 for(const facing of ['east','west']){
  const img=new Image();img.src=`assets/sprites/kris_activities/${folder}/${facing}.png`;
  activitySprites[activity][facing]=img;
 }
}

// Real-time activities use monotonic time while open and a saved end timestamp after reload.
const ACTIVITY_KEY='kris-activities-v23';
const actionDefs={sleep:{furniture:'bed',duration:600000,label:'sleeping'},shower:{furniture:'shower',duration:180000,label:'taking a shower'},work:{furniture:null,duration:300000,label:'using the laptop'},sofa:{furniture:'sofa',duration:300000,label:'relaxing on the sofa'},cook:{furniture:'stove',duration:300000,label:'cooking at the campfire'}};
let activeAction=null;
try{const a=JSON.parse(localStorage.getItem(ACTIVITY_KEY));if(a&&actionDefs[a.id]&&a.end>Date.now())activeAction=a}catch(e){}
function updateActionButtons(){
 document.querySelectorAll('[data-action]').forEach(b=>{const d=actionDefs[b.dataset.action];b.disabled=!!(d.furniture&&!furniture(d.furniture));b.title=b.disabled?'Buy this furniture first':''});
 document.getElementById('cancelAction').hidden=!activeAction;
}
function startAction(id){
 const d=actionDefs[id];if(!d||d.furniture&&!furniture(d.furniture))return;
 activeAction={id,end:Date.now()+d.duration,start:Date.now()};
 localStorage.setItem(ACTIVITY_KEY,JSON.stringify(activeAction));
 kris.pending=null;kris.target=kris.x;setActivity(id==='sofa'?'sofa':id);updateActionButtons();
}
function stopAction(){activeAction=null;localStorage.removeItem(ACTIVITY_KEY);kris.pending=null;setActivity('idle');nextAction=performance.now()+1000;updateActionButtons()}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>startAction(b.dataset.action));
document.getElementById('cancelAction').onclick=stopAction;
function actionTick(){
 if(activeAction && Date.now()>=activeAction.end)stopAction();
 if(activeAction){const d=actionDefs[activeAction.id],left=Math.max(0,activeAction.end-Date.now());
  document.getElementById('actionStatus').textContent='Kris is '+d.label+' · '+Math.ceil(left/60000)+' min remaining';
  document.getElementById('actionFill').style.width=(100*(1-left/d.duration)).toFixed(1)+'%';
 }else{document.getElementById('actionStatus').textContent='Kris is free to explore.';document.getElementById('actionFill').style.width='0%'}
}
updateActionButtons();setInterval(actionTick,500);actionTick();
function activityFurniture(id){return id==='work'?'desk':id==='sofa'?'sofa':id}
function drawActionKris(t){
 if(!activeAction)return false;
 const id=activeAction.id;
 if(id==='sleep' || id==='shower' || id==='sofa' || (id==='cook'&&s.stage===0&&level('stove')<3))return true; // Furniture atlases already contain Kris.
 const b=getBox(activityFurniture(id)),v=characterLayout();
 let x=b.x+b.w*.5,y=b.y+b.h*.90;
 if(id==='shower'){x=b.x+b.w*.51;y=b.y+b.h*.84}
 if(id==='work'){x=b.x+b.w*.58;y=b.y+b.h*.93}
 if(id==='sofa'){x=b.x+b.w*.49;y=b.y+b.h*.63}
 const w=(id==='shower'?b.w*.49:id==='sofa'?72:86)*v.scale*(v.width||1),h=(id==='shower'?b.h*.65:id==='sofa'?89:108)*v.scale*(v.height||1);
 ctx.save();ctx.globalAlpha=id==='shower'?.85:1;
 const frame=id==='work'?Math.floor(t/300)%2:Math.floor(t/450)%2;
 if(krisAtlas.complete&&krisAtlas.naturalWidth===480){ctx.drawImage(krisAtlas,frame*80,0,80,80,x-w/2,y-h,w,h)}
 if(id==='work'){rect(x+8,y-36,2+frame*3,2,'#9cf3ff')}
 if(id==='sofa'){rect(x+14,y-55,8,5,'#9bbaff')}
 if(id==='shower'){
  // Overlay translucent shower glass and running water over Kris. The position
  // is calculated from getBox(), so Edit Room scaling and movement stay aligned.
  ctx.fillStyle='rgba(109,195,224,.28)';
  ctx.fillRect(b.x+b.w*.22,b.y+b.h*.17,b.w*.56,b.h*.70);
  ctx.strokeStyle='rgba(221,250,255,.7)';ctx.lineWidth=Math.max(1,b.w*.025);
  ctx.beginPath();ctx.moveTo(b.x+b.w*.50,b.y+b.h*.16);ctx.lineTo(b.x+b.w*.50,b.y+b.h*.88);ctx.stroke();
  for(let i=0;i<12;i++){let yy=b.y+b.h*.19+((t/12+i*17)%(b.h*.65));rect(b.x+b.w*.23+(i*13)%(Math.max(15,b.w*.52)),yy,2,8,'#c2f6ffb8')}
 }
 ctx.restore();return true;
}
const FLOOR_Y=337;
const stations={work:140,sleep:321,cook:587,fridge:478,shower:62,sit:143,idle:390};
function stationX(action){let id=({work:'desk',sleep:'bed',cook:'stove',fridge:'fridge',shower:'shower',sit:'chair'})[action];if(!id)return stations[action]??175;let b=getBox(id);return Math.round(action==='sleep'?b.x+b.w*.5:action==='cook'?b.x+4:action==='fridge'?b.x-20:b.x+b.w*.55)}

function paintKris(t){
 const walking=Math.abs(kris.target-kris.x)>1.2;
 const row=walking?(kris.face<0?2:1):0;
 const frame=walking?Math.floor(t/115)%6:0;
 const v=characterLayout(),x=Math.round(kris.x+v.x),y=FLOOR_Y+v.y;
 ctx.save();ctx.translate(x,y);ctx.scale(v.scale*(v.width||1),v.scale*(v.height||1));ctx.translate(-x,-y);
 // When Kris reaches a station, show the matching real activity sprite.
 const activityImage=!walking && !kris.pending && activitySprites[kris.action]?.[kris.face<0?'west':'east'];
 if(activityImage?.complete && activityImage.naturalWidth>0){
  if(kris.action==='sleep' && furniture('bed')){
   ctx.restore();return;
  } else {
   const w=112,h=135;
   ctx.drawImage(activityImage,x-Math.round(w/2),y-h,w,h);
  }
  ctx.restore();return;
 }
 // Scale the 80px source art without cropping; foot position remains fixed.
 if(krisAtlas.complete && krisAtlas.naturalWidth===480){
  ctx.drawImage(krisAtlas,frame*80,row*80,80,80,x-64,y-134,128,134);
 } else {
  rect(x-9,y-39,18,22,'#30243d');rect(x-7,y-20,14,19,'#f2e7dc');
 }
 ctx.restore();
}
function setActivity(a){
 kris.action=a;
 document.getElementById('activity').textContent=({work:'Kris is at the laptop',sleep:'Kris is sleeping',cook:'Kris is cooking',fridge:'Kris is getting food',shower:'Kris is taking a shower',sofa:'Kris is relaxing on the sofa',sit:'Kris is by the chair',idle:'Kris is exploring'})[a]||'Kris is exploring';
}
function goTo(action,t){
 const x=stationX(action);
 kris.target=Math.max(48,Math.min(607,x));
 kris.pending=action;
 kris.until=t+2500;
 setActivity('idle');
}
function chooseAction(t){
 const choices=['work','idle'];
 if(furniture('bed'))choices.push('sleep');
 if(furniture('stove'))choices.push('cook');
 if(furniture('fridge'))choices.push('fridge');
 if(furniture('shower'))choices.push('shower');
 if(furniture('chair'))choices.push('sit');
 const action=choices[Math.floor(Math.random()*choices.length)];
 goTo(action,t);
}
let lastClockText='';
function animate(t){
 const dt=Math.min(.06,Math.max(0,(t-lastFrame)/1000));lastFrame=t;
 if(!editMode && !activeAction && t>nextAction){chooseAction(t);nextAction=t+5000+Math.random()*2600;}
 const d=kris.target-kris.x;
 if(!editMode && !activeAction && Math.abs(d)>1.2){kris.x+=Math.sign(d)*Math.min(Math.abs(d),dt*65);kris.face=Math.sign(d);}
 else if(!editMode && !activeAction) {kris.x=kris.target;if(kris.pending){setActivity(kris.pending);kris.pending=null;}}
 kris.y=FLOOR_Y;
 paintScene(t);
 const clockText=timeLabel();if(clockText!==lastClockText){document.getElementById('gameClock').textContent=clockText;lastClockText=clockText;}
 requestAnimationFrame(animate);
}
function fx(symbol,x,y,kind='pop'){let p=document.createElement('span');p.className=kind;p.textContent=symbol;p.style.left=(x/640*100)+'%';p.style.top=(y/360*100)+'%';scene.appendChild(p);setTimeout(()=>p.remove(),900)}
function purchaseFx(){scene.classList.remove('flash');void scene.offsetWidth;scene.classList.add('flash');for(let i=0;i<9;i++)fx(i%2?'✦':'✧',100+Math.random()*440,80+Math.random()*180,'spark')}
requestAnimationFrame(animate);
const offline=Math.min(8*3600,Math.max(0,(Date.now()-s.last)/1000));s.money+=offline*rate();function draw(){document.getElementById('cash').textContent=fmt(s.money);document.getElementById('rate').textContent=fmt(rate())+'/sec';document.getElementById('taprate').textContent=fmt(tap())+'/tap';document.getElementById('stageName').textContent=stages[s.stage].name+(s.stage===0?' · Free shelter':s.stage<4?' · Rent ₱'+stages[s.stage].rent.toLocaleString()+'/month':' · Homeowner!');document.getElementById('room').dataset.stage=s.stage;document.getElementById('shop').innerHTML=items.map(x=>{let owned=s.owned.includes(x.id),lv=level(x.id),maxed=lv>=6,cost=owned?upgradeCost(x):x.cost*mult(),income=x.rate*mult()*Math.pow(2.1,Math.max(0,lv-1));return `<div class="item"><span class="emoji">${x.emoji}</span><div class="info"><strong>${owned?itemName(x):(s.stage===0?bridgeNames[x.id][0]:x.name)}</strong><small>${owned?'Level '+lv+'/6 · ':''}+${fmt(income)}/sec${owned&&!maxed?' · Next: '+(bridgeNames[x.id]?.[lv]||'Upgrade'):''}</small></div><button data-buy="${x.id}" ${maxed&&owned||s.money<cost?'disabled':''}>${owned?(maxed?'MAX':fmt(cost)+' ↑'):fmt(cost)}</button></div>`}).join('');document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{let x=items.find(i=>i.id===b.dataset.buy),owned=s.owned.includes(x.id),cost=owned?upgradeCost(x):x.cost*mult();if(s.money>=cost&&(!owned||level(x.id)<6)){s.money-=cost;if(owned)s.levels[x.id]=level(x.id)+1;else{s.owned.push(x.id);s.levels[x.id]=1}purchaseFx();nextAction=performance.now()+600;save();draw();updateActionButtons()}});let st=stages[s.stage],finished=s.stage===4;document.getElementById('nextDesc').textContent=finished?'Kris has finally bought her first home! Keep decorating and earning.':'Save enough money to move into a '+st.next.toLowerCase()+'. Furniture upgrades carry over when you move.';document.getElementById('nextTitle').textContent=finished?'🎉 Dream achieved!':st.next;document.getElementById('nextCost').textContent=finished?'Your very own home':fmt(st.cost)+' moving / purchase goal';document.getElementById('progress').style.width=(finished?100:Math.min(100,s.money/st.cost*100))+'%';let b=document.getElementById('move');b.disabled=finished||s.money<st.cost;b.textContent=finished?'Homeowner!':'Move to '+st.next;document.getElementById('skillInfo').textContent='Level '+s.skill+' · '+fmt(tap())+' per tap';document.getElementById('skillBtn').textContent=fmt(skillCost());document.getElementById('skillBtn').disabled=s.money<skillCost()}
function earn(e){
 if(editMode)return;
 const p=canvasPoint(e),b=getBox('desk');
 // Use the same transformed rectangle as the movable desk, rather than the old fixed hotspot.
 // Inset slightly to target the visible desk/laptop while retaining comfortable touch input.
 if(p.x<b.x||p.x>b.x+b.w||p.y<b.y||p.y>b.y+b.h)return;
 s.money+=tap();fx('+'+fmt(tap()),Math.min(620,Math.max(20,p.x)),Math.min(335,Math.max(25,p.y)));
 goTo('work',performance.now());nextAction=performance.now()+2800;draw();
}
function canvasPoint(e){let r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*640,y:(e.clientY-r.top)/r.height*360}}
scene.addEventListener('pointerdown',e=>{
 if(!editMode){earn(e);return}
 let p=canvasPoint(e),hits=editable.filter(([id])=>available(id)).reverse();
 let found=(selected==='kris'?hits.filter(([id])=>id==='kris'):hits).find(([id])=>{let b=getBox(id);return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h});
 if(!found)found=hits.find(([id])=>{let b=getBox(id);return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h});
 if(found)selected=found[0];
 let v=layout(selected);dragStart={px:p.x,py:p.y,x:v.x,y:v.y};dragging=!!found;
 if(dragging)scene.setPointerCapture(e.pointerId);
 refreshEditor();
});
scene.addEventListener('pointermove',e=>{
 if(!editMode||!dragging)return;
 let p=canvasPoint(e),v=layout(selected);
 if(selected==='kris'){
  v.x=Math.round(Math.max(-kris.x+12,Math.min(628-kris.x,dragStart.x+p.x-dragStart.px)));
  v.y=Math.round(Math.max(-FLOOR_Y+35,Math.min(360-FLOOR_Y,dragStart.y+p.y-dragStart.py)));
 }else{
  // Clamp against the visible sprite, not its outdated logical anchor.
  const art=spriteBounds[selected]||boxes[selected],anchor=boxes[selected];
  const ox=anchor.x+(art.x-anchor.x)*v.scale;
  const oy=anchor.y+(art.y-anchor.y)*v.scale;
  v.x=Math.round(Math.max(-ox,Math.min(640-ox-art.w*v.scale,dragStart.x+p.x-dragStart.px)));
  v.y=Math.round(Math.max(-oy,Math.min(360-oy-art.h*v.scale,dragStart.y+p.y-dragStart.py)));
 }
 currentLayout()[selected]=v;refreshEditor();
});
function finishDrag(){if(dragging)storeLayout();dragging=false}
scene.addEventListener('pointerup',finishDrag);scene.addEventListener('pointercancel',finishDrag);
document.getElementById('editToggle').onclick=()=>{editMode=!editMode;dragging=false;refreshEditor();if(!editMode)storeLayout()};
document.getElementById('editItem').onchange=e=>{selected=e.target.value;refreshEditor()};
for(const [id,prop] of [['editWidth','width'],['editHeight','height']]){
 document.getElementById(id).oninput=e=>{
  let v=characterLayout(),value=Number(e.target.value)/100;
  v[prop]=value;
  if(document.getElementById('keepProportions').checked){v.width=value;v.height=value;}
  currentLayout().kris=v;storeLayout();refreshEditor();
 };
}
document.getElementById('keepProportions').onchange=e=>{
 let v=characterLayout();v.locked=e.target.checked;
 if(v.locked)v.height=v.width;
 currentLayout().kris=v;storeLayout();refreshEditor();
};
document.getElementById('editScale').oninput=e=>{currentLayout()[selected]={...layout(selected),scale:Number(e.target.value)/100};refreshEditor();storeLayout()};
document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{let [dx,dy]=b.dataset.nudge.split(',').map(Number),v=layout(selected);currentLayout()[selected]={...v,x:v.x+dx,y:v.y+dy};storeLayout();refreshEditor()});
document.getElementById('resetLayout').onclick=()=>{if(confirm('Reset this room to its saved default (or original game layout)?')){delete savedLayouts[String(s.stage)];storeLayout();refreshEditor()}};
const templateStatus=document.getElementById('templateStatus');
function showTemplateStatus(message){templateStatus.textContent=message}
document.getElementById('saveDefaultLayout').onclick=()=>{
 // Include ALL furniture, including furniture not yet purchased, with current saved offsets.
 const room=currentLayout(),complete={};for(const id of Object.keys(defaults))complete[id]=normalizeLayout({[id]:{...defaults[id],...(room[id]||{})}})[id];
 layoutTemplates[String(s.stage)]=complete;storeTemplates();storeLayout();
 showTemplateStatus('Saved default for '+stages[s.stage].name+'. New games will use these positions when furniture is purchased.');
};
document.getElementById('exportDefaultLayout').onclick=()=>{
 if(!Object.keys(layoutTemplates).length){showTemplateStatus('First tap Save as Default Layout.');return}
 exportTemplates();showTemplateStatus('Layout backup exported. Keep the JSON file for future game versions.');
};
document.getElementById('importDefaultLayout').onclick=()=>document.getElementById('layoutImportFile').click();
document.getElementById('layoutImportFile').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const data=JSON.parse(await file.text());if(data.format!=='my-first-home-layout'||!data.homes||typeof data.homes!=='object')throw Error('Invalid layout file');
  const imported={};for(let stage=0;stage<stages.length;stage++)if(data.homes[String(stage)])imported[String(stage)]=normalizeLayout(data.homes[String(stage)]);
  if(!Object.keys(imported).length)throw Error('No valid homes found');
  if(!confirm('Import default layouts? Existing defaults for those homes will be replaced. Your current room and money will not change.'))return;
  layoutTemplates={...layoutTemplates,...imported};storeTemplates();showTemplateStatus('Imported '+Object.keys(imported).length+' home layout(s).');
 }catch(err){showTemplateStatus('Import failed: '+err.message)}finally{e.target.value=''}
};

scene.addEventListener('keydown',e=>{if(editMode){e.preventDefault();return}if(e.key==='Enter'||e.key===' '){e.preventDefault();s.money+=tap();fx('+'+fmt(tap()),105,195);draw()}});

document.getElementById('newGame').onclick=()=>{
 if(!confirm('Start a new game? Savings, purchases, laptop skills and home progress will reset. Your saved room layouts and default templates will be kept.'))return;
 stopAction();
 s={money:0,stage:0,owned:[],levels:{},skill:0,last:Date.now()};
 // Clear previous room-specific positions; keep user-defined default templates.
 savedLayouts={};
 storeLayout();
 kris.x=260;kris.y=326;kris.target=260;kris.pending=null;kris.face=1;
 setActivity('idle');nextAction=performance.now()+2500;
 // Ensure a saved template is used for the first home, if one exists.
 if(templateForStage(0))savedLayouts['0']=JSON.parse(JSON.stringify(templateForStage(0)));
 storeLayout();
 try{localStorage.removeItem('kris-home-v2');localStorage.removeItem(ACTIVITY_KEY)}catch(e){}
 save();draw();refreshEditor();updateActionButtons();
 document.getElementById('newGameStatus').textContent='New game started. Your furniture layout presets were preserved.';
 window.scrollTo({top:0,behavior:'smooth'});
};
document.getElementById('skillBtn').onclick=()=>{if(s.money>=skillCost()){s.money-=skillCost();s.skill++;purchaseFx();save();draw()}};document.getElementById('move').onclick=()=>{let st=stages[s.stage];if(s.stage<4&&s.money>=st.cost&&confirm('Move to '+st.next+'? Your furniture and upgrades will move with you.')){s.money-=st.cost;s.stage++;kris.x=275;kris.y=FLOOR_Y;kris.target=275;kris.pending=null;setActivity("idle");purchaseFx();save();draw();refreshEditor()}};setInterval(()=>{s.money+=rate()/4;draw()},250);setInterval(save,5000);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});window.addEventListener('pagehide',save);draw();
