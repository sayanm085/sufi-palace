const entrance = document.querySelector('#entrance');
const skip = document.querySelector('#skip');
function finishIntro(){ entrance.classList.add('open'); skip.hidden=true; window.setTimeout(()=>entrance.remove(),1600); }
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { entrance.remove(); skip.hidden=true; } else { window.setTimeout(finishIntro, 1500); skip.addEventListener('click',finishIntro); }
const toggle=document.querySelector('.menu-toggle'); const nav=document.querySelector('#nav');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true'; toggle.setAttribute('aria-expanded',String(!open));nav.classList.toggle('show',!open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('show');toggle.setAttribute('aria-expanded','false')}));
