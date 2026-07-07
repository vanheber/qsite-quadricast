/* QSITE Forms Handler v3 — WhatsApp Lead Redundancy */
document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('.js-ajax-form');

    forms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // 1. Feedback Visual
            var btn = form.querySelector('button[type="submit"]');
            var originalText = 'Enviar';
            if (btn) {
                originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Enviando...';
            }

            // 2. Coleta de Dados como Objeto
            var formData = new FormData(form);
            var payload = {};
            formData.forEach(function (value, key) {
                payload[key] = value;
            });
            payload.dominio = window.location.hostname;
            payload.timestamp = new Date().toISOString();

            // 3. Define Tipo de Formulário
            if (!payload.tipo_form) {
                var formId = form.id || '';
                payload.tipo_form = formId.indexOf('newsletter') !== -1 ? 'Newsletter' : 'Contato';
            }

            // 4. Resolve Endpoint
            var endpoint = form.dataset.action || form.getAttribute('action');
            if (!endpoint) {
                console.error('QSITE Forms: Nenhum endpoint configurado. Use data-action="URL" no <form>.');
                alert('Erro de configuração no formulário.');
                if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
                return;
            }

            // 5. Resolve URL de redirecionamento
            var baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.base_url) || '/';
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
            var redirectUrl = baseUrl + '/obrigado';

            // 6. Envio (JSON com CORS para ler a resposta WhatsApp)
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('Erro HTTP ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    // [WHATSAPP REDUNDANCY] Abre WhatsApp automaticamente antes de redirecionar
                    if (data.whatsapp_url) {
                        window.open(data.whatsapp_url, '_blank');
                    }
                    // Redireciona após breve delay (permite o popup do WhatsApp abrir)
                    setTimeout(function () {
                        window.location.href = redirectUrl;
                    }, data.whatsapp_url ? 800 : 0);
                })
                .catch(function (error) {
                    console.warn('QSITE Forms: Fallback ativo —', error.message);
                    // Fallback: mesmo se a resposta falhar, redireciona (o lead pode ter sido salvo)
                    window.location.href = redirectUrl;
                })
                .finally(function () {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }
                });
        });
    });
});