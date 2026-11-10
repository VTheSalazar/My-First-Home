'use strict';
(function(){
const buttons=[...document.querySelectorAll('[data-hub]')],drawer=document.getElementById('hubDrawer');
function show(name){for(const b of buttons){const active=b.dataset.hub===name;b.setAttribute('aria-selected',String(active));const p=document.getElementById('hub-'+b.dataset.hub);if(p)p.hidden=!active}drawer.hidden=false;document.body.classList.add('drawer-open')}
function hide(){drawer.hidden=true;document.body.classList.remove('drawer-open');buttons.forEach(b=>b.setAttribute('aria-selected','false'))}
buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.hub)));
document.getElementById('closeHub').addEventListener('click',hide);
document.getElementById('menuToggle').addEventListener('click',()=>drawer.hidden?show('shop'):hide());
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});hide();
})();
