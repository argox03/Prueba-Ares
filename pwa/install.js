// Instalación online: no service worker, caché offline ni cola de sincronización.
let installPrompt=null;
const button=document.createElement('button');button.id='pwa-install';button.type='button';button.textContent='↓ Instalar aplicación';button.setAttribute('aria-haspopup','dialog');document.body.append(button);
const modal=document.createElement('dialog');modal.id='pwa-help';modal.setAttribute('aria-labelledby','pwa-title');modal.innerHTML='<h2 id="pwa-title">Tornillería Oriente en tu teléfono</h2><p>Ábrela desde su icono, con el inventario y Ares en la misma aplicación. Necesita internet.</p><div id="pwa-instructions"></div><p class="pwa-note">Si ya la instalaste, ábrela desde su icono. Instalar no copia ni sincroniza datos entre dispositivos.</p><button type="button" id="pwa-close">Entendido</button>';document.body.append(modal);
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function visibility(){button.hidden=standalone();}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;visibility()});
window.addEventListener('appinstalled',()=>{installPrompt=null;button.hidden=true;if(modal.open)modal.close()});
window.matchMedia('(display-mode: standalone)').addEventListener('change',visibility);
document.getElementById('pwa-close').onclick=()=>modal.close();modal.onclick=e=>{if(e.target===modal)modal.close()};
button.onclick=async()=>{
 if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;return;}catch{/* mostrar instrucciones si el navegador rechaza el diálogo */}}
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 document.getElementById('pwa-instructions').textContent=ios?'En iPhone o iPad: abre esta página en Safari, toca Compartir y elige «Añadir a pantalla de inicio». Si aparece «Abrir como app», actívalo.':'En Android: abre esta página en Chrome y busca «Instalar aplicación» o «Añadir a pantalla de inicio» en el menú ⋮. En computadora, usa Chrome o Edge y busca «Instalar» en la barra de direcciones o en el menú del navegador. La opción depende del navegador.';
 modal.showModal();
};
visibility();
