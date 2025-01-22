const carouselContainer = document.querySelector('.carousel-container');
const carouselItems = document.querySelectorAll('.carousel-item');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const balaoItem = document.querySelectorAll('.balao');

let currentIndex = 0;

// Pinta os balões de acordo a imagem que é mostrada ná tela
function paintBallon() {
  for (let i = 0; i < balaoItem.length; i++) {
    const element = balaoItem[i];
    if (element.classList.contains(`balao${i + 1}`) && i === currentIndex) {
      element.style.backgroundColor = "#FD8A24";
    } else if (element.classList.contains(`balao${i + 1}`) && i !== currentIndex) {
      element.style.backgroundColor = "#605F54";
    }
  }
};

function updateCarousel() {
  carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
  paintBallon();
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % carouselItems.length;
  updateCarousel();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
  updateCarousel();
}

nextButton.addEventListener('click', nextSlide);
prevButton.addEventListener('click', prevSlide);

// Automatic scrolling
setInterval(nextSlide, 3000);

// Animação do Botão para voltar ao topo
document.addEventListener("DOMContentLoaded", () => {
  const backToTopButton = document.getElementById("backToTop");
  const footer = document.getElementById("pageFooter");

  window.addEventListener("scroll", () => {
    const footerPosition = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    // Mostrar ou esconder o botão
    if (window.scrollY > 200) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }

    // Ajustar a posição do botão para não sobrepor o footer
    if (footerPosition < windowHeight) {
      const overlap = windowHeight - footerPosition + 20; // 20px de margem
      backToTopButton.style.bottom = `${overlap}px`;
    } else {
      backToTopButton.style.bottom = "20px"; // Posição padrão
    }
  });

  // Rolar para o topo ao clicar
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});