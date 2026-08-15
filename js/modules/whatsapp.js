import { CONFIG } from '../config.js';

/**
 * Construye la URL de WhatsApp con mensaje prellenado.
 * @param {string} message - Mensaje a enviar
 * @returns {string} URL de wa.me
 */
export function buildWhatsAppUrl(message) {
  const { phoneNumber } = CONFIG.whatsapp;
  const encodedMessage = encodeURIComponent(message);

  if (!phoneNumber) {
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Genera mensaje para cotización de producto específico.
 * @param {string} model - Nombre del modelo (ej. "Tijera 26 pies")
 * @returns {string}
 */
export function getProductMessage(model) {
  return CONFIG.whatsapp.productMessageTemplate.replace('{model}', model);
}

/**
 * Inicializa todos los botones de WhatsApp en la página.
 */
export function initWhatsAppButtons() {
  const generalButtons = document.querySelectorAll('[data-whatsapp="general"]');
  generalButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const url = buildWhatsAppUrl(CONFIG.whatsapp.generalMessage);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  const productButtons = document.querySelectorAll('[data-whatsapp="product"]');
  productButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const card = button.closest('[data-model]');
      const model = card?.dataset.model || 'plataforma de elevación';
      const message = getProductMessage(model);
      const url = buildWhatsAppUrl(message);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}
