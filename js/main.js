import { initWhatsAppButtons } from './modules/whatsapp.js';
import { initNavigation } from './modules/navigation.js';
import { initCatalog } from './modules/catalog.js';
import { initMap } from './modules/map.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initWhatsAppButtons();
  initCatalog();
  initMap();
});
