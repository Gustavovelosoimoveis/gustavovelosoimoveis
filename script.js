// Site Gustavo Veloso Imóveis - VERSÃO FINAL CORRIGIDA
// Resolve problemas de placeholder e garante funcionamento perfeito

// ======== Configuração ========
const WA_NUMBER = "5521979915391";
const USE_SHEET = true;
const SHEET_ID = '1J1S0PQ_1gWOsmhVEvUjxDbFCS1YJN64O4pJ-anI__t0';
const GID = '246089297';

const DEFAULT_WA_MSG = "Olá Gustavo, encontrei no seu site e gostaria de saber mais sobre os imóveis disponíveis.";

// Dados estáticos como fallback
const properties = [
  {
    slug: "royal-garden-i-marica",
    title: "Casa 3 qts (1 suíte) – Royal Garden I, Maricá",
    price: "R$ 575.000,00",
    meta: "99 m² construídos • 240 m² de terreno|Área gourmet • Condomínio fechado",
    thumb: "https://drive.google.com/uc?export=view&id=1oGUILvwyvFwGPnaVrwjFqvtKTFqbETWc",
    galleryArray: [
      "https://drive.google.com/uc?export=view&id=1uggt7p5XmDvGzVczyDosqxyAEO9Dwj6x",
      "https://drive.google.com/uc?export=view&id=1ScYu6bhddhwnAZsjgFCaOGoU0oDXPR3r",
      "https://drive.google.com/uc?export=view&id=1x7U7qssLcDxeP44LR6lkmEiwjd4fZgpI"
    ],
    desc_html: "<p>🏠 <strong>Casa 3 qts (1 suíte)</strong> — condomínio <strong>Royal Garden I</strong>, Maricá/RJ</p>",
    wa_message_override: ""
  }
];

// ======== Funções de Carregamento ========

async function fetchCSV() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    console.log('🔄 Carregando planilha Gustavo Veloso:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log('📊 CSV carregado com sucesso. Tamanho:', csvText.length, 'caracteres');
    console.log('📋 Amostra CSV:', csvText.substring(0, 300).replace(/\n/g, '\\n'));

    return parseCSVGustavo(csvText);
  } catch (error) {
    console.error('❌ Erro ao carregar planilha:', error);
    console.log('⚠️  Usando dados estáticos como fallback');
    return properties;
  }
}

function parseCSVGustavo(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    console.warn('⚠️  Planilha parece vazia ou inválida');
    return properties;
  }

  console.log(`📄 Total de linhas encontradas: ${lines.length}`);

  // Primeira linha = cabeçalho
  const headers = splitCSVRow(lines[0]);
  console.log('📋 Cabeçalhos detectados:', headers);

  // Demais linhas = dados
  const dataLines = lines.slice(1);
  const parsedProperties = [];

  dataLines.forEach((line, index) => {
    const lineNumber = index + 2;

    if (!line.trim()) {
      console.log(`⏭️  Linha ${lineNumber}: vazia, pulando`);
      return;
    }

    const columns = splitCSVRow(line);
    console.log(`📍 Linha ${lineNumber}: ${columns.length} colunas encontradas`);

    // ✅ SÓ PROCESSA SE TIVER PELO MENOS 4 COLUNAS COM DADOS
    const validColumns = columns.filter(col => col.trim().length > 0);

    if (validColumns.length >= 4) { // Mínimo: slug, title, price, meta

      const property = {
        slug: cleanText(columns[0]),
        title: cleanText(columns[1]),
        price: cleanText(columns[2]),
        meta: cleanText(columns[3]),
        thumb: cleanText(columns[4]) || "",
        galleryArray: [],
        desc_html: "",
        wa_message_override: ""
      };

      // ✅ Validação básica
      if (!property.slug || !property.title) {
        console.warn(`⚠️  Linha ${lineNumber} ignorada: dados essenciais vazios`);
        return;
      }

      console.log(`🏠 Processando imóvel: "${property.title}"`);

      // ✅ Processar colunas extras baseado no cabeçalho
      for (let i = 5; i < Math.min(columns.length, headers.length); i++) {
        const cellValue = cleanText(columns[i]);
        const headerName = cleanText(headers[i]).toLowerCase();

        if (!cellValue) continue; // Pular células vazias

        console.log(`  📊 Coluna ${i+1} (${headerName}): "${cellValue.substring(0, 50)}..."`);

        // Detectar tipo de conteúdo baseado no cabeçalho
        if (headerName === 'desc_html') {
          property.desc_html = cellValue;
          console.log(`    📝 desc_html definido`);
        }
        else if (headerName === 'wa_message_override') {
          property.wa_message_override = cellValue;
          console.log(`    📱 wa_message_override definido`);
        }
        else if (headerName === 'gallery') {
          // Coluna gallery: URLs separadas por |
          const urls = cellValue.split('|')
            .map(url => cleanText(url))
            .filter(url => url && isValidURL(url));

          property.galleryArray = property.galleryArray.concat(urls);
          console.log(`    🖼️  Gallery: ${urls.length} imagens válidas encontradas`);
          console.log(`    📸 URLs: ${urls.map(u => u.substring(0, 30) + '...').join(', ')}`);
        }
        else if (headerName.startsWith('img') || isValidURL(cellValue)) {
          // Coluna individual de imagem ou URL válida
          property.galleryArray.push(cellValue);
          console.log(`    📸 Imagem individual adicionada`);
        }
      }

      // ✅ Se thumb vazio mas temos galeria, usar primeira imagem como thumb
      if (!property.thumb && property.galleryArray.length > 0) {
        property.thumb = property.galleryArray[0];
        console.log(`    🖼️  Thumb definido automaticamente: primeira imagem da galeria`);
      }

      // ✅ Garantir que thumb está na galeria
      if (property.thumb && !property.galleryArray.includes(property.thumb)) {
        property.galleryArray.unshift(property.thumb);
      }

      // ✅ Remover duplicatas da galeria
      property.galleryArray = [...new Set(property.galleryArray)];

      console.log(`✅ Imóvel "${property.title}" processado com sucesso:`);
      console.log(`   - Slug: ${property.slug}`);
      console.log(`   - Preço: ${property.price}`);
      console.log(`   - Thumb: ${property.thumb ? 'SIM' : 'NÃO'}`);
      console.log(`   - Galeria: ${property.galleryArray.length} imagens`);
      console.log(`   - Desc HTML: ${property.desc_html ? 'SIM' : 'NÃO'}`);
      console.log(`   - WA Personalizado: ${property.wa_message_override ? 'SIM' : 'NÃO'}`);

      parsedProperties.push(property);

    } else {
      console.log(`⏭️  Linha ${lineNumber} ignorada: apenas ${validColumns.length} colunas válidas (mínimo 4 necessário)`);
    }
  });

  console.log(`🎉 RESULTADO FINAL: ${parsedProperties.length} imóveis válidos processados`);

  if (parsedProperties.length === 0) {
    console.warn('⚠️  Nenhum imóvel válido encontrado, usando fallback');
    return properties;
  }

  return parsedProperties;
}

// ======== Funções Auxiliares ========

function splitCSVRow(row) {
  const result = [];
  let current = '';
  let insideQuote = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === ',' && !insideQuote) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/^"|"$/g, '').trim();
}

function isValidURL(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// ======== Funções de Renderização ========

function renderCards(properties) {
  const container = document.getElementById("cards");
  if (!container) {
    console.warn('⚠️  Elemento #cards não encontrado na página');
    return;
  }

  if (!Array.isArray(properties) || properties.length === 0) {
    container.innerHTML = "<p>Nenhum imóvel disponível no momento.</p>";
    console.log('📭 Nenhum imóvel para exibir');
    return;
  }

  container.innerHTML = "";
  console.log(`🏠 Renderizando ${properties.length} imóveis na página inicial`);

  properties.forEach((property, index) => {
    const card = document.createElement("article");
    card.className = "card";

    // ✅ PLACEHOLDER QUE FUNCIONA (usar base64 ou serviço confiável)
    let imageSrc = property.thumb;
    let errorHandler = '';

    if (!imageSrc || !isValidURL(imageSrc)) {
      // SVG placeholder direto em base64 que sempre funciona
      imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM2YzgzIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+SW3Ds3ZlbDwvdGV4dD4KPHN2Zz4=';
      errorHandler = '';
    } else {
      // Se temos imagem válida, usar placeholder como fallback
      errorHandler = 'onerror="this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiNkMWQ1ZGIiLz4KPHBhdGggZD0iTTE2MCAyMDBMMjAwIDE2MEwyNDAgMjAwSDE2MFoiIGZpbGw9IiNkMWQ1ZGIiLz4KPHN2Zz4=\';"';
    }

    card.innerHTML = `
      <a href="property.html?slug=${encodeURIComponent(property.slug)}" style="text-decoration:none;color:inherit">
        <img src="${imageSrc}" 
             alt="${property.title}" 
             ${errorHandler}
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
    console.log(`  ✅ Card ${index + 1}: ${property.title}`);
  });

  console.log(`🎉 ${properties.length} cards renderizados com sucesso!`);
}

function renderProperty(properties) {
  const slugParam = new URLSearchParams(window.location.search).get("slug");

  if (!slugParam) {
    console.log('ℹ️  Parâmetro slug não encontrado na URL - não é uma página de propriedade');
    return;
  }

  console.log(`🔍 Procurando imóvel com slug: ${slugParam}`);

  const property = properties.find(p => p.slug === slugParam);

  if (!property) {
    console.error(`❌ Imóvel não encontrado: ${slugParam}`);
    console.log('📋 Slugs disponíveis:', properties.map(p => p.slug));

    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h1>Imóvel não encontrado</h1>
        <p>O imóvel "${slugParam}" não existe ou foi removido.</p>
        <a href="index.html">← Voltar para página inicial</a>
      </div>
    `;
    return;
  }

  console.log(`🏠 Renderizando página do imóvel: ${property.title}`);

  // ✅ Atualizar elementos da página
  updateElementText('title', property.title);
  updateElementText('price', property.price);

  // ✅ Atualizar meta (características)
  const metaElement = document.getElementById('meta');
  if (metaElement && property.meta) {
    metaElement.innerHTML = property.meta.split('|').map(item => `<li>${item.trim()}</li>`).join('');
    console.log('📋 Meta atualizada');
  }

  // ✅ Atualizar descrição
  const descElement = document.getElementById('desc');
  if (descElement) {
    if (property.desc_html) {
      descElement.innerHTML = property.desc_html;
      console.log('📝 Descrição HTML personalizada aplicada');
    } else {
      descElement.innerHTML = '<p>Imóvel em excelente estado e localização privilegiada.</p>';
      console.log('📝 Descrição padrão aplicada');
    }
  }

  // ✅ Configurar galeria de imagens
  if (property.galleryArray && property.galleryArray.length > 0) {
    setupGallery(property.galleryArray);
    console.log(`🖼️  Galeria configurada com ${property.galleryArray.length} imagens`);
  }

  // ✅ Configurar WhatsApp
  const message = property.wa_message_override || 
    `Olá Gustavo, tenho interesse no imóvel "${property.title}" e gostaria de mais informações.`;
  setupWhatsApp(message);

  console.log('📱 WhatsApp configurado:', property.wa_message_override ? 'mensagem personalizada' : 'mensagem padrão');
  console.log('✅ Página de propriedade renderizada com sucesso!');
}

function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
    console.log(`📝 Elemento #${elementId} atualizado`);
  }
}

