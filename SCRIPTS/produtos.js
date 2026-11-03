/* =========================================================
   608 Flores e Floricultura — dados de produtos (localStorage)
   Compartilhado entre vendas.html e admin.html
   ========================================================= */

const CHAVE_PRODUTOS = 'flores608_produtos';

function produtosPadrao() {
  return [
    {
      id: 'girassol',
      nome: 'Buquê de Girassóis',
      categoria: 'girassol',
      descricao: 'Girassóis frescos, folhagens e um toque de flor-de-cera. Alegria garantida para presentear.',
      preco: 89.90,
      estoque: 12,
      imagem: '../../IMG/BuqueGirassol.jpg',
      imagemAlt: '../../IMG/BuqueGirassol2.webp'
    },
    {
      id: 'lirios',
      nome: 'Buquê de Lírios Brancos',
      categoria: 'lirios',
      descricao: 'Lírios brancos com folhagens nobres. Elegância para homenagens e agradecimentos.',
      preco: 109.90,
      estoque: 8,
      imagem: '../../IMG/BuqueLiriosBrancos.jpg',
      imagemAlt: '../../IMG/BuqueLiriosBrancos2.jpg'
    },
    {
      id: 'rosas',
      nome: 'Buquê de Rosas Vermelhas',
      categoria: 'rosas',
      descricao: 'Rosas vermelhas selecionadas uma a uma. O clássico para declarar amor e paixão.',
      preco: 129.90,
      estoque: 15,
      imagem: '../../IMG/BuqueRosasVermelhas2.jpg',
      imagemAlt: ''
    }
  ];
}

function obterProdutos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_PRODUTOS));
    if (Array.isArray(dados) && dados.length) return dados;
  } catch (erro) {
    /* localStorage inválido — segue para o catálogo padrão */
  }
  const padrao = produtosPadrao();
  salvarProdutos(padrao);
  return padrao;
}

function salvarProdutos(lista) {
  localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(lista));
}

function gerarIdProduto(nome) {
  const base = nome
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'produto';

  const existentes = obterProdutos().map(p => p.id);
  let idFinal = base;
  let sufixo = 1;
  while (existentes.includes(idFinal)) {
    sufixo += 1;
    idFinal = `${base}-${sufixo}`;
  }
  return idFinal;
}

function formatarPrecoBRL(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
