/* QSITE Messaging Channels — botões de contato por canal (QZap/WhatsApp/Telegram/X DM)
   Lê CONFIG.messaging do site.config.json:
     "messaging": {
       "channels": ["whatsapp", "telegram", "xchat"],
       "whatsapp": "5511999999999",
       "telegram": "usuario",
       "xchat": "1234567890"
     }
   - whatsapp: número (D. Internacional)
   - telegram: @username (sem @)
   - xchat:    recipient_id numérico da conta X (obter em publish.x.com)
   QZap entra sempre como primeiro canal quando features.qzap === true (abre a
   página de atendimento). Qualquer elemento com classe .js-messaging vira um
   btn-group com os canais lado a lado; o texto da mensagem vem de data-text. */
(function () {
  'use strict';

  function cfg() {
    return (typeof CONFIG !== 'undefined' && CONFIG.messaging) || null;
  }

  var CHANNELS = {
    qzap: {
      label: 'QZap',
      icon: 'bi bi-chat-dots',
      bg: '#0033FF',
      url: function (target, text, ctx) {
        return (ctx && ctx.qzapPage) || '/atendimento.html';
      }
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: 'bi bi-whatsapp',
      bg: '',
      // api.whatsapp.com/send direto (não wa.me): o redirect do wa.me corrompe
      // emojis de 4 bytes (U+FFFD �) em mensagens pré-preenchidas.
      url: function (target, text) {
        return 'https://api.whatsapp.com/send?phone=' + String(target).replace(/\D/g, '') + '&text=' + encodeURIComponent(text || '');
      }
    },
    telegram: {
      label: 'Telegram',
      icon: 'bi bi-telegram',
      bg: '#229ED9',
      url: function (target, text) {
        return 'https://t.me/' + String(target).replace(/^@/, '') + '?text=' + encodeURIComponent(text || '');
      }
    },
    xchat: {
      label: '(DM)',
      icon: 'bi bi-twitter-x',
      bg: '#000000',
      // O texto vai por ?text= e é aplicado pelo DM button oficial (widgets.js da X)
      // via openChannel; sem o JS da X o compose ignora o parâmetro.
      url: function (target, text) {
        return 'https://x.com/messages/compose?recipient_id=' + encodeURIComponent(target) + '&text=' + encodeURIComponent(text || '');
      }
    }
  };

  // Contexto do QZap (script tag injetado pelo build): slug/api/página de atendimento.
  // O data-page vem prefixado com base_url (produção em subpasta); em servidor
  // local (raiz) o pathname não contém o base_url → remove o prefixo.
  function qzapCtx() {
    var widget = document.querySelector('script[src*="qzap-widget"]');
    if (!widget) return null;
    var page = widget.dataset.page || '/atendimento.html';
    var baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.base_url) || '';
    var path = window.location.pathname || '';
    if (baseUrl && baseUrl !== '/' && page.indexOf(baseUrl) === 0 && path.indexOf(baseUrl) !== 0) {
      page = page.slice(baseUrl.length) || '/atendimento.html';
    }
    return {
      qzapPage: page,
      apiBase: widget.dataset.api || (widget.src ? new URL(widget.src).origin : '')
    };
  }

  function qzapOn() {
    return typeof CONFIG !== 'undefined' && CONFIG.features && CONFIG.features.qzap === true;
  }

  // Canais ativos: QZap primeiro (sempre quando features.qzap), depois os configurados.
  // Valores vazios ("") não geram botão.
  function getChannels() {
    var list = [];
    var ctx = qzapCtx();
    if (qzapOn() && ctx) list.push({ id: 'qzap', ctx: ctx });
    var m = cfg();
    if (m && Array.isArray(m.channels)) {
      m.channels.forEach(function (id) {
        if (CHANNELS[id] && typeof m[id] === 'string' && m[id].trim()) list.push({ id: id });
      });
    }
    return list;
  }

  // Fallback para sites sem bloco messaging: usa social.whatsapp como canal único.
  function legacyWhatsapp() {
    var wa = (typeof CONFIG !== 'undefined' && CONFIG.social && CONFIG.social.whatsapp) || '';
    var mm = wa.match(/wa\.me\/(\d+)/);
    return mm ? [{ id: 'whatsapp' }] : [];
  }

  function linkFor(ch, text) {
    if (ch.id === 'qzap') return (ch.ctx && ch.ctx.qzapPage) || '/atendimento.html';
    var m = cfg();
    if (!m || !m[ch.id]) return null;
    return CHANNELS[ch.id].url(m[ch.id], text, ch.ctx);
  }

  // Monta o link de um canal pelo id (usado no clique do picker quando o texto
  // só é conhecido na hora, ex: pedido do cart montado dinamicamente).
  function linkForId(id, text) {
    var ch = null;
    getChannels().forEach(function (c) { if (c.id === id) ch = c; });
    return ch ? linkFor(ch, text) : null;
  }

  function iconHTML(ch) {
    if (ch.id === 'qzap' && ch.ctx && ch.ctx.apiBase) {
      return '<img src="' + ch.ctx.apiBase + '/qzap/icons/icon-192.png" alt="QZap" style="width:16px;height:16px;border-radius:4px;object-fit:contain">';
    }
    return '<i class="' + CHANNELS[ch.id].icon + '" style="color:#fff!important"></i>';
  }

  // Toast discreto para avisos (ex: X copiou a mensagem para o clipboard)
  function toast(msg) {
    var el = document.getElementById('qmessaging-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'qmessaging-toast';
      el.style.cssText = 'position:fixed;bottom:90px;right:20px;z-index:2147483100;background:#212529;color:#fff;padding:8px 14px;border-radius:8px;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.3);opacity:0;transition:opacity .25s;max-width:260px';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.style.opacity = '0'; }, 3500);
  }

  // Carrega o JS oficial da X (widgets.js) — necessário para o DM button
  // pre-preenchido (o compose puro ignora o parâmetro ?text).
  var xWidgetsLoaded = false;
  function loadXWidgets(cb) {
    if (xWidgetsLoaded) { if (cb) cb(); return; }
    var s = document.getElementById('qmessaging-x-widgets');
    if (s) { if (cb) s.addEventListener('load', cb); return; }
    s = document.createElement('script');
    s.id = 'qmessaging-x-widgets';
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    s.addEventListener('load', function () { xWidgetsLoaded = true; if (cb) cb(); });
    s.addEventListener('error', function () { xWidgetsLoaded = true; });
    document.head.appendChild(s);
  }

  // Abre o canal com a mensagem. WhatsApp/Telegram usam o ?text do link direto.
  // Para o X: usa o DM button oficial (twitter-dm-button + widgets.js) que abre o
  // composer com o texto pre-preenchido.
  function openChannel(channelId, url, text) {
    if (!url) return;
    if (channelId !== 'xchat') {
      window.open(url, '_blank', 'noopener');
      return;
    }
    var base = url.split('?')[0] + (url.indexOf('?') > -1 ? url.slice(url.indexOf('?')) : '');
    var full = base + (base.indexOf('?') > -1 ? '&' : '?') + 'text=' + encodeURIComponent(text || '');
    var doClick = function () {
      var a = document.createElement('a');
      a.href = full;
      a.className = 'twitter-dm-button';
      a.dataset.screenName = '';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 2000);
    };
    if (xWidgetsLoaded) {
      doClick();
    } else {
      loadXWidgets(doClick);
    }
  }

  // Picker para formulários/cart: label + grupo de botões com os canais (sem Qzap,
  // que segue under the hood). onPick(channelId, url) é chamado no clique.
  // Um botão "Envio padrão" (url vazia) fica sempre no fim — envia sem abrir app.
  // Por padrão empilha no mobile (flex-column flex-sm-row); com stack=true fica
  // sempre empilhado (usado no offcanvas do cart, onde o espaço é pequeno).
  function renderPicker(el, text, onPick, stack) {
    // Picker (forms/cart): sem Qzap e sem X (o X não pré-preenche mensagem) —
    // X fica apenas no botão flutuante (renderGroup float).
    var channels = getChannels().filter(function (ch) { return ch.id !== 'qzap' && ch.id !== 'xchat'; });
    if (!channels.length) return false;
    var layout = stack ? 'd-flex flex-column gap-2' : 'd-flex flex-column flex-sm-row gap-2';
    var html = '<div class="js-messaging-picker">' +
      '<small class="d-block text-body-secondary mb-2">Enviar mensagem usando:</small>' +
      '<div class="' + layout + '" role="group" aria-label="Canal de envio">';
    html += '<button type="button" class="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 flex-fill" data-channel="default" data-url="">' +
      '<i class="bi bi-send"></i> Envio padrão</button>';
    channels.forEach(function (ch) {
      var c = CHANNELS[ch.id];
      var url = linkFor(ch, text);
      if (!url) return;
      var color = c.bg ? ' style="background:' + c.bg + ';border-color:' + c.bg + '"' : '';
      html += '<button type="button" class="btn btn-success text-white d-inline-flex align-items-center justify-content-center gap-2 flex-fill" data-channel="' + ch.id + '" data-url="' + url + '"' + color + '>' +
        iconHTML(ch) + ' ' + c.label + '</button>';
    });
    html += '</div></div>';
    el.innerHTML = html;
    el.querySelectorAll('[data-channel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        onPick(btn.getAttribute('data-channel'), btn.getAttribute('data-url'));
      });
    });
    return true;
  }

  function renderGroup(el) {
    var text = el.getAttribute('data-text') || '';
    var channels = getChannels();
    if (!channels.length) channels = legacyWhatsapp();
    if (!channels.length) return;

    var variant = el.getAttribute('data-variant') || 'group';
    var html;
    if (variant === 'float') {
      html = '<div class="btn-group btn-group-sm shadow flex-row" role="group" aria-label="Canais de contato">';
      channels.forEach(function (ch) {
        var c = CHANNELS[ch.id];
        var url = linkFor(ch, text);
        if (!url) return;
        var color = c.bg ? ' style="background:' + c.bg + ';border-color:' + c.bg + '"' : '';
        html += '<a href="' + url + '" target="_blank" rel="noopener" class="btn btn-success text-white d-inline-flex align-items-center justify-content-center px-2" title="' + c.label + '" aria-label="' + c.label + '"' + color + '>' +
          iconHTML(ch) + '</a>';
      });
      html += '</div>';
    } else {
      html = '<div class="btn-group btn-group-sm" role="group" aria-label="Canais de contato">';
      channels.forEach(function (ch) {
        var c = CHANNELS[ch.id];
        var url = linkFor(ch, text);
        if (!url) return;
        html += '<a href="' + url + '" target="_blank" rel="noopener" class="btn btn-outline-primary d-inline-flex align-items-center gap-2">' +
          iconHTML(ch) + ' ' + c.label + '</a>';
      });
      html += '</div>';
    }
    el.innerHTML = html;
    el.classList.remove('d-none');
    // Compat: botão flutuante legado do WhatsApp é substituído pelos canais
    if (variant === 'float') {
      var legacy = document.getElementById('floating-whatsapp');
      if (legacy) legacy.classList.add('d-none');
      // QZap entra no grupo → remove o bubble legado do qzap-widget (evita duplicação)
      var qzapBubble = document.querySelector('.qzap-bubble');
      if (qzapBubble) qzapBubble.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-messaging').forEach(renderGroup);
    // Pré-carrega o widgets.js da X se o canal (DM) estiver configurado (fica pronto para o clique)
    var hasX = getChannels().some(function (c) { return c.id === 'xchat'; });
    if (hasX) loadXWidgets();
  });

  window.QMessaging = { getChannels: getChannels, renderGroup: renderGroup, linkFor: linkFor, linkForId: linkForId, renderPicker: renderPicker, openChannel: openChannel };
})();