#!/usr/bin/env node

/**
 * QSITE Intelligence Replicator
 * 
 * Orquestrador para criar novas instâncias de clientes integrando:
 * - Estratégia (Qmind)
 * - Identidade Visual (PIV Digital)
 * - Engine Estática (QSITE)
 */

const fs = require('fs-extra');
const path = require('path');

// Configurações Globais
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const TEMPLATE_DIR = path.resolve(__dirname, '..');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
    const args = process.argv.slice(2);
    const slug = args.find(a => !a.startsWith('--')) || '';

    if (!slug) {
        log('❌ Erro: Slug do cliente não fornecido.', 'red');
        log('Uso: node scripts/replicate.js <slug>', 'yellow');
        process.exit(1);
    }

    const targetDir = path.join(ROOT_DIR, `html-${slug}`);
    
    log(`\n🚀 Iniciando Replicação Nexus para: ${slug}\n`, 'bright');

    // 1. Descoberta de Contexto (Qmind)
    const strategyPath = path.join(ROOT_DIR, 'qmind', 'clients', slug, 'estrategia.md');
    let strategyFound = false;
    let clientEmail = 'contato@' + slug + '.com';
    
    if (fs.existsSync(strategyPath)) {
        strategyFound = true;
        log('🧠 Estratégia encontrada no Qmind!', 'green');
        const content = fs.readFileSync(strategyPath, 'utf8');
        
        // Simulação de "AI Parsing" (Regex para o padrão atual do usuário)
        const emailMatch = content.match(/\*\*Conta Gmail:\*\* (.*)/);
        if (emailMatch) clientEmail = emailMatch[1].trim();
    } else {
        log('⚠ Estratégia não encontrada no Qmind. Prosseguindo com dados genéricos.', 'yellow');
    }

    // 1.1 Sincronia de Ferramentas (QMIND Hub)
    const qmindConfigPath = path.join(ROOT_DIR, 'qmind', 'clients', slug, 'config.json');
    let qmindFeatures = null;
    if (fs.existsSync(qmindConfigPath)) {
        const qmindConfig = fs.readJsonSync(qmindConfigPath);
        if (qmindConfig.qsite && qmindConfig.qsite.tools) {
            log('🔗 Sincronizando ferramentas do Hub QMIND...', 'green');
            qmindFeatures = {
                site: qmindConfig.qsite.tools.landing,
                blog: qmindConfig.qsite.tools.blog,
                podcast: qmindConfig.qsite.tools.podcast,
                bios: qmindConfig.qsite.tools.bio
            };
        }
    }

    // 2. Descoberta de Identidade (PIV)
    const pivPaths = [
        path.join(ROOT_DIR, 'qmind', 'clients', slug, 'brand_config.json'),
        path.join(ROOT_DIR, `piv-${slug}`, 'brand_config.json'),
        path.join(ROOT_DIR, 'pivdigital', 'brand_config.json')
    ];

    let brandConfig = null;
    for (const p of pivPaths) {
        if (fs.existsSync(p)) {
            log(`🎨 Identidade Visual encontrada em: ${path.relative(ROOT_DIR, p)}`, 'green');
            brandConfig = fs.readJsonSync(p);
            break;
        }
    }

    // 3. Clonagem da Instância
    if (fs.existsSync(targetDir)) {
        log(`❌ Erro: O diretório ${path.basename(targetDir)} já existe.`, 'red');
        process.exit(1);
    }

    log(`📂 Clonando template para ${path.basename(targetDir)}...`, 'blue');
    fs.copySync(TEMPLATE_DIR, targetDir, {
        filter: (src) => !src.includes('node_modules') && !src.includes('.git') && !src.includes('.DS_Store')
    });

    // 4. Síntese do site.config.json
    log('⚙️  Sintetizando site.config.json...', 'blue');
    const configPath = path.join(targetDir, 'site.config.json');
    const config = fs.readJsonSync(configPath);

    config.slug = slug;
    config.site_title = brandConfig ? brandConfig.brandName : slug.toUpperCase();
    config.contact_email = clientEmail;
    config.strategy_source = strategyFound ? path.relative(targetDir, strategyPath) : null;
    
    if (brandConfig && brandConfig.theme) {
        config.brand = {
            colors: brandConfig.theme.colors,
            typography: brandConfig.theme.fonts,
            settings: { border_radius: "0.5rem" }
        };
    }

    if (qmindFeatures) {
        config.features = { ...config.features, ...qmindFeatures };
    }

    fs.writeJsonSync(configPath, config, { spaces: 4 });

    // 5. Setup de Segurança (.env)
    log('🔐 Configurando ambiente de segurança...', 'blue');
    const envContent = `# QSITE Environment - ${slug.toUpperCase()}

QSITE_SECRET=${Math.random().toString(36).substring(2, 15)}
`;
    fs.writeFileSync(path.join(targetDir, '.env'), envContent);

    log(`\n✅ Instância ${slug} criada com sucesso!`, 'green');
    log(`📍 Caminho: ${targetDir}`, 'cyan');
    log(`\nPróximos passos:`, 'bright');
    log(`1. cd ${path.relative(process.cwd(), targetDir)}`);
    log(`2. npm install`);
    log(`3. Preencha os secrets no .env (Napoleon + Workspace 2)`);
    log(`4. Execute o build para validar.`);
}

main().catch(err => {
    log(`\n❌ Erro fatal: ${err.message}`, 'red');
    process.exit(1);
});
