/* 608 Flores — painel: abas, dashboard, pedidos, estoque e financeiro */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  if (!$('aba-dashboard')) return;
  const R = formatarPrecoBRL, esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const st = { aba: 'dashboard', tipo: 'mes', ref: new Date() };
  const fmt = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const iv = () => intervalo(st.tipo, st.ref);
  const aviso = (t) => { const a = $('aviso-admin'); a.textContent = t; a.classList.add('visivel'); setTimeout(() => a.classList.remove('visivel'), 2800); };
  const card = (n, l) => `<div class="estatistica-cartao"><span class="estatistica-numero">${n}</span><span class="estatistica-legenda">${l}</span></div>`;

  function rotuloPeriodo() {
    const [a, b] = iv(), d = (x) => x.toLocaleDateString('pt-BR');
    return st.tipo === 'ano' ? a.getFullYear() : st.tipo === 'mes' ? a.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : `${d(a)} a ${d(new Date(b - 1))}`;
  }
  function dashboard() {
    const c = calcular(iv()), s = serie(st.tipo, iv()), max = Math.max(1, ...s.map(x => Math.max(x.receita, x.despesas)));
    $('aba-dashboard').innerHTML = `<div class="resumo-admin">
      ${card(c.novos, 'Pedidos novos')}${card(c.andamento, 'Em andamento')}${card(c.concluidos, 'Concluídos')}${card(c.cancelados, 'Cancelados')}
      ${card(R(c.liquida), 'Receita líquida')}${card(R(c.despesas), 'Despesas')}${card(R(c.lucroLiquido), 'Lucro líquido')}${card(c.vendas, 'Vendas')}
      ${card(c.estoque, 'Estoque atual (un.)')}${card(c.entradas, 'Entradas no período')}${card(c.saidas, 'Saídas no período')}${card(c.baixo.length, 'Baixo estoque (≤ ' + BAIXO_ESTOQUE + ')')}</div>
      <h3 class="titulo-painel">Receita líquida × despesas</h3>
      <div class="grafico">${s.map(x => `<div class="grafico-col" title="${x.rotulo}: ${R(x.receita)} / ${R(x.despesas)}"><div class="grafico-barras"><i class="b-rec" style="height:${Math.max(0, x.receita) / max * 100}%"></i><i class="b-desp" style="height:${x.despesas / max * 100}%"></i></div><span>${x.rotulo}</span></div>`).join('')}</div>
      <p class="legenda-grafico"><i class="b-rec"></i> Receita líquida <i class="b-desp"></i> Despesas</p>
      ${c.baixo.length ? `<h3 class="titulo-painel">Produtos com baixo estoque</h3><p>${c.baixo.map(p => `${esc(p.nome)} (${p.estoque})`).join(' · ')}</p>` : ''}`;
  }
  function pedidos() {
    const l = lerJ(K.ped).filter(p => !p.excluido).reverse();
    $('aba-pedidos').innerHTML = l.map(p => {
      const ult = p.historico[p.historico.length - 1];
      return `<div class="linha-produto pedido" data-id="${p.id}"><div class="linha-produto-info"><strong>Pedido #${p.num}</strong><span class="linha-produto-categoria">${p.itens.map(i => i.qtd + 'x ' + esc(i.nome)).join(', ')}</span>
        <small>${fmt(p.historico[0].data)} · Total ${R(p.subtotal - (p.desconto || 0))}${p.desconto ? ' (desc. ' + R(p.desconto) + ')' : ''} · Último: ${esc(ult.status)} por ${esc(ult.resp)}, ${fmt(ult.data)}</small></div>
        <select class="campo-estado" ${p.status === 'cancelado' ? 'disabled' : ''}>${Object.entries(ESTADOS).map(([k, v]) => `<option value="${k}" ${k === p.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
        ${!['concluido', 'cancelado'].includes(p.status) ? '<button type="button" class="botao botao--contorno" data-a="desc">Desconto</button>' : ''}
        ${p.status === 'concluido' ? '<button type="button" class="botao botao--contorno" data-a="reemb">Reembolso</button>' : ''}
        <button type="button" class="botao botao--contorno" data-a="hist">Histórico</button><button type="button" class="botao botao--contorno" data-a="del">Excluir</button></div>`;
    }).join('') || '<p class="carrinho-vazio">Nenhum pedido registrado ainda.</p>';
  }
  function estoque() {
    const prods = obterProdutos(), m = lerJ(K.mov).filter(x => dentro(new Date(x.data), iv())).reverse();
    $('aba-estoque').innerHTML = `<form id="form-mov" class="formulario-produto">
      <div class="campo"><label>Produto</label><select id="mov-prod">${prods.map(p => `<option value="${p.id}">${esc(p.nome)} (${p.estoque})</option>`).join('')}</select></div>
      <div class="campo"><label>Tipo</label><select id="mov-tipo"><option value="compra">Compra (entrada)</option><option value="perda">Perda (saída)</option><option value="avaria">Avaria (saída)</option><option value="ajuste+">Ajuste (+)</option><option value="ajuste-">Ajuste (−)</option><option value="devolucao">Devolução (entrada)</option></select></div>
      <div class="campo"><label>Quantidade</label><input type="number" id="mov-qtd" min="1" step="1" required></div>
      <div class="campo"><label>Custo unitário (R$)</label><input type="number" id="mov-custo" min="0" step="0.01" placeholder="obrigatório em compras"></div>
      <div class="campo campo-descricao"><label>Motivo</label><input type="text" id="mov-motivo" required></div>
      <button type="submit" class="botao botao--primario">Registrar</button></form>
      <div class="tabela-rolavel"><table class="tabela-admin"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Custo un.</th><th>Motivo</th><th>Resp.</th></tr></thead><tbody>${m.map(x => `<tr><td>${fmt(x.data)}</td><td>${esc(x.produto)}</td><td>${esc(x.tipo)}</td><td>${x.qtd}</td><td>${R(x.custo)}</td><td>${esc(x.motivo)}</td><td>${esc(x.resp)}</td></tr>`).join('') || '<tr><td colspan="7">Sem movimentações no período.</td></tr>'}</tbody></table></div>`;
  }
  function financeiro() {
    const c = calcular(iv()), d = lerJ(K.desp).filter(x => dentro(dataDesp(x), iv())).reverse();
    $('aba-financeiro').innerHTML = `<div class="resumo-admin">${card(R(c.bruta), 'Receita bruta')}${card(R(c.descontos), 'Descontos')}${card(R(c.reembolsos), 'Reembolsos')}${card(R(c.liquida), 'Receita líquida')}${card(R(c.cpv), 'CPV')}${card(R(c.lucroBruto), 'Lucro bruto')}${card(R(c.despesas), 'Despesas operacionais')}${card(R(c.lucroLiquido), 'Lucro líquido')}${card(R(c.ticket), 'Ticket médio')}${card(c.margem.toFixed(1).replace('.', ',') + '%', 'Margem líquida')}</div>
      <h3 class="titulo-painel">Registrar despesa</h3>
      <form id="form-desp" class="formulario-produto"><div class="campo"><label>Data</label><input type="date" id="desp-data" required value="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="campo"><label>Categoria</label><select id="desp-cat"><option>Embalagens</option><option>Entregas</option><option>Contas</option><option>Taxas</option><option>Outras</option></select></div>
      <div class="campo"><label>Valor (R$)</label><input type="number" id="desp-valor" min="0.01" step="0.01" required></div>
      <div class="campo campo-descricao"><label>Descrição</label><input type="text" id="desp-desc" required></div><button type="submit" class="botao botao--primario">Registrar</button></form>
      <div class="tabela-rolavel"><table class="tabela-admin"><thead><tr><th>Data</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Resp.</th></tr></thead><tbody>${d.map(x => `<tr><td>${dataDesp(x).toLocaleDateString('pt-BR')}</td><td>${esc(x.categoria)}</td><td>${esc(x.descricao)}</td><td>${R(x.valor)}</td><td>${esc(x.resp)}</td></tr>`).join('') || '<tr><td colspan="5">Sem despesas no período.</td></tr>'}</tbody></table></div>`;
  }
  const CHAVE_CLIENTES = 'flores608_clientes';
  const secClientes = document.createElement('section');
  secClientes.className = 'painel-aba'; secClientes.id = 'aba-clientes'; secClientes.hidden = true;
  $('aba-financeiro').after(secClientes);
  const abaClientes = document.createElement('button');
  abaClientes.type = 'button'; abaClientes.className = 'aba-link'; abaClientes.dataset.aba = 'clientes'; abaClientes.textContent = 'Clientes';
  document.querySelector('#abas-admin [data-aba="financeiro"]').after(abaClientes);
  function clientes() {
    const l = lerJ(CHAVE_CLIENTES);
    secClientes.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.6rem"><p style="margin:0">${l.length} cliente(s) cadastrado(s)</p><button type="button" class="botao botao--primario" data-a="exp">Exportar (CSV)</button></div>
      <div class="tabela-rolavel"><table class="tabela-admin"><thead><tr><th>Nome</th><th>E-mail</th><th>Cadastro</th><th></th></tr></thead><tbody>${l.map(c => `<tr><td>${esc(c.nome)}</td><td>${esc(c.email)}</td><td>${c.criado ? fmt(c.criado) : '—'}</td><td><button type="button" class="botao botao--contorno" data-a="del" data-email="${esc(c.email)}">Excluir</button></td></tr>`).join('') || '<tr><td colspan="4">Nenhum cliente cadastrado neste navegador.</td></tr>'}</tbody></table></div>`;
  }
  secClientes.addEventListener('click', (e) => {
    const a = e.target.dataset.a; if (!a) return;
    if (a === 'exp') exportarCSV('clientes', iv());
    if (a === 'del') {
      const email = e.target.dataset.email, c = lerJ(CHAVE_CLIENTES).find(x => x.email === email);
      if (c && confirm(`Excluir o cadastro de ${c.nome} (${c.email})? O cliente precisará se cadastrar de novo.`)) {
        salvarJ(CHAVE_CLIENTES, lerJ(CHAVE_CLIENTES).filter(x => x.email !== email)); aviso('Cadastro excluído.'); render();
      }
    }
  });
  const vistas = { dashboard, pedidos, estoque, financeiro, clientes };
  function render() {
    document.querySelectorAll('[data-aba]').forEach(b => b.classList.toggle('ativa', b.dataset.aba === st.aba));
    document.querySelectorAll('.painel-aba').forEach(p => p.hidden = p.id !== 'aba-' + st.aba);
    $('barra-periodo').hidden = st.aba === 'catalogo' || st.aba === 'pedidos' || st.aba === 'clientes';
    $('rotulo-periodo').textContent = rotuloPeriodo();
    document.querySelectorAll('[data-tipo]').forEach(b => b.classList.toggle('ativa', b.dataset.tipo === st.tipo));
    if (vistas[st.aba]) vistas[st.aba]();
  }
  document.querySelectorAll('[data-aba]').forEach(b => b.addEventListener('click', () => { st.aba = b.dataset.aba; render(); }));
  document.querySelectorAll('[data-tipo]').forEach(b => b.addEventListener('click', () => { st.tipo = b.dataset.tipo; render(); }));
  $('periodo-ant').addEventListener('click', () => { const a = iv()[0]; st.ref = st.tipo === 'semana' ? new Date(a.getFullYear(), a.getMonth(), a.getDate() - 7) : st.tipo === 'mes' ? new Date(a.getFullYear(), a.getMonth() - 1, 1) : new Date(a.getFullYear() - 1, 0, 1); render(); });
  $('periodo-prox').addEventListener('click', () => { st.ref = iv()[1]; render(); });
  $('exportar').addEventListener('click', () => exportarCSV($('exportar-aba').value, iv()));
  $('sair-admin').addEventListener('click', () => window.sairAdmin());

  $('aba-pedidos').addEventListener('change', (e) => {
    if (!e.target.classList.contains('campo-estado')) return;
    const id = e.target.closest('.pedido').dataset.id;
    if (e.target.value === 'cancelado' && !confirm('Cancelar o pedido? Os itens voltam ao estoque.')) { render(); return; }
    mudarEstado(id, e.target.value); aviso('Estado atualizado.'); render();
  });
  $('aba-pedidos').addEventListener('click', (e) => {
    const a = e.target.dataset.a; if (!a) return;
    const id = e.target.closest('.pedido').dataset.id, p = lerJ(K.ped).find(x => x.id === id);
    if (a === 'del' && confirm('Excluir o pedido #' + p.num + '? Registros financeiros, histórico e movimentações de estoque são mantidos.')) { excluirPedido(id); aviso('Pedido excluído.'); }
    if (a === 'hist') alert(p.historico.map(h => `${fmt(h.data)} — ${ESTADOS[h.status] || h.status} — ${h.resp}`).join('\n'));
    if (a === 'desc') { const v = parseFloat(prompt('Desconto em R$ (máx. ' + p.subtotal.toFixed(2) + '):', p.desconto || 0)); if (!isNaN(v) && v >= 0 && v <= p.subtotal) atualizarPedido(id, x => { x.desconto = v; }); }
    if (a === 'reemb') { const v = parseFloat(prompt('Valor reembolsado em R$:', '0')); if (!isNaN(v) && v > 0) reembolsar(id, v, confirm('Devolver os itens ao estoque?')); }
    render();
  });
  $('aba-estoque').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('mov-tipo').value, q = parseInt($('mov-qtd').value, 10), custo = $('mov-custo').value === '' ? null : parseFloat($('mov-custo').value);
    if (t === 'compra' && custo == null) { aviso('Informe o custo unitário da compra.'); return; }
    const entrada = ['compra', 'ajuste+', 'devolucao'].includes(t);
    movimentar($('mov-prod').value, t.replace(/[+-]/, ''), entrada ? q : -q, custo, $('mov-motivo').value.trim());
    aviso('Movimentação registrada.'); render();
  });
  $('aba-financeiro').addEventListener('submit', (e) => {
    e.preventDefault();
    const l = lerJ(K.desp); l.push({ id: uid('d'), data: $('desp-data').value, categoria: $('desp-cat').value, descricao: $('desp-desc').value.trim(), valor: parseFloat($('desp-valor').value), resp: responsavel() });
    salvarJ(K.desp, l); aviso('Despesa registrada.'); render();
  });
  render();
});
