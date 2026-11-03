/* =========================================================
   608 Flores e Floricultura — loja (vendas.html)
   Renderiza produtos a partir de produtos.js, cuida do
   filtro por categoria, do carrinho e do checkout.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const grade = document.getElementById('grade-produtos');
  if (!grade) return;

  const filtrosContainer = document.getElementById('filtro-categorias');
  const painel = document.querySelector('.painel-carrinho');
  const fundoPainel = document.querySelector('.fundo-carrinho');

  const rotulosCategoria = { girassol: 'Girassóis', lirios: 'Lírios', rosas: 'Rosas' };
  function rotuloCategoria(cat) {
    return rotulosCategoria[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
  }

  let filtroAtivo = 'todos';

  /* ---------- Carrinho ---------- */
  const CHAVE_CARRINHO = 'flores608_carrinho';

  function lerCarrinho() {
    try { return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || []; }
    catch (erro) { return []; }
  }
  function salvarCarrinho(itens) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
    atualizarContadores();
  }
  function totalItens(itens) { return itens.reduce((soma, item) => soma + item.quantidade, 0); }
  function atualizarContadores() {
    const itens = lerCarrinho();
    document.querySelectorAll('.contador-carrinho').forEach(el => { el.textContent = totalItens(itens); });
  }

  /* ---------- Renderização do catálogo ---------- */
  function renderizarFiltros(produtos) {
    if (!filtrosContainer) return;
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    filtrosContainer.innerHTML =
      `<button type="button" class="filtro-tag${filtroAtivo === 'todos' ? ' ativa' : ''}" data-filtro="todos">Todos</button>` +
      categorias.map(c => `<button type="button" class="filtro-tag${filtroAtivo === c ? ' ativa' : ''}" data-filtro="${c}">${rotuloCategoria(c)}</button>`).join('');
  }

  function renderizarProdutos() {
    const produtos = obterProdutos();
    const carrinho = lerCarrinho();

    renderizarFiltros(produtos);

    grade.innerHTML = produtos.map(p => {
      const noCarrinho = carrinho.find(i => i.id === p.id);
      const disponivel = p.estoque - (noCarrinho ? noCarrinho.quantidade : 0);
      const esgotado = disponivel <= 0;
      const oculto = filtroAtivo !== 'todos' && p.categoria !== filtroAtivo;

      return `
        <article class="cartao-buque" ${oculto ? 'hidden' : ''} data-id="${p.id}">
          <div class="cartao-buque-figura">
            <img class="imagem-principal" src="${p.imagem}" alt="${p.nome}">
            ${p.imagemAlt ? `<img class="imagem-alt" src="${p.imagemAlt}" alt="">` : ''}
            ${esgotado ? '<span class="etiqueta-esgotado">Esgotado</span>' : ''}
          </div>
          <div class="cartao-buque-corpo">
            <h3>${p.nome}</h3>
            <p class="cartao-buque-descricao">${p.descricao || ''}</p>
            <p class="cartao-buque-preco">${formatarPrecoBRL(p.preco)}</p>
            <p class="cartao-buque-estoque">${esgotado ? 'Sem estoque no momento' : disponivel + ' disponível(is)'}</p>
            <div class="acoes-buque">
              <div class="controle-qtd">
                <button type="button" data-acao="subtrair" aria-label="Diminuir quantidade">−</button>
                <input type="number" value="1" min="1" max="${Math.max(disponivel, 1)}" aria-label="Quantidade">
                <button type="button" data-acao="somar" aria-label="Aumentar quantidade">+</button>
              </div>
              <button type="button" class="botao botao--primario adicionar-carrinho" ${esgotado ? 'disabled' : ''}>${esgotado ? 'Esgotado' : 'Adicionar'}</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  /* ---------- Filtro por categoria ---------- */
  if (filtrosContainer) {
    filtrosContainer.addEventListener('click', (e) => {
      const botao = e.target.closest('.filtro-tag');
      if (!botao) return;
      filtroAtivo = botao.dataset.filtro;
      renderizarProdutos();
    });
  }

  /* ---------- Quantidade e adicionar ao carrinho (delegação) ---------- */
  grade.addEventListener('click', (e) => {
    const cartao = e.target.closest('.cartao-buque');
    if (!cartao) return;
    const id = cartao.dataset.id;
    const input = cartao.querySelector('.controle-qtd input');

    if (e.target.dataset.acao === 'somar' || e.target.dataset.acao === 'subtrair') {
      const max = parseInt(input.max, 10) || 1;
      let valor = parseInt(input.value, 10) || 1;
      valor += e.target.dataset.acao === 'somar' ? 1 : -1;
      input.value = Math.min(max, Math.max(1, valor));
    }

    if (e.target.classList.contains('adicionar-carrinho') && !e.target.disabled) {
      const produto = obterProdutos().find(p => p.id === id);
      if (!produto) return;
      const quantidade = parseInt(input.value, 10) || 1;

      const itens = lerCarrinho();
      const existente = itens.find(item => item.id === id);
      if (existente) { existente.quantidade += quantidade; } else {
        itens.push({ id, nome: produto.nome, preco: produto.preco, imagem: produto.imagem, quantidade });
      }
      salvarCarrinho(itens);
      renderizarProdutos();
      renderizarPainelCarrinho();
      abrirCarrinho();
    }
  });

  /* ---------- Painel do carrinho ---------- */
  function abrirCarrinho() {
    if (!painel) return;
    painel.classList.add('visivel');
    fundoPainel.classList.add('visivel');
  }
  function fecharCarrinho() {
    if (!painel) return;
    painel.classList.remove('visivel');
    fundoPainel.classList.remove('visivel');
  }

  function renderizarPainelCarrinho() {
    if (!painel) return;
    const lista = painel.querySelector('.painel-carrinho-itens');
    const subtotalEl = painel.querySelector('.linha-subtotal-valor');
    const botaoFinalizar = painel.querySelector('.finalizar-pedido');
    const itens = lerCarrinho();

    if (itens.length === 0) {
      lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio. Que tal escolher um buquê?</p>';
      if (botaoFinalizar) botaoFinalizar.setAttribute('disabled', 'true');
    } else {
      lista.innerHTML = itens.map(item => `
        <div class="item-carrinho">
          <img src="${item.imagem}" alt="${item.nome}">
          <div>
            <strong>${item.nome}</strong><br>
            <span>${item.quantidade} × ${formatarPrecoBRL(item.preco)}</span><br>
            <button class="item-carrinho-remover" data-remover="${item.id}">Remover</button>
          </div>
          <span>${formatarPrecoBRL(item.preco * item.quantidade)}</span>
        </div>
      `).join('');
      if (botaoFinalizar) botaoFinalizar.removeAttribute('disabled');
    }

    const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    if (subtotalEl) subtotalEl.textContent = formatarPrecoBRL(subtotal);

    lista.querySelectorAll('[data-remover]').forEach(botao => {
      botao.addEventListener('click', () => {
        salvarCarrinho(lerCarrinho().filter(item => item.id !== botao.dataset.remover));
        renderizarPainelCarrinho();
        renderizarProdutos();
      });
    });
  }

  document.querySelectorAll('[data-abrir-carrinho]').forEach(botao => {
    botao.addEventListener('click', (e) => { e.preventDefault(); renderizarPainelCarrinho(); abrirCarrinho(); });
  });
  document.querySelectorAll('[data-fechar-carrinho]').forEach(botao => {
    botao.addEventListener('click', fecharCarrinho);
  });

  /* ---------- Finalizar pedido: envia WhatsApp e dá baixa no estoque ---------- */
  const botaoFinalizar = document.querySelector('.finalizar-pedido');
  if (botaoFinalizar) {
    botaoFinalizar.addEventListener('click', () => {
      const itens = lerCarrinho();
      if (itens.length === 0) return;

      const linhas = itens.map(item => `• ${item.quantidade}x ${item.nome} — ${formatarPrecoBRL(item.preco * item.quantidade)}`);
      const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
      const mensagem = `Olá! Gostaria de fazer o seguinte pedido na 608 Flores:%0A%0A${linhas.join('%0A')}%0A%0ATotal: ${formatarPrecoBRL(subtotal)}`;
      window.open(`https://wa.me/5561999999999?text=${mensagem}`, '_blank');

      const produtos = obterProdutos();
      itens.forEach(item => {
        const produto = produtos.find(p => p.id === item.id);
        if (produto) produto.estoque = Math.max(0, produto.estoque - item.quantidade);
      });
      salvarProdutos(produtos);
      salvarCarrinho([]);
      renderizarProdutos();
      renderizarPainelCarrinho();
    });
  }

  atualizarContadores();
  renderizarProdutos();
  renderizarPainelCarrinho();
});
