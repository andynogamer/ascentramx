<?php
/**
 * API del formulario de contacto.
 * GET  → emite un token CSRF
 * POST → valida, limpia y envía el correo a ventas@ascentramx.com
 */

declare(strict_types=1);

require __DIR__ . '/contact-lib.php';

ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Content-Type: application/json; charset=UTF-8');

if (PHP_SAPI === 'cli') {
    fwrite(STDERR, "Este archivo responde por HTTP. Usa php -l o las pruebas CLI.\n");
    exit(1);
}

function json_response(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_origin_allowed(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        if ($referer === '') {
            return true;
        }
        $host = parse_url($referer, PHP_URL_HOST);
        return is_allowed_host(is_string($host) ? $host : null);
    }

    $parts = parse_url($origin);
    $host = $parts['host'] ?? null;
    $scheme = $parts['scheme'] ?? '';
    if (!is_string($host) || ($scheme !== 'https' && $scheme !== 'http')) {
        return false;
    }
    return is_allowed_host($host);
}

function is_allowed_host(?string $host): bool
{
    if ($host === null || $host === '') {
        return false;
    }
    $host = strtolower($host);
    $allowed = [
        'ascentramx.com',
        'www.ascentramx.com',
        'localhost',
        '127.0.0.1',
        '::1',
    ];
    return in_array($host, $allowed, true);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    json_response(405, ['ok' => false, 'message' => 'Método no permitido.']);
}

if (!request_origin_allowed()) {
    json_response(403, ['ok' => false, 'message' => 'Origen no permitido.']);
}

start_contact_session();

if ($method === 'GET') {
    json_response(200, [
        'ok' => true,
        'csrfToken' => csrf_issue_token(),
    ]);
}

$length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($length > MAX_JSON_BYTES) {
    json_response(413, ['ok' => false, 'message' => 'El mensaje es demasiado grande.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    json_response(415, ['ok' => false, 'message' => 'Formato no soportado.']);
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '' || strlen($raw) > MAX_JSON_BYTES) {
    json_response(400, ['ok' => false, 'message' => 'No se pudo leer el formulario.']);
}

$data = json_decode($raw, true, 4);
if (!is_array($data)) {
    json_response(400, ['ok' => false, 'message' => 'No se pudo leer el formulario.']);
}

$csrfToken = is_string($data['csrfToken'] ?? null) ? $data['csrfToken'] : '';
if (!csrf_verify_token($csrfToken)) {
    json_response(403, ['ok' => false, 'message' => 'La sesión expiró. Recarga la página e inténtalo de nuevo.']);
}

if (is_honeypot_triggered($data)) {
    $ip = get_client_ip();
    $limit = rate_limit_status($ip);
    if ($limit['ok']) {
        rate_limit_commit($limit);
    }
    json_response(200, ['ok' => true, 'message' => 'Mensaje enviado. Te contactaremos pronto.']);
}

$validated = validate_contact_fields($data);
if (!$validated['ok']) {
    json_response(422, [
        'ok' => false,
        'message' => 'Revisa los campos e inténtalo de nuevo.',
        'errors' => $validated['errors'],
    ]);
}

$ip = get_client_ip();
$limit = rate_limit_status($ip);
if (!$limit['ok']) {
    json_response(429, [
        'ok' => false,
        'message' => 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    ]);
}

$email = build_contact_email($validated['data']);
$sent = send_contact_email($email);

if (!$sent) {
    json_response(500, [
        'ok' => false,
        'message' => 'No pudimos enviar el mensaje. Escríbenos a ventas@ascentramx.com o llámanos.',
    ]);
}

rate_limit_commit($limit);
csrf_issue_token();

json_response(200, [
    'ok' => true,
    'message' => 'Mensaje enviado. Te contactaremos pronto.',
]);
