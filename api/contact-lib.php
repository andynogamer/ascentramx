<?php
/**
 * Validación, sanitización y envío del formulario de contacto ASCENTRA.
 * El destinatario está fijado en el servidor: el cliente no puede cambiarlo.
 */

declare(strict_types=1);

const CONTACT_TO_EMAIL = 'ventas@ascentramx.com';
const CONTACT_FROM_EMAIL = 'ventas@ascentramx.com';
const CONTACT_FROM_NAME = 'ASCENTRA Sitio Web';

const CONTACT_LIMITS = [
    'nombre' => ['min' => 2, 'max' => 80],
    'telefono' => ['min' => 8, 'max' => 20],
    'correo' => ['max' => 254],
    'asunto' => ['min' => 5, 'max' => 1000],
];

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600;
const RATE_LIMIT_COOLDOWN = 15;
const RATE_LIMIT_DIR = __DIR__ . '/storage/ratelimit';

const CSRF_TTL_SECONDS = 7200;
const MAX_JSON_BYTES = 8192;

function contact_str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function contact_substr(string $value, int $start, int $length): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, $start, $length, 'UTF-8');
    }
    return substr($value, $start, $length);
}

function contains_header_injection(string $value): bool
{
    return strpbrk($value, "\r\n\0") !== false;
}

function as_string($value): string
{
    return is_string($value) ? $value : '';
}

function strip_control_chars(string $value, bool $allowNewlines = false): string
{
    $value = str_replace("\0", '', $value);
    if ($allowNewlines) {
        $value = str_replace(["\r\n", "\r"], "\n", $value);
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
        $value = preg_replace("/\n{3,}/", "\n\n", $value) ?? '';
    } else {
        $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
    }
    return trim($value);
}

function encode_mail_header(string $value): string
{
    $value = strip_control_chars($value, false);
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($value, 'UTF-8', 'Q', "\r\n");
    }
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function get_client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function rate_limit_path(string $ip): string
{
    $hash = hash('sha256', $ip);
    return RATE_LIMIT_DIR . '/' . $hash . '.json';
}

function rate_limit_read(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) && isset($data['hits']) && is_array($data['hits']) ? $data['hits'] : [];
}

function rate_limit_status(string $ip): array
{
    if (!is_dir(RATE_LIMIT_DIR) && !mkdir(RATE_LIMIT_DIR, 0750, true) && !is_dir(RATE_LIMIT_DIR)) {
        return ['ok' => false, 'reason' => 'server'];
    }

    $path = rate_limit_path($ip);
    $now = time();
    $hits = array_values(array_filter(
        rate_limit_read($path),
        static function ($ts) use ($now) {
            $timestamp = (int) $ts;
            return $timestamp >= ($now - RATE_LIMIT_WINDOW);
        }
    ));

    if ($hits && ($now - max($hits)) < RATE_LIMIT_COOLDOWN) {
        return ['ok' => false, 'reason' => 'cooldown'];
    }
    if (count($hits) >= RATE_LIMIT_MAX) {
        return ['ok' => false, 'reason' => 'limit'];
    }

    return ['ok' => true, 'hits' => $hits, 'path' => $path, 'now' => $now];
}

function rate_limit_commit(array $status): void
{
    $hits = $status['hits'] ?? [];
    $hits[] = $status['now'] ?? time();
    $path = $status['path'] ?? '';
    if ($path === '') {
        return;
    }
    $fh = fopen($path, 'c+');
    if ($fh === false) {
        return;
    }
    if (flock($fh, LOCK_EX)) {
        ftruncate($fh, 0);
        fwrite($fh, json_encode(['hits' => $hits], JSON_UNESCAPED_SLASHES));
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);
}

