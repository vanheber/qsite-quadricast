<?php
/**
 * Plugin Name: Quadricast Agenda
 * Description: Agenda pública dos estúdios Quadricast. Lê a disponibilidade nas agendas Google, mostra os horários livres para o cliente e envia o pedido de reserva para o QG. Use o shortcode [quadricast_agenda].
 * Version: 2.0.0
 * Author: Agência Quadri
 * Text Domain: quadricast-agenda
 */

if (!defined('ABSPATH')) exit;

define('QCA_VERSION', '2.0.0');
define('QCA_OPT', 'qca_settings');
define('QCA_TZ', 'America/Sao_Paulo');

/* ------------------------------------------------------------------ */
/* Configuração padrão                                                 */
/* ------------------------------------------------------------------ */

function qca_gcal_public($id) {
    // Endereço secreto (privado) da agenda, se configurado: a agenda não precisa ser pública.
    static $seg = null;
    if ($seg === null) { $seg = []; $c = get_option(QCA_OPT); $seg = is_array($c) && !empty($c['ics_secretos']) ? $c['ics_secretos'] : []; }
    if (!empty($seg[$id])) return 'https://calendar.google.com/calendar/ical/' . rawurlencode($id) . '/' . $seg[$id] . '/basic.ics';
    return 'https://calendar.google.com/calendar/ical/' . rawurlencode($id) . '/public/basic.ics';
}

function qca_defaults() {
    $e = function ($id, $nome, $local, $grupo, $equipe, $cal, $desc, $inicio = '') {
        return compact('id', 'nome', 'local', 'grupo', 'equipe', 'desc', 'inicio') + ['ics' => qca_gcal_public($cal), 'ativo' => 1];
    };
    return [
        'espacos' => [
            $e('qspace', 'Estúdio QuadriSpace', 'Space Coworking', 'Podcast e videocast', 1, 'c_527880df511700ecb25f0a26be363f8203fecb5fa3b7738c3f28497a869fdb64@group.calendar.google.com', 'Set fixo de podcast, multicâmera, pronto para gravar.'),
            $e('qcpod', 'Estúdio Quadricast Podcast', 'Estúdio Quadricast', 'Podcast e videocast', 1, 'c_bf936130ce3e7f6007b16ab4aa6be84897048e4e920bbe2a3beb67f397ca609b@group.calendar.google.com', 'O estúdio original da Quadricast, com tratamento acústico.'),
            $e('cruzeiro', 'Quadricast Cruzeiro', 'Cruzeiro', 'Podcast e videocast', 1, 'c_97905d94936754b470e5898e90fae6c39ca2d71b2656040cdbda26be773936f5@group.calendar.google.com', 'Set de podcast com mesa redonda e fundo verde para chroma key.', '2026-12-01'),
            $e('qcaulas', 'Estúdio Aulas e Lives', 'Estúdio Quadricast', 'Aulas, cursos e lives', 1, 'c_f3252ed9c1f4defc90f1fa9b64d112851b8fb54c65a4a8bd2ab5b5a334e115d3@group.calendar.google.com', 'Fundo verde para cursos, treinamentos e transmissões ao vivo.'),
            $e('lareira', 'Sala Lareira', 'Space Coworking', 'Cenários', 2, 'c_d70f0bdde7fa5744101f003b35b3b7c86ca8efecf5d5ca2b87cba7fe87ca4ab5@group.calendar.google.com', 'Ambiente aconchegante para entrevistas e conteúdo de autoridade.'),
            $e('vitrine', 'Sala Vitrine', 'Space Coworking', 'Cenários', 2, 'c_3e432a66107dc7866fda8f4299b1ae286ab90171d0059d565a30af15a7a78786@group.calendar.google.com', 'Sala de vidro com vista para o jardim e a piscina, luz natural.'),
            $e('externas', 'Externas: Jardim e Piscina', 'Space Coworking', 'Cenários', 2, 'c_8d480376692d218f9ffe6df2470c3f99abf5d7a6c23d884fd5b1b7c2a424af1a@group.calendar.google.com', 'Gravações ao ar livre no jardim e na piscina.'),
            $e('spacecozinha', 'Cozinha do Space', 'Space Coworking', 'Gastronomia', 2, 'c_1c0e6999505f7440a8971aa8142fac88257e25ad10ff597d03365f790fed9dd3@group.calendar.google.com', 'Bancada gastronômica para receitas e degustações. Único cenário com opção de churrasco.'),
            $e('cozinha', 'Estúdio Cozinha da Pri', 'Boulevard Vila', 'Gastronomia', 1, 'c_64edf745076fb7cb62cef7b8e1d45c61421150e6a66e6024f571c241727a2f36@group.calendar.google.com', 'Cozinha equipada com panelas, formas e utensílios para receitas. Não comporta churrasco.'),
        ],
        'equipe' => [
            ['nome' => 'Reinaldo', 'ics' => qca_gcal_public('c_4022618cef92227746d8a1bca43e29b7deaf1b8b0e086bd1579c2d780f5b2965@group.calendar.google.com')],
            ['nome' => 'Vicenzo', 'ics' => qca_gcal_public('c_1cef1be5dfb6de8d5db3843dcd391736936e53840e1069e8aebc4d9373e2c0d8@group.calendar.google.com')],
            ['nome' => 'Felipe', 'ics' => qca_gcal_public('c_b3d77eb74e34093e83e3e9dfa70a0be2ee2c8c9ed9ffce36ed58a78418327430@group.calendar.google.com')],
            ['nome' => 'Danillo', 'ics' => qca_gcal_public('c_61194ca01595ca3fbb3b4434ed055f85ad713b80f28a89e6c3834b791f379908@group.calendar.google.com')],
        ],
        // Horário em que o cliente pode escolher começar (0 = domingo ... 6 = sábado).
        'horarios' => ['1' => '08:00-24:00', '2' => '08:00-24:00', '3' => '08:00-24:00', '4' => '08:00-24:00', '5' => '08:00-24:00', '6' => '08:00-24:00', '0' => '08:00-24:00'], // último início 22h, gravação até meia-noite
        'cenario_abre' => '18:00', // cenários do Space: gravação só a partir das 18h
        'cenario_dia' => 'externas', // exceção: Externas também podem ser alugadas de dia (ids separados por vírgula)
        'cenario_montagem' => 60,  // montagem a partir das 17h
        'montagem' => 30,          // minutos antes e depois
        'antecedencia' => 48,      // horas mínimas para reservar (Media Kit: 48h)
        'dias' => 45,              // quantos dias à frente mostrar
        'segura_horas' => 48,      // quanto tempo um pedido segura o horário
        'qg_url' => '',            // ex.: https://qg.agenciaquadri.com
        'qg_token' => '',
        'qg_source' => 3,          // Contato
        'qg_status' => 2,          // Prospecção
        'qg_assigned' => 2,
        'email' => get_option('admin_email'),
        'whatsapp' => '5515997862901', // Carolina Rodrigues
        // Projeto e tarefas no QG a cada reserva
        'qg_projeto' => 1,
        // Aviso automático por WhatsApp (API de envio da Quadri)
        'wa_provedor' => '',          // evolution | zapi | webhook
        'wa_url' => '',               // Evolution: https://servidor/message/sendText/INSTANCIA · Z-API: https://api.z-api.io/instances/ID/token/TOKEN/send-text · Webhook: qualquer URL
        'wa_token' => '',             // apikey (Evolution) ou Client-Token (Z-API)
        'wa_equipe' => '5515997862901', // quem da equipe recebe o aviso (separe por vírgula)
        'origens' => 'https://www.quadricast.com.br,https://quadricast.com.br,https://agenciaquadri.com,https://www.agenciaquadri.com',
    ];
}

