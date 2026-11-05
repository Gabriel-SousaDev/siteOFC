/* Login e cadastro de clientes; o administrador entra por aqui e vai direto ao painel */
const CHAVE_CLIENTES = 'flores608_clientes';
const clientes = () => lerJ(CHAVE_CLIENTES);
const normalizar = (t) => String(t || '').trim().toLowerCase();

async function novoHash(senha) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return { sal: Array.from(sal).map(b => b.toString(16).padStart(2, '0')).join(''), hash: await Auth.hash(senha, sal) };
}
const semCripto = () => (!window.crypto || !crypto.subtle) ? 'Abra o site por https ou localhost para usar o login.' : '';

async function cadastrar(nome, email, senha) {
  email = normalizar(email);
  if (semCripto()) return { ok: false, msg: semCripto() };
  const erro = validarSenha(senha); if (erro) return { ok: false, msg: erro };
  if (email === Auth.ADMIN.email || clientes().some(c => c.email === email)) return { ok: false, msg: 'Este e-mail já está cadastrado.' };
  const l = clientes(); l.push({ nome: nome.trim(), email, criado: agora(), ...await novoHash(senha) }); salvarJ(CHAVE_CLIENTES, l);
  return { ok: true, msg: 'Cadastro realizado com sucesso! Você já pode entrar.' };
}
async function entrar(email, senha) {
  email = normalizar(email);
  if (semCripto()) return { ok: false, msg: semCripto() };
  if (await Auth.ehAdmin(email, senha)) return { ok: true, admin: true };
  const c = clientes().find(x => x.email === email);
  if (c && await Auth.hash(senha, Auth.bytes(c.sal)) === c.hash) return { ok: true, msg: 'Login realizado com sucesso! Bem-vinda(o) de volta, ' + c.nome.split(' ')[0] + '.' };
  return { ok: false, msg: 'E-mail ou senha incorretos.' };
}
async function redefinirSenha(email, nome, nova) {
  email = normalizar(email);
  if (semCripto()) return { ok: false, msg: semCripto() };
  if (email === Auth.ADMIN.email) return { ok: false, msg: 'Esta conta não pode ser redefinida por aqui.' };
  const erro = validarSenha(nova); if (erro) return { ok: false, msg: erro };
  const l = clientes(), c = l.find(x => x.email === email);
  if (!c || normalizar(c.nome) !== normalizar(nome)) return { ok: false, msg: 'Não encontramos um cadastro com esse e-mail e nome.' };
  Object.assign(c, await novoHash(nova)); salvarJ(CHAVE_CLIENTES, l);
  return { ok: true, msg: 'Senha alterada com sucesso! Entre com a nova senha.' };
}

document.addEventListener('DOMContentLoaded', () => {
  const abas = document.querySelectorAll('.aba-acesso');
  const formularios = document.querySelectorAll('.formulario-acesso');
  const mostrar = (id) => { formularios.forEach(f => f.classList.toggle('ativo', f.id === id)); };

  abas.forEach(aba => {
    aba.addEventListener('click', () => {
      abas.forEach(a => a.classList.remove('ativa'));
      aba.classList.add('ativa');
      mostrar(aba.dataset.alvo);
    });
  });

  document.querySelectorAll('.alterna-senha').forEach(botao => {
    botao.addEventListener('click', () => {
      const campo = document.getElementById(botao.dataset.campo);
      const visivel = campo.type === 'text';
      campo.type = visivel ? 'password' : 'text';
      botao.textContent = visivel ? 'mostrar' : 'ocultar';
    });
  });

  const val = (id) => document.getElementById(id).value;
  const msg = (id, r) => { const el = document.getElementById(id); el.textContent = r.msg || ''; };

  document.getElementById('form-entrar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await entrar(val('email-entrar'), val('senha-entrar'));
    if (r.admin) { Auth.iniciarSessao(normalizar(val('email-entrar'))); return; }
    msg('mensagem-entrar', r);
  });

  document.getElementById('form-cadastrar').addEventListener('submit', async (e) => {
    e.preventDefault();
    msg('mensagem-cadastrar', await cadastrar(val('nome-cadastro'), val('email-cadastro'), val('senha-cadastro')));
  });

  document.getElementById('abrir-recuperar').addEventListener('click', () => { abas.forEach(a => a.classList.remove('ativa')); mostrar('form-recuperar'); });
  document.getElementById('voltar-entrar').addEventListener('click', () => { abas[0].classList.add('ativa'); mostrar('form-entrar'); });
  document.getElementById('form-recuperar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await redefinirSenha(val('email-recuperar'), val('nome-recuperar'), val('senha-recuperar'));
    msg('mensagem-recuperar', r);
    if (r.ok) e.target.reset();
  });
});
