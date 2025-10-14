// GUSTAVO VELOSO IMÓVEIS - SISTEMA HÍBRIDO DEFINITIVO
// GitHub (JSON) + Imgur (fotos) = SOLUÇÃO COMPLETA

const WA_NUMBER = "5521979915391";

// Cache dos imóveis
let imoveisData = null;

// Carregar dados dos imóveis do arquivo JSON
async function carregarImoveis() {
  try {
    console.log('🏠 GUSTAVO: Carregando imóveis do arquivo JSON...');

    const response = await fetch('./imoveis.json');
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    imoveisData = data.imoveis || [];

    console.log(`✅ GUSTAVO: ${imoveisData.length} imóveis carregados com sucesso!`);
    return imoveisData;

  } catch (error) {
    console.error('❌ GUSTAVO: Erro ao carregar imóveis:', error);

    // Fallback básico em caso de erro
    console.log('🔄 GUSTAVO: Usando dados de fallback...');
    imoveisData = [];
    return imoveisData;
  }
}

// Otimização de imagens Imgur
function otimizarUrlImgur(url, tamanho = 'l') {
  // Tamanhos: s=90px, b=160px, t=160px, m=320px, l=640px, h=1024px
  if (url && url.includes('imgur.com') && url.includes('/')) {
    const parts = url.split('/');
    const filename = parts.pop();
    const id = filename.split('.')[0];
    return `https://i.imgur.com/${id}${tamanho}.jpg`;
  }
  return url;
}

// Renderizar cards na página inicial
function renderizarCards(imoveis) {
  const container = document.getElementById("cards");
  if (!container) return;

  container.innerHTML = "";
  console.log(`📋 GUSTAVO: Renderizando ${imoveis.length} cards profissionais...`);

  if (imoveis.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Nenhum imóvel encontrado. Verifique o arquivo imoveis.json</p>';
    return;
  }

  imoveis.forEach((imovel, index) => {
    const card = document.createElement("article");
    card.className = "card property-card";

    // Primeira foto otimizada para card (320px)
    const fotoThumb = imovel.fotos && imovel.fotos.length > 0 
      ? otimizarUrlImgur(imovel.fotos[0], 'm')
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2YzgzIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+SW3Ds3ZlbDwvdGV4dD4KPHN2Zz4=';

    card.innerHTML = `
      <a href="property.html?slug=${encodeURIComponent(imovel.slug)}" class="card-link">
        <div class="card-image">
          <img src="${fotoThumb}" alt="${imovel.titulo}" loading="lazy"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2YzgzIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+SW3Ds3ZlbDwvdGV4dD4KPHN2Zz4='">
          <div class="property-code">${imovel.codigo}</div>
          <div class="property-type">${imovel.tipo}</div>
        </div>

        <div class="card-body">
          <div class="property-location">
            <h4>${imovel.bairro} - ${imovel.cidade}</h4>
          </div>

          <div class="property-specs">
            <div class="spec-item">
              <span class="spec-icon">📐</span>
              <span class="spec-text">${imovel.area} m²</span>
            </div>
            <div class="spec-item">
              <span class="spec-icon">🛏️</span>
              <span class="spec-text">${imovel.quartos} Quarto${imovel.quartos > 1 ? 's' : ''}</span>
            </div>
            <div class="spec-item">
              <span class="spec-icon">🚿</span>
              <span class="spec-text">${imovel.banheiros} Banheiro${imovel.banheiros > 1 ? 's' : ''}</span>
            </div>
            <div class="spec-item">
              <span class="spec-icon">🚗</span>
              <span class="spec-text">${imovel.vagas} Vaga${imovel.vagas > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div class="property-features">
            ${imovel.caracteristicas ? imovel.caracteristicas.slice(0, 3).map(feat => 
              `<span class="feature-tag">${feat}</span>`
            ).join('') : ''}
          </div>

          <div class="property-price">
            <span class="price-label">Venda</span>
            <span class="price-value">${imovel.preco}</span>
          </div>
        </div>
      </a>
    `;

    container.appendChild(card);
  });

  console.log(`✅ GUSTAVO: ${imoveis.length} cards renderizados com sucesso!`);
}