function qca_settings() {
    $s = get_option(QCA_OPT);
    $d = qca_defaults();
    if (!is_array($s)) return $d;
    return array_merge($d, $s);
}

/* ------------------------------------------------------------------ */
/* Leitura das agendas (iCal) e cálculo de horários livres            */
/* ------------------------------------------------------------------ */

function qca_tz() { return new DateTimeZone(QCA_TZ); }

function qca_parse_dt($val, $params) {
    $tz = qca_tz();
    if (preg_match('/TZID=([^;:]+)/', $params, $m)) {
        try { $tz = new DateTimeZone($m[1]); } catch (Exception $e) {}
    }
    $allday = (strpos($params, 'VALUE=DATE') !== false) || preg_match('/^\d{8}$/', $val);
    if ($allday) {
        $d = DateTime::createFromFormat('Ymd H:i:s', substr($val, 0, 8) . ' 00:00:00', qca_tz());
        return [$d ? $d->getTimestamp() : 0, true];
    }
    if (substr($val, -1) === 'Z') {
        $d = DateTime::createFromFormat('Ymd\THis\Z', $val, new DateTimeZone('UTC'));
    } else {
        $d = DateTime::createFromFormat('Ymd\THis', $val, $tz);
    }
    return [$d ? $d->getTimestamp() : 0, false];
}

/** Títulos que não ocupam estúdio (config 'ignorar_titulos'; padrão: reservas para edição). */
function qca_ignorar_titulo($t) {
    if ($t === '') return false;
    static $lista = null;
    if ($lista === null) { $lista = ['Reservado para Edi']; $c = get_option(QCA_OPT); if (is_array($c) && isset($c['ignorar_titulos'])) $lista = (array) $c['ignorar_titulos']; }
    foreach ($lista as $x) if ($x !== '' && mb_stripos($t, $x) !== false) return true;
    return false;
}

/** Retorna lista de intervalos ocupados [ini, fim] (timestamps) dentro da janela. */
function qca_busy_from_ics($url, $from, $to) {
    if (!$url) return [];
    $key = 'qca_ics_' . md5($url);
    $raw = get_transient($key);
    if ($raw === false) {
        $r = wp_remote_get($url, ['timeout' => 12]);
        if (is_wp_error($r) || wp_remote_retrieve_response_code($r) !== 200) {
            set_transient($key, '__ERR__', 60);
            return null; // erro: tratar como indisponível
        }
        $raw = wp_remote_retrieve_body($r);
        set_transient($key, $raw, 5 * MINUTE_IN_SECONDS);
    }
    if ($raw === '__ERR__') return null;
    $raw = preg_replace("/\n[ \t]/", '', str_replace("\r\n", "\n", $raw));
    $out = [];
    if (!preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $raw, $evs)) return [];
    $cancelled_instances = [];
    $events = [];
    foreach ($evs[1] as $block) {
        $ev = ['ex' => []];
        foreach (explode("\n", trim($block)) as $line) {
            if (!preg_match('/^([A-Z\-]+)([^:]*):(.*)$/', $line, $m)) continue;
            list(, $name, $params, $val) = $m;
            switch ($name) {
                case 'DTSTART': $ev['s'] = qca_parse_dt(trim($val), $params); break;
                case 'DTEND': $ev['e'] = qca_parse_dt(trim($val), $params); break;
                case 'RRULE': $ev['rrule'] = trim($val); break;
                case 'EXDATE':
                    foreach (explode(',', trim($val)) as $x) { $ev['ex'][] = qca_parse_dt($x, $params)[0]; }
                    break;
                case 'TRANSP': $ev['transp'] = trim($val); break;
                case 'SUMMARY': $ev['titulo'] = trim(str_replace(['\\,', '\\;'], [',', ';'], $val)); break;
                case 'STATUS': $ev['status'] = trim($val); break;
                case 'UID': $ev['uid'] = trim($val); break;
                case 'RECURRENCE-ID': $ev['rid'] = qca_parse_dt(trim($val), $params)[0]; break;
            }
        }
        if (empty($ev['s'])) continue;
        if (($ev['status'] ?? '') === 'CANCELLED') {
            if (!empty($ev['rid'])) $cancelled_instances[($ev['uid'] ?? '') . '@' . $ev['rid']] = 1;
            continue;
        }
        if (($ev['transp'] ?? '') === 'TRANSPARENT') continue;
        if (qca_ignorar_titulo($ev['titulo'] ?? '')) continue; // ex.: "Reservado para Edições" não ocupa estúdio
        $events[] = $ev;
    }
    foreach ($events as $ev) {
        $s = $ev['s'][0];
        $e = isset($ev['e']) ? $ev['e'][0] : ($ev['s'][1] ? $s + DAY_IN_SECONDS : $s + HOUR_IN_SECONDS);
        $dur = max(60, $e - $s);
        $starts = [$s];
        if (!empty($ev['rrule']) && empty($ev['rid'])) $starts = qca_expand_rrule($ev['rrule'], $s, $to, $ev['ex']);
        foreach ($starts as $st) {
            if (isset($cancelled_instances[($ev['uid'] ?? '') . '@' . $st])) continue;
            $en = $st + $dur;
            if ($en > $from && $st < $to) $out[] = [$st, $en];
        }
    }
    return $out;
}

