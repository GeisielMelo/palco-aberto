document.addEventListener('submit', (evento) => {
  const mensagem = evento.target.dataset.confirmar;
  if (mensagem && !window.confirm(mensagem)) {
    evento.preventDefault();
  }
});

const secaoAtiva = document.querySelector('#menu-admin .nav-link.active');
if (secaoAtiva) {
  secaoAtiva.scrollIntoView({ block: 'nearest', inline: 'center' });
}