// Renderizar página individual do imóvel
function renderizarImovel(imoveis) {
  const slugParam = new URLSearchParams(window.location.search).get("slug");
  if (!slugParam) return;

  console.log(`🔍 GUSTAVO: Buscando imóvel: ${slugParam}`);

  const imovel = imoveis.find(i => i.slug === slugParam);
  if (!imovel) {
    console.error(`❌ GUSTAVO: Imóvel não encontrado: ${slugParam}`);
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h1>Imóvel não encontrado</h1>
        <p>O imóvel "${slugParam}" não existe ou foi removido.</p>
        <a href="index.html" style="color: #3b82f6;">← Voltar para página inicial</a>
      </div>
    `;
    return;
  }

  console.log(`✅ GUSTAVO: Renderizando imóvel: ${imovel.titulo}`);

  // Atualizar elementos básicos
  const titleEl = document.getElementById('title');
  const priceEl = document.getElementById('price');
  const codeEl = document.getElementById('property-code');

  if (titleEl) titleEl.textContent = imovel.titulo;
  if (priceEl) priceEl.textContent = imovel.preco;
  if (codeEl) codeEl.textContent = imovel.codigo;

  // Atualizar título da página
  document.title = `${imovel.titulo} - ${imovel.preco} - Gustavo Veloso Imóveis`;

  // Atualizar especificações técnicas
  const specsEl = document.getElementById('specs');
  if (specsEl) {
    specsEl.innerHTML = `
      <div class="spec-grid">
        <div class="spec-item">
          <span class="spec-label">Área construída</span>
          <span class="spec-value">${imovel.area} m²</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Área do terreno</span>
          <span class="spec-value">${imovel.areaTerreno || 'N/A'} m²</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Quartos</span>
          <span class="spec-value">${imovel.quartos}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Suítes</span>
          <span class="spec-value">${imovel.suites}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Banheiros</span>
          <span class="spec-value">${imovel.banheiros}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Vagas</span>
          <span class="spec-value">${imovel.vagas}</span>
        </div>
      </div>
    `;
  }

  // Meta características
  const metaEl = document.getElementById('meta');
  if (metaEl && imovel.caracteristicas) {
    metaEl.innerHTML = imovel.caracteristicas.map(item => `<li>${item}</li>`).join('');
  }

  // Descrição
  const descEl = document.getElementById('desc');
  if (descEl) {
    descEl.innerHTML = imovel.descricao || '<p>Imóvel em excelente estado e localização privilegiada.</p>';
  }

  // Galeria com fotos otimizadas
  if (imovel.fotos && imovel.fotos.length > 0) {
    setupGallery(imovel.fotos);
  }

  // WhatsApp personalizado
  const message = imovel.whatsapp || `Olá Gustavo, tenho interesse no imóvel ${imovel.codigo} "${imovel.titulo}"`;
  setupWhatsApp(message);

  console.log('✅ GUSTAVO: Página individual renderizada com sucesso!');
}

// Configurar galeria com otimização Imgur
function setupGallery(fotos) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  gallery.innerHTML = '';
  console.log(`📸 GUSTAVO: Configurando galeria com ${fotos.length} fotos`);

  fotos.forEach((foto, index) => {
    const img = document.createElement('img');
    // Usar tamanho grande para galeria (640px)
    img.src = otimizarUrlImgur(foto, 'l');
    img.alt = `Foto ${index + 1}`;
    img.style.cursor = 'pointer';
    img.loading = 'lazy';

    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEyNSIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2YzgzIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+SW1hZ2VtPC90ZXh0Pgo8L3N2Zz4=';
    };

    // Lightbox usa foto em alta resolução (1024px)
    img.addEventListener('click', () => {
      const fotosHD = fotos.map(f => otimizarUrlImgur(f, 'h'));
      openLightbox(fotosHD, index);
    });

    gallery.appendChild(img);
  });

  console.log(`✅ GUSTAVO: Galeria criada com ${fotos.length} fotos otimizadas`);
}

// Lightbox para visualização em alta resolução
function openLightbox(fotos, startIndex) {
  const lbBackdrop = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');

  if (!lbBackdrop || !lbImg) return;

  let currentIndex = startIndex;

  function showImage() {
    lbImg.src = fotos[currentIndex];
    lbBackdrop.classList.add('active');
  }

  function close() {
    lbBackdrop.classList.remove('active');
  }

  function next() {
    currentIndex = (currentIndex + 1) % fotos.length;
    showImage();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + fotos.length) % fotos.length;
    showImage();
  }

  // Event listeners
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

// Configurar WhatsApp personalizado
function setupWhatsApp(message) {
  const waButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], #wa-button, .wa-button');
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  waButtons.forEach((button) => {
    button.href = waUrl;
  });
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 GUSTAVO VELOSO IMÓVEIS - SISTEMA HÍBRIDO ATIVO');
  console.log('📄 Carregando imóveis do JSON + fotos do Imgur...');

  // Carregar dados dos imóveis
  const imoveis = await carregarImoveis();

  // Detectar tipo de página
  const isHomePage = document.getElementById('cards') !== null;
  const isPropertyPage = document.getElementById('title') !== null;

  if (isHomePage) {
    console.log('🏠 GUSTAVO: Renderizando página inicial');
    renderizarCards(imoveis);
  }

  if (isPropertyPage) {
    console.log('🏡 GUSTAVO: Renderizando página individual');
    renderizarImovel(imoveis);
  }

  console.log('✅ GUSTAVO: SISTEMA FUNCIONANDO PERFEITAMENTE!');
  console.log(`📊 Total de imóveis: ${imoveis.length}`);

  // Debug info no console
  if (imoveis.length > 0) {
    console.log('🏠 GUSTAVO: Imóveis carregados:');
    imoveis.forEach(imovel => {
      console.log(`   ${imovel.codigo}: ${imovel.titulo} - ${imovel.preco}`);
    });
  }
});
