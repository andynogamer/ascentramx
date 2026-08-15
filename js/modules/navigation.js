/**
 * Navegación suave, menú móvil y estado activo del navbar.
 */
export function initNavigation() {
  const header = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sections = document.querySelectorAll('section[id], footer[id]');

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href')?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) return;

      event.preventDefault();

      // Cerrar el menú antes de medir: abierto, el header mide su altura completa
      // y el desplazamiento quedaría muy por encima de la sección.
      mobileMenu?.classList.add('hidden');
      menuToggle?.setAttribute('aria-expanded', 'false');

      const offset = header?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('shadow-lg', window.scrollY > 20);
    }

    let currentSection = 'inicio';
    const scrollPos = window.scrollY + (header?.offsetHeight || 0) + 100;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentSection = section.id;
      }
    });

    // El footer es más corto que la ventana, así que el umbral nunca lo alcanza:
    // al llegar al final de la página marcamos la última sección como activa.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    if (atBottom && sections.length) {
      currentSection = sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.slice(1);
      const isActive = href === currentSection;
      link.classList.toggle('text-ascentra-yellow', isActive);
      link.classList.toggle('after:w-full', isActive);
    });
  });
}
