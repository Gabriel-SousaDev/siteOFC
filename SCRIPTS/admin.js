/* =========================================================
   608 Flores e Floricultura — painel de administrador
   CRUD de produtos sobre o mesmo localStorage da loja.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const lista = document.getElementById('lista-produtos');
  if (!lista) return;

  const formNovo = document.getElementById('form-novo-produto');
  const aviso = document.getElementById('aviso-admin');

  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(mostrarAviso._temporizador);
    mostrarAviso._temporizador = setTimeout(() => aviso.classList.remove('visivel'), 2800);
  }

  function atualizarResumo(produtos) {
    document.getElementById('resumo-total').textContent = produtos.length;
    document.getElementById('resumo-estoque').textContent = produtos.reduce((s, p) => s + Number(p.estoque || 0), 0);
    document.getElementById('resumo-esgotados').textContent = produtos.filter(p => Number(p.estoque) <= 0).length;
    const valor = produtos.reduce((s, p) => s + Number(p.preco || 0) * Number(p.estoque || 0), 0);
    document.getElementById('resumo-valor').textContent = formatarPrecoBRL(valor);
  }

  function renderizar() {
    const produtos = obterProdutos();
    atualizarResumo(produtos);

    lista.innerHTML = produtos.map(p => `
      <div class="linha-produto" data-id="${p.id}">
        <img class="miniatura-produto" src="${p.imagem}" alt="${p.nome}">
        <div class="linha-produto-info">
          <strong>${p.nome}</strong>
          <span class="linha-produto-categoria">${p.categoria}</span>
        </div>
        <label class="campo-inline">
          <span>Preço</span>
          <input type="number" class="campo-preco" min="0" step="0.01" value="${p.preco}">
        </label>
        <label class="campo-inline">
          <span>Estoque</span>
          <div class="controle-qtd">
            <button type="button" data-acao="subtrair" aria-label="Diminuir estoque">−</button>
            <input type="number" class="campo-estoque" min="0" value="${p.estoque}">
            <button type="button" data-acao="somar" aria-label="Aumentar estoque">+</button>
          </div>
        </label>
        <button type="button" class="botao botao--contorno botao-excluir">Excluir</button>
      </div>
    `).join('') || '<p class="carrinho-vazio">Nenhum produto cadastrado ainda.</p>';
  }

  /* ---------- Edição de preço e estoque ---------- */
  lista.addEventListener('change', (e) => {
    const linha = e.target.closest('.linha-produto');
    if (!linha) return;
    const produtos = obterProdutos();
    const produto = produtos.find(p => p.id === linha.dataset.id);
    if (!produto) return;

    if (e.target.classList.contains('campo-preco')) {
      produto.preco = Math.max(0, parseFloat(e.target.value) || 0);
      e.target.value = produto.preco;
      salvarProdutos(produtos);
      atualizarResumo(produtos);
      mostrarAviso(`Preço de "${produto.nome}" atualizado para ${formatarPrecoBRL(produto.preco)}.`);
    }

    if (e.target.classList.contains('campo-estoque')) {
      produto.estoque = Math.max(0, parseInt(e.target.value, 10) || 0);
      e.target.value = produto.estoque;
      salvarProdutos(produtos);
      atualizarResumo(produtos);
      mostrarAviso(`Estoque de "${produto.nome}" atualizado para ${produto.estoque} unidade(s).`);
    }
  });

  /* ---------- Botões +/- de estoque e exclusão ---------- */
  lista.addEventListener('click', (e) => {
    const linha = e.target.closest('.linha-produto');
    if (!linha) return;

    if (e.target.dataset.acao === 'somar' || e.target.dataset.acao === 'subtrair') {
      const input = linha.querySelector('.campo-estoque');
      let valor = parseInt(input.value, 10) || 0;
      valor += e.target.dataset.acao === 'somar' ? 1 : -1;
      input.value = Math.max(0, valor);
      input.dispatchEvent(new Event('change'));
    }

    if (e.target.classList.contains('botao-excluir')) {
      const produtos = obterProdutos();
      const produto = produtos.find(p => p.id === linha.dataset.id);
      if (!produto) return;
      if (!confirm(`Remover "${produto.nome}" do catálogo? Essa ação não pode ser desfeita.`)) return;
      salvarProdutos(produtos.filter(p => p.id !== produto.id));
      mostrarAviso(`"${produto.nome}" removido do catálogo.`);
      renderizar();
    }
  });

  /* ---------- Cadastro de novo produto ---------- */
  formNovo.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('novo-nome').value.trim();
    const categoria = document.getElementById('novo-categoria').value.trim().toLowerCase();
    const preco = Math.max(0, parseFloat(document.getElementById('novo-preco').value) || 0);
    const estoque = Math.max(0, parseInt(document.getElementById('novo-estoque').value, 10) || 0);
    const imagem = document.getElementById('novo-imagem').value.trim();
    const imagemAlt = document.getElementById('novo-imagem-alt').value.trim();
    const descricao = document.getElementById('novo-descricao').value.trim();

    if (!nome || !categoria || !imagem) {
      mostrarAviso('Preencha ao menos nome, categoria e imagem principal.');
      return;
    }

    const produtos = obterProdutos();
    produtos.push({ id: gerarIdProduto(nome), nome, categoria, descricao, preco, estoque, imagem, imagemAlt });
    salvarProdutos(produtos);

    formNovo.reset();
    mostrarAviso(`"${nome}" adicionado ao catálogo.`);
    renderizar();
  });

  renderizar();
});
