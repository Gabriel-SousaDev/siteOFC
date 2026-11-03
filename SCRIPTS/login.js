document.addEventListener('DOMContentLoaded', () => {

  const abas = document.querySelectorAll('.aba-acesso');
  const formularios = document.querySelectorAll('.formulario-acesso');

  abas.forEach(aba => {
    aba.addEventListener('click', () => {
      abas.forEach(a => a.classList.remove('ativa'));
      formularios.forEach(f => f.classList.remove('ativo'));

      aba.classList.add('ativa');
      document.getElementById(aba.dataset.alvo).classList.add('ativo');
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

  const formLogin = document.getElementById('form-entrar');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('mensagem-entrar').textContent = 'Login realizado com sucesso! Bem-vinda(o) de volta.';
    });
  }

  const formCadastro = document.getElementById('form-cadastrar');
  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('mensagem-cadastrar').textContent = 'Cadastro realizado com sucesso! Você já pode entrar.';
    });
  }
});
