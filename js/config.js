/**
 * Configuración global de ASCENTRA
 * El número de WhatsApp va en formato internacional sin '+' ni espacios:
 * código de país (52) + los 10 dígitos nacionales.
 */
export const CONFIG = {
  whatsapp: {
    phoneNumber: '528110821305',
    generalMessage: 'Hola, me interesa cotizar una plataforma de elevación',
    productMessageTemplate: 'Hola, me interesa cotizar la plataforma {model}',
  },
  social: {
    facebook: 'https://facebook.com/ascentramx',
    instagram: 'https://instagram.com/ascentramx',
  },
  contact: {
    phone: '+52 81 1082 1305',
    email: 'contacto@ascentramx.com',
    location: 'Francisco Villa 202 Ote, Col. Los Elizondo, Escobedo, Nuevo León',
    hours: 'Lun - Vie: 8:30 - 18:00',
  },
};
