let installPrompt=null;
const install=document.getElementById('install-app');
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;install.textContent='Installer l’application';});
window.addEventListener('appinstalled',()=>{installPrompt=null;install.textContent='Application installée';});
install.addEventListener('click',async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;return;}document.getElementById('install-dialog').showModal();});
document.getElementById('install-close').addEventListener('click',()=>document.getElementById('install-dialog').close());
function connection(){document.getElementById('offline-status').hidden=navigator.onLine;}
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('/sw.js').catch(()=>{});
