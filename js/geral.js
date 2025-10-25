document.addEventListener('DOMContentLoaded', () => {
const toggleButton = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
if(!toggleButton || !sidebar) return;


const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);


function openMenu(){
sidebar.classList.add('active');
overlay.classList.add('show');
document.body.style.overflow = 'hidden';
}
function closeMenu(){
sidebar.classList.remove('active');
overlay.classList.remove('show');
document.body.style.overflow = '';
}


toggleButton.addEventListener('click', () => {
if (sidebar.classList.contains('active')) closeMenu(); else openMenu();
});
overlay.addEventListener('click', closeMenu);
sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
});