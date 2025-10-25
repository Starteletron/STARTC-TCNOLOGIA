(function(){
    const u = localStorage.getItem('stc_user');
    if(!u){
      // Sem sessão → volta pro login
      window.location.href = 'login.html';
      return;
    }
    // Exibe nome no cabeçalho (se existir elemento)
    try{
      const user = JSON.parse(u);
      const slot = document.getElementById('userSlot');
      if(slot){ slot.textContent = user.nome ? `Olá, ${user.nome}` : user.email; }
    }catch(_){}
  })();

  function sair(){
    localStorage.removeItem('stc_user');
    window.location.href = 'login.html';
  }
