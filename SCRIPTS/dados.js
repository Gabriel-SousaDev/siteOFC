/* 608 Flores — pedidos, estoque (custo médio), despesas e finanças (localStorage) */
const K = { ped: 'flores608_pedidos', mov: 'flores608_movimentos', desp: 'flores608_despesas', cred: 'flores608_admin', sess: 'flores608_sessao' };
const ESTADOS = { novo: 'Novo', confirmado: 'Confirmado', preparacao: 'Em preparação', pronto: 'Pronto para retirada', entrega: 'Saiu para entrega', concluido: 'Concluído', cancelado: 'Cancelado' };
const BAIXO_ESTOQUE = 5;
const lerJ = (k) => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
const salvarJ = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const agora = () => new Date().toISOString();
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const validarSenha = (s) => ((s || '').length >= 8 ? '' : 'A senha deve ter no mínimo 8 caracteres.');
function responsavel() { try { return JSON.parse(sessionStorage.getItem(K.sess)).email; } catch (e) { return 'cliente'; } }

/* ---- Estoque: toda alteração gera movimentação; custo médio ponderado ---- */
function movimentar(produtoId, tipo, qtd, custo, motivo) {
  const prods = obterProdutos();
  const p = prods.find(x => x.id === produtoId);
  if (!p || !qtd) return 0;
  const est = Number(p.estoque) || 0, med = Number(p.custoMedio) || 0;
  if (qtd > 0) {
    const c = custo == null || isNaN(custo) ? med : Number(custo);
    p.custoMedio = est + qtd ? (est * med + qtd * c) / (est + qtd) : c;
    p.estoque = est + qtd; custo = c;
  } else {
    qtd = -Math.min(-qtd, est); custo = med; p.estoque = est + qtd;
    if (!qtd) return med;
  }
  salvarProdutos(prods);
  const m = lerJ(K.mov);
  m.push({ id: uid('m'), data: agora(), produtoId, produto: p.nome, tipo, qtd, custo: +custo.toFixed(4), motivo: motivo || '', resp: responsavel() });
  salvarJ(K.mov, m);
  return custo;
}

/* ---- Pedidos ---- */
function criarPedido(itens) {
  const ped = lerJ(K.ped);
  const num = ped.length + 1;
  const linhas = itens.map(i => ({ id: i.id, nome: i.nome, qtd: i.quantidade, preco: i.preco, custo: movimentar(i.id, 'venda', -i.quantidade, null, 'Pedido #' + num) }));
  const p = { id: uid('p'), num, itens: linhas, subtotal: linhas.reduce((s, i) => s + i.preco * i.qtd, 0), desconto: 0, reembolsos: [], status: 'novo', excluido: false, historico: [{ status: 'novo', data: agora(), resp: 'cliente' }] };
  ped.push(p); salvarJ(K.ped, ped);
  return p;
}
function atualizarPedido(id, fn) { const l = lerJ(K.ped); const p = l.find(x => x.id === id); if (p) { fn(p); salvarJ(K.ped, l); } }
function mudarEstado(id, estado) {
  atualizarPedido(id, p => {
    if (p.status === estado || p.status === 'cancelado') return;
    if (estado === 'cancelado') p.itens.forEach(i => movimentar(i.id, 'cancelamento', i.qtd, i.custo, 'Pedido #' + p.num));
    p.status = estado; p.historico.push({ status: estado, data: agora(), resp: responsavel() });
  });
}
function excluirPedido(id) {
  const p = lerJ(K.ped).find(x => x.id === id);
  if (p && !['concluido', 'cancelado'].includes(p.status)) mudarEstado(id, 'cancelado');
  atualizarPedido(id, x => { x.excluido = true; x.historico.push({ status: 'excluído', data: agora(), resp: responsavel() }); });
}
function reembolsar(id, valor, devolver) {
  atualizarPedido(id, p => {
    p.reembolsos.push({ data: agora(), valor, devolveu: devolver, resp: responsavel() });
    if (devolver) p.itens.forEach(i => movimentar(i.id, 'devolucao', i.qtd, i.custo, 'Pedido #' + p.num));
  });
}
const dataConclusao = (p) => { const h = p.historico.filter(x => x.status === 'concluido').pop(); return h && new Date(h.data); };

/* ---- Períodos e indicadores ---- */
function intervalo(tipo, ref) {
  let a = new Date(ref), b;
  if (tipo === 'semana') { a = new Date(a.getFullYear(), a.getMonth(), a.getDate() - (a.getDay() + 6) % 7); b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7); }
  else if (tipo === 'mes') { a = new Date(a.getFullYear(), a.getMonth(), 1); b = new Date(a.getFullYear(), a.getMonth() + 1, 1); }
  else { a = new Date(a.getFullYear(), 0, 1); b = new Date(a.getFullYear() + 1, 0, 1); }
  return [a, b];
}
const dentro = (d, [a, b]) => d && d >= a && d < b;
const dataDesp = (d) => new Date(d.data + 'T00:00:00');
const soma = (l, f) => l.reduce((s, x) => s + f(x), 0);

