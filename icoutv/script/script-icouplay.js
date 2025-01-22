import { showLoadingBtnAnimation } from "../../animacoes/loadingOverlay.js";

const btnClient = document.getElementById("btn-client");
const btnSubscribe = document.getElementById("btn-subscribe");

btnSubscribe.addEventListener("click", () => {
  showLoadingBtnAnimation("./register/index.html", 1000, false);
})