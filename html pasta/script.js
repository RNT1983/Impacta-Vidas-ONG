function setupVolForm() {
  const volForm = document.getElementById('vol-form');
  if (!volForm) return;

  const nome = document.getElementById('nome');
  const cpf = document.getElementById('cpf');
  const tel = document.getElementById('telefone');
  const cep = document.getElementById('cep');

  // ======= Máscaras =======
  cpf.addEventListener('input', () => cpf.value = maskCPF(cpf.value));
  tel.addEventListener('input', () => tel.value = maskPhone(tel.value));
  cep.addEventListener('input', () => cep.value = maskCEP(cep.value));

  // ======= Validações =======
  function validarCPF(cpfStr) {
    const cpfNum = cpfStr.replace(/\D/g, '');
    if (cpfNum.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpfNum)) return false; // bloqueia CPFs como 000.000.000-00

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpfNum.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNum.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpfNum.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfNum.substring(10, 11))) return false;

    return true;
  }

  function validarTelefone(telStr) {
    const telNum = telStr.replace(/\D/g, '');
    // 10 dígitos fixo (DDD + 8) ou 11 dígitos celular (DDD + 9 + 8)
    return telNum.length === 10 || telNum.length === 11;
  }

  function validarCEP(cepStr) {
    const cepNum = cepStr.replace(/\D/g, '');
    return cepNum.length === 8;
  }

  // ======= Envio do formulário =======
  volForm.addEventListener('submit', e => {
    e.preventDefault();

    // 1️⃣ Verificação HTML5 (campos obrigatórios)
    if (!volForm.checkValidity()) {
      volForm.reportValidity();
      return;
    }

    // 2️⃣ Validação de CPF
    if (!validarCPF(cpf.value)) {
      showToast('CPF inválido ou incompleto. Verifique e tente novamente.');
      cpf.focus();
      return;
    }

    // 3️⃣ Validação de Telefone
    if (!validarTelefone(tel.value)) {
      showToast('Telefone inválido. Use o formato (XX) XXXXX-XXXX.');
      tel.focus();
      return;
    }

    // 4️⃣ Validação de CEP
    if (!validarCEP(cep.value)) {
      showToast('CEP inválido ou incompleto. Deve conter 8 dígitos.');
      cep.focus();
      return;
    }

    // 5️⃣ Se tudo estiver certo — salva no localStorage
    const data = Object.fromEntries(new FormData(volForm));
    localStorage.setItem('voluntario', JSON.stringify(data));

    showToast('Inscrição enviada — obrigado!');
    volForm.reset();
  });
}
