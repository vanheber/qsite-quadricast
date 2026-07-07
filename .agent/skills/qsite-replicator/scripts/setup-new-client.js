#!/usr/bin/env node

/**
 * QSITE Replicator - Setup Wizard
 * Script interativo para configurar um novo projeto QSITE para cliente
 * 
 * Uso: node setup-new-client.js
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n🚀 QSITE Replicator - Setup Wizard\n');
    console.log('Este wizard irá configurar o projeto para um novo cliente.\n');

    // Coleta de informações
    const clientName = await question('Nome do Cliente (ex: ACME Corp): ');
    const slug = await question('Slug do Projeto (ex: acme-corp): ');
    const domain = await question('Domínio (ex: acmecorp.com.br): ');
    const contactEmail = await question('E-mail de Contato: ');

    console.log('\n📱 Redes Sociais (deixe em branco para pular):');
    const instagram = await question('Instagram (URL completo): ');
    const linkedin = await question('LinkedIn (URL completo): ');
    const facebook = await question('Facebook (URL completo): ');

    console.log('\n🎛️ Módulos a Ativar:');
    const enableSite = (await question('Site Core (landing page)? (s/N): ')).toLowerCase() === 's';
    const enableBlog = (await question('Blog? (S/n): ')).toLowerCase() !== 'n';
    const enablePodcast = (await question('Podcast? (s/N): ')).toLowerCase() === 's';
    const enableBios = (await question('Bios (perfis de equipe)? (s/N): ')).toLowerCase() === 's';

    // Podcast config (se ativo)
    let podcastConfig = {
        title: '',
        author: '',
        summary: '',
        category: 'Business',
        explicit: 'no',
        language: 'pt-br'
    };

    if (enablePodcast) {
        console.log('\n🎙️ Configuração do Podcast:');
        podcastConfig.title = await question('Título do Podcast: ');
        podcastConfig.author = await question('Autor/Host: ');
        podcastConfig.summary = await question('Descrição breve: ');
        podcastConfig.category = await question('Categoria (padrão: Business): ') || 'Business';
    }

    rl.close();

    // Gerar configuração
    const config = {
        site_title: clientName,
        slug: slug,
        domain: `https://${domain}`,
        _last_deploy: new Date().toISOString().split('T')[0] + '_InitialSetup',
        base_url: '',
        features: {
            site: enableSite,
            blog: enableBlog,
            podcast: enablePodcast,
            bios: enableBios
        },
        social: {
            instagram: instagram || '',
            twitter: '',
            linkedin: linkedin || '',
            discord: '',
            facebook: facebook || '',
            tiktok: ''
        },
        contact_email: contactEmail,
        podcast: podcastConfig
    };

    // Salvar site.config.json
    const configPath = path.join(process.cwd(), 'site.config.json');
    fs.writeJsonSync(configPath, config, { spaces: 4 });
    console.log('\n✅ site.config.json criado com sucesso!');

    // Criar .env template
    const envContent = `# QSITE Environment Variables - ${clientName}
# NÃO COMMITAR ESTE ARQUIVO!

# Token de segurança para upload de áudio (gere um token aleatório)
QSITE_SECRET=
`;

    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env criado! IMPORTANTE: Preencha as variáveis antes de buildar.');
    }

    // Criar estrutura de diretórios do cliente
    const srcDir = path.join(process.cwd(), 'src');

    if (enableSite) {
        fs.ensureDirSync(path.join(srcDir, 'site/content'));
        const localAssetsDir = path.join(srcDir, 'site/assets');
        fs.ensureDirSync(localAssetsDir);
        fs.ensureDirSync(path.join(localAssetsDir, 'img'));
        
        // Copiar assets padrão do template se estiverem ausentes localmente
        const templateAssetsDir = path.resolve(process.cwd(), '../qsite/src/site/assets');
        if (fs.existsSync(templateAssetsDir)) {
            const copyDirIfNew = (src, dest) => {
                fs.ensureDirSync(dest);
                const items = fs.readdirSync(src);
                for (const item of items) {
                    const srcItem = path.join(src, item);
                    const destItem = path.join(dest, item);
                    const stats = fs.statSync(srcItem);
                    if (stats.isDirectory()) {
                        copyDirIfNew(srcItem, destItem);
                    } else {
                        if (!fs.existsSync(destItem)) {
                            fs.copySync(srcItem, destItem);
                        }
                    }
                }
            };
            copyDirIfNew(templateAssetsDir, localAssetsDir);
            console.log('✅ Imagens e logos de exemplo copiados do template');
        }
        console.log('✅ Estrutura do Site Core criada');
    }

    if (enableBlog) {
        fs.ensureDirSync(path.join(srcDir, 'blog/content'));
        console.log('✅ Estrutura do Blog criada');
    }

    if (enablePodcast) {
        fs.ensureDirSync(path.join(srcDir, 'podcast/content'));
        console.log('✅ Estrutura do Podcast criada');
    }

    if (enableBios) {
        fs.ensureDirSync(path.join(srcDir, 'bios'));
        console.log('✅ Estrutura de Bios criada');
    }

    // Gerar checklist
    console.log('\n📋 PRÓXIMOS PASSOS:\n');
    console.log('[ ] 1. Preencha as variáveis no arquivo .env');
    console.log('[ ] 2. Configure GitHub Secrets no repositório');
    console.log('[ ] 3. Configure os Formulários do Google (Publicação + Exclusão)');
    console.log('[ ] 4. Configure o Gateway de Leads na planilha');
    console.log('[ ] 5. Adicione o cliente na Planilha de Permissões');
    console.log('[ ] 6. Configure acesso à GEM personalizada do cliente');
    console.log('[ ] 7. Customize identidade visual em src/site/assets/css/theme.css');
    console.log('[ ] 8. Adicione logo e favicon em src/site/assets/img/');
    console.log('[ ] 9. Gere conteúdo inicial com a GEM');
    console.log('[ ] 10. Execute: npm run build:all');
    console.log('[ ] 11. Commit e push para GitHub');
    console.log('[ ] 12. Verifique deploy automático no GitHub Actions');
    console.log('\n🎯 Para detalhes completos, consulte: .agent/skills/qsite-replicator/SKILL.md\n');

    // Salvar checklist em arquivo
    const checklistContent = `# Checklist de Setup - ${clientName}
Projeto: ${slug}
Domínio: ${domain}
Data: ${new Date().toLocaleDateString('pt-BR')}

## Configuração Inicial
- [ ] site.config.json configurado
- [ ] .env preenchido com todas as variáveis
- [ ] Repositório GitHub criado e clonado

## GitHub
- [ ] Secret: FTP_SERVER
- [ ] Secret: FTP_USERNAME
- [ ] Secret: FTP_PASSWORD
- [ ] Secret: FTP_SERVER_DIR

- [ ] Secret: QSITE_SECRET

## Google Ecosystem
- [ ] Cliente adicionado na Planilha de Permissões
- [ ] Formulário de Publicação criado
- [ ] Apps Script do Form de Publicação configurado
- [ ] Trigger onFormSubmit do Form de Publicação ativo
- [ ] Formulário de Exclusão criado
- [ ] Apps Script do Form de Exclusão configurado
- [ ] Trigger onFormSubmit do Form de Exclusão ativo
- [ ] Domínio cadastrado em Emails_Autorizados (Gateway Leads)
- [ ] Cloudflare Turnstile configurado

## GEM (AI)
- [ ] Acesso à GEM personalizada do cliente
- [ ] PROMPT_GERAL_GEM_CLIENT.md atualizado com slug do cliente
- [ ] Base de conhecimento do cliente anexada

## Identidade Visual
- [ ] theme.css customizado com cores da marca
- [ ] Logo adicionado (logo.svg ou logo.png)
- [ ] Favicon adicionado (favicon.png)
- [ ] Imagem OG adicionada (og-image.jpg)
- [ ] Fontes personalizadas configuradas (se aplicável)

## Conteúdo Inicial
- [ ] Landing page criada (se site ativo)
- [ ] Página "Sobre" criada
- [ ] Pelo menos 1 artigo de blog publicado (se blog ativo)
- [ ] Pelo menos 1 episódio de podcast publicado (se podcast ativo)

## Build e Deploy
- [ ] Build local executado com sucesso (npm run build:all)
- [ ] Teste local no MAMP (se aplicável)
- [ ] Primeiro commit e push realizados
- [ ] GitHub Actions executou sem erros
- [ ] Site acessível no domínio final

## Testes de Integração
- [ ] Formulário de contato testado
- [ ] Lead recebido na planilha
- [ ] E-mail de notificação enviado ao cliente
- [ ] Publicação via Form testada
- [ ] Exclusão via Form testada

## SEO e Analytics
- [ ] Meta tags verificadas
- [ ] sitemap.xml gerado
- [ ] robots.txt configurado
- [ ] Google Analytics/Tag Manager instalado (se solicitado)
- [ ] SSL/HTTPS ativo e funcional

## Entrega ao Cliente
- [ ] Credenciais documentadas
- [ ] Links dos formulários fornecidos
- [ ] Acesso à planilha de Leads configurado
- [ ] Treinamento básico realizado
- [ ] Documentação de manutenção entregue

---
Status: 🟡 Em Progresso
Responsável: [SEU_NOME]
`;

    const checklistPath = path.join(process.cwd(), `CHECKLIST_SETUP_${slug}.md`);
    fs.writeFileSync(checklistPath, checklistContent);
    console.log(`✅ Checklist salvo em: CHECKLIST_SETUP_${slug}.md\n`);
}

main().catch(err => {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
});