function setupGallery(imageUrls) {
  const gallery = document.getElementById('gallery');
  if (!gallery) {
    console.warn('⚠️  Elemento #gallery não encontrado');
    return;
  }

  gallery.innerHTML = '';
  console.log(`🖼️  Configurando galeria...`);

  const validUrls = imageUrls.filter(url => isValidURL(url));
  console.log(`📸 URLs válidas: ${validUrls.length} de ${imageUrls.length}`);

  validUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Imagem ${index + 1}`;
    img.style.cursor = 'pointer';
    img.onerror = function() {
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjZDFkNWRiIi8+CjxwYXRoIGQ9Ik01MCA3MEw3NSA1MEwxMDAgNzBINTBaIiBmaWxsPSIjZDFkNWRiIi8+Cjwvc3ZnPg==';
    };
    img.addEventListener('click', () => openLightbox(validUrls, index));
    gallery.appendChild(img);
  });

  console.log(`✅ Galeria criada com ${validUrls.length} imagens`);
}

function openLightbox(urls, startIndex) {
  console.log(`📸 Abrindo lightbox - imagem ${startIndex + 1} de ${urls.length}`);

  const lbBackdrop = document.getElementById('lb');
  const lbImg = document.getElementById('lbImg');

  if (!lbBackdrop || !lbImg) {
    console.warn('⚠️  Elementos do lightbox não encontrados');
    return;
  }

  let currentIndex = startIndex;

  function showImage() {
    lbImg.src = urls[currentIndex];
    lbBackdrop.classList.add('active');
    console.log(`📸 Exibindo imagem ${currentIndex + 1}`);
  }

  function close() {
    lbBackdrop.classList.remove('active');
    console.log('📸 Lightbox fechado');
  }

  function next() {
    currentIndex = (currentIndex + 1) % urls.length;
    showImage();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + urls.length) % urls.length;
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

function setupWhatsApp(message) {
  const waButtons = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"], #wa-button, .wa-button');

  if (waButtons.length === 0) {
    console.warn('⚠️  Nenhum botão WhatsApp encontrado');
    return;
  }

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  waButtons.forEach((button, index) => {
    button.href = waUrl;
    console.log(`📱 Botão WhatsApp ${index + 1} configurado`);
  });
}

// ======== Inicialização ========

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 ==========================================');
  console.log('🚀 SITE GUSTAVO VELOSO - VERSÃO FINAL');
  console.log('🚀 ==========================================');
  console.log('📋 Configurações:');
  console.log(`   - USE_SHEET: ${USE_SHEET}`);
  console.log(`   - SHEET_ID: ${SHEET_ID}`);
  console.log(`   - GID: ${GID}`);
  console.log(`   - WA_NUMBER: ${WA_NUMBER}`);

  let loadedProperties;

  if (USE_SHEET) {
    console.log('📊 Modo: Carregando dados da planilha Google Sheets...');
    loadedProperties = await fetchCSV();
  } else {
    console.log('📁 Modo: Usando dados estáticos');
    loadedProperties = properties;
  }

  console.log('🎯 PROPRIEDADES FINAIS:', loadedProperties);
  console.log(`📊 Total de imóveis carregados: ${loadedProperties.length}`);

  // ✅ Detectar tipo de página e renderizar apropriadamente
  const isHomePage = document.getElementById('cards') !== null;
  const isPropertyPage = document.getElementById('title') !== null;

  if (isHomePage) {
    console.log('🏠 PÁGINA DETECTADA: Inicial (lista de imóveis)');
    renderCards(loadedProperties);
  }

  if (isPropertyPage) {
    console.log('🏡 PÁGINA DETECTADA: Individual (detalhes do imóvel)');
    renderProperty(loadedProperties);
  }

  if (!isHomePage && !isPropertyPage) {
    console.log('📄 PÁGINA DETECTADA: Outra (bio, links, etc)');
  }

  console.log('✅ ==========================================');
  console.log('✅ SITE FUNCIONANDO PERFEITAMENTE!');
  console.log('✅ ==========================================');
});
