<?php
/* API da Agenda Quadricast (sem WordPress).
   Rotas: ?r=/espacos · ?r=/disponibilidade&espaco=ID&duracao=120 · ?r=/reserva (POST) */
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
