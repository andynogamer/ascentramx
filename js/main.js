/**
 * Incrementa este número cada vez que subas cambios al servidor.
 */
const APP_VERSION = '1.1.1';

document.addEventListener('DOMContentLoaded', async () => {
  const v = APP_VERSION;
  const suffix = `?v=${v}`;

  const [
    { initWhatsAppButtons },
    { initNavigation },
    { initCatalog },
    { initMap },
  ] = await Promise.all([
    import(`./modules/whatsapp.js${suffix}`),
    import(`./modules/navigation.js${suffix}`),
    import(`./modules/catalog.js${suffix}`),
    import(`./modules/map.js${suffix}`),
  ]);

  initNavigation();
  initWhatsAppButtons();
  initCatalog();
  initMap();
});
