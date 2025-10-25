// auth.js – controle de sessão e assinatura (MVP com Apps Script)
(function(){
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxwuTOLB2aZZO4jpt3CgkqlUr0AtVwnUC2e6UCc2zsAC3IeEd4YlLzeoj_LObbKcWV/exec';


async function requireAuth() {
const raw = localStorage.getItem('starc_session');
let session = null;
try { session = JSON.parse(raw || 'null'); } catch { session = null; }
if (!session || !session.email || !session.token) return redirectLogin();


try {
const res = await fetch(APPS_SCRIPT_URL, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ tipo: 'session-validate', token: session.token })
});
const data = await res.json();
if (data.status !== 'ok' || data.subscription !== 'active') return redirectLogin();
} catch {
return redirectLogin();
}
}


function redirectLogin(){
const target = encodeURIComponent(location.pathname + location.search);
location.href = `../login.html?redirect=${target}`;
}


window.STARC_AUTH = { requireAuth };


// Auto-rodar quando for incluído com data-protected
try {
const current = document.currentScript;
if (current && current.dataset && current.dataset.protected === 'true') {
// Ajuste do caminho relativo para login.html
// Se a página estiver na raiz, troca '../login.html' por 'login.html'
const depth = (location.pathname.match(/\//g) || []).length - 1;
if (depth <= 1) {
// Reescreve redirectLogin para raiz
window.STARC_AUTH.__proto__.redirectLogin = redirectLogin; // noop
}
requireAuth();
}
} catch(e) { /* ignora */ }
})();