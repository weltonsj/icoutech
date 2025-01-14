function showLoadingBtnAnimation() {
  // Mostra o overlay e bloqueia interação com a página
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');  
  setTimeout(() => {
    overlay.classList.remove('active');
  }, 3000);
}

function showloadingFormAnimation (form) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');

  // Simula o envio do formulário
  setTimeout(() => {
    form.reset();
    overlay.classList.remove('active');
  }, 5000); // Simulação de 3 segundos
}

export { showLoadingBtnAnimation, showloadingFormAnimation };