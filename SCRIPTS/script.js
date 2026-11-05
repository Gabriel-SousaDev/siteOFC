/* =========================================================
   608 Flores e Floricultura — scripts globais
   Tema claro/escuro + revelação ao rolar + menu mobile
   (Carrinho e catálogo ficam em loja.js / admin.js)
   ========================================================= */

(function () {
  const CHAVE_TEMA = 'flores608_tema';
  const temaSalvo = localStorage.getItem(CHAVE_TEMA);
  const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const temaInicial = temaSalvo || (prefereEscuro ? 'escuro' : 'claro');
  if (temaInicial === 'escuro') {
    document.documentElement.setAttribute('data-tema', 'escuro');
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Alternador de tema ---------- */
  const CHAVE_TEMA = 'flores608_tema';
  const botoesTema = document.querySelectorAll('.alterna-tema');

  function temaAtual() {
    return document.documentElement.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
  }

  function aplicarTema(tema) {
    if (tema === 'escuro') {
      document.documentElement.setAttribute('data-tema', 'escuro');
    } else {
      document.documentElement.removeAttribute('data-tema');
    }
    localStorage.setItem(CHAVE_TEMA, tema);
    botoesTema.forEach(botao => botao.setAttribute('aria-pressed', tema === 'escuro' ? 'true' : 'false'));
  }

  botoesTema.forEach(botao => {
    botao.setAttribute('aria-pressed', temaAtual() === 'escuro' ? 'true' : 'false');
    botao.addEventListener('click', () => {
      aplicarTema(temaAtual() === 'escuro' ? 'claro' : 'escuro');
    });
  });

  /* ---------- Revelação suave ao rolar ---------- */
  const elementosRevelar = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window && elementosRevelar.length) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('revelado');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elementosRevelar.forEach(el => observador.observe(el));
  } else {
    elementosRevelar.forEach(el => el.classList.add('revelado'));
  }

  /* ---------- Menu mobile ---------- */
  const botaoMenu = document.querySelector('.menu-alterna');
  const menu = document.querySelector('.menu');

  if (botaoMenu && menu) {
    botaoMenu.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      document.body.classList.toggle('menu-ativo', aberto);
      botaoMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('aberto');
        document.body.classList.remove('menu-ativo');
      });
    });
  }
});

/* Botão flutuante do WhatsApp (todas as páginas públicas) */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.whatsapp-flutuante') || location.pathname.endsWith('admin.html') || location.pathname.endsWith('admin-login.html')) return;
  const a = document.createElement('a');
  a.className = 'whatsapp-flutuante'; a.href = 'https://wa.me/5561999999999'; a.target = '_blank'; a.rel = 'noopener';
  a.setAttribute('aria-label', 'Conversar no WhatsApp');
  a.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>';
  document.body.appendChild(a);
});
