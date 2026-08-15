import { initWhatsAppButtons } from './modules/whatsapp.js';
import { initNavigation } from './modules/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initWhatsAppButtons();
});
