<?php
/* API da Agenda Quadricast (sem WordPress).
   Rotas: ?r=/espacos · ?r=/disponibilidade&espaco=ID&duracao=120 · ?r=/reserva (POST) */
/* Diagnóstico: erro fatal vira JSON curto (sem dados secretos) e ?r=/ping mostra o ambiente. */
ini_set('display_errors', '0');
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) { http_response_code(500); header('Content-Type: application/json; charset=utf-8'); }
        echo json_encode(['erro' => $e['message'], 'arquivo' => basename($e['file']), 'linha' => $e['line'], 'php' => PHP_VERSION], JSON_UNESCAPED_UNICODE);
    }
});
if (($_GET['r'] ?? '') === '/ping' || ($_GET['r'] ?? '') === 'ping') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['php' => PHP_VERSION, 'mbstring' => extension_loaded('mbstring'), 'curl' => extension_loaded('curl'), 'url_fopen' => (bool) ini_get('allow_url_fopen'), 'dados_gravavel' => is_writable(__DIR__ . '/dados'), 'config' => is_file(__DIR__ . '/config.php')]);
    exit;
}
require __DIR__ . '/shim.php';
require __DIR__ . '/nucleo.php';

$s = qca_settings();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$ok = array_map('trim', explode(',', $s['origens']));
if ($origem && in_array($origem, $ok, true)) {
    header("Access-Control-Allow-Origin: $origem");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

function qca_saida($x) {
    if (is_wp_error($x)) {
        http_response_code(intval($x->get_error_data()['status'] ?? 400));
        $x = ['code' => $x->get_error_code(), 'message' => $x->get_error_message()];
    }
    echo json_encode($x, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$rota = trim($_GET['r'] ?? ($_SERVER['PATH_INFO'] ?? ''), '/');
$json = json_decode(file_get_contents('php://input') ?: 'null', true) ?: [];
$req = new WP_REST_Request($_GET, $json);

if ($rota === 'espacos') {
    $out = [];
    foreach ($s['espacos'] as $e) {
        if (empty($e['ativo'])) continue;
        $out[] = ['id' => $e['id'], 'nome' => $e['nome'], 'local' => $e['local'], 'grupo' => $e['grupo'], 'desc' => $e['desc'], 'equipe' => intval($e['equipe']), 'inicio' => $e['inicio'] ?? ''];
    }
    qca_saida(['espacos' => $out, 'montagem' => intval($s['montagem']), 'whatsapp' => preg_replace('/\D/', '', $s['whatsapp'])]);
}
if ($rota === 'disponibilidade') {
    $d = qca_disponibilidade(sanitize_key($req['espaco']), intval($req['duracao'] ?: 120));
    if (is_wp_error($d)) qca_saida($d);
    qca_saida(['dias' => $d, 'atualizado' => wp_date('c')]);
}
if ($rota === 'reserva' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') qca_saida(qca_post_reserva($req));
qca_saida(new WP_Error('rota', 'Rota não encontrada.', ['status' => 404]));
