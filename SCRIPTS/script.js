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
