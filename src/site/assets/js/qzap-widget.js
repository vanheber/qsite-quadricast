/* global document, window, EventSource, MediaRecorder, FileReader */
/* QZap Widget (qsite-core) — balão flutuante + modo página (chat de atendimento com IA)
   Injetado automaticamente pelo build quando features.qzap === true:
   <script src="/assets/js/qzap-widget.js" data-slug="cliente-x" data-api="https://qmind.agenciaquadri.com" data-page="/atendimento.html"></script>
   Página dedicada: <div data-qzap-chat></div> + o mesmo script.
   Modo página reutiliza o layout aprovado do endpoint /qzap do qmind (style.css + Bootstrap + Bootstrap Icons). */
(function () {
    'use strict';

    var script = document.currentScript;
    var slug = (script && script.dataset.slug) || '';
    var apiBase = (script && script.dataset.api) || (script ? new URL(script.src).origin : '');
    if (!slug) return;

    var LS_KEY = 'qzap-visitor-id';
    var visitorId = localStorage.getItem(LS_KEY);
    if (!visitorId) {
        visitorId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'v' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
        localStorage.setItem(LS_KEY, visitorId);
    }

    var container = document.querySelector('[data-qzap-chat]');
    var brandName = container ? (container.dataset.name || '') : '';

    function api(path, opts) {
        return fetch(apiBase + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts || {}));
    }

    // POST /api/qzap/chat com retry único em erro 5xx (reinício do servidor, picos)
    function postChat(body) {
        return api('/api/qzap/chat', { method: 'POST', body: JSON.stringify(body) })
            .then(function (res) {
                if (res.status >= 500) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(api('/api/qzap/chat', { method: 'POST', body: JSON.stringify(body) }));
                        }, 1500);
                    });
                }
                return res;
            });
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function renderMarkdown(text) {
        var html = '';
        if (window.marked && typeof window.marked.parse === 'function') {
            try { html = window.marked.parse(text || ''); } catch (e) { /* fallback */ }
        }
        if (!html) {
            html = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        }
        // Sanitiza o HTML gerado (anti-XSS: a IA e o atendente são entradas não confiáveis)
        if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
            return window.DOMPurify.sanitize(html);
        }
        return html;
    }

    // Carrega marked + DOMPurify do endpoint QZap (mesma lib do Conjurador) sem conflitar com o site
    (function loadMarked() {
        if (!window.marked && !document.getElementById('qzap-marked')) {
            var s = document.createElement('script');
            s.id = 'qzap-marked';
            s.src = apiBase + '/qzap/vendor/marked.min.js';
            document.head.appendChild(s);
        }
        if (!window.DOMPurify && !document.getElementById('qzap-purify')) {
            var p = document.createElement('script');
            p.id = 'qzap-purify';
            p.src = apiBase + '/qzap/vendor/purify.min.js';
            document.head.appendChild(p);
        }
    })();

    // Assets do layout aprovado (endpoint /qzap): Bootstrap, ícones e style.css da cor QZap
    function injectAssets() {
        var links = [
            { id: 'qzap-bs', rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
            { id: 'qzap-bs-icons', rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css' },
            { id: 'qzap-style', rel: 'stylesheet', href: apiBase + '/qzap/style.css' }
        ];
        for (var i = 0; i < links.length; i++) {
            if (document.getElementById(links[i].id)) continue;
            var l = document.createElement('link');
            l.id = links[i].id;
            l.rel = links[i].rel;
            l.href = links[i].href;
            document.head.appendChild(l);
        }
    }

    // Estilos mínimos específicos do widget (o restante vem do style.css do endpoint QZap)
    var STYLE = [
        '.qzap-bubble{position:fixed;bottom:20px;right:20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.25);background:#0033FF;color:#fff;transition:transform .2s}',
        '.qzap-bubble:hover{transform:scale(1.08)}',
        '.qzap-bubble img{width:36px;height:36px;border-radius:8px;object-fit:contain;background:rgba(255,255,255,.15);padding:3px}',
        '.qzap-mic{color:#6c757d}.qzap-mic.recording{color:#dc3545}',
        '.qzap-audio-preview{display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid #dee2e6;background:#f8f9fa}',
        '.qzap-audio-preview audio{height:36px;max-width:220px}',
        '.qzap-typing{opacity:.7}'
    ].join('');

    function injectStyle() {
        if (document.getElementById('qzap-widget-style')) return;
        var s = document.createElement('style');
        s.id = 'qzap-widget-style';
        s.textContent = STYLE;
        document.head.appendChild(s);
    }

    // ---------- Modo balão flutuante ----------
    function renderBubble() {
        // Messaging Channels assumiu o flutuante (QZap entra no btn-group) — não criar bubble duplicado
        var messagingFloat = document.querySelector('.js-messaging[data-variant="float"]');
        if (messagingFloat && typeof CONFIG !== 'undefined' && CONFIG.messaging && Array.isArray(CONFIG.messaging.channels)) {
            return;
        }
        injectStyle();
        var btn = document.createElement('button');
        btn.className = 'qzap-bubble';
        btn.type = 'button';
        btn.title = 'Atendimento';
        btn.innerHTML = '<img src="' + apiBase + '/qzap/icons/icon-192.png" alt="QZap">';
        btn.addEventListener('click', function () {
            // data-page vem prefixado com base_url (produção em subpasta); em servidor
            // local (raiz) o pathname não contém o base_url → remove o prefixo.
            var page = script.dataset.page || '/atendimento.html';
            var baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.base_url) || '';
            var path = window.location.pathname || '';
            if (baseUrl && baseUrl !== '/' && page.indexOf(baseUrl) === 0 && path.indexOf(baseUrl) !== 0) {
                page = page.slice(baseUrl.length) || '/atendimento.html';
            }
            window.open(page, '_blank', 'noopener');
        });
        document.body.appendChild(btn);

        // Coexistência com o botão flutuante do WhatsApp (não pode cobri-lo)
        function positionBubble() {
            var wa = document.getElementById('floating-whatsapp');
            var overlap = wa && wa.offsetParent !== null;
            btn.style.bottom = overlap ? '100px' : '20px';
        }
        if (document.readyState !== 'loading') positionBubble();
        else document.addEventListener('DOMContentLoaded', positionBubble);
    }

    // ---------- Modo página (container [data-qzap-chat]) — layout aprovado do endpoint QZap ----------
    function renderChat(root) {
        injectAssets();
        injectStyle();
        var chatEl = document.createElement('div');
        chatEl.className = 'qzap-public d-flex flex-column w-100';
        chatEl.style.height = '100vh';
        chatEl.style.minHeight = '420px';
        chatEl.innerHTML =
            '<header class="d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-body">' +
                '<img src="' + apiBase + '/qzap/icons/icon-192.png" alt="QZap" style="width:32px;height:32px;border-radius:8px;">' +
                '<div class="d-flex flex-column lh-1">' +
                    '<strong class="fs-6">QZap</strong>' +
                    '<small class="text-body-secondary">' + escapeHtml(brandName || 'Atendimento') + ' · online</small>' +
                '</div>' +
                '<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 ms-auto qzap-human">' +
                    '<i class="bi bi-person-badge"></i> Falar com humano' +
                '</button>' +
            '</header>' +
            '<main id="qzap-msgs" class="flex-grow-1 overflow-auto px-3 py-4 d-flex flex-column" style="min-height:0;background:var(--bs-body-bg);scroll-behavior:smooth"></main>' +
            '<form class="chat-input-wrapper px-3 pb-3 pt-2 bg-body-tertiary m-0" id="qzap-composer">' +
                '<div class="mx-auto w-100 mw-800 bg-body border border-secondary-subtle chat-input-container shadow-sm p-2 d-flex align-items-center focus-within-ring transition-all">' +
                    '<button type="button" class="btn btn-sm text-body-secondary border-0 qzap-mic flex-shrink-0" title="Gravar áudio" style="width:36px;height:36px">' +
                        '<i class="bi bi-mic fs-5"></i>' +
                    '</button>' +
                    '<textarea class="form-control bg-transparent border-0 shadow-none py-2 px-4 text-body chat-input-area chat-input-precision flex-grow-1" rows="1" placeholder="Digite sua mensagem..." autocomplete="off" style="min-height:46px;max-height:200px;height:46px"></textarea>' +
                    '<button type="submit" class="btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center square-btn-40 me-1 flex-shrink-0 text-white" aria-label="Enviar">' +
                        '<i class="bi bi-arrow-up fs-5"></i>' +
                    '</button>' +
                '</div>' +
            '</form>';
        root.appendChild(chatEl);

        var msgsEl = chatEl.querySelector('#qzap-msgs');
        var inputEl = chatEl.querySelector('textarea');
        var formEl = chatEl.querySelector('#qzap-composer');
        var sendBtn = chatEl.querySelector('button[type=submit]');
        var humanBtn = chatEl.querySelector('.qzap-human');
        var micBtn = chatEl.querySelector('.qzap-mic');

        // Bolhas no padrão visual QMIND (mesmo markup da PWA do QZap)
        function addMsg(text, cls, sender) {
            var isUser = cls === 'qzap-user';
            var wrap = document.createElement('div');
            wrap.className = 'd-flex ' + (isUser ? 'justify-content-end' : 'justify-content-start') + ' mb-4 bubble-in';
            var bg = isUser ? 'bg-primary text-white border-primary' : 'bg-body border-secondary-subtle text-body shadow-sm';
            var senderTag = sender ? '<small class="d-block text-body-secondary mb-1">' + sender + '</small>' : '';
            wrap.innerHTML =
                '<div class="chat-bubble p-0 rounded-4 border ' + bg + ' chat-bubble-max position-relative overflow-hidden">' +
                    '<div class="chat-content p-3">' + senderTag +
                        '<div class="rendered-view marked-content"></div>' +
                    '</div>' +
                '</div>';
            var view = wrap.querySelector('.rendered-view');
            view.innerHTML = isUser ? escapeHtml(text) : renderMarkdown(text);
            msgsEl.appendChild(wrap);
            msgsEl.scrollTop = msgsEl.scrollHeight;
            return { wrap: wrap, view: view };
        }

        function senderLabel(role) {
            if (role === 'user') return '';
            if (role === 'atendente') return '<i class="bi bi-person-badge"></i> Atendente';
            return '<i class="bi bi-robot"></i> Assistente IA';
        }

        var MAX_AUDIO_MS = 90000;
        var mediaStream = null;
        var recorder = null;
        var audioChunks = [];
        var pendingAudio = null;
        var audioTimer = null;
        var recordingStartedAt = 0;

        function pickMimeType() {
            var candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
            for (var i = 0; i < candidates.length; i++) {
                if (window.MediaRecorder && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
            }
            return '';
        }

        function stopMicStream() {
            if (mediaStream) {
                mediaStream.getTracks().forEach(function (t) { t.stop(); });
                mediaStream = null;
            }
        }

        function stopRecording() {
            if (recorder && recorder.state !== 'inactive') recorder.stop();
            clearInterval(audioTimer);
            audioTimer = null;
            micBtn.classList.remove('recording');
            micBtn.querySelector('i').className = 'bi bi-mic fs-5';
        }

        function showAudioPreview() {
            if (!pendingAudio) return;
            var url = URL.createObjectURL(pendingAudio.blob);
            var preview = document.createElement('div');
            preview.className = 'qzap-audio-preview';
            preview.innerHTML = '<audio controls src="' + url + '"></audio>' +
                '<button type="button" class="btn btn-primary btn-sm rounded-pill">Enviar</button>';
            formEl.parentNode.insertBefore(preview, formEl);
            preview.querySelector('button').addEventListener('click', function () {
                preview.remove();
                var audio = pendingAudio;
                pendingAudio = null;
                sendAudio(audio);
            });
        }

        function startRecording() {
            if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) {
                addMsg('Gravação de áudio não suportada neste navegador.', 'qzap-ai', senderLabel('model'));
                return;
            }
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
                mediaStream = stream;
                var mimeType = pickMimeType();
                recorder = new MediaRecorder(stream, mimeType ? { mimeType: mimeType } : undefined);
                audioChunks = [];
                recorder.ondataavailable = function (e) {
                    if (e.data && e.data.size > 0) audioChunks.push(e.data);
                };
                recorder.onstop = function () {
                    pendingAudio = {
                        blob: new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' }),
                        mimeType: recorder.mimeType || 'audio/webm'
                    };
                    stopMicStream();
                    showAudioPreview();
                };
                recorder.start();
                recordingStartedAt = Date.now();
                micBtn.classList.add('recording');
                micBtn.querySelector('i').className = 'bi bi-stop-circle fs-5';
                audioTimer = setInterval(function () {
                    if (Date.now() - recordingStartedAt >= MAX_AUDIO_MS) stopRecording();
                }, 1000);
            }).catch(function (err) {
                addMsg(err && err.name === 'NotAllowedError'
                    ? 'Microfone bloqueado — permita nas configurações do navegador.'
                    : 'Erro ao acessar o microfone.', 'qzap-ai', senderLabel('model'));
            });
        }

        micBtn.addEventListener('click', function () {
            if (recorder && recorder.state === 'recording') stopRecording();
            else startRecording();
        });

        function sendAudio(audio) {
            sendBtn.disabled = true;
            var typing = addMsg('Pensando...', 'qzap-ai', senderLabel('model'));
            typing.wrap.classList.add('qzap-typing');
            var reader = new FileReader();
            reader.onload = function () {
                var base64 = reader.result.split(',')[1];
                postChat({ slug: slug, visitorId: visitorId, message: '', audio: { base64: base64, mimeType: audio.mimeType } }).then(function (res) {
                    if (!res.ok) throw new Error('Servidor retornou ' + res.status);
                    return res.body.getReader();
                }).then(function (r) {
                    var decoder = new TextDecoder();
                    var buffer = '';
                    var full = '';
                    function pump() {
                        return r.read().then(function (result) {
                            if (result.done) return;
                            buffer += decoder.decode(result.value, { stream: true });
                            var lines = buffer.split('\n');
                            buffer = lines.pop();
                            lines.forEach(function (line) {
                                if (line.indexOf('data: ') !== 0) return;
                                try {
                                    var data = JSON.parse(line.slice(6));
                                    if (data.lead) showLeadForm();
                                    if (data.text) {
                                        full += data.text;
                                        typing.view.innerHTML = renderMarkdown(full);
                                        msgsEl.scrollTop = msgsEl.scrollHeight;
                                    }
                                } catch (e) { /* chunk parcial */ }
                            });
                            return pump();
                        });
                    }
                    return pump();
                }).then(function () {
                    typing.wrap.classList.remove('qzap-typing');
                }).catch(function (err) {
                    typing.wrap.remove();
                    addMsg('Falha ao enviar. Tente novamente.', 'qzap-ai', senderLabel('model'));
                    console.warn('[QZap]', err.message);
                }).finally(function () {
                    sendBtn.disabled = false;
                    inputEl.focus();
                });
            };
            reader.readAsDataURL(audio.blob);
        }

        function send(message) {
            if (!message) return;
            addMsg(message, 'qzap-user');
            inputEl.value = '';
            sendBtn.disabled = true;
            var typing = addMsg('Pensando...', 'qzap-ai', senderLabel('model'));
            typing.wrap.classList.add('qzap-typing');

            postChat({ slug: slug, visitorId: visitorId, message: message }).then(function (res) {
                if (!res.ok) throw new Error('Servidor retornou ' + res.status);
                return res.body.getReader();
            }).then(function (reader) {
                var decoder = new TextDecoder();
                var buffer = '';
                var full = '';
                function pump() {
                    return reader.read().then(function (result) {
                        if (result.done) return;
                        buffer += decoder.decode(result.value, { stream: true });
                        var lines = buffer.split('\n');
                        buffer = lines.pop();
                        lines.forEach(function (line) {
                            if (line.indexOf('data: ') !== 0) return;
                            try {
                                var data = JSON.parse(line.slice(6));
                                if (data.lead) showLeadForm();
                                if (data.text) {
                                    full += data.text;
                                    typing.view.innerHTML = renderMarkdown(full);
                                    msgsEl.scrollTop = msgsEl.scrollHeight;
                                }
                            } catch (e) { /* chunk parcial */ }
                        });
                        return pump();
                    });
                }
                return pump();
            }).then(function () {
                typing.wrap.classList.remove('qzap-typing');
            }).catch(function (err) {
                typing.wrap.remove();
                addMsg('Falha ao enviar. Tente novamente.', 'qzap-ai', senderLabel('model'));
                console.warn('[QZap]', err.message);
            }).finally(function () {
                sendBtn.disabled = false;
                inputEl.focus();
            });
        }

        formEl.addEventListener('submit', function (e) {
            e.preventDefault();
            send(inputEl.value.trim());
        });
        inputEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inputEl.value.trim()); }
        });

        // Identificação → Lead (transbordo para humano)
        function showLeadForm() {
            if (chatEl.querySelector('.qzap-lead')) return;
            var leadEl = document.createElement('div');
            leadEl.className = 'qzap-lead bg-body-tertiary border-top px-3 py-3 d-flex flex-column gap-2';
            leadEl.innerHTML =
                '<small class="text-body-secondary">Para nossa equipe entrar em contato, informe seus dados:</small>' +
                '<input class="form-control" type="text" placeholder="Seu nome" autocomplete="name">' +
                '<input class="form-control" type="email" placeholder="Seu e-mail" autocomplete="email">' +
                '<button class="btn btn-primary" type="button">Encaminhar para a equipe</button>';
            chatEl.insertBefore(leadEl, formEl);
            humanBtn.style.display = 'none';

            leadEl.querySelector('button').addEventListener('click', function () {
                var name = leadEl.querySelector('input').value.trim();
                var email = leadEl.querySelector('input[type=email]').value.trim();
                if (!name) return;
                var btn = leadEl.querySelector('button');
                btn.disabled = true;
                api('/api/qzap/lead', {
                    method: 'POST',
                    body: JSON.stringify({ slug: slug, visitorId: visitorId, name: name, email: email })
                }).then(function (res) {
                    return res.json();
                }).then(function (data) {
                    if (data.success) {
                        addMsg('✅ Encaminhamos seu caso para nossa equipe. Entraremos em contato em breve!', 'qzap-ai', senderLabel('model'));
                        leadEl.remove();
                    } else {
                        throw new Error(data.error || 'Falha');
                    }
                }).catch(function (err) {
                    btn.disabled = false;
                    addMsg('Falha ao encaminhar: ' + err.message, 'qzap-ai', senderLabel('model'));
                });
            });
        }

        humanBtn.addEventListener('click', showLeadForm);

        // Histórico
        api('/api/qzap/history/' + slug + '/' + visitorId).then(function (res) {
            return res.json();
        }).then(function (data) {
            (data.messages || []).forEach(function (m) {
                addMsg(m.text, m.role === 'user' ? 'qzap-user' : 'qzap-ai', senderLabel(m.role));
            });
            if (data.status === 'humano') showLeadForm();
        }).catch(function (e) {
            console.warn('[QZap] Sem histórico:', e.message);
        });

        // SSE: respostas do atendente chegam em tempo real
        var es = new EventSource(apiBase + '/api/qzap/stream/' + slug + '/' + visitorId);
        es.addEventListener('message', function (e) {
            try {
                var data = JSON.parse(e.data);
                if (data.role === 'atendente' && data.text) {
                    addMsg(data.text, 'qzap-ai', senderLabel('atendente'));
                }
            } catch (err) { /* ignore */ }
        });
        es.onerror = function () {
            es.close();
            setTimeout(function () {
                try { es = new EventSource(apiBase + '/api/qzap/stream/' + slug + '/' + visitorId); } catch (err) { /* ignore */ }
            }, 15000);
        };
    }

    if (container) renderChat(container);
    else renderBubble();
})();