function qca_expand_rrule($rule, $start, $to, $ex) {
    $p = [];
    foreach (explode(';', $rule) as $kv) { $a = explode('=', $kv, 2); if (count($a) === 2) $p[$a[0]] = $a[1]; }
    $freq = $p['FREQ'] ?? '';
    $interval = max(1, intval($p['INTERVAL'] ?? 1));
    $count = isset($p['COUNT']) ? intval($p['COUNT']) : 0;
    $until = isset($p['UNTIL']) ? qca_parse_dt($p['UNTIL'], '')[0] : $to;
    $until = min($until, $to);
    $tz = qca_tz();
    $base = (new DateTime('@' . $start))->setTimezone($tz);
    $days = ['SU' => 0, 'MO' => 1, 'TU' => 2, 'WE' => 3, 'TH' => 4, 'FR' => 5, 'SA' => 6];
    $byday = [];
    if (!empty($p['BYDAY'])) foreach (explode(',', $p['BYDAY']) as $d) { $d = substr($d, -2); if (isset($days[$d])) $byday[] = $days[$d]; }
    $out = [];
    $n = 0;
    $guard = 0;
    if ($freq === 'WEEKLY') {
        if (!$byday) $byday = [intval($base->format('w'))];
        $week = clone $base;
        $week->modify('-' . $base->format('w') . ' days');
        while ($guard++ < 1000) {
            foreach ($byday as $wd) {
                $c = clone $week;
                $c->modify("+$wd days");
                $c->setTime(intval($base->format('H')), intval($base->format('i')), intval($base->format('s')));
                $ts = $c->getTimestamp();
                if ($ts < $start) continue;
                if ($ts > $until) break 2;
                $n++;
                if ($count && $n > $count) break 2;
                if (!in_array($ts, $ex, true)) $out[] = $ts;
            }
            $week->modify('+' . (7 * $interval) . ' days');
        }
    } else {
        $step = ['DAILY' => 'day', 'MONTHLY' => 'month', 'YEARLY' => 'year'][$freq] ?? null;
        if (!$step) return [$start];
        $c = clone $base;
        while ($guard++ < 1000) {
            $ts = $c->getTimestamp();
            if ($ts > $until) break;
            if ($freq === 'DAILY' && $byday && !in_array(intval($c->format('w')), $byday, true)) { $c->modify("+$interval $step"); continue; }
            $n++;
            if ($count && $n > $count) break;
            if (!in_array($ts, $ex, true)) $out[] = $ts;
            $c->modify("+$interval $step");
        }
    }
    return $out;
}

function qca_overlaps($list, $a, $b) {
    foreach ($list as $iv) if ($a < $iv[1] && $iv[0] < $b) return true;
    return false;
}

function qca_holds() {
    $h = get_option('qca_holds', []);
    $now = time();
    $h = array_values(array_filter(is_array($h) ? $h : [], function ($x) use ($now) { return $x['exp'] > $now; }));
    return $h;
}

