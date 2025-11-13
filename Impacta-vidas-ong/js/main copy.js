document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-hamburger');
  const nav = document.getElementById('main-nav');
  const app = document.getElementById('app');
  const toast = document.getElementById('toast');

  // ======= Sistema SPA =======
  const routes = {
    home: `
      <section>
        <h1>Bem-vindo à ONG Social</h1>
        <p>Transformamos vidas através de projetos e ações comunitárias.</p>
      </section>
    `,
    projetos: `
      <section>
        <h1>Projetos</h1>
        <div id="lista-projetos"></div>
      </section>
    `,
    voluntarios: `
      <section>
        <h1>Cadastro de Voluntários</h1>
        <form id="vol-form">
          <label>Nome:<br><input required id="nome" name="nome" /></label><br>
          <label>CPF:<br><input required id="cpf" name="cpf" maxlength="14" /></label><br>
          <label>Telefone:<br><input required id="telefone" name="telefone" /></label><br>
          <label>CEP:<br><input required id="cep" name="cep" /></label><br>
          <button type="submit">Enviar</button>
        </form>
      </section>
    `,
    doacoes: `
      <section>
        <h1>Doações</h1>
        <p>Ajude-nos a continuar nossos projetos sociais.</p>
      </section>
    `,
    transparencia: `
      <section>
        <h1>Transparência</h1>
        <p>Confira nossos relatórios e prestação de contas.</p>
      </section>
    `
  };

  function navigate() {
    const hash = window.location.hash.substring(1) || 'home';
    app.innerHTML = routes[hash] || '<h1>Página não encontrada</h1>';
    if (hash === 'projetos') renderProjetos();
    if (hash === 'voluntarios') setupVolForm();
  }

  window.addEventListener('hashchange', navigate);
  navigate();

  // ======= Menu Responsivo =======
  if (btn) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }
  document.querySelectorAll('.main-nav a').forEach(a => 
    a.addEventListener('click', () => nav.classList.remove('open'))
  );

  // ======= Toast =======
  function showToast(msg, duration = 3000) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ======= Máscaras =======
  const maskCPF = v => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, '$1.$2');
    if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };
  const maskPhone = v => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return d.replace(/(\d{2})(\d+)/, '($1) $2');
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return d.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
  };
  const maskCEP = v => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? d.replace(/(\d{5})(\d+)/, '$1-$2') : d;
  };

  // ======= Função de Validação de CPF =======
  function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
  }

  // ======= SPA Funcionalidades =======
  function setupVolForm() {
    const volForm = document.getElementById('vol-form');
    if (!volForm) return;

    const cpf = document.getElementById('cpf');
    const tel = document.getElementById('telefone');
    const cep = document.getElementById('cep');

    cpf.addEventListener('input', e => cpf.value = maskCPF(cpf.value));
    tel.addEventListener('input', e => tel.value = maskPhone(tel.value));
    cep.addEventListener('input', e => cep.value = maskCEP(cep.value));

    volForm.addEventListener('submit', e => {
      e.preventDefault();

      if (!volForm.checkValidity()) {
        volForm.reportValidity();
        return;
      }

      const cpfValue = cpf.value.replace(/\D/g, '');
      if (!isValidCPF(cpfValue)) {
        showToast('CPF inválido ou incompleto. Verifique e tente novamente.');
        cpf.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(volForm));
      localStorage.setItem('voluntario', JSON.stringify(data));
      showToast('Inscrição enviada — obrigado!');
      volForm.reset();
    });
  }

  // ======= Vue 3 - Integração =======
  function renderProjetos() {
    const container = document.getElementById('lista-projetos');
    if (!container) return;
    
    Vue.createApp({
      data() {
        return {
          projetos: JSON.parse(localStorage.getItem('projetos') || '[]'),
          novo: ''
        };
      },
      methods: {
        adicionar() {
          if (!this.novo.trim()) return;
          this.projetos.push({ nome: this.novo, ativo: true });
          localStorage.setItem('projetos', JSON.stringify(this.projetos));
          this.novo = '';
        },
        remover(i) {
          this.projetos.splice(i, 1);
          localStorage.setItem('projetos', JSON.stringify(this.projetos));
        }
      },
      template: `
        <div>
          <input v-model="novo" placeholder="Novo projeto..." />
          <button @click="adicionar">Adicionar</button>
          <ul>
            <li v-for="(p,i) in projetos" :key="i">
              {{ p.nome }} 
              <button @click="remover(i)">Remover</button>
            </li>
          </ul>
        </div>
      `
    }).mount('#lista-projetos');
  }
});
