<?php
/* ============================================================
   CONFIGURAÇÃO DA AGENDA QUADRICAST (modelo)
   Copie para config.php no servidor. O config.php NÃO vai para o Git.
   Preencha só o que estiver marcado com [PREENCHER].
   O que não estiver aqui usa o padrão (estúdios, horários, regras).
   ============================================================ */
return [
    // QG (Perfex): endereço e token da API  [PREENCHER]
    'qg_url'   => 'https://qg.agenciaquadri.com',
    'qg_token' => '',

    // No QG: origem, status e responsável do lead
    'qg_source'   => 3,   // Contato
    'qg_status'   => 2,   // Prospecção
    'qg_assigned' => 16,  // Carolina Rodrigues
    'qg_projeto'  => 1,   // 1 = abre o projeto do mês e cria as tarefas

    // E-mail que recebe cada pedido
    'email' => 'carolina@agenciaquadri.com',

    // WhatsApp da Carolina (botão da página)
    'whatsapp' => '5515997862901',

    // WhatsApp automático  [PREENCHER quando houver a ferramenta]
    'wa_provedor' => '',          // evolution | zapi | webhook
    'wa_url'      => '',
    'wa_token'    => '',
    'wa_equipe'   => '5515997862901', // números da equipe que recebem o aviso, separados por vírgula

    // Agendas do Google: endereços SECRETOS de leitura (não compartilhe este arquivo).
    // As agendas continuam privadas; a API só lê os horários.
    'ics_secretos' => [
        'c_527880df511700ecb25f0a26be363f8203fecb5fa3b7738c3f28497a869fdb64@group.calendar.google.com' => 'private-COLE_AQUI', // QuadriSpace
        'c_bf936130ce3e7f6007b16ab4aa6be84897048e4e920bbe2a3beb67f397ca609b@group.calendar.google.com' => 'private-COLE_AQUI', // Quadricast Podcast
        'c_f3252ed9c1f4defc90f1fa9b64d112851b8fb54c65a4a8bd2ab5b5a334e115d3@group.calendar.google.com' => 'private-COLE_AQUI', // Aulas/Lives
        'c_d70f0bdde7fa5744101f003b35b3b7c86ca8efecf5d5ca2b87cba7fe87ca4ab5@group.calendar.google.com' => 'private-COLE_AQUI', // Sala Lareira
        'c_3e432a66107dc7866fda8f4299b1ae286ab90171d0059d565a30af15a7a78786@group.calendar.google.com' => 'private-COLE_AQUI', // Sala Vitrine
        'c_8d480376692d218f9ffe6df2470c3f99abf5d7a6c23d884fd5b1b7c2a424af1a@group.calendar.google.com' => 'private-COLE_AQUI', // Externas
        'c_1c0e6999505f7440a8971aa8142fac88257e25ad10ff597d03365f790fed9dd3@group.calendar.google.com' => 'private-COLE_AQUI', // Cozinha do Space
        'c_64edf745076fb7cb62cef7b8e1d45c61421150e6a66e6024f571c241727a2f36@group.calendar.google.com' => 'private-COLE_AQUI', // Cozinha da Pri
        'c_97905d94936754b470e5898e90fae6c39ca2d71b2656040cdbda26be773936f5@group.calendar.google.com' => 'private-COLE_AQUI', // Cruzeiro
        'c_4022618cef92227746d8a1bca43e29b7deaf1b8b0e086bd1579c2d780f5b2965@group.calendar.google.com' => 'private-COLE_AQUI', // Equipe Reinaldo
        'c_1cef1be5dfb6de8d5db3843dcd391736936e53840e1069e8aebc4d9373e2c0d8@group.calendar.google.com' => 'private-COLE_AQUI', // Equipe Vicenzo
        'c_b3d77eb74e34093e83e3e9dfa70a0be2ee2c8c9ed9ffce36ed58a78418327430@group.calendar.google.com' => 'private-COLE_AQUI', // Equipe Felipe
        'c_61194ca01595ca3fbb3b4434ed055f85ad713b80f28a89e6c3834b791f379908@group.calendar.google.com' => 'private-COLE_AQUI', // Equipe Danillo
    ],

    // Endereços de site que podem usar esta API (separados por vírgula)
    'origens' => 'https://quadricast.com.br,https://www.quadricast.com.br,https://agenciaquadri.com,https://www.agenciaquadri.com',
];
