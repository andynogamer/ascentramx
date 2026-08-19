import { CONFIG } from '../config.js';

function getMapsQuery() {
  return CONFIG.maps?.query || CONFIG.contact.location;
}

export function getMapsLink() {
  const query = encodeURIComponent(getMapsQuery());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getMapsEmbedUrl() {
  const query = encodeURIComponent(getMapsQuery());

  if (CONFIG.maps?.apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${CONFIG.maps.apiKey}&q=${query}&language=es&zoom=16`;
  }

  return `https://maps.google.com/maps?q=${query}&hl=es&z=16&output=embed`;
}

function setContactLink(link, href, label) {
  if (!link) return;
  link.href = href;
  const labelEl = link.querySelector('p:last-child');
  if (labelEl) labelEl.textContent = label;
}

export function initMap() {
  const mapContainer = document.getElementById('map-embed');
  const directionsLink = document.getElementById('maps-directions-link');
  const footerAddress = document.getElementById('footer-address');
  const locationAddress = document.getElementById('location-address');
  const contactPhone = document.getElementById('contact-phone');
  const contactEmail = document.getElementById('contact-email');
  const contactHours = document.getElementById('contact-hours');

  const address = getMapsQuery();
  const mapsLink = getMapsLink();
  const phoneDigits = CONFIG.contact.phone.replace(/\D/g, '');

  if (mapContainer) {
    mapContainer.src = getMapsEmbedUrl();
    mapContainer.title = `Ubicación de ASCENTRA - ${address}`;
  }

  if (directionsLink) {
    directionsLink.href = mapsLink;
  }

  if (locationAddress) {
    locationAddress.textContent = address;
  }

  if (footerAddress) {
    footerAddress.href = mapsLink;
    footerAddress.textContent = address;
  }

  setContactLink(contactPhone, `tel:+${phoneDigits}`, CONFIG.contact.phone);
  setContactLink(contactEmail, `mailto:${CONFIG.contact.email}`, CONFIG.contact.email);

  if (contactHours) {
    contactHours.textContent = CONFIG.contact.hours;
  }
}
