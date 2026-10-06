let installPrompt=null;
const install=document.getElementById('install-app');
const standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(standalone)install.hidden=true;
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
document.getElementById('install-device-help').textContent=ios?'Sur cet appareil, utilisez Safari pour ajouter Yeti PLV à votre écran d’accueil.':/Android/.test(navigator.userAgent)?'Sur cet appareil, ouvrez ce site dans Chrome puis choisissez Installer l’application.':'Installez Yeti PLV pour l’ouvrir directement depuis votre écran d’accueil.';
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;install.textContent='Installer l’application';});
window.addEventListener('appinstalled',()=>{installPrompt=null;install.hidden=true;});
install.addEventListener('click',async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;return;}document.getElementById('install-dialog').showModal();});
document.getElementById('install-close').addEventListener('click',()=>document.getElementById('install-dialog').close());
function connection(){document.getElementById('offline-status').hidden=navigator.onLine;}
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('/sw.js').catch(()=>{});
