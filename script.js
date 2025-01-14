import {showLoadingBtnAnimation, showloadingFormAnimation } from "./animacoes/loadingOverlay.js";
const btnAppAccess = document.getElementById('btn-app-access');

// Botão que dar acessao aplicação iCouTV 
btnAppAccess.addEventListener('click', () => {
  showLoadingBtnAnimation();
  setTimeout(() => {
    window.open("./app/icoutv/login/index.html", "_blank");
  }, 3000);
})

// Máscara para Telefone
document.getElementById("telefone").addEventListener("input", function (e) {
  let input = e.target;
  let value = input.value.replace(/\D/g, ""); // Remove tudo que não for número
  let formattedValue = "";

  if (value.length <= 10) {
    // Máscara para telefone fixo: (00) 0000-0000
    formattedValue = value
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // Máscara para telefone celular: (00) 00000-0000
    formattedValue = value
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
  input.value = formattedValue;
});

// Lógica para enviar os dados para a planilha google sheets
const scriptURL = 'https://script.google.com/macros/s/AKfycbx4TSoUaCFjoT5rJ6nJ61nFhA0GxkrCZAa7QtdT2uQbYzKyVaHVzk5HImZgtpdq_jYP/exec';
const form = document.getElementById('formulario');
const responseMessage = document.getElementById('responseMessage');
const errorMessage = document.getElementById('errorMessage');
const pleaseWait = document.getElementById('pleaseWait');
let responses;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  pleaseWait.style.display = 'block';
  showloadingFormAnimation(form);

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      pleaseWait.style.display = 'none';
      responseMessage.style.display = 'block';
      errorMessage.style.display = 'none';
      responses = 'ok';
      window.location.href = "./pages/contact-thanks/inex.html";
    } else {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    pleaseWait.style.display = 'none';
    responseMessage.style.display = 'none';
    errorMessage.style.display = 'block';
  } finally {
    let seconds = 0
    const intervalId = setInterval(() => {
      seconds += 1
      if (seconds >= 2) {
        clearInterval(intervalId);
        seconds = 0;
        responseMessage.style.display = 'none';
      };
    }, 1 * 1000);
  }
});