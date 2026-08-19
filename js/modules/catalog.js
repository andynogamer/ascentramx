/**
 * Carga catalogo.json y renderiza las categorías de equipos.
 */
export async function initCatalog() {
  const container = document.getElementById('catalog-container');
  const footerEquipos = document.getElementById('footer-equipos');

  if (!container) return;

  try {
    const response = await fetch('catalogo.json');
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');

    const data = await response.json();
    container.innerHTML = data.categorias.map(renderCategory).join('');

    initDataSheetModal();
    populateFooterLinks(data.categorias, footerEquipos);
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-ascentra-gray text-center col-span-full">No se pudo cargar el catálogo. Intenta recargar la página.</p>';
  }
}

function renderCategory(categoria) {
  const sectionId = categoria.id || categoria.nombre.toLowerCase().replace(/\s+/g, '-');

  return `
    <div class="catalog-category mb-16 lg:mb-20 last:mb-0" id="${sectionId}">
      <h3 class="text-xl sm:text-2xl font-black tracking-wide uppercase mb-8 pb-3 border-b-2 border-ascentra-yellow inline-block">
        ${categoria.nombre}
      </h3>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        ${categoria.equipos.map((equipo) => renderProductCard(equipo, categoria.texto_boton)).join('')}
      </div>
    </div>
  `;
}

function renderProductCard(equipo, buttonText) {
  return `
    <article class="product-card bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col" data-model="${equipo.nombre}">
      <div class="aspect-[4/3] overflow-hidden bg-white">
        <img
          src="${equipo.imagen}"
          alt="${equipo.nombre}"
          class="w-full h-full object-contain p-4"
          loading="lazy"
        >
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h4 class="text-base sm:text-lg font-black tracking-wide uppercase leading-tight mb-1">${equipo.nombre}</h4>
        <p class="text-ascentra-gray text-xs sm:text-sm mb-4">${equipo.descripcion}</p>
        <button
          type="button"
          data-ficha="${equipo.ficha_tecnica}"
          data-title="${equipo.nombre}"
          class="data-sheet-btn mt-auto btn-primary w-full bg-ascentra-yellow text-ascentra-dark font-bold text-xs tracking-widest uppercase py-3 rounded-full flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
          ${buttonText}
        </button>
      </div>
    </article>
  `;
}

function populateFooterLinks(categorias, footerList) {
  if (!footerList) return;

  const links = categorias.flatMap((categoria) =>
    categoria.equipos.map((equipo) => {
      const sectionId = categoria.id || 'equipos';
      return `<li><a href="#${sectionId}" data-nav-link class="text-white/60 hover:text-white text-sm transition-colors">${equipo.nombre}</a></li>`;
    })
  );

  footerList.innerHTML = links.join('');
}

function initDataSheetModal() {
  let modal = document.getElementById('data-sheet-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'data-sheet-modal';
    modal.className = 'data-sheet-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Ficha técnica');
    modal.innerHTML = `
      <div class="data-sheet-backdrop" data-close-modal></div>
      <div class="data-sheet-content">
        <div class="data-sheet-header">
          <h3 id="data-sheet-title" class="text-lg font-black uppercase tracking-wide text-ascentra-dark"></h3>
          <button type="button" class="data-sheet-close" data-close-modal aria-label="Cerrar">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="data-sheet-body">
          <img id="data-sheet-image" src="" alt="" class="w-full h-auto">
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const titleEl = modal.querySelector('#data-sheet-title');
  const imageEl = modal.querySelector('#data-sheet-image');

  const openModal = (src, title) => {
    titleEl.textContent = title;
    imageEl.src = src;
    imageEl.alt = `Ficha técnica - ${title}`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    imageEl.src = '';
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.data-sheet-btn').forEach((button) => {
    button.addEventListener('click', () => {
      openModal(button.dataset.ficha, button.dataset.title);
    });
  });

  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}
