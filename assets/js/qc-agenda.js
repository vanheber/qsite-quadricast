/* Agenda Quadricast · widget do site (qsite2)
   Com data-api preenchido: mostra só os horários livres (agendas Google dos estúdios e da equipe)
   e envia o pedido para a API da agenda, que abre lead, projeto e tarefas no QG e avisa a equipe.
   Sem data-api (ou se a API falhar): o pedido segue pelo WhatsApp da produção, como antes.
   Contrato: <div id="qc-agenda" data-whatsapp="55..." data-responsavel="Nome" data-api="https://.../index.php?r="> */
(function () {
  'use strict';
  var root = document.getElementById('qc-agenda');
  if (!root) return;

  var WA = (root.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
  var RESP = root.getAttribute('data-responsavel') || 'nossa equipe';
  var PRIMEIRO = RESP.split(' ')[0];
  var API = (root.getAttribute('data-api') || '').trim().replace(/\/$/, '');
  if (!/^(https?:)?\/\//.test(API) && API.charAt(0) !== '/') API = ''; // vazio, "desligada" ou token não resolvido: segue pelo WhatsApp
  var IMG = '/assets/img/agenda/';
  function url(p) { return API.indexOf('?') >= 0 ? API + p.replace('?', '&') : API + p; }

  /* ---------- dados (mesmos da agenda aprovada) ---------- */
  var ESPACOS = [
    { id: 'qspace', nome: 'Estúdio QuadriSpace', local: 'Space Coworking', grupo: 'Podcast e videocast', desc: 'Set fixo de podcast, multicâmera, pronto para gravar.', equipe: 1, fixo: 1 },
    { id: 'qcpod', nome: 'Estúdio Quadricast Podcast', local: 'Estúdio Quadricast', grupo: 'Podcast e videocast', desc: 'O estúdio original da Quadricast, com tratamento acústico.', equipe: 1, fixo: 1 },
    { id: 'cruzeiro', nome: 'Quadricast Cruzeiro', local: 'Cruzeiro', grupo: 'Podcast e videocast', desc: 'Set de podcast com mesa redonda e fundo verde para chroma key.', equipe: 1, fixo: 1, inicio: '2026-12-01' },
    { id: 'qcaulas', nome: 'Estúdio Aulas e Lives', local: 'Estúdio Quadricast', grupo: 'Aulas, cursos e lives', desc: 'Fundo verde para cursos, treinamentos e transmissões ao vivo.', equipe: 1 },
    { id: 'lareira', nome: 'Sala Lareira', local: 'Space Coworking', grupo: 'Cenários', desc: 'Ambiente aconchegante para entrevistas e conteúdo de autoridade.', equipe: 2 },
    { id: 'vitrine', nome: 'Sala Vitrine', local: 'Space Coworking', grupo: 'Cenários', desc: 'Sala de vidro com vista para o jardim e a piscina, luz natural.', equipe: 2 },
    { id: 'externas', nome: 'Externas: Jardim e Piscina', local: 'Space Coworking', grupo: 'Cenários', desc: 'Gravações ao ar livre no jardim e na piscina.', equipe: 2 },
    { id: 'spacecozinha', nome: 'Cozinha do Space', local: 'Space Coworking', grupo: 'Gastronomia', desc: 'Bancada gastronômica para receitas e degustações. Único cenário com opção de churrasco.', equipe: 2 },
    { id: 'cozinha', nome: 'Estúdio Cozinha da Pri', local: 'Boulevard Vila', grupo: 'Gastronomia', desc: 'Cozinha equipada com panelas, formas e utensílios para receitas. Não comporta churrasco.', equipe: 1 }
  ];
  var GRUPOS = [['Todos', 'Todos'], ['Podcast e videocast', 'Podcast'], ['Aulas, cursos e lives', 'Aulas e lives'], ['Cenários', 'Cenários'], ['Gastronomia', 'Gastronomia'], ['Eventos', 'No seu evento']];
  var DUR = [{ m: 120, t: '2h', s: '1 episódio' }, { m: 240, t: '4h', s: '2 episódios' }, { m: 360, t: '6h', s: '3 episódios' }, { m: 480, t: '8h', s: 'diária' }];
  var FERIADOS = ['2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25', '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-26', '2027-04-21', '2027-05-01', '2027-05-27', '2027-09-07', '2027-10-12', '2027-11-02', '2027-11-15', '2027-11-20', '2027-12-25'];
  var PRECOS = [
    { n: 'Hora de gravação em estúdio fixo', d: 'QuadriSpace, Quadricast ou Cruzeiro · reservas em blocos de 2h', v: 'R$ 390', m: 'R$ 351', no: 'R$ 507' },
    { n: 'Episódio em estúdio fixo', d: 'QuadriSpace, Quadricast ou Cruzeiro · 2h de estúdio, vinhetas e 4 cortes', v: 'R$ 750', m: 'R$ 675', no: 'R$ 975' },
    { n: 'Plano mensal', d: '4 episódios de 2h por mês, 16 cortes (4 por episódio)', v: 'R$ 2.600', m: 'R$ 2.340', no: '+30% nos episódios noturnos', top: 1 },
    { n: 'Diária em estúdio fixo', d: '8h de estúdio, até 4 episódios e 16 cortes', v: 'R$ 2.800', m: 'R$ 2.520', no: '+30% após 18h, fins de semana e feriados' },
    { n: 'Episódio em cenário', d: 'Lareira, Vitrine, Externas ou Cozinha do Space · estúdio montado só para você, 4 cortes. Externas também de dia; os demais cenários a partir das 18h', v: 'R$ 1.450', m: 'R$ 1.305', no: 'R$ 1.885' }
  ];
  /* fotos de cada estúdio (assets/img/agenda/ID-N.webp) */
  var NFOTOS = { qspace: 5, qcpod: 3, cruzeiro: 8, qcaulas: 2, lareira: 4, vitrine: 4, externas: 5, spacecozinha: 4, cozinha: 3, __externo: 9 };
  function fotos(id) { var n = NFOTOS[id] || 0, out = []; for (var i = 1; i <= n; i++) out.push(IMG + id + '-' + i + '.webp'); return out; }
  var SERVICOS = [
    ['Vídeos institucionais', 'A partir de R$ 2.450', 'a partir de R$ 2.205'],
    ['Vídeos de treinamento', 'A partir de R$ 250 por aula de até 15 min', 'a partir de R$ 225'],
    ['Cobertura de eventos', 'Meia diária (4h) R$ 1.250 · diária (8h) R$ 1.850', 'R$ 1.125 (4h) e R$ 1.665 (8h)'],
    ['Captação e edição de palestras', 'A partir de R$ 1.250', 'a partir de R$ 1.125'],
    ['Transmissão de eventos ao vivo', 'Meia diária (4h) R$ 1.450 · diária (8h) R$ 2.250', 'R$ 1.305 (4h) e R$ 2.025 (8h)'],
    ['Vídeos com drone ou 360°', 'A partir de R$ 350', 'a partir de R$ 315'],
    ['Lives em estúdio', 'A partir de R$ 600', 'a partir de R$ 540'],
    ['Edição de vídeos para redes', 'A partir de R$ 250', 'a partir de R$ 225'],
    ['Locação de estúdio fixo', 'R$ 390 por hora', 'R$ 351 por hora']
  ];
  var CORTES = [{ n: '10 cortes', v: 'R$ 350', u: 'R$ 35 cada · membro R$ 315' }, { n: '15 cortes', v: 'R$ 450', u: 'R$ 30 cada · membro R$ 405' }, { n: '20 cortes', v: 'R$ 500', u: 'R$ 25 cada · membro R$ 450', top: 1 }];
  var TIPOS = ['Podcast', 'Videocast', 'Entrevista', 'Aula ou curso', 'Live', 'Redes sociais', 'Gastronomia', 'Outro'];
  var PRODUCAO = [['Gravação com operador', 'Eu levo o conteúdo, vocês cuidam de câmera, luz e áudio'], ['Produção completa', 'Gravação, edição, vinhetas e cortes para as redes'], ['Quero conversar antes', 'Um produtor me chama para montar o projeto']];
  var MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var WDL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  /* ---------- ícones ---------- */
  function svg(p, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var I = {
    l: svg('<path d="M15 5l-7 7 7 7"/>', 2.2), r: svg('<path d="M9 5l7 7-7 7"/>', 2.2),
    ck: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3),
    pin: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    cal: svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    clk: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>'),
    tag: svg('<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.6"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
    img: svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>'),
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm5.6 13.7c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1.1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>',
    g: {
      'Podcast e videocast': svg('<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/>', 1.6),
      'Aulas, cursos e lives': svg('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M10 9l5 2.5-5 2.5V9ZM8 21h8"/>', 1.6),
      'Cenários': svg('<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/>', 1.6),
      'Gastronomia': svg('<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>', 1.6),
      'Eventos': svg('<path d="M4 18V8l8-4 8 4v10"/><circle cx="12" cy="12" r="2.5"/><path d="M8 12a4 4 0 0 1 8 0"/>', 1.6)
    }
  };

  /* ---------- utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function plus(h, m) { var p = h.split(':'), t = +p[0] * 60 + +p[1] + m; return t >= 1440 ? '24:00' : pad(Math.floor(t / 60)) + ':' + pad(t % 60); }
  function diaTxt(k) { var d = parse(k); return WDL[d.getDay()] + ', ' + d.getDate() + ' de ' + MES[d.getMonth()]; }
  function durTxt(m) { for (var i = 0; i < DUR.length; i++) if (DUR[i].m === m) return DUR[i].t + ' · ' + DUR[i].s; return m + ' min'; }
  function diaExtra(k) { if (!k) return ''; var w = parse(k).getDay(); return FERIADOS.indexOf(k) >= 0 ? 'Feriado' : (w === 0 || w === 6) ? 'Fim de semana' : ''; }
  function noturno(h) { return +h.split(':')[0] >= 18; }
  function cenario(e) { return e && e.equipe > 1; }
  function soNoite(e) { return cenario(e) && e.id !== 'externas'; }
  function E() { for (var i = 0; i < ESPACOS.length; i++) if (ESPACOS[i].id === S.esp) return ESPACOS[i]; return null; }
  function tagTxt(e) {
    if (e.inicio && e.inicio > iso(new Date())) { var p = e.inicio.split('-'); return ['soon', 'A partir de ' + p[2] + '/' + p[1]]; }
    if (e.fixo) return ['', 'Estúdio fixo'];
    if (cenario(e)) return ['cen', 'Cenário montado'];
    return ['', e.grupo === 'Gastronomia' ? 'Cozinha equipada' : 'Estúdio equipado'];
  }

  /* dias possíveis: 48h de antecedência, 60 dias à frente */
  function dias() {
    var out = [], d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + 2);
    var e = E();
    for (var i = 0; i < 60; i++) {
      var k = iso(d);
      var lv = livresAgora();
      out.push({ k: k, ok: !(e && e.inicio && k < e.inicio) && (!lv || !!(lv[k] && lv[k].length)) });
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  /* horários de início pelas regras da agenda (a confirmação é humana) */
  function chave() { return S.esp + '|' + S.dur; }
  function livresAgora() { return API && !S.apiFalhou ? S.livres[chave()] || null : null; }
  function carregar() {
    if (!API || S.apiFalhou || !S.esp || S.livres[chave()] || S.carregando === chave()) return;
    var k = chave(); S.carregando = k;
    fetch(url('/disponibilidade?espaco=' + encodeURIComponent(S.esp) + '&duracao=' + S.dur), { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { S.livres[k] = j.dias || {}; })
      .catch(function () { S.apiFalhou = true; })
      .then(function () { if (S.carregando === k) S.carregando = ''; if (S.dia && livresAgora() && !(livresAgora()[S.dia] || []).length) { S.dia = null; S.hora = null; } render(); });
  }
  function horarios() {
    var e = E(); if (!e) return [];
    var lv = livresAgora(); if (lv) return lv[S.dia] || [];
    var ini = soNoite(e) ? 18 * 60 : 8 * 60, out = [];
    for (var t = ini; t <= 22 * 60 && t + S.dur <= 24 * 60; t += 30) out.push(pad(Math.floor(t / 60)) + ':' + pad(t % 60));
    return out;
  }

  /* ---------- estado ---------- */
  var S = { step: 1, grupo: 'Todos', esp: null, dur: 120, dia: null, hora: null, form: { tipo: 'Podcast', producao: 'Produção completa', pessoas: '2' }, erro: '', bad: '', done: null, precos: false, evento: false, fx: 0, livres: {}, carregando: '', apiFalhou: false, gal: null, gi: 0, enviando: false, viaApi: false };

  /* link direto (WhatsApp): /agenda/?estudio=quadricast&horas=2&nome=Ana&whats=15999999999
     estudio: quadrispace, quadricast, cruzeiro, aulas, lareira, vitrine, externas, cozinha-space, cozinha-pri (ou o id)
     ver: podcast, aulas, cenarios, gastronomia (só filtra a lista de estúdios) */
  (function () {
    var q; try { q = new URLSearchParams(location.search); } catch (x) { return; }
    var AL = { quadrispace: 'qspace', space: 'qspace', quadricast: 'qcpod', podcast: 'qcpod', cruzeiro: 'cruzeiro', aulas: 'qcaulas', lives: 'qcaulas', lareira: 'lareira', vitrine: 'vitrine', externas: 'externas', jardim: 'externas', 'cozinha-space': 'spacecozinha', 'cozinha-pri': 'cozinha', cozinha: 'cozinha' };
    var VER = { podcast: 'Podcast e videocast', aulas: 'Aulas, cursos e lives', cenarios: 'Cenários', gastronomia: 'Gastronomia' };
    function lim(v) { return (v || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'); }
    var es = lim(q.get('estudio')), id = AL[es] || es, h = parseInt(q.get('horas'), 10);
    if (VER[lim(q.get('ver'))]) S.grupo = VER[lim(q.get('ver'))];
    if (q.get('nome')) S.form.nome = q.get('nome').slice(0, 80);
    if (q.get('whats')) S.form.whatsapp = q.get('whats').replace(/[^\d()+ -]/g, '').slice(0, 20);
    if (q.get('empresa')) S.form.empresa = q.get('empresa').slice(0, 80);
    for (var i = 0; i < ESPACOS.length; i++) if (ESPACOS[i].id === id) { S.esp = id; S.step = 2; S.grupo = ESPACOS[i].grupo; }
    if ([2, 4, 6, 8].indexOf(h) >= 0 && !(soNoite(E()) && h > 6)) S.dur = h * 60;
    if (S.esp && /aulas|lives/.test(S.esp + es)) S.form.tipo = 'Aula ou curso';
  })();

  /* ---------- pedaços ---------- */
  function stepper() {
    var e = E();
    var it = [[1, 'Estúdio', e ? e.nome : 'Escolha'], [2, 'Dia e horário', S.hora ? WD[parse(S.dia).getDay()] + ' ' + parse(S.dia).getDate() + '/' + pad(parse(S.dia).getMonth() + 1) + ' · ' + S.hora : 'A escolher'], [3, 'Seus dados', 'Contato']];
    return '<nav class="qa-stepper" aria-label="Etapas">' + it.map(function (x) {
      var n = x[0], st = n < S.step ? 'done' : n === S.step ? 'on' : '', can = n < S.step || (n === 2 && S.esp) || (n === 3 && S.hora);
      return '<button type="button" class="' + st + '"' + (can && n !== S.step ? ' data-goto="' + n + '"' : ' tabindex="-1"') + (n === S.step ? ' aria-current="step"' : '') + '><span class="n">' + (st === 'done' ? I.ck : n) + '</span><span class="t"><small>' + x[1] + '</small><b>' + esc(x[2]) + '</b></span></button>';
    }).join('<i class="ln" aria-hidden="true"></i>') + '</nav>';
  }

  function step1() {
    var list = ESPACOS.filter(function (e) { return S.grupo === 'Todos' || e.grupo === S.grupo; });
    var h = '<div class="qa-fwrap"><button type="button" class="qa-fnav p" data-fscroll="-1" aria-label="Ver tipos anteriores" hidden>' + I.l + '</button>' +
      '<div class="qa-seg qa-filt" role="tablist" aria-label="Tipo de gravação">' + GRUPOS.map(function (g) {
        return '<button type="button" role="tab" aria-selected="' + (S.grupo === g[0]) + '" data-grupo="' + esc(g[0]) + '" class="' + (S.grupo === g[0] ? 'on' : '') + '">' + esc(g[1]) + '</button>';
      }).join('') + '</div><button type="button" class="qa-fnav n" data-fscroll="1" aria-label="Ver mais tipos" hidden>' + I.r + '</button></div>';
    h += '<div class="qa-list" role="radiogroup" aria-label="Estúdios">' + list.map(function (e) {
      var t = tagTxt(e), on = S.esp === e.id;
      return '<button type="button" role="radio" aria-checked="' + on + '" class="qa-st' + (on ? ' on' : '') + '" data-esp="' + esc(e.id) + '">' +
        '<span class="qa-art has-foto g-' + (e.grupo === 'Gastronomia' ? 'gastro' : e.grupo === 'Aulas, cursos e lives' ? 'aulas' : 'pod') + '" style="background-image:url(\'' + fotos(e.id)[0] + '\')"><span class="tg ' + t[0] + '">' + t[1] + '</span><span class="qa-nf">' + I.img + fotos(e.id).length + ' fotos</span></span>' +
        '<span class="qa-st-b"><span class="nm">' + esc(e.nome) + '</span><span class="lc">' + I.pin + esc(e.local) + '</span><span class="ds">' + esc(e.desc) + '</span>' +
        '<span class="cta">' + (on ? 'Escolhido' : 'Escolher este') + I.r + '</span></span></button>';
    }).join('');
    if (S.grupo === 'Todos' || S.grupo === 'Eventos') {
      h += '<button type="button" class="qa-st qa-ext" data-evento="1"><span class="qa-art has-foto g-ev" style="background-image:url(\'' + fotos('__externo')[0] + '\')"><span class="tg soon">Orçamento sob medida</span><span class="qa-nf">' + I.img + fotos('__externo').length + ' fotos</span></span>' +
        '<span class="qa-st-b"><span class="nm">Gravação no seu evento</span><span class="lc">' + I.pin + 'Onde você estiver</span><span class="ds">Podcast ao vivo, coberturas e transmissões em congressos, feiras, shoppings e empresas.</span><span class="cta">Pedir orçamento' + I.r + '</span></span></button>';
    }
    return h + '</div>';
  }

  function qh(n, ok, t) { return '<header class="qa-qh"><span class="n' + (ok ? ' ok' : '') + '">' + (ok ? I.ck : n) + '</span><b>' + t + '</b></header>'; }

  function step2() {
    var e = E(), h = '';
    h += '<div class="qa-sel"><button type="button" class="ic qa-sel-foto" data-gal="' + esc(e.id) + '" style="background-image:url(\'' + fotos(e.id)[0] + '\')" aria-label="Ver fotos de ' + esc(e.nome) + '">' + I.img + '</button><span class="tx"><small>Estúdio escolhido</small><b>' + esc(e.nome) + '</b><span>' + esc(e.local) + '</span></span><button type="button" data-goto="1">Trocar</button></div>';
    h += '<section class="qa-q">' + qh(1, true, 'Quanto tempo vai gravar?') + '<div class="qa-seg dur" role="radiogroup">' + DUR.map(function (x) {
      var off = soNoite(e) && x.m > 360;
      return '<button type="button" role="radio" aria-checked="' + (S.dur === x.m) + '" data-dur="' + x.m + '" class="' + (S.dur === x.m ? 'on' : '') + '"' + (off ? ' disabled title="Neste cenário a gravação vai das 18h à meia-noite"' : '') + '><b>' + x.t + '</b><small>' + x.s + '</small></button>';
    }).join('') + '</div>' + (soNoite(e) ? '<p class="qa-qsub">Neste cenário a equipe monta o set a partir das 17h e a gravação começa às 18h.</p>' : cenario(e) ? '<p class="qa-qsub">As Externas podem ser reservadas de dia. A equipe chega 1h antes para montar o set.</p>' : '') + '</section>';

    var ds = dias(), cur = parse(S.dia || ds[0].k);
    h += '<section class="qa-q">' + qh(2, !!S.dia, 'Escolha o dia') +
      '<div class="qa-mes"><b data-mes>' + MES[cur.getMonth()] + ' ' + cur.getFullYear() + '</b><span class="qa-arrows"><button type="button" data-scroll="-1" aria-label="Dias anteriores">' + I.l + '</button><button type="button" data-scroll="1" aria-label="Próximos dias">' + I.r + '</button></span></div>' +
      '<div class="qa-strip" role="radiogroup" aria-label="Dias">' + ds.map(function (x) {
        var d = parse(x.k), ex = diaExtra(x.k);
        return '<button type="button" role="radio" aria-checked="' + (x.k === S.dia) + '" class="qa-d' + (x.k === S.dia ? ' on' : '') + (ex ? ' ex' : '') + '" data-dia="' + x.k + '"' + (x.ok ? '' : ' disabled') + ' aria-label="' + esc(diaTxt(x.k)) + (ex ? ', ' + ex : '') + '"><span class="w">' + WD[d.getDay()] + '</span><span class="n">' + d.getDate() + '</span><span class="m">' + MES[d.getMonth()].slice(0, 3) + '</span></button>';
      }).join('') + '</div></section>';

    h += '<section class="qa-q">' + qh(3, !!S.hora, 'Horário de início');
    if (S.aviso) { h += '<div class="qa-err" role="alert">' + esc(S.aviso) + '</div>'; S.aviso = ''; }
    if (API && !S.apiFalhou && !livresAgora()) h += '<div class="qa-none">Consultando os horários livres…</div>';
    else if (!S.dia) h += '<div class="qa-none">Escolha um dia para ver os horários.</div>';
    else if (!horarios().length) h += '<div class="qa-none">Sem horários livres neste dia. Escolha outro dia ou outra duração.</div>';
    else {
      var per = { 'Manhã': [], 'Tarde': [], 'Noite': [] };
      horarios().forEach(function (x) { var hh = +x.split(':')[0]; (hh < 12 ? per['Manhã'] : hh < 18 ? per['Tarde'] : per['Noite']).push(x); });
      if (diaExtra(S.dia)) h += '<p class="qa-qsub"><b>' + diaExtra(S.dia) + ':</b> acréscimo de 30% em todos os horários deste dia.</p>';
      h += Object.keys(per).filter(function (p) { return per[p].length; }).map(function (p) {
        return '<div class="qa-per"><span class="pl">' + p + '</span><div class="qa-slots" role="radiogroup" aria-label="' + p + '">' + per[p].map(function (x) {
          return '<button type="button" role="radio" aria-checked="' + (S.hora === x) + '" class="qa-sl' + (S.hora === x ? ' on' : '') + '" data-hora="' + x + '"><b>' + x + '</b><small>até ' + plus(x, S.dur) + '</small>' + (!diaExtra(S.dia) && noturno(x) ? '<i class="nt">+30%</i>' : '') + '</button>';
        }).join('') + '</div></div>';
      }).join('');
    }
    h += '</section>';
    h += '<p class="qa-note">' + I.info + '<span>' + (livresAgora() ? 'Só aparecem os horários livres. Ao enviar, o horário fica guardado para você por 48h e ' + esc(PRIMEIRO) + ' confirma pelo WhatsApp.' : 'Você escolhe o horário desejado e ' + esc(PRIMEIRO) + ' confirma a disponibilidade pelo WhatsApp.') + ' Montagem e desmontagem não contam no seu tempo. Gravações a partir das 18h, nos fins de semana e feriados têm acréscimo de 30%. Pedidos com no mínimo 48 horas de antecedência. <a href="#" data-precos="1">Ver valores</a></span></p>';
    return h;
  }

  function step3() {
    var f = S.form, v = function (k) { return esc(f[k] || ''); };
    return '<div class="qa-sum">' + I.ck + '<span><small>Você está pedindo</small><b>' + esc(E().nome) + '</b>' + esc(diaTxt(S.dia)) + ' · ' + S.hora + ' às ' + plus(S.hora, S.dur) + '</span><button type="button" data-goto="2">Alterar</button></div>' +
      '<form class="qa-form" novalidate autocomplete="on">' +
      '<p class="qa-lbl">Seus contatos</p><div class="qa-group">' +
      '<label class="qa-f' + (S.bad === 'nome' ? ' bad' : '') + '"><span>Seu nome</span><input name="nome" autocomplete="name" maxlength="80" value="' + v('nome') + '" required></label>' +
      '<div class="qa-2"><label class="qa-f' + (S.bad === 'whatsapp' ? ' bad' : '') + '"><span>WhatsApp com DDD</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="' + v('whatsapp') + '" required></label>' +
      '<label class="qa-f' + (S.bad === 'email' ? ' bad' : '') + '"><span>E-mail</span><input name="email" type="email" inputmode="email" autocomplete="email" maxlength="120" value="' + v('email') + '" required></label></div>' +
      '<label class="qa-f"><span>Empresa ou projeto (opcional)</span><input name="empresa" autocomplete="organization" maxlength="80" value="' + v('empresa') + '"></label></div>' +
      '<p class="qa-lbl">O que você vai gravar</p><div class="qa-chips">' + TIPOS.map(function (t) { return '<label><input type="radio" name="tipo" value="' + t + '"' + (f.tipo === t ? ' checked' : '') + '><span>' + t + '</span></label>'; }).join('') + '</div>' +
      '<p class="qa-lbl">Como prefere</p><div class="qa-opts">' + PRODUCAO.map(function (o) {
        return '<label class="qa-opt"><input type="radio" name="producao" value="' + o[0] + '"' + (f.producao === o[0] ? ' checked' : '') + '><span class="rd"></span><span>' + o[0] + '<small>' + o[1] + '</small></span></label>'; }).join('') + '</div>' +
      '<p class="qa-lbl">Pessoas no set</p><div class="qa-seg">' + ['1', '2', '3', '4', '5+'].map(function (n) { return '<button type="button" data-pess="' + n + '" class="' + (f.pessoas === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div>' +
      '<p class="qa-lbl">Conte um pouco do projeto (opcional)</p><div class="qa-group"><label class="qa-f"><span>Tema, convidados, se é uma série</span><textarea name="obs" maxlength="800">' + v('obs') + '</textarea></label></div>' +
      '<label class="qa-cons"><input type="checkbox" name="ok"' + (f.ok ? ' checked' : '') + '><span>Autorizo a Quadricast a falar comigo sobre esta reserva pelo WhatsApp e e-mail.</span></label>' +
      (S.erro ? '<div class="qa-err" role="alert">' + esc(S.erro) + '</div>' : '') + '</form>';
  }

  function ticket() {
    var e = E();
    var rows = [[I.cal, 'Data', S.dia && S.step > 1 ? diaTxt(S.dia) : ''], [I.clk, 'Horário', S.hora ? S.hora + ' às ' + plus(S.hora, S.dur) : ''], [I.mic, 'Duração', e ? durTxt(S.dur) : '']];
    return '<div class="qa-tk-h"><small>Sua reserva</small><b>' + (e ? esc(e.nome) : 'Escolha um estúdio') + '</b>' + (e ? '<span>' + esc(e.local) + '</span>' : '') + '</div><div class="qa-cut" aria-hidden="true"></div>' +
      '<div class="qa-tk-rows">' + rows.map(function (r) { return '<div class="qa-row"><span class="ic">' + r[0] + '</span><span><small>' + r[1] + '</small><b class="' + (r[2] ? '' : 'pend') + '">' + esc(r[2] || 'a escolher') + '</b></span></div>'; }).join('') + '</div>' +
      '<div class="qa-tk-cta">' + mainBtn() + '<p class="qa-help"><a href="#" data-precos="1">Ver tabela de valores</a></p></div>';
  }
  function mainBtn() {
    if (S.step === 1) return '<button type="button" class="qs-btn ' + (S.esp ? 'qs-btn-primary' : 'qs-btn-outline-dark') + ' qs-btn--block" data-next="1"' + (S.esp ? '' : ' disabled') + '>' + (S.esp ? 'Escolher dia e horário' : 'Escolha um estúdio') + '</button>';
    if (S.step === 2) return '<button type="button" class="qs-btn ' + (S.hora ? 'qs-btn-primary' : 'qs-btn-outline-dark') + ' qs-btn--block" data-next="1"' + (S.hora ? '' : ' disabled') + '>' + (S.hora ? 'Continuar para seus dados' : 'Escolha o dia e o horário') + '</button>';
    if (API && !S.apiFalhou) return '<button type="button" class="qs-btn qs-btn-primary qs-btn--block" data-send="1"' + (S.enviando ? ' disabled' : '') + '>' + (S.enviando ? 'Enviando…' : 'Enviar pedido de reserva') + '</button>';
    return '<button type="button" class="qs-btn qs-btn-primary qs-btn--block" data-send="1">' + I.wa + 'Enviar pedido pelo WhatsApp</button>';
  }
  function dock() {
    if (S.step === 1 && !S.esp) return '';
    return '<div class="qa-dock">' + mainBtn() + '</div>';
  }

  function sheetPrecos() {
    if (!S.precos) return '';
    return '<div class="qa-sheet" role="dialog" aria-modal="true" aria-label="Tabela de valores"><div class="qa-sheet-bg" data-close="1"></div><div class="qa-sheet-in">' +
      '<div class="qa-sheet-h"><div><small>Tabela de valores</small><b>Quanto custa gravar</b></div><button type="button" class="qa-x" data-close="1" aria-label="Fechar">' + I.x + '</button></div>' +
      '<div class="qa-prices">' + PRECOS.map(function (p) {
        return '<div class="qa-pr' + (p.top ? ' top' : '') + '">' + (p.top ? '<span class="qa-badge">Mais escolhido</span>' : '') + '<div><b>' + p.n + '</b><small>' + p.d + '</small></div><div class="v"><b>' + p.v + '</b><small>Membro Space ' + p.m + '</small><small class="nt">Noturno ' + p.no + '</small></div></div>';
      }).join('') + '</div>' +
      '<p class="qa-pnote">Membros do Space: 10% de desconto em qualquer serviço vendido pelo coworking. Noites (a partir das 18h), fins de semana e feriados: +30%.</p>' +
      '<p class="qa-lbl">Pacotes de cortes</p><div class="qa-cortes">' + CORTES.map(function (c) { return '<div class="' + (c.top ? 'top' : '') + '"><small>' + c.n + '</small><b>' + c.v + '</b><span>' + c.u + '</span></div>'; }).join('') + '</div>' +
      '<p class="qa-pnote">Biombo, painéis, logotipo e decoração do cenário são orçados à parte, conforme o projeto.</p>' +
      '<p class="qa-lbl">Outros serviços</p><p class="qa-pnote">Valores de referência. O orçamento final depende do projeto.</p>' +
      '<div class="qa-serv">' + SERVICOS.map(function (x, i) { return '<div><span>' + pad(i + 1) + '</span><b>' + x[0] + '</b><small>' + x[1] + '</small><small class="mb">Membro Space: ' + x[2] + '</small></div>'; }).join('') + '</div>' +
      '<a class="qs-btn qs-btn-primary qs-btn--block qa-wa" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Olá, ' + PRIMEIRO + '! Vi a tabela de valores da Quadricast e gostaria de mais informações.') + '" target="_blank" rel="noopener">' + I.wa + 'Informações pelo WhatsApp com a ' + esc(PRIMEIRO) + '</a>' +
      '<button type="button" class="qs-btn qs-btn-outline-dark qs-btn--block" data-close="1">Voltar à reserva</button></div></div>';
  }
  function sheetEvento() {
    if (!S.evento) return '';
    var msg = 'Olá, ' + PRIMEIRO + '! Quero um orçamento de gravação no meu evento.\nEvento: \nData: \nCidade: \nO que gravar: ';
    return '<div class="qa-sheet" role="dialog" aria-modal="true" aria-label="Gravação no seu evento"><div class="qa-sheet-bg" data-close="1"></div><div class="qa-sheet-in">' +
      '<div class="qa-sheet-h"><div><small>Produção externa</small><b>A Quadricast vai até você</b></div><button type="button" class="qa-x" data-close="1" aria-label="Fechar">' + I.x + '</button></div>' +
      '<div class="qa-opts">' + [['Podcast ao vivo no evento', 'Set completo montado no seu estande ou palco'], ['Cobertura e entrevistas', 'Meia diária ou diária completa, com cortes para as redes'], ['Transmissão ao vivo', 'Multicâmera, com corte em tempo real']].map(function (o) {
        return '<div class="qa-opt is-static"><span class="rd on"></span><span>' + o[0] + '<small>' + o[1] + '</small></span></div>'; }).join('') + '</div>' +
      '<button type="button" class="qs-btn qs-btn-outline-dark qs-btn--block qa-mb" data-gal="__externo">' + I.img + 'Ver fotos de gravações em eventos</button>' +
      '<p class="qa-pnote">Cada evento tem orçamento sob medida, com equipe, equipamentos e montagem da Quadricast. Conte a data e o local que ' + esc(PRIMEIRO) + ' monta a proposta.</p>' +
      '<a class="qs-btn qs-btn-primary qs-btn--block" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + I.wa + 'Pedir orçamento pelo WhatsApp</a></div></div>';
  }

  function sheetGal() {
    if (!S.gal) return '';
    var fs = fotos(S.gal), e = null; for (var i = 0; i < ESPACOS.length; i++) if (ESPACOS[i].id === S.gal) e = ESPACOS[i];
    var nome = e ? e.nome : 'Gravações em eventos', gi = Math.max(0, Math.min(S.gi, fs.length - 1));
    return '<div class="qa-sheet qa-gal" role="dialog" aria-modal="true" aria-label="Fotos de ' + esc(nome) + '"><div class="qa-sheet-bg" data-close="1"></div><div class="qa-sheet-in">' +
      '<div class="qa-sheet-h"><div><small>Fotos · ' + (gi + 1) + ' de ' + fs.length + '</small><b>' + esc(nome) + '</b></div><button type="button" class="qa-x" data-close="1" aria-label="Fechar">' + I.x + '</button></div>' +
      '<div class="qa-gal-main"><img src="' + fs[gi] + '" alt="' + esc(nome) + ', foto ' + (gi + 1) + '">' +
      (fs.length > 1 ? '<button type="button" class="qa-gal-nav p" data-gi="' + ((gi - 1 + fs.length) % fs.length) + '" aria-label="Foto anterior">' + I.l + '</button><button type="button" class="qa-gal-nav n" data-gi="' + ((gi + 1) % fs.length) + '" aria-label="Próxima foto">' + I.r + '</button>' : '') + '</div>' +
      '<div class="qa-gal-th">' + fs.map(function (f, i) { return '<button type="button" data-gi="' + i + '" class="' + (i === gi ? 'on' : '') + '" aria-label="Foto ' + (i + 1) + '"><img src="' + f + '" alt="" loading="lazy"></button>'; }).join('') + '</div>' +
      (e ? '<button type="button" class="qs-btn qs-btn-primary qs-btn--block" data-pick="' + esc(e.id) + '">Reservar este estúdio</button>' : '') + '</div></div>';
  }

  function done() {
    if (S.viaApi) return '<section class="qa-panel qa-done"><div class="ok">' + I.ck + '</div><h2>Pedido enviado!</h2>' +
      '<p>Seu horário ficou guardado por 48h. ' + esc(PRIMEIRO) + ' vai falar com você pelo WhatsApp para confirmar o valor e as condições e fechar a reserva.</p>' +
      '<div class="qa-ticket">' + ticket().replace(/<div class="qa-tk-cta">[\s\S]*$/, '') + '</div>' +
      '<div class="acts"><a class="qs-btn qs-btn-primary qs-btn--block" href="' + esc(S.done) + '" target="_blank" rel="noopener">' + I.wa + 'Falar com ' + esc(PRIMEIRO) + ' agora</a>' +
      '<button type="button" class="qs-btn qs-btn-outline-dark qs-btn--block" data-novo="1">Fazer outro pedido</button></div></section>';
    return '<section class="qa-panel qa-done"><div class="ok">' + I.wa + '</div><h2>Falta só enviar a mensagem</h2>' +
      '<p>O WhatsApp abriu com o seu pedido pronto. Envie a mensagem para ' + esc(PRIMEIRO) + ' confirmar a disponibilidade e fechar a reserva.</p>' +
      '<div class="qa-ticket">' + ticket().replace(/<div class="qa-tk-cta">[\s\S]*$/, '') + '</div>' +
      '<div class="acts"><a class="qs-btn qs-btn-primary qs-btn--block" href="' + esc(S.done) + '" target="_blank" rel="noopener">' + I.wa + 'Abrir o WhatsApp de novo</a>' +
      '<button type="button" class="qs-btn qs-btn-outline-dark qs-btn--block" data-novo="1">Fazer outro pedido</button></div></section>';
  }

  var TITLES = { 1: ['Onde você quer gravar?', 'Toque no estúdio para escolher.'], 2: ['Quando você quer gravar?', 'Responda as 3 perguntas, na ordem.'], 3: ['Para quem é a reserva?', 'Só faltam seus contatos. A confirmação chega pelo WhatsApp.'] };

  function render(stripToSel) {
    capture();
    var st = root.querySelector('.qa-strip'), sx = st ? st.scrollLeft : 0, body;
    if (S.done) body = done();
    else {
      var t = TITLES[S.step];
      body = '<section class="qa-panel">' + stepper() +
        '<div class="qa-head">' + (S.step > 1 ? '<button type="button" class="qa-back" data-back="1" aria-label="Voltar">' + I.l + '</button>' : '') + '<div><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div></div>' +
        '<div class="qa-body">' + (S.step === 1 ? step1() : S.step === 2 ? step2() : step3()) + '</div></section>' +
        '<aside class="qa-ticket" aria-label="Resumo da reserva">' + ticket() + '</aside>';
    }
    root.innerHTML = '<div class="qa' + (S.done ? ' is-done' : '') + '">' + body + '</div>' + (S.done ? '' : dock()) + sheetPrecos() + sheetEvento() + sheetGal();
    if (S.step === 2 && !S.done) carregar();
    root.classList.add('is-ready');
    filtSync();
    st = root.querySelector('.qa-strip');
    if (st) {
      var on = st.querySelector('.qa-d.on');
      if (stripToSel && on) st.scrollLeft = Math.max(0, on.offsetLeft - st.offsetLeft - 8); else st.scrollLeft = sx;
      st.addEventListener('scroll', mesLabel, { passive: true });
    }
  }
  function mesLabel() {
    var st = root.querySelector('.qa-strip'), lb = root.querySelector('[data-mes]'); if (!st || !lb) return;
    var bs = st.querySelectorAll('.qa-d'), x = st.scrollLeft + 20;
    for (var i = 0; i < bs.length; i++) if (bs[i].offsetLeft - st.offsetLeft >= x) { var d = parse(bs[i].getAttribute('data-dia')); lb.textContent = MES[d.getMonth()] + ' ' + d.getFullYear(); return; }
  }
  function filtSync() {
    var w = root.querySelector('.qa-fwrap'), t = w && w.querySelector('.qa-filt'); if (!t) return;
    var bp = w.querySelector('.qa-fnav.p'), bn = w.querySelector('.qa-fnav.n');
    function upd() { var m = t.scrollWidth - t.clientWidth, x = t.scrollLeft, l = x > 4, r = x < m - 4; w.classList.toggle('l', l); w.classList.toggle('r', r); bp.hidden = !l; bn.hidden = !r; }
    t.scrollLeft = S.fx || 0;
    var on = t.querySelector('.on');
    if (on && (on.offsetLeft < t.scrollLeft || on.offsetLeft + on.offsetWidth > t.scrollLeft + t.clientWidth)) t.scrollLeft = Math.max(0, on.offsetLeft - 48);
    t.addEventListener('scroll', function () { S.fx = t.scrollLeft; upd(); }, { passive: true });
    upd();
  }
  window.addEventListener('resize', function () { filtSync(); });

  function capture() {
    var f = root.querySelector('.qa-form'); if (!f) return;
    ['nome', 'whatsapp', 'email', 'empresa', 'obs'].forEach(function (k) { if (f.elements[k]) S.form[k] = f.elements[k].value.trim(); });
    ['tipo', 'producao'].forEach(function (k) { var c = f.querySelector('input[name="' + k + '"]:checked'); if (c) S.form[k] = c.value; });
    if (f.elements.ok) S.form.ok = f.elements.ok.checked;
  }
  function go(n) {
    S.step = n; S.erro = ''; S.bad = '';
    render(n === 2);
    var top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * .6) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function send() {
    capture();
    var f = S.form, dg = (f.whatsapp || '').replace(/\D/g, ''), e = E();
    S.bad = !f.nome ? 'nome' : dg.length < 10 ? 'whatsapp' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email || '') ? 'email' : '';
    S.erro = S.bad === 'nome' ? 'Informe seu nome.' : S.bad === 'whatsapp' ? 'Informe o WhatsApp com DDD.' : S.bad === 'email' ? 'Informe um e-mail válido.' : !f.ok ? 'Marque a autorização de contato para continuar.' : '';
    if (S.erro) { render(); var b = root.querySelector('.qa-err'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    var extra = diaExtra(S.dia) || (noturno(S.hora) ? 'Horário noturno' : '');
    var msg = 'Olá, ' + PRIMEIRO + '! Quero reservar uma gravação pelo site.\n\n' +
      '*Estúdio:* ' + e.nome + ' (' + e.local + ')\n' +
      '*Data:* ' + diaTxt(S.dia) + '\n' +
      '*Horário:* ' + S.hora + ' às ' + plus(S.hora, S.dur) + ' (' + durTxt(S.dur) + ')' + (extra ? '\n' + extra + ': acréscimo de 30%' : '') + '\n' +
      '*O que vou gravar:* ' + f.tipo + '\n*Como prefiro:* ' + f.producao + '\n*Pessoas no set:* ' + f.pessoas + '\n\n' +
      '*Nome:* ' + f.nome + '\n*WhatsApp:* ' + f.whatsapp + '\n*E-mail:* ' + f.email + (f.empresa ? '\n*Empresa:* ' + f.empresa : '') + (f.obs ? '\n*Projeto:* ' + f.obs : '') +
      '\n\nPode confirmar a disponibilidade?';
    var link = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    function pelowhats() { window.open(link, '_blank', 'noopener'); S.viaApi = false; S.done = link; render(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    if (!API || S.apiFalhou) { pelowhats(); return; }
    if (S.enviando) return;
    S.enviando = true; render();
    var payload = { espaco: S.esp, data: S.dia, inicio: S.hora, duracao: S.dur, nome: f.nome, empresa: f.empresa, whatsapp: f.whatsapp, email: f.email, tipo: f.tipo, producao: f.producao, pessoas: f.pessoas, obs: f.obs, site: '' };
    fetch(url('/reserva'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var x = new Error(j && j.message || 'Erro'); x.st = r.status; throw x; } return j; }); })
      .then(function (j) {
        S.enviando = false; S.viaApi = true;
        S.done = j.whatsapp || ('https://wa.me/' + WA + '?text=' + encodeURIComponent('Olá, ' + PRIMEIRO + '! Acabei de pedir uma reserva pelo site: ' + e.nome + ', ' + diaTxt(S.dia) + ', ' + S.hora + '. Nome: ' + f.nome));
        S.livres = {}; render(); root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (x) {
        S.enviando = false;
        if (x.st === 409) { S.livres = {}; S.hora = null; S.step = 2; S.erro = ''; S.aviso = x.message; render(); return; }
        if (x.st && x.st < 500) { S.erro = x.message; render(); return; }
        S.apiFalhou = true; pelowhats();
      });
  }

  root.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-precos],[data-close],[data-evento]');
    if (a && root.contains(a)) { ev.preventDefault(); capture(); S.precos = a.hasAttribute('data-precos'); S.evento = a.hasAttribute('data-evento'); S.gal = null; render(); return; }
    var b = ev.target.closest('button'); if (!b || !root.contains(b)) return;
    var d = b.dataset;
    if (d.gal) { capture(); S.gal = d.gal; S.gi = 0; S.precos = false; S.evento = false; render(); return; }
    if (d.gi) { S.gi = +d.gi; render(); return; }
    if (d.pick) { S.gal = null; if (S.esp !== d.pick) { S.esp = d.pick; S.dia = null; S.hora = null; if (soNoite(E()) && S.dur > 360) S.dur = 120; } go(2); return; }
    if (d.grupo) { S.grupo = d.grupo; render(); return; }
    if (d.fscroll) { var ft = root.querySelector('.qa-filt'); if (ft) ft.scrollBy({ left: +d.fscroll * ft.clientWidth * 0.7, behavior: 'smooth' }); return; }
    if (d.esp) { if (S.esp !== d.esp) { S.esp = d.esp; S.dia = null; S.hora = null; if (soNoite(E()) && S.dur > 360) S.dur = 120; } render(); setTimeout(function () { go(2); }, 220); return; }
    if (d.next) { if (S.step === 1 && S.esp) go(2); else if (S.step === 2 && S.hora) go(3); return; }
    if (d.back) { go(S.step - 1); return; }
    if (d.goto) { go(+d.goto); return; }
    if (d.dur) { S.dur = +d.dur; S.hora = null; if (livresAgora() && S.dia && !(livresAgora()[S.dia] || []).length) S.dia = null; render(); return; }
    if (d.scroll) { var st = root.querySelector('.qa-strip'); if (st) st.scrollBy({ left: +d.scroll * st.clientWidth * 0.9, behavior: 'smooth' }); return; }
    if (d.dia) { S.dia = d.dia; S.hora = null; render(); return; }
    if (d.hora) { S.hora = d.hora; render(); return; }
    if (d.pess) { capture(); S.form.pessoas = d.pess; render(); return; }
    if (d.send) { send(); return; }
    if (d.novo) { S.done = null; S.hora = null; S.step = 1; render(); }
  });
  root.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && (S.precos || S.evento || S.gal)) { S.precos = false; S.evento = false; S.gal = null; render(); }
    if (S.gal && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) { var n = fotos(S.gal).length; S.gi = (S.gi + (ev.key === 'ArrowRight' ? 1 : n - 1)) % n; render(); }
  });
  root.addEventListener('submit', function (ev) { ev.preventDefault(); send(); });

  render();
  if (S.esp) setTimeout(function () { root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
})();