/** Calcula horários livres por dia para um espaço e uma duração (min). */
function qca_disponibilidade($espaco_id, $duracao, $dias = null) {
    $s = qca_settings();
    $esp = null;
    foreach ($s['espacos'] as $e) if ($e['id'] === $espaco_id && !empty($e['ativo'])) $esp = $e;
    if (!$esp) return new WP_Error('espaco', 'Espaço não encontrado', ['status' => 404]);
    $tz = qca_tz();
    $dias = $dias ?: intval($s['dias']);
    $cen = intval($esp['equipe']) > 1 && stripos($esp['local'], 'Space') !== false;
    $buf = intval($s['montagem']) * 60;
    $bufAntes = $cen ? intval($s['cenario_montagem']) * 60 : $buf;
    $dur = max(30, min(600, intval($duracao))) * 60;
    $hoje = new DateTime('today', $tz);
    $from = $hoje->getTimestamp();
    $to = $from + ($dias + 1) * DAY_IN_SECONDS;
    $minStart = time() + intval($s['antecedencia']) * HOUR_IN_SECONDS;
    if (!empty($esp['inicio'])) {
        $ini = DateTime::createFromFormat('Y-m-d H:i', $esp['inicio'] . ' 00:00', $tz);
        if ($ini) $minStart = max($minStart, $ini->getTimestamp());
    }

    $espBusy = qca_busy_from_ics($esp['ics'], $from, $to);
    if ($espBusy === null) return new WP_Error('agenda', 'Não foi possível ler a agenda deste espaço agora.', ['status' => 503]);
    // Integração com o sistema de reservas do coworking: cada endereço iCal extra bloqueia os horários dele
    $extras = trim(($esp['ics_extra'] ?? '') . ' ' . ($s['ics_extra_por_espaco'][$esp['id']] ?? ''));
    foreach (preg_split('/\s+/', $extras) as $u) {
        if (!$u) continue;
        $x = qca_busy_from_ics($u, $from, $to);
        if ($x === null) return new WP_Error('agenda', 'Não foi possível ler a agenda do coworking agora.', ['status' => 503]);
        $espBusy = array_merge($espBusy, $x);
    }
    foreach (qca_holds() as $h) if ($h['esp'] === $esp['id']) $espBusy[] = [$h['a'], $h['b']];

    $team = [];
    foreach ($s['equipe'] as $p) {
        $b = qca_busy_from_ics($p['ics'], $from, $to);
        if ($b !== null) $team[] = $b; // agenda da pessoa indisponível: ignora a pessoa
    }
    $need = max(1, intval($esp['equipe']));

    $res = [];
    for ($i = 0; $i <= $dias; $i++) {
        $d = (clone $hoje)->modify("+$i days");
        $janela = $s['horarios'][$d->format('w')] ?? '';
        if (!preg_match('/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/', trim($janela), $m)) { $res[$d->format('Y-m-d')] = []; continue; }
        $abre = (clone $d)->setTime(intval($m[1]), intval($m[2]))->getTimestamp();
        $diaOk = in_array($esp['id'], array_map('trim', explode(',', $s['cenario_dia'] ?? '')), true);
        if ($cen && !$diaOk && preg_match('/^(\d{1,2}):(\d{2})$/', $s['cenario_abre'], $ca)) $abre = max($abre, (clone $d)->setTime(intval($ca[1]), intval($ca[2]))->getTimestamp());
        $fecha = (clone $d)->setTime(intval($m[3]), intval($m[4]))->getTimestamp();
        $livres = [];
        for ($t = $abre; $t + $dur <= $fecha; $t += 30 * 60) {
            if ($t < $minStart) continue;
            $a = $t - $bufAntes; $b = $t + $dur + $buf;
            if (qca_overlaps($espBusy, $a, $b)) continue;
            $free = 0;
            foreach ($team as $tb) if (!qca_overlaps($tb, $a, $b)) $free++;
            if ($team && $free < $need) continue;
            $livres[] = wp_date('H:i', $t, $tz);
        }
        $res[$d->format('Y-m-d')] = $livres;
    }
    return $res;
}

/* ------------------------------------------------------------------ */
/* API REST                                                            */
/* ------------------------------------------------------------------ */

add_action('rest_api_init', function () {
    register_rest_route('qcagenda/v1', '/espacos', [
        'methods' => 'GET', 'permission_callback' => '__return_true',
        'callback' => function () {
            $s = qca_settings();
            $out = [];
            foreach ($s['espacos'] as $e) {
                if (empty($e['ativo'])) continue;
                $out[] = ['id' => $e['id'], 'nome' => $e['nome'], 'local' => $e['local'], 'grupo' => $e['grupo'], 'desc' => $e['desc'], 'equipe' => intval($e['equipe']), 'inicio' => $e['inicio'] ?? ''];
            }
            return ['espacos' => $out, 'montagem' => intval($s['montagem']), 'whatsapp' => preg_replace('/\D/', '', $s['whatsapp'])];
        },
    ]);
    register_rest_route('qcagenda/v1', '/disponibilidade', [
        'methods' => 'GET', 'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $r) {
            $d = qca_disponibilidade(sanitize_key($r['espaco']), intval($r['duracao'] ?: 120));
            if (is_wp_error($d)) return $d;
            return ['dias' => $d, 'atualizado' => wp_date('c')];
        },
    ]);
    register_rest_route('qcagenda/v1', '/reserva', [
        'methods' => 'POST', 'permission_callback' => '__return_true',
        'callback' => 'qca_post_reserva',
    ]);
});

