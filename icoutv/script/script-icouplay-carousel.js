const carouselContainer = document.querySelector('.carousel-container');
const slides = document.querySelectorAll('.carousel-slide');
const prevButton = document.querySelector('.carousel-prev');
const nextButton = document.querySelector('.carousel-next');

let currentIndex = 0;
let autoSlideInterval;

// Função para mover o carrossel
function updateCarousel() {
  const slideWidth = slides[0].clientWidth;
  carouselContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

// Função para avançar o slide
function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length; // Volta para o início após o último slide
  updateCarousel();
}

// Função para voltar o slide
function prevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length; // Vai para o último slide se estiver no primeiro
  updateCarousel();
}

// Função para iniciar o loop automático
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 3000); // Troca de slide a cada 3 segundos
}

// Função para parar o loop automático
function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// Eventos dos botões
nextButton.addEventListener('click', () => {
  stopAutoSlide(); // Pausa o auto-slide durante a interação
  nextSlide();
  startAutoSlide(); // Reinicia o auto-slide
});

prevButton.addEventListener('click', () => {
  stopAutoSlide(); // Pausa o auto-slide durante a interação
  prevSlide();
  startAutoSlide(); // Reinicia o auto-slide
});

// Ajustar o carrossel ao redimensionar a tela
window.addEventListener('resize', updateCarousel);

// Iniciar o loop automático ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  updateCarousel(); // Ajusta o slide inicial
  startAutoSlide(); // Inicia o loop
});