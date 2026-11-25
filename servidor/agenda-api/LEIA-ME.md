# API da agenda Quadricast

Servidor PHP (7.4+ com cURL) que a página `/agenda` usa para:

- `?r=/espacos`: lista dos estúdios;
- `?r=/disponibilidade&espaco=ID&duracao=120`: horários livres, lidos das agendas Google "QC | ..." (estúdios e equipe);
- `?r=/reserva` (POST): recebe o pedido, segura o horário por 48h, cria lead, projeto "CLIENTE - GRAVAÇÕES - MÊS ANO" e tarefas no QG (Perfex) e manda e-mail para a Carolina.

Esta pasta **não entra no build** do QSite2 e o deploy FTP do site (com `FTP_DELETE=true`) não deve apagá-la.
Por isso ela fica num endereço próprio, fora da pasta do site. Sugestão: `https://agenciaquadri.com/agenda-api/` ou um subdomínio no mesmo servidor do QG.

## Instalação

1. Suba o conteúdo desta pasta para o servidor PHP.
2. Copie `config.exemplo.php` para `config.php` e preencha:
   - `qg_token`: token da API do QG (Perfex › Configurações › API);
   - `ics_secretos`: endereços secretos das agendas Google (o Ed tem o arquivo `agenda-config-SECRETO.php` já preenchido no HD).
3. Dê permissão de escrita em `dados/`.
4. Teste: `https://ENDERECO/index.php?r=/espacos`.
5. No `dados.json` do site, preencha `agenda.api` com `https://ENDERECO/index.php?r=` e faça o build e o deploy.

Enquanto `agenda.api` estiver vazio, a página continua enviando o pedido pelo WhatsApp.
