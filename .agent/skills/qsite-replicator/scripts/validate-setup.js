#!/usr/bin/env node

/**
 * QSITE Replicator - Setup Validator
 * Valida se a configuração do projeto está completa antes do deploy
 * 
 * Uso: node validate-setup.js
 */

const fs = require('fs-extra');
const path = require('path');

let errors = [];
let warnings = [];
let success = [];

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        success.push(`✅ ${description}`);
        return true;
    } else {
        errors.push(`❌ ${description} - Arquivo não encontrado: ${filePath}`);
        return false;
    }
}

function checkEnvVar(varName, description) {
    require('dotenv').config();
    if (process.env[varName]) {
        success.push(`✅ ${description} (${varName})`);
        return true;
    } else {
        errors.push(`❌ ${description} - Variável ${varName} não definida no .env`);
        return false;
    }
}

function checkConfig(key, description, required = true) {
    const configPath = path.join(process.cwd(), 'site.config.json');
    const config = fs.readJsonSync(configPath);

    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
        value = value?.[k];
    }

    if (value !== undefined && value !== '' && value !== null) {
        success.push(`✅ ${description} (${key})`);
        return true;
    } else {
        if (required) {
            errors.push(`❌ ${description} - Campo ${key} ausente ou vazio`);
        } else {
            warnings.push(`⚠️ ${description} - Campo ${key} está vazio (opcional)`);
        }
        return false;
    }
}

console.log('\n🔍 QSITE Replicator - Validação de Setup\n');

// 1. Arquivos Essenciais
console.log('📁 Validando arquivos essenciais...\n');
checkFile('site.config.json', 'Configuração principal');
checkFile('.env', 'Variáveis de ambiente');
checkFile('package.json', 'Package.json');
checkFile('README.md', 'README');

// 2. Configuração site.config.json
console.log('\n⚙️ Validando site.config.json...\n');
checkConfig('site_title', 'Título do site');
checkConfig('slug', 'Slug do projeto');
checkConfig('domain', 'Domínio');
checkConfig('contact_email', 'E-mail de contato');

// Verificar se não é localhost em produção
const config = fs.readJsonSync('site.config.json');
if (config.domain && config.domain.includes('localhost')) {
    warnings.push('⚠️ Domínio configurado como localhost - deploys para FTP serão bloqueados');
}

// 3. Variáveis de Ambiente
console.log('\n🔐 Validando variáveis de ambiente (.env)...\n');
checkEnvVar('QSITE_SECRET', 'Token de segurança');

// 4. Estruturas de Diretórios
console.log('\n📂 Validando estrutura de diretórios...\n');

const features = config.features || {};

if (features.site !== false) {
    checkFile('src/site', 'Diretório do Site Core');
    checkFile('src/site/templates', 'Templates do Site');
    checkFile('src/site/assets', 'Assets do Site');
}

if (features.blog) {
    checkFile('src/blog', 'Diretório do Blog');
}

if (features.podcast) {
    checkFile('src/podcast', 'Diretório do Podcast');
}

if (features.bios) {
    checkFile('src/bios', 'Diretório de Bios');
}

// 5. Assets da Marca
console.log('\n🎨 Validando assets da marca...\n');

const logoExists = fs.existsSync('src/site/assets/img/logo.svg') || fs.existsSync('src/site/assets/img/logo.png');
if (logoExists) {
    success.push('✅ Logo da marca');
} else {
    warnings.push('⚠️ Logo não encontrado - Adicione logo.svg ou logo.png em src/site/assets/img/');
}

const faviconExists = fs.existsSync('src/site/assets/img/favicon.png') || fs.existsSync('src/site/assets/img/favicon.ico');
if (faviconExists) {
    success.push('✅ Favicon');
} else {
    warnings.push('⚠️ Favicon não encontrado - Adicione favicon.png em src/site/assets/img/');
}

// 6. Workflows GitHub Actions
console.log('\n🚀 Validando GitHub Actions workflows...\n');
checkFile('.github/workflows/deploy-site.yml', 'Workflow Deploy Site');

if (features.blog) {
    checkFile('.github/workflows/deploy-blog.yml', 'Workflow Deploy Blog');
}

if (features.podcast) {
    checkFile('.github/workflows/deploy-podcast.yml', 'Workflow Deploy Podcast');
}

if (features.bios) {
    checkFile('.github/workflows/deploy-bio.yml', 'Workflow Deploy Bios');
}

// 7. Scripts Google
console.log('\n📊 Verificando scripts Google Apps Script...\n');
checkFile('QSITE_SHEET_LEADS.gs', 'Script Gateway Leads');

// 8. Prompts da GEM
console.log('\n🤖 Verificando prompts da GEM...\n');
checkFile('PROMPT_GERAL_GEM_CLIENT.md', 'Prompt Geral da GEM');

if (features.bios) {
    checkFile('PROMPT_BIO_BUILDER.md', 'Prompt Builder de Bios');
}

// Verificar se o slug foi atualizado no prompt
const promptPath = 'PROMPT_GERAL_GEM_CLIENT.md';
if (fs.existsSync(promptPath)) {
    const promptContent = fs.readFileSync(promptPath, 'utf-8');
    if (promptContent.includes('{{SLUG_CLIENTE}}')) {
        warnings.push('⚠️ PROMPT_GERAL_GEM_CLIENT.md ainda contém placeholder {{SLUG_CLIENTE}} - Atualize com o slug real');
    }
}

// 9. Conteúdo Inicial
console.log('\n📝 Verificando conteúdo inicial...\n');

if (features.site !== false) {
    const contentDir = 'src/site/content';
    if (fs.existsSync(contentDir)) {
        const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
        if (files.length > 0) {
            success.push(`✅ ${files.length} página(s) no Site Core`);
        } else {
            warnings.push('⚠️ Nenhum conteúdo encontrado em src/site/content/ - Gere com a GEM');
        }
    }
}

if (features.blog) {
    const blogDir = 'src/blog/content';
    if (fs.existsSync(blogDir)) {
        const posts = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
        if (posts.length > 0) {
            success.push(`✅ ${posts.length} post(s) no Blog`);
        } else {
            warnings.push('⚠️ Nenhum post encontrado em src/blog/content/ - Publique via formulário');
        }
    }
}

// Relatório Final
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO DE VALIDAÇÃO');
console.log('='.repeat(60) + '\n');

if (success.length > 0) {
    console.log('✅ VALIDAÇÕES BEM-SUCEDIDAS:\n');
    success.forEach(s => console.log(s));
}

if (warnings.length > 0) {
    console.log('\n⚠️ AVISOS (Opcional, mas recomendado):\n');
    warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
    console.log('\n❌ ERROS CRÍTICOS (Devem ser corrigidos):\n');
    errors.forEach(e => console.log(e));
    console.log('\n🚫 Setup incompleto! Corrija os erros antes de fazer deploy.\n');
    process.exit(1);
} else {
    console.log('\n✅ Setup validado com sucesso! Projeto pronto para build e deploy.\n');
    console.log('💡 Próximos passos:');
    console.log('   1. npm run build:all');
    console.log('   2. git add . && git commit -m "Initial setup"');
    console.log('   3. git push origin main');
    console.log('   4. Monitore GitHub Actions para confirmar deploy\n');
    process.exit(0);
}
