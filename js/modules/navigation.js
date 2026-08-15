/**
 * Navegación suave, menú móvil y estado activo del navbar.
 */
export function initNavigation() {
  const header = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sections = document.querySelectorAll('section[id]');

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href')?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        const offset = header?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      mobileMenu?.classList.add('hidden');
      menuToggle?.setAttribute('aria-expanded', 'false');
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

    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.slice(1);
      const isActive = href === currentSection;
      link.classList.toggle('text-ascentra-yellow', isActive);
      link.classList.toggle('after:w-full', isActive);
    });
  });
}
