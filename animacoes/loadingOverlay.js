/**
 * 
 * @param {string} url - Informe o caminho que será acessado. 
 * @param {number} time - Informe o tempo antes de ser executada. Ex: 1000 = 1seg
 * @param {boolean} smae_page - true executa na mesma página, e false exuta em outra página.
 */

function showLoadingBtnAnimation(url, time, smae_page = true) {
  const overlay = document.getElementById('loadingOverlay');

  overlay.classList.add('active');
  setTimeout(() => {
    if (smae_page === true) {
      window.location.href = `${url}`;
    } else {
      window.open(url);
    }
    overlay.classList.remove('active');
  }, time);
};

function showloadingFormAnimation() {
  const overlay = document.getElementById('loadingOverlay');
  return overlay.classList.add('active');
};

/**
 * 
 * @param {formulário} form - Informe o formulário a ser resetado apos a execução da função.
 * @param {string} url - Informe o caminho que será acessado.
 * @param {boolean} smae_page - true executa na mesma página, e false exuta em outra página.
 */

function hideloadingFormAnimation(form, url, smae_page = true) {
  const overlay = document.getElementById('loadingOverlay');
  form.reset();
  if (smae_page === true) {
    window.location.href = `${url}`;
  } else {
    window.open(url);
  }
  return overlay.classList.remove('active');
};

export { showLoadingBtnAnimation, showloadingFormAnimation, hideloadingFormAnimation };