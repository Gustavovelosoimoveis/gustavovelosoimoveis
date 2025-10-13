// Site Gustavo Veloso Imóveis - VERSÃO COM IMAGENS LOCAIS

// ======== Configuração ========
const WA_NUMBER = "5521979915391";

// Dados diretos com as imagens do GitHub
const properties = [
  {
    slug: "royal-garden-i-marica",
    title: "Casa 3 qts (1 suíte) – Royal Garden I, Maricá",
    price: "R$ 575.000,00",
    meta: "99 m² construídos • 240 m² de terreno|Área gourmet • Condomínio fechado",
    thumb: "royal1.jpg",
    galleryArray: [
      "royal1.jpg",
      "royal2.jpg",
      "royal3.jpg",
      "royal4.jpg",
      "royal5.jpg",
      "royal6.jpg"
    ],
    desc_html: "<p>🏠 <strong>Casa 3 qts (1 suíte)</strong> — condomínio <strong>Royal Garden I</strong>, Maricá/RJ<br><strong>99 m² construídos</strong> • <strong>240 m² de terreno</strong><br><strong>Área gourmet</strong> • 🏡 <strong>Condomínio fechado</strong></p>",
    wa_message_override: "Olá Gustavo, tenho interesse na casa do Royal Garden I e gostaria de agendar uma visita."
  }
];

console.log('✅ GUSTAVO: Dados carregados com imagens locais');

function renderCards(properties) {
  const container = document.getElementById("cards");
  if (!container) return;

  container.innerHTML = "";
  console.log(`🏠 Renderizando ${properties.length} imóveis`);

  properties.forEach((property) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <a href="property.html?slug=${encodeURIComponent(property.slug)}" style="text-decoration:none;color:inherit">
        <img src="${property.thumb}" 
             alt="${property.title}" 
             loading="lazy">
        <div class="card-body">
          <h4>${property.title}</h4>
          <ul class="meta">
            ${property.meta ? property.meta.split('|').map(item => `<li>${item.trim()}</li>`).join('') : ''}
          </ul>
          <p class="price">${property.price}</p>
        </div>
      </a>
    `;

    container.appendChild(card);
  });

  console.log(`✅ GUSTAVO: ${properties.length} cards com imagens funcionando`);
}

function renderProperty(properties) {
  const slugParam = new URLSearchParams(window.location.search).get("slug");
  if (!slugParam) return;

  const property = properties.find(p => p.slug === slugParam);
  if (!property) return;

  console.log(`🏠 Renderizando: ${property.title}`);

  // Atualizar elementos
  const titleEl = document.getElementById('title');
  const priceEl = document.getElementById('price');

  if (titleEl) titleEl.textContent = property.title;
  if (priceEl) priceEl.textContent = property.price;

  // Meta
  const metaEl = document.getElementById('meta');
  if (metaEl && property.meta) {
    metaEl.innerHTML = property.meta.split('|').map(item => `<li>${item.trim()}</li>`).join('');
  }

  // Descrição
  const descEl = document.getElementById('desc');
  if (descEl) {
    descEl.innerHTML = property.desc_html || '<p>Imóvel em excelente estado e localização privilegiada.</p>';
  }

  // Galeria
  if (property.galleryArray && property.galleryArray.length > 0) {
    setupGallery(property.galleryArray);
  }

  // WhatsApp
  const message = property.wa_message_override || `Olá Gustavo, tenho interesse no imóvel "${property.title}"`;
  setupWhatsApp(message);

  console.log('✅ GUSTAVO: Página individual funcionando');
}

function setupGallery(imageUrls) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  gallery.innerHTML = '';
  console.log(`🖼️ Configurando galeria com ${imageUrls.length} imagens`);

  imageUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Imagem ${index + 1}`;
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(imageUrls, index));
    gallery.appendChild(img);
  });

  console.log(`✅ GUSTAVO: Galeria com ${imageUrls.length} imagens criada`);
}

function openLightbox(urls, startIndex) {
  const lbBackdrop = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');

  if (!lbBackdrop || !lbImg) return;

  let currentIndex = startIndex;

  function showImage() {
    lbImg.src = urls[currentIndex];
    lbBackdrop.classList.add('active');
  }

  function close() {
    lbBackdrop.classList.remove('active');
  }

  function next() {
    currentIndex = (currentIndex + 1) % urls.length;
    showImage();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + urls.length) % urls.length;
    showImage();
  }

  lbBackdrop.addEventListener('click', (e) => {
    if (e.target === lbBackdrop) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lbBackdrop.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  showImage();
}

function setupWhatsApp(message) {
  const waButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], #wa-button, .wa-button');
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  waButtons.forEach((button) => {
    button.href = waUrl;
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ GUSTAVO: Site iniciado - VERSÃO COM IMAGENS FUNCIONANDO');

  const isHomePage = document.getElementById('cards') !== null;
  const isPropertyPage = document.getElementById('title') !== null;

  if (isHomePage) {
    console.log('🏠 GUSTAVO: Página inicial detectada');
    renderCards(properties);
  }

  if (isPropertyPage) {
    console.log('🏡 GUSTAVO: Página de propriedade detectada');
    renderProperty(properties);
  }

  console.log('✅ GUSTAVO: SITE FUNCIONANDO PERFEITAMENTE COM IMAGENS!');
});
