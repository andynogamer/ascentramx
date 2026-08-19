/**
 * Navegación suave, menú móvil y estado activo del navbar.
 */
export function initNavigation() {
  const header = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const sections = document.querySelectorAll('section[id]');

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden') === false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-nav-link]');
    if (!link || !link.matches('a[href^="#"]')) return;

    const targetId = link.getAttribute('href')?.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    event.preventDefault();

    mobileMenu?.classList.add('hidden');
    menuToggle?.setAttribute('aria-expanded', 'false');

    const offset = header?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('shadow-lg', window.scrollY > 20);
    }

    const navLinks = document.querySelectorAll('[data-nav-link]');
    let currentSection = 'inicio';
    const scrollPos = window.scrollY + (header?.offsetHeight || 0) + 100;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentSection = section.id;
      }
    });

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