function qca_post_reserva(WP_REST_Request $r) {
    $p = $r->get_json_params() ?: $r->get_params();
    if (!empty($p['site'])) return new WP_Error('spam', 'Pedido recusado.', ['status' => 400]); // honeypot
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $rk = 'qca_rl_' . md5($ip);
    $n = intval(get_transient($rk));
    if ($n >= 6) return new WP_Error('limite', 'Muitos pedidos seguidos. Tente de novo em alguns minutos.', ['status' => 429]);
    set_transient($rk, $n + 1, 10 * MINUTE_IN_SECONDS);

    $s = qca_settings();
    $esp = sanitize_key($p['espaco'] ?? '');
    $data = sanitize_text_field($p['data'] ?? '');
    $ini = sanitize_text_field($p['inicio'] ?? '');
    $dur = intval($p['duracao'] ?? 120);
    $nome = sanitize_text_field($p['nome'] ?? '');
    $whats = preg_replace('/[^\d+() \-]/', '', $p['whatsapp'] ?? '');
    $email = sanitize_email($p['email'] ?? '');
    if (!$nome || strlen(preg_replace('/\D/', '', $whats)) < 10 || !is_email($email)) {
        return new WP_Error('dados', 'Preencha nome, WhatsApp com DDD e um e-mail válido.', ['status' => 400]);
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data) || !preg_match('/^\d{2}:\d{2}$/', $ini)) {
        return new WP_Error('dados', 'Escolha data e horário.', ['status' => 400]);
    }
    // Confere de novo, na hora, se o horário continua livre.
    $disp = qca_disponibilidade($esp, $dur);
    if (is_wp_error($disp)) return $disp;
    if (empty($disp[$data]) || !in_array($ini, $disp[$data], true)) {
        return new WP_Error('ocupado', 'Esse horário acabou de ser reservado. Escolha outro, por favor.', ['status' => 409]);
    }
    $espNome = $esp;
    foreach ($s['espacos'] as $e) if ($e['id'] === $esp) $espNome = $e['nome'] . ' (' . $e['local'] . ')';

    $tz = qca_tz();
    $a = DateTime::createFromFormat('Y-m-d H:i', "$data $ini", $tz)->getTimestamp();
    $b = $a + $dur * 60;
    $buf = intval($s['montagem']) * 60;
    $holds = qca_holds();
    $holds[] = ['esp' => $esp, 'a' => $a - $buf, 'b' => $b + $buf, 'exp' => time() + intval($s['segura_horas']) * HOUR_IN_SECONDS];
    update_option('qca_holds', $holds, false);

    $fim = wp_date('H:i', $b, $tz);
    $dataBR = wp_date('d/m/Y (l)', $a, $tz);
    $campos = [
        'Espaço' => $espNome,
        'Data' => $dataBR,
        'Horário' => "$ini às $fim (" . qca_dur_txt($dur) . ')',
        'Nome' => $nome,
        'Empresa ou projeto' => sanitize_text_field($p['empresa'] ?? ''),
        'WhatsApp' => $whats,
        'E-mail' => $email,
        'Tipo de gravação' => sanitize_text_field($p['tipo'] ?? ''),
        'Produção' => sanitize_text_field($p['producao'] ?? ''),
        'Pessoas no set' => sanitize_text_field($p['pessoas'] ?? ''),
        'Observações' => sanitize_textarea_field($p['obs'] ?? ''),
    ];
    $txt = "Pedido de reserva pela Agenda Quadricast\n\n";
    foreach ($campos as $k => $v) if ($v !== '') $txt .= "$k: $v\n";
    $txt .= "\nO horário fica bloqueado por " . intval($s['segura_horas']) . "h aguardando confirmação. Confirme ou recuse na Central de Reservas.";

    // 1) Registro no WordPress (nunca se perde).
    $post_id = wp_insert_post(['post_type' => 'qca_pedido', 'post_status' => 'private', 'post_title' => "$nome · $espNome · $dataBR $ini", 'post_content' => $txt]);

    // 2) Lead no QG.
    $qg = qca_send_qg($s, $nome, $email, $whats, $campos['Empresa ou projeto'], $txt);
    if ($post_id) update_post_meta($post_id, 'qca_qg', $qg);

    // 2b) Projeto do cliente no mês + tarefas da gravação.
    $proj = !empty($s['qg_projeto']) ? qca_qg_projeto($s, $nome, $email, $whats, $campos, $esp, $data, $ini, $fim, $dur) : 'desligado';
    if ($post_id) update_post_meta($post_id, 'qca_qg_projeto', $proj);

    // 2c) Aviso no WhatsApp do cliente e da equipe.
    $first = strtok($nome, ' ');
    $msgCli = "Olá, $first! Recebemos o seu pedido de reserva na Quadricast.\n\n"
        . "📍 $espNome\n📅 $dataBR\n🕒 $ini às $fim (" . qca_dur_txt($dur) . ")\n\n"
        . "O horário fica separado para você por " . intval($s['segura_horas']) . "h. A Carolina vai falar com você por aqui para confirmar o valor e as condições e fechar a reserva.";
    $msgEq = "Nova reserva pela agenda do site\n\n$txt";
    $wa = [qca_wa_send($s, $whats, $msgCli)];
    foreach (array_filter(array_map('trim', explode(',', $s['wa_equipe'] ?? ''))) as $n) $wa[] = qca_wa_send($s, $n, $msgEq);
    if ($post_id) update_post_meta($post_id, 'qca_whatsapp', implode(' | ', $wa));

    // 3) Aviso por e-mail.
    if (!empty($s['email'])) wp_mail($s['email'], "Novo pedido de reserva: $espNome, $dataBR $ini", $txt);

    $msg = "Olá! Acabei de pedir uma reserva pela agenda do site.\n$espNome\n$dataBR, $ini às $fim\nNome: $nome";
    return ['ok' => true, 'resumo' => ['espaco' => $espNome, 'data' => $dataBR, 'horario' => "$ini às $fim"], 'whatsapp' => 'https://wa.me/' . preg_replace('/\D/', '', $s['whatsapp']) . '?text=' . rawurlencode($msg)];
}

function qca_dur_txt($m) {
    $h = floor($m / 60); $r = $m % 60;
    return trim(($h ? $h . 'h' : '') . ($r ? $r . 'min' : ''));
}

function qca_send_qg($s, $nome, $email, $whats, $empresa, $txt) {
    if (empty($s['qg_url']) || empty($s['qg_token'])) return 'QG não configurado';
    $url = rtrim($s['qg_url'], '/') . '/api/leads';
    $body = [
        'name' => 'Reserva de estúdio - ' . $nome,
        'source' => intval($s['qg_source']),
        'status' => intval($s['qg_status']),
        'assigned' => intval($s['qg_assigned']),
        'email' => $email,
        'phonenumber' => $whats,
        'company' => $empresa,
        'description' => nl2br(esc_html($txt)),
    ];
    $r = wp_remote_post($url, ['timeout' => 15, 'headers' => ['authtoken' => $s['qg_token']], 'body' => $body]);
    if (is_wp_error($r)) return 'Erro: ' . $r->get_error_message();
    return 'HTTP ' . wp_remote_retrieve_response_code($r) . ' ' . substr(wp_remote_retrieve_body($r), 0, 300);
}

/* ---------- QG (Perfex): projeto do cliente e tarefas da gravação ---------- */
function qca_qg_req($s, $method, $path, $body = null) {
    $args = ['method' => $method, 'timeout' => 15, 'headers' => ['authtoken' => $s['qg_token']]];
    if ($body !== null) $args['body'] = $body;
    $r = wp_remote_request(rtrim($s['qg_url'], '/') . '/api/' . ltrim($path, '/'), $args);
    if (is_wp_error($r)) return null;
    $j = json_decode(wp_remote_retrieve_body($r), true);
    return ['code' => wp_remote_retrieve_response_code($r), 'json' => $j];
}
function qca_qg_find($s, $tipo, $termo, $campo, $valor, $chave = 'id') {
    $r = qca_qg_req($s, 'GET', "$tipo/search/" . rawurlencode($termo));
    if (!$r || !is_array($r['json'])) return 0;
    $lista = isset($r['json'][0]) ? $r['json'] : [$r['json']];
    foreach ($lista as $x) {
        if (!is_array($x)) continue;
        if (mb_strtolower(trim($x[$campo] ?? '')) === mb_strtolower(trim($valor))) return intval($x[$chave] ?? 0);
    }
    return 0;
}
function qca_qg_projeto($s, $nome, $email, $whats, $campos, $esp, $data, $ini, $fim, $dur) {
    if (empty($s['qg_url']) || empty($s['qg_token'])) return 'QG não configurado';
    $meses = [1 => 'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    $mesesMin = [1 => 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    [$Y, $M, $D] = array_map('intval', explode('-', $data));
    $cliente = $campos['Empresa ou projeto'] ?: $nome;
    // 1) Cliente
    $cid = qca_qg_find($s, 'customers', $cliente, 'company', $cliente, 'userid');
    if (!$cid) {
        qca_qg_req($s, 'POST', 'customers', ['company' => $cliente, 'phonenumber' => $whats, 'default_currency' => 0]);
        $cid = qca_qg_find($s, 'customers', $cliente, 'company', $cliente, 'userid');
    }
    if (!$cid) return 'Cliente não criado no QG';
    // 2) Projeto do mês: "CLIENTE - GRAVAÇÕES - MÊS ANO"
    $pnome = mb_strtoupper($cliente) . ' - GRAVAÇÕES - ' . $meses[$M] . " $Y";
    $pid = qca_qg_find($s, 'projects', $pnome, 'name', $pnome);
    if (!$pid) {
        $ult = intval(date("t", mktime(12, 0, 0, $M, 1, $Y)));
        qca_qg_req($s, 'POST', 'projects', ['name' => $pnome, 'rel_type' => 'customer', 'clientid' => $cid, 'billing_type' => 1, 'status' => 2,
            'start_date' => sprintf('%04d-%02d-01', $Y, $M), 'deadline' => sprintf('%04d-%02d-%02d', $Y, $M, $ult), 'progress_from_tasks' => 'on']);
        $pid = qca_qg_find($s, 'projects', $pnome, 'name', $pnome);
    }
    if (!$pid) return "Cliente $cid ok, projeto não criado";
    // 3) Tarefas
    $hora = preg_replace('/h00$/', 'h', str_replace(':', 'h', $ini));
    $quando = "$D de " . $mesesMin[$M] . " - $hora";
    $local = $campos['Espaço'];
    $det = "Pedido feito pela agenda do site.\n\n";
    foreach ($campos as $k => $v) if ($v !== '') $det .= "$k: $v\n";
    $cen = false;
    foreach ($s['espacos'] as $e) if ($e['id'] === $esp) $cen = intval($e['equipe']) > 1;
    $tarefas = [
        ["Confirmar reserva - $nome - $quando", "Falar com o cliente pelo WhatsApp ($whats), confirmar valor, condições e forma de pagamento. Depois confirmar a reserva na Central.\n\n$det", date('Y-m-d'), 3],
        ["Gravação " . ($campos['Empresa ou projeto'] ?: $nome) . " - $quando", "Gravação em $local, $D/$M/$Y, das $ini às $fim.\n" . ($cen ? 'Cenário: videomaker e assistente, montagem a partir das 17h.' : 'Estúdio fixo: 1 videomaker.') . "\n\n$det", $data, 2],
    ];
    if ($cen) $tarefas[] = ["Montagem do cenário - $quando", "Montar câmeras, luz, áudio e set em $local antes da gravação (videomaker e assistente).", $data, 2];
    $tarefas[] = ["Edição e entrega dos cortes - $quando", "Editar o episódio e os cortes inclusos e entregar ao cliente.", $data, 2];
    $ok = 0;
    foreach ($tarefas as $t) {
        $r = qca_qg_req($s, 'POST', 'tasks', ['name' => $t[0], 'description' => nl2br(esc_html($t[1])), 'startdate' => $t[2], 'priority' => $t[3],
            'rel_type' => 'project', 'rel_id' => $pid, 'billable' => 1, 'is_public' => 0]);
        if ($r && $r['code'] < 300) $ok++;
    }
    return "Cliente $cid, projeto $pid, $ok de " . count($tarefas) . ' tarefas';
}

/* ---------- WhatsApp automático ---------- */
function qca_wa_num($n) {
    $d = preg_replace('/\D/', '', $n);
    if (strlen($d) === 10 || strlen($d) === 11) $d = '55' . $d;
    return $d;
}
function qca_wa_send($s, $numero, $texto) {
    $prov = $s['wa_provedor'] ?? ''; $url = $s['wa_url'] ?? '';
    if (!$prov || !$url) return 'WhatsApp automático não configurado';
    $n = qca_wa_num($numero);
    if (strlen($n) < 12) return "Número inválido: $numero";
    $h = ['Content-Type' => 'application/json'];
    if ($prov === 'evolution') { $h['apikey'] = $s['wa_token']; $b = ['number' => $n, 'text' => $texto]; }
    elseif ($prov === 'zapi') { if ($s['wa_token']) $h['Client-Token'] = $s['wa_token']; $b = ['phone' => $n, 'message' => $texto]; }
    else { if ($s['wa_token']) $h['Authorization'] = 'Bearer ' . $s['wa_token']; $b = ['phone' => $n, 'message' => $texto]; }
    $r = wp_remote_post($url, ['timeout' => 15, 'headers' => $h, 'body' => wp_json_encode($b)]);
    if (is_wp_error($r)) return "$n: erro " . $r->get_error_message();
    return "$n: HTTP " . wp_remote_retrieve_response_code($r);
}

/* CORS para a página no site da Quadricast. */
add_filter('rest_pre_serve_request', function ($served, $result, $request) {
    if (strpos($request->get_route(), '/qcagenda/v1') !== 0) return $served;
    $origin = get_http_origin();
    $ok = array_map('trim', explode(',', qca_settings()['origens']));
    if ($origin && in_array($origin, $ok, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    return $served;
}, 10, 3);

/* ------------------------------------------------------------------ */
/* Pedidos no painel do WordPress                                      */
/* ------------------------------------------------------------------ */

add_action('init', function () {
    register_post_type('qca_pedido', [
        'label' => 'Pedidos de reserva', 'public' => false, 'show_ui' => true, 'menu_icon' => 'dashicons-calendar-alt',
        'supports' => ['title', 'editor'], 'capability_type' => 'post', 'menu_position' => 26,
    ]);
});

/* ------------------------------------------------------------------ */
/* Shortcode                                                           */
/* ------------------------------------------------------------------ */

add_shortcode('quadricast_agenda', function () {
    $base = plugin_dir_url(__FILE__) . 'assets/';
    wp_enqueue_style('qca', $base . 'agenda.css', [], QCA_VERSION);
    wp_enqueue_script('qca', $base . 'agenda.js', [], QCA_VERSION, true);
    return '<div id="qc-agenda" data-api="' . esc_url(rest_url('qcagenda/v1')) . '" data-assets="' . esc_url($base) . '"></div>';
});

/* ------------------------------------------------------------------ */
/* Tela de configuração                                                */
/* ------------------------------------------------------------------ */

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=qca_pedido', 'Configurações da agenda', 'Configurações', 'manage_options', 'qca-config', 'qca_admin_page');
});

function qca_admin_page() {
    if (!current_user_can('manage_options')) return;
    $s = qca_settings();
    if (!empty($_POST['qca_save']) && check_admin_referer('qca_save')) {
        $in = wp_unslash($_POST);
        foreach (['montagem', 'antecedencia', 'dias', 'segura_horas', 'qg_source', 'qg_status', 'qg_assigned'] as $k) $s[$k] = intval($in[$k] ?? $s[$k]);
        foreach (['qg_url', 'whatsapp', 'origens', 'wa_provedor', 'wa_url', 'wa_equipe'] as $k) $s[$k] = sanitize_text_field($in[$k] ?? '');
        $s['qg_projeto'] = empty($in['qg_projeto']) ? 0 : 1;
        if (!empty($in['wa_token'])) $s['wa_token'] = sanitize_text_field($in['wa_token']);
        $s['email'] = sanitize_email($in['email'] ?? '');
        if (!empty($in['qg_token'])) $s['qg_token'] = sanitize_text_field($in['qg_token']);
        foreach ($s['horarios'] as $d => $v) $s['horarios'][$d] = sanitize_text_field($in['h_' . $d] ?? '');
        foreach ($s['espacos'] as $i => $e) {
            $s['espacos'][$i]['ics'] = esc_url_raw($in['ics_e_' . $i] ?? $e['ics']);
            $s['espacos'][$i]['ics_extra'] = implode("\n", array_filter(array_map('esc_url_raw', preg_split('/\s+/', trim($in['icsx_e_' . $i] ?? ($e['ics_extra'] ?? ''))))));
            $s['espacos'][$i]['ativo'] = empty($in['ativo_' . $i]) ? 0 : 1;
            $s['espacos'][$i]['equipe'] = max(1, intval($in['eq_' . $i] ?? 1));
            $s['espacos'][$i]['inicio'] = sanitize_text_field($in['ini_' . $i] ?? '');
        }
        foreach ($s['equipe'] as $i => $p) $s['equipe'][$i]['ics'] = esc_url_raw($in['ics_p_' . $i] ?? $p['ics']);
        update_option(QCA_OPT, $s, false);
        foreach (array_merge($s['espacos'], $s['equipe']) as $x) { delete_transient('qca_ics_' . md5($x['ics'])); foreach (preg_split('/\s+/', trim($x['ics_extra'] ?? '')) as $u) if ($u) delete_transient('qca_ics_' . md5($u)); }
        echo '<div class="updated"><p>Configurações salvas.</p></div>';
    }
    $dn = ['1' => 'Segunda', '2' => 'Terça', '3' => 'Quarta', '4' => 'Quinta', '5' => 'Sexta', '6' => 'Sábado', '0' => 'Domingo'];
    ?>
    <div class="wrap"><h1>Agenda Quadricast</h1>
    <p>Página pública: use o shortcode <code>[quadricast_agenda]</code> numa página deste site, ou publique o arquivo <code>agenda/index.html</code> no site da Quadricast.</p>
    <form method="post"><?php wp_nonce_field('qca_save'); ?>
    <h2>Espaços</h2><table class="widefat striped"><thead><tr><th>Ativo</th><th>Espaço</th><th>Equipe mínima</th><th>Disponível a partir de</th><th>Endereço iCal da agenda (Google)<br><small>e, abaixo, agendas do sistema do coworking (uma por linha)</small></th></tr></thead><tbody>
    <?php foreach ($s['espacos'] as $i => $e): ?>
      <tr><td><input type="checkbox" name="ativo_<?php echo $i; ?>" value="1" <?php checked(!empty($e['ativo'])); ?>></td>
      <td><strong><?php echo esc_html($e['nome']); ?></strong><br><small><?php echo esc_html($e['local']); ?></small></td>
      <td><select name="eq_<?php echo $i; ?>"><option value="1" <?php selected(intval($e['equipe']), 1); ?>>1 videomaker</option><option value="2" <?php selected(intval($e['equipe']), 2); ?>>Videomaker e assistente</option></select></td>
      <td><input type="date" name="ini_<?php echo $i; ?>" value="<?php echo esc_attr($e['inicio'] ?? ''); ?>"></td>
      <td><input type="url" class="large-text" name="ics_e_<?php echo $i; ?>" value="<?php echo esc_attr($e['ics']); ?>"><textarea class="large-text" rows="2" placeholder="iCal do sistema de reservas do coworking (opcional)" name="icsx_e_<?php echo $i; ?>"><?php echo esc_textarea($e['ics_extra'] ?? ''); ?></textarea></td></tr>
    <?php endforeach; ?></tbody></table>
    <h2>Equipe</h2><table class="widefat striped"><tbody>
    <?php foreach ($s['equipe'] as $i => $p): ?>
      <tr><td style="width:160px"><strong><?php echo esc_html($p['nome']); ?></strong></td><td><input type="url" class="large-text" name="ics_p_<?php echo $i; ?>" value="<?php echo esc_attr($p['ics']); ?>"></td></tr>
    <?php endforeach; ?></tbody></table>
    <h2>Horários que o cliente pode escolher</h2><p>Formato 08:00-21:00. Deixe vazio para fechado.</p><table class="form-table">
    <?php foreach ($dn as $k => $n): ?><tr><th><?php echo $n; ?></th><td><input name="h_<?php echo $k; ?>" value="<?php echo esc_attr($s['horarios'][$k] ?? ''); ?>"></td></tr><?php endforeach; ?></table>
    <h2>Regras</h2><table class="form-table">
      <tr><th>Montagem antes e depois (min)</th><td><input type="number" name="montagem" value="<?php echo intval($s['montagem']); ?>"></td></tr>
      <tr><th>Antecedência mínima (horas)</th><td><input type="number" name="antecedencia" value="<?php echo intval($s['antecedencia']); ?>"></td></tr>
      <tr><th>Dias à frente</th><td><input type="number" name="dias" value="<?php echo intval($s['dias']); ?>"></td></tr>
      <tr><th>Pedido segura o horário por (horas)</th><td><input type="number" name="segura_horas" value="<?php echo intval($s['segura_horas']); ?>"></td></tr>
    </table>
    <h2>QG e avisos</h2><table class="form-table">
      <tr><th>Endereço do QG</th><td><input class="regular-text" name="qg_url" value="<?php echo esc_attr($s['qg_url']); ?>" placeholder="https://qg.agenciaquadri.com"></td></tr>
      <tr><th>Token da API do QG</th><td><input class="regular-text" type="password" name="qg_token" value="" placeholder="<?php echo $s['qg_token'] ? 'Salvo (deixe vazio para manter)' : 'Cole o token'; ?>"></td></tr>
      <tr><th>IDs no QG (origem, status, responsável)</th><td><input type="number" name="qg_source" value="<?php echo intval($s['qg_source']); ?>" style="width:70px"> <input type="number" name="qg_status" value="<?php echo intval($s['qg_status']); ?>" style="width:70px"> <input type="number" name="qg_assigned" value="<?php echo intval($s['qg_assigned']); ?>" style="width:70px"></td></tr>
      <tr><th>E-mail de aviso</th><td><input class="regular-text" name="email" value="<?php echo esc_attr($s['email']); ?>"></td></tr>
      <tr><th>Projeto e tarefas no QG</th><td><label><input type="checkbox" name="qg_projeto" value="1" <?php checked(!empty($s['qg_projeto'])); ?>> A cada reserva, abrir (ou usar) o projeto "CLIENTE - GRAVAÇÕES - MÊS ANO" e criar as tarefas: confirmar reserva, gravação, montagem (cenários) e edição dos cortes</label></td></tr>
      <tr><th>WhatsApp automático</th><td><select name="wa_provedor"><option value="">Desligado</option><?php foreach (['evolution' => 'Evolution API', 'zapi' => 'Z-API', 'webhook' => 'Outro (webhook)'] as $k => $v): ?><option value="<?php echo $k; ?>" <?php selected($s['wa_provedor'] ?? '', $k); ?>><?php echo $v; ?></option><?php endforeach; ?></select>
        <p><input class="large-text" name="wa_url" value="<?php echo esc_attr($s['wa_url'] ?? ''); ?>" placeholder="Endereço de envio de texto da API"></p>
        <p><input class="regular-text" type="password" name="wa_token" value="" placeholder="<?php echo !empty($s['wa_token']) ? 'Token salvo (deixe vazio para manter)' : 'Token da API'; ?>"></p>
        <p><input class="regular-text" name="wa_equipe" value="<?php echo esc_attr($s['wa_equipe'] ?? ''); ?>"> <small>Números da equipe que recebem o aviso (vírgula)</small></p></td></tr>
      <tr><th>WhatsApp da Quadricast</th><td><input name="whatsapp" value="<?php echo esc_attr($s['whatsapp']); ?>"></td></tr>
      <tr><th>Sites que podem usar a agenda</th><td><input class="large-text" name="origens" value="<?php echo esc_attr($s['origens']); ?>"></td></tr>
    </table>
    <p><button class="button button-primary" name="qca_save" value="1">Salvar</button></p></form></div>
    <?php
}
