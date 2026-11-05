/* Acesso administrativo (client-side): senha guardada só como hash PBKDF2; sessão expira em 2h */
(function () {
  const sessaoValida = () => { try { return JSON.parse(sessionStorage.getItem(K.sess)).exp > Date.now(); } catch (e) { return false; } };
  const hash = async (senha, sal) => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: sal, iterations: 150000, hash: 'SHA-256' }, base, 256);
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  };
  const bytes = (h) => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));

  if (document.currentScript && document.currentScript.dataset.guard) {
    if (!sessaoValida()) location.replace('admin-login.html'); else document.documentElement.style.visibility = 'visible';
    window.sairAdmin = () => { sessionStorage.removeItem(K.sess); location.replace('admin-login.html'); };
    return;
  }
  /* Acesso único do administrador (a senha não aparece no código, só o hash) */
  const ADMIN = { email: 'admin@608flores.com', sal: '7a1c0d0b10a9e4864d7b4b7430ce5996', hash: 'a68f63cd8fa0cece329085579cef5358a21422df91c0961e145a559a55328fdf' };

  window.Auth = {
    hash, bytes, ADMIN,
    ehAdmin: async (email, senha) => email === ADMIN.email && await hash(senha, bytes(ADMIN.sal)) === ADMIN.hash,
    iniciarSessao: (email) => { sessionStorage.setItem(K.sess, JSON.stringify({ email, exp: Date.now() + 72e5 })); location.href = 'admin.html'; }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-admin'); if (!form) return;
    const msg = document.getElementById('mensagem-admin');
    if (sessaoValida()) { location.replace('admin.html'); return; }
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = '';
      if (!window.crypto || !crypto.subtle) { msg.textContent = 'Abra o site por https ou localhost para usar o acesso administrativo.'; return; }
      const email = document.getElementById('email-admin').value.trim().toLowerCase(), senha = document.getElementById('senha-admin').value;
      if (!await Auth.ehAdmin(email, senha)) { msg.textContent = 'E-mail ou senha incorretos.'; return; }
      Auth.iniciarSessao(email);
    });
  });
})();