function validate_contact_fields(array $input): array
{
    $errors = [];

    $nombre = strip_control_chars(as_string($input['nombre'] ?? ''), false);
    $telefono = strip_control_chars(as_string($input['telefono'] ?? ''), false);
    $correo = strip_control_chars(as_string($input['correo'] ?? ''), false);
    $asunto = strip_control_chars(as_string($input['asunto'] ?? ''), true);

    if (contains_header_injection($nombre) || contains_header_injection($telefono) || contains_header_injection($correo)) {
        return ['ok' => false, 'errors' => ['form' => 'El mensaje contiene caracteres no permitidos.']];
    }

    $nombreLen = contact_str_len($nombre);
    if ($nombreLen < CONTACT_LIMITS['nombre']['min'] || $nombreLen > CONTACT_LIMITS['nombre']['max']) {
        $errors['nombre'] = 'Ingresa un nombre de 2 a 80 caracteres.';
    } elseif (!preg_match("/^[\\p{L}\\p{M}\\s'.\\-]{2,80}$/u", $nombre)) {
        $errors['nombre'] = 'El nombre solo puede incluir letras, espacios, apóstrofe y guion.';
    }

    $telefonoLen = contact_str_len($telefono);
    if ($telefonoLen < CONTACT_LIMITS['telefono']['min'] || $telefonoLen > CONTACT_LIMITS['telefono']['max']) {
        $errors['telefono'] = 'Ingresa un teléfono válido.';
    } elseif (!preg_match('/^\+?[0-9\s\\-()]{8,20}$/', $telefono)) {
        $errors['telefono'] = 'El teléfono solo puede incluir números, espacios, +, paréntesis y guion.';
    } else {
        $digits = preg_replace('/\D+/', '', $telefono) ?? '';
        $digitLen = strlen($digits);
        if ($digitLen < 8 || $digitLen > 15) {
            $errors['telefono'] = 'El teléfono debe tener entre 8 y 15 dígitos.';
        }
    }

    if ($correo === '' || contact_str_len($correo) > CONTACT_LIMITS['correo']['max']) {
        $errors['correo'] = 'Ingresa un correo electrónico válido.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $errors['correo'] = 'Ingresa un correo electrónico válido.';
    } elseif (contains_header_injection($correo) || !preg_match('/^[A-Z0-9._%+\\-]+@[A-Z0-9.\\-]+\\.[A-Z]{2,}$/i', $correo)) {
        $errors['correo'] = 'Ingresa un correo electrónico válido.';
    }

    $asuntoLen = contact_str_len($asunto);
    if ($asuntoLen < CONTACT_LIMITS['asunto']['min'] || $asuntoLen > CONTACT_LIMITS['asunto']['max']) {
        $errors['asunto'] = 'El asunto debe tener entre 5 y 1000 caracteres.';
    }

    if ($errors) {
        return ['ok' => false, 'errors' => $errors];
    }

    return [
        'ok' => true,
        'data' => [
            'nombre' => $nombre,
            'telefono' => $telefono,
            'correo' => $correo,
            'asunto' => $asunto,
        ],
    ];
}

function build_contact_email(array $data): array
{
    $subjectPreview = contact_substr(str_replace(["\n", "\r"], ' ', $data['asunto']), 0, 70);
    $subject = '[ASCENTRA] Contacto web: ' . $subjectPreview;

    $body = implode("\n", [
        'Nuevo mensaje desde el formulario de ascentramx.com',
        '---------------------------------------------------',
        'Nombre:    ' . $data['nombre'],
        'Teléfono:  ' . $data['telefono'],
        'Correo:    ' . $data['correo'],
        '',
        'Asunto:',
        $data['asunto'],
        '---------------------------------------------------',
        'Este correo se envió desde el formulario de contacto del sitio web.',
        'Responde a este mensaje para contactar al cliente.',
    ]);

    return [
        'to' => CONTACT_TO_EMAIL,
        'subject' => $subject,
        'body' => $body,
        'replyTo' => $data['correo'],
    ];
}

function send_contact_email(array $email): bool
{
    $encodedSubject = encode_mail_header($email['subject']);
    $fromName = encode_mail_header(CONTACT_FROM_NAME);
    $replyTo = $email['replyTo'];

    if (!filter_var($replyTo, FILTER_VALIDATE_EMAIL) || contains_header_injection($replyTo)) {
        return false;
    }

    $headers = [
        'From: ' . $fromName . ' <' . CONTACT_FROM_EMAIL . '>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: ASCENTRA-Contact',
    ];

    $envelope = '-f' . CONTACT_FROM_EMAIL;

    return @mail(
        $email['to'],
        $encodedSubject,
        $email['body'],
        implode("\r\n", $headers),
        $envelope
    );
}

function start_contact_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('ascentra_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function csrf_issue_token(): string
{
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_issued_at'] = time();
    return $token;
}

function csrf_verify_token(string $token): bool
{
    if ($token === '' || empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        return false;
    }
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        return false;
    }
    $issued = isset($_SESSION['csrf_issued_at']) ? (int) $_SESSION['csrf_issued_at'] : 0;
    return $issued > 0 && (time() - $issued) <= CSRF_TTL_SECONDS;
}

function is_honeypot_triggered(array $input): bool
{
    if (!array_key_exists('website', $input)) {
        return false;
    }
    $website = $input['website'];
    if (!is_string($website)) {
        return true;
    }
    return trim($website) !== '';
}