function calcular(iv) {
  const ped = lerJ(K.ped);
  const concl = ped.filter(p => p.status === 'concluido' && dentro(dataConclusao(p), iv));
  const bruta = soma(concl, p => p.subtotal), descontos = soma(concl, p => p.desconto || 0);
  const reembolsos = soma(ped, p => soma(p.reembolsos.filter(r => dentro(new Date(r.data), iv)), r => r.valor));
  const liquida = bruta - descontos - reembolsos;
  const cpv = soma(concl, p => soma(p.itens, i => i.custo * i.qtd));
  const despesas = soma(lerJ(K.desp).filter(d => dentro(dataDesp(d), iv)), d => d.valor);
  const lucroBruto = liquida - cpv, lucroLiquido = lucroBruto - despesas;
  const grupo = (p) => { const u = new Date(p.historico[p.historico.length - 1].data); return dentro(new Date(p.historico.filter(h => h.status !== 'excluído').pop().data), iv) || dentro(u, iv); };
  const doPeriodo = ped.filter(grupo);
  const prods = obterProdutos(), mov = lerJ(K.mov).filter(m => dentro(new Date(m.data), iv));
  return {
    bruta, descontos, reembolsos, liquida, cpv, lucroBruto, despesas, lucroLiquido, vendas: concl.length,
    ticket: concl.length ? liquida / concl.length : 0,
    margem: liquida ? lucroLiquido / liquida * 100 : 0,
    novos: doPeriodo.filter(p => p.status === 'novo').length,
    andamento: doPeriodo.filter(p => ['confirmado', 'preparacao', 'pronto', 'entrega'].includes(p.status)).length,
    concluidos: concl.length, cancelados: doPeriodo.filter(p => p.status === 'cancelado').length,
    estoque: soma(prods, p => Number(p.estoque) || 0),
    entradas: soma(mov.filter(m => m.qtd > 0), m => m.qtd), saidas: -soma(mov.filter(m => m.qtd < 0), m => m.qtd),
    baixo: prods.filter(p => Number(p.estoque) <= BAIXO_ESTOQUE)
  };
}
function serie(tipo, iv) {
  const dias = tipo === 'ano' ? null : Math.round((iv[1] - iv[0]) / 864e5);
  const n = tipo === 'ano' ? 12 : dias;
  return Array.from({ length: n }, (_, k) => {
    const a = tipo === 'ano' ? new Date(iv[0].getFullYear(), k, 1) : new Date(iv[0].getFullYear(), iv[0].getMonth(), iv[0].getDate() + k);
    const b = tipo === 'ano' ? new Date(iv[0].getFullYear(), k + 1, 1) : new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
    const c = calcular([a, b]);
    return { rotulo: tipo === 'ano' ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][k] : a.getDate(), receita: c.liquida, despesas: c.despesas };
  });
}

/* ---- Exportação (CSV por aba, mesmos dados do painel) ---- */
function exportarCSV(aba, iv) {
  const f = (d) => new Date(d).toLocaleString('pt-BR'), n = (v) => Number(v).toFixed(2).replace('.', ',');
  let cab, linhas;
  const ped = lerJ(K.ped), c = calcular(iv);
  if (aba === 'pedidos') {
    cab = ['Pedido', 'Status', 'Conclusão', 'Itens', 'Subtotal', 'Desconto', 'Reembolsos', 'CPV'];
    linhas = ped.filter(p => dentro(new Date(p.historico[0].data), iv) || dentro(dataConclusao(p), iv)).map(p => [p.num, ESTADOS[p.status], dataConclusao(p) ? f(dataConclusao(p)) : '', p.itens.map(i => i.qtd + 'x ' + i.nome).join(' | '), n(p.subtotal), n(p.desconto || 0), n(soma(p.reembolsos, r => r.valor)), n(soma(p.itens, i => i.custo * i.qtd))]);
  } else if (aba === 'estoque') {
    cab = ['Data', 'Produto', 'Tipo', 'Quantidade', 'Custo unitário', 'Motivo', 'Responsável'];
    linhas = lerJ(K.mov).filter(m => dentro(new Date(m.data), iv)).map(m => [f(m.data), m.produto, m.tipo, m.qtd, n(m.custo), m.motivo, m.resp]);
  } else if (aba === 'clientes') {
    cab = ['Nome', 'E-mail', 'Data de cadastro'];
    linhas = lerJ('flores608_clientes').map(c => [c.nome, c.email, c.criado ? f(c.criado) : '']);
  } else if (aba === 'lancamentos') {
    cab = ['Data', 'Tipo', 'Descrição', 'Valor'];
    linhas = [];
    ped.filter(p => p.status === 'concluido' && dentro(dataConclusao(p), iv)).forEach(p => linhas.push([f(dataConclusao(p)), 'Receita', 'Pedido #' + p.num, n(p.subtotal - (p.desconto || 0))]));
    ped.forEach(p => p.reembolsos.filter(r => dentro(new Date(r.data), iv)).forEach(r => linhas.push([f(r.data), 'Reembolso', 'Pedido #' + p.num, n(-r.valor)])));
    lerJ(K.desp).filter(d => dentro(dataDesp(d), iv)).forEach(d => linhas.push([dataDesp(d).toLocaleDateString('pt-BR'), 'Despesa', d.categoria + ' — ' + d.descricao, n(-d.valor)]));
  } else {
    cab = ['Indicador', 'Valor'];
    linhas = [['Período', iv[0].toLocaleDateString('pt-BR') + ' a ' + new Date(iv[1] - 1).toLocaleDateString('pt-BR')], ['Receita bruta', n(c.bruta)], ['Descontos', n(c.descontos)], ['Reembolsos', n(c.reembolsos)], ['Receita líquida', n(c.liquida)], ['CPV', n(c.cpv)], ['Lucro bruto', n(c.lucroBruto)], ['Despesas operacionais', n(c.despesas)], ['Lucro líquido', n(c.lucroLiquido)], ['Ticket médio', n(c.ticket)], ['Margem líquida (%)', n(c.margem)]];
  }
  const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const blob = new Blob(['\ufeff' + [cab, ...linhas].map(l => l.map(esc).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '608flores-' + aba + '.csv'; a.click();
}
