<?php
/* Substitui as funções do WordPress usadas pelo núcleo da agenda. Não precisa de WordPress. */
define('ABSPATH', __DIR__ . '/');
define('MINUTE_IN_SECONDS', 60); define('HOUR_IN_SECONDS', 3600); define('DAY_IN_SECONDS', 86400);
define('QCA_DADOS', __DIR__ . '/dados');
if (!is_dir(QCA_DADOS)) @mkdir(QCA_DADOS, 0750, true);

class WP_Error {
    public $code, $msg, $data;
    function __construct($c = '', $m = '', $d = []) { $this->code = $c; $this->msg = $m; $this->data = $d; }
    function get_error_message() { return $this->msg; }
    function get_error_code() { return $this->code; }
    function get_error_data() { return $this->data; }
}
function is_wp_error($x) { return $x instanceof WP_Error; }
function __return_true() { return true; }
foreach (['add_action', 'add_filter', 'add_shortcode', 'register_activation_hook', 'register_deactivation_hook', 'register_post_type', 'register_rest_route'] as $f)
    if (!function_exists($f)) eval("function $f(){}");

/* Configuração: config.php sobrepõe os padrões do núcleo */
function qca_arquivo($n) { return QCA_DADOS . '/' . preg_replace('/[^a-z0-9_\-]/i', '_', $n) . '.json'; }
function get_option($n, $d = false) {
    if ($n === 'qca_settings') { $c = @include __DIR__ . '/config.php'; return is_array($c) ? $c : $d; }
    if ($n === 'admin_email') return '';
    $f = qca_arquivo('opt_' . $n);
    if (!is_file($f)) return $d;
    $v = json_decode(file_get_contents($f), true);
    return $v === null ? $d : $v;
}
function update_option($n, $v, $a = null) { return (bool) file_put_contents(qca_arquivo('opt_' . $n), json_encode($v), LOCK_EX); }
function get_transient($k) {
    $f = qca_arquivo('t_' . md5($k));
    if (!is_file($f)) return false;
    $x = json_decode(file_get_contents($f), true);
    if (!$x || $x['exp'] < time()) { @unlink($f); return false; }
    return $x['v'];
}
function set_transient($k, $v, $t = 0) { return (bool) file_put_contents(qca_arquivo('t_' . md5($k)), json_encode(['exp' => time() + ($t ?: 86400), 'v' => $v]), LOCK_EX); }
function delete_transient($k) { @unlink(qca_arquivo('t_' . md5($k))); }

/* HTTP */
function wp_remote_request($url, $a = []) {
    $ch = curl_init($url);
    $h = [];
    foreach (($a['headers'] ?? []) as $k => $v) $h[] = "$k: $v";
    $m = strtoupper($a['method'] ?? 'GET');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => $a['timeout'] ?? 15, CURLOPT_CUSTOMREQUEST => $m, CURLOPT_HTTPHEADER => $h, CURLOPT_USERAGENT => 'QuadricastAgenda/2']);
    if (isset($a['body'])) curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($a['body']) ? http_build_query($a['body']) : $a['body']);
    $body = curl_exec($ch);
    if ($body === false) { $e = curl_error($ch); curl_close($ch); return new WP_Error('http', $e); }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return ['code' => $code, 'body' => $body];
}
function wp_remote_get($u, $a = []) { $a['method'] = 'GET'; return wp_remote_request($u, $a); }
function wp_remote_post($u, $a = []) { $a['method'] = 'POST'; return wp_remote_request($u, $a); }
function wp_remote_retrieve_body($r) { return is_array($r) ? $r['body'] : ''; }
function wp_remote_retrieve_response_code($r) { return is_array($r) ? $r['code'] : 0; }

/* Textos */
function sanitize_text_field($s) { $s = strip_tags((string) $s); return trim(preg_replace('/[\r\n\t ]+/', ' ', $s)); }
function sanitize_textarea_field($s) { return trim(strip_tags((string) $s)); }
function sanitize_key($s) { return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $s)); }
function sanitize_email($s) { return filter_var(trim((string) $s), FILTER_SANITIZE_EMAIL); }
function is_email($s) { return (bool) filter_var($s, FILTER_VALIDATE_EMAIL); }
function esc_html($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }
function esc_attr($s) { return esc_html($s); }
function esc_textarea($s) { return esc_html($s); }
function esc_url_raw($s) { return filter_var(trim((string) $s), FILTER_SANITIZE_URL); }
function wp_json_encode($x) { return json_encode($x, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); }
function wp_date($f, $ts = null, $tz = null) {
    $d = new DateTime('@' . ($ts ?? time())); $d->setTimezone($tz ?: new DateTimeZone('America/Sao_Paulo'));
    $out = $d->format($f);
    $dias = ['Monday' => 'segunda-feira', 'Tuesday' => 'terça-feira', 'Wednesday' => 'quarta-feira', 'Thursday' => 'quinta-feira', 'Friday' => 'sexta-feira', 'Saturday' => 'sábado', 'Sunday' => 'domingo'];
    return strpos($f, 'l') !== false ? strtr($out, $dias) : $out;
}

/* Pedidos: ficam guardados em dados/pedidos.jsonl (cópia de segurança) */
function wp_insert_post($p) {
    $id = time() . rand(100, 999);
    file_put_contents(QCA_DADOS . '/pedidos.jsonl', json_encode(['id' => $id, 'quando' => date('c'), 'titulo' => $p['post_title'], 'texto' => $p['post_content']], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    return $id;
}
function update_post_meta($id, $k, $v) {
    file_put_contents(QCA_DADOS . '/pedidos.jsonl', json_encode(['id' => $id, $k => $v], JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}
function wp_mail($para, $assunto, $texto) {
    $h = "Content-Type: text/plain; charset=UTF-8\r\nFrom: Agenda Quadricast <" . ($GLOBALS['QCA_FROM'] ?? 'agenda@quadricast.com.br') . ">";
    return @mail($para, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $texto, $h);
}

/* Pedido recebido (substitui WP_REST_Request) */
class WP_REST_Request implements ArrayAccess {
    private $q, $j;
    function __construct($q, $j) { $this->q = $q; $this->j = $j; }
    function get_json_params() { return $this->j; }
    function get_params() { return array_merge($this->q, $this->j ?: []); }
    #[\ReturnTypeWillChange] function offsetGet($k) { return $this->q[$k] ?? ($this->j[$k] ?? null); }
    #[\ReturnTypeWillChange] function offsetExists($k) { return isset($this->q[$k]) || isset($this->j[$k]); }
    #[\ReturnTypeWillChange] function offsetSet($k, $v) {}
    #[\ReturnTypeWillChange] function offsetUnset($k) {}
}
