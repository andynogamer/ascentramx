import { CONFIG } from '../config.js';

const ENDPOINT = 'api/contact.php';

const LIMITS = {
  nombre: { min: 2, max: 80 },
  telefono: { min: 8, max: 20 },
  correo: { max: 254 },
  asunto: { min: 5, max: 1000 },
};

const FIELD_IDS = ['nombre', 'telefono', 'correo', 'asunto'];
const HEADER_INJECTION = /[\r\n\0]/;
const NAME_RE = /^[\p{L}\p{M}\s'.-]{2,80}$/u;
const PHONE_RE = /^\+?[0-9\s\-()]{8,20}$/;
const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

function byId(id) {
  return document.getElementById(id);
}

function setStatus(el, type, message) {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message;
  el.classList.remove('is-success', 'is-error');
  if (type) el.classList.add(type);
}

function setFieldError(field, message) {
  const input = byId(`contact-${field}`);
  const error = byId(`contact-error-${field}`);
  if (input) {
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    input.classList.toggle('is-invalid', Boolean(message));
  }
  if (error) {
    error.hidden = !message;
    error.textContent = message || '';
  }
}

function clearErrors() {
  FIELD_IDS.forEach((field) => setFieldError(field, ''));
}

function getValue(form, name) {
  const field = form.elements.namedItem(name);
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function validateClient(values) {
  const errors = {};

  if (HEADER_INJECTION.test(values.nombre) || HEADER_INJECTION.test(values.telefono) || HEADER_INJECTION.test(values.correo)) {
    errors.form = 'El mensaje contiene caracteres no permitidos.';
    return errors;
  }

  if (!values.nombre) {
    errors.nombre = 'Ingresa tu nombre.';
  } else if (values.nombre.length < LIMITS.nombre.min || values.nombre.length > LIMITS.nombre.max || !NAME_RE.test(values.nombre)) {
    errors.nombre = 'El nombre solo puede incluir letras, espacios, apóstrofe y guion.';
  }

  const phoneDigits = values.telefono.replace(/\D+/g, '');
  if (!values.telefono) {
    errors.telefono = 'Ingresa tu teléfono.';
  } else if (!PHONE_RE.test(values.telefono) || phoneDigits.length < 8 || phoneDigits.length > 15) {
    errors.telefono = 'Ingresa un teléfono válido.';
  }

  if (!values.correo) {
    errors.correo = 'Ingresa tu correo electrónico.';
  } else if (values.correo.length > LIMITS.correo.max || !EMAIL_RE.test(values.correo)) {
    errors.correo = 'Ingresa un correo electrónico válido.';
  }

  if (!values.asunto) {
    errors.asunto = 'Ingresa el asunto.';
  } else if (values.asunto.length < LIMITS.asunto.min || values.asunto.length > LIMITS.asunto.max) {
    errors.asunto = 'El asunto debe tener entre 5 y 1000 caracteres.';
  }

  return errors;
}

async function fetchCsrfToken() {
  const response = await fetch(ENDPOINT, {
    method: 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('token');
  }
  const payload = await response.json();
  if (!payload?.ok || typeof payload.csrfToken !== 'string' || !payload.csrfToken) {
    throw new Error('token');
  }
  return payload.csrfToken;
}

async function submitContact(payload) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
}

function setSubmitting(button, submitting) {
  if (!button) return;
  button.disabled = submitting;
  button.setAttribute('aria-busy', submitting ? 'true' : 'false');
  button.textContent = submitting ? 'Enviando…' : 'Enviar mensaje';
}

export function initContactForm() {
  const form = byId('contact-form');
  if (!form) return;

  const statusEl = byId('contact-form-status');
  const submitBtn = byId('contact-submit');
  const companyEmail = CONFIG.contact?.email || 'ventas@ascentramx.com';
  const hint = byId('contact-form-hint');
  if (hint) {
    hint.textContent = `Tu mensaje se envía a ${companyEmail}.`;
  }

  let csrfToken = '';

  async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    csrfToken = await fetchCsrfToken();
    return csrfToken;
  }

  ensureCsrfToken().catch(() => {});

  form.addEventListener('input', (event) => {
    const field = event.target?.name;
    if (FIELD_IDS.includes(field)) {
      setFieldError(field, '');
      if (statusEl?.classList.contains('is-error')) {
        setStatus(statusEl, '', '');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    setStatus(statusEl, '', '');

    const values = {
      nombre: getValue(form, 'nombre'),
      telefono: getValue(form, 'telefono'),
      correo: getValue(form, 'correo'),
      asunto: getValue(form, 'asunto'),
      website: getValue(form, 'website'),
    };

    const errors = validateClient(values);
    if (Object.keys(errors).length) {
      FIELD_IDS.forEach((field) => {
        if (errors[field]) setFieldError(field, errors[field]);
      });
      setStatus(statusEl, 'is-error', errors.form || 'Revisa los campos e inténtalo de nuevo.');
      const firstError = FIELD_IDS.find((field) => errors[field]);
      if (firstError) byId(`contact-${firstError}`)?.focus();
      return;
    }

    setSubmitting(submitBtn, true);

    try {
      const token = await ensureCsrfToken();
      const { response, data } = await submitContact({
        nombre: values.nombre,
        telefono: values.telefono,
        correo: values.correo,
        asunto: values.asunto,
        website: values.website,
        csrfToken: token,
      });

      if (data?.ok) {
        form.reset();
        clearErrors();
        csrfToken = '';
        setStatus(statusEl, 'is-success', data.message || 'Mensaje enviado. Te contactaremos pronto.');
        fetchCsrfToken()
          .then((token) => {
            csrfToken = token;
          })
          .catch(() => {});
        return;
      }

      const fieldErrors = data?.errors && typeof data.errors === 'object' ? data.errors : {};
      FIELD_IDS.forEach((field) => {
        if (typeof fieldErrors[field] === 'string') {
          setFieldError(field, fieldErrors[field]);
        }
      });

      if (response.status === 429) {
        setStatus(statusEl, 'is-error', data?.message || 'Demasiados intentos. Espera unos minutos.');
        return;
      }

      setStatus(
        statusEl,
        'is-error',
        data?.message || `No pudimos enviar el mensaje. Escríbenos a ${companyEmail}.`
      );
    } catch {
      setStatus(statusEl, 'is-error', `No pudimos enviar el mensaje. Escríbenos a ${companyEmail}.`);
    } finally {
      setSubmitting(submitBtn, false);
    }
  });
}
