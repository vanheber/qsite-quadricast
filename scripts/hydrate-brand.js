const fs = require('fs');
const path = require('path');

/**
 * PIVdigital Hydrator for QSITE
 * Lê um manual de identidade visual (.md) e injeta no projeto.
 */

const ROOT_DIR = process.cwd();
const CONFIG_PATH = path.join(ROOT_DIR, 'site.config.json');
const CSS_PATH = path.join(ROOT_DIR, 'src', 'site', 'assets', 'css', 'theme.css');

function hydrate() {
    console.log('🚀 Iniciando Hidratação de Marca (PIVdigital -> QSITE)...');

    // 1. Localizar o arquivo .md de identidade
    const files = fs.readdirSync(ROOT_DIR);
    const brandFile = files.find(f => f.endsWith('-identidade-visual.md'));

    if (!brandFile) {
        console.error('❌ Erro: Nenhum arquivo [slug]-identidade-visual.md encontrado na raiz.');
        console.log('💡 Dica: Exporte seu manual do PIVdigital e salve-o na raiz do projeto.');
        process.exit(1);
    }

    console.log(`📖 Lendo manual: ${brandFile}`);
    const content = fs.readFileSync(path.join(ROOT_DIR, brandFile), 'utf8');

    // 2. Extrair Cores (Regex para - key: #hex)
    const colorMatches = content.matchAll(/- (\w+): (#[\dA-Fa-f]{3,6})/g);
    const colors = {};
    for (const match of colorMatches) {
        colors[match[1]] = match[2];
    }

    // 3. Extrair Fontes
    const titleMatch = content.match(/### Títulos\nFamília: (.*)/);
    const bodyMatch = content.match(/### Texto\nFamília: (.*)/);
    const titleUrlMatch = content.match(/- \[Página da fonte título\]\((.*)\)/);
    const bodyUrlMatch = content.match(/- \[Página da fonte texto\]\((.*)\)/);

    const typography = {
        headings: {
            family: titleMatch ? titleMatch[1].trim() : 'sans-serif',
            url: titleUrlMatch ? titleUrlMatch[1].trim().replace('specimen', 'css2') + ':wght@400;700&display=swap' : null
        },
        body: {
            family: bodyMatch ? bodyMatch[1].trim() : 'serif',
            url: bodyUrlMatch ? bodyUrlMatch[1].trim().replace('specimen', 'css2') + ':ital,wght@0,400;0,700;1,400&display=swap' : null
        }
    };

    // 4. Atualizar site.config.json
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    config.brand = config.brand || {};
    config.brand.colors = { ...config.brand.colors, ...colors };
    config.brand.typography = typography;
    
    // Garantir que temos settings
    config.brand.settings = config.brand.settings || { border_radius: '0.5rem' };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));
    console.log('✅ site.config.json atualizado.');

    // 5. Atualizar theme.css
    let cssContent = fs.readFileSync(CSS_PATH, 'utf8');
    
    // Gerar Bloco :root dinâmico
    let rootBlock = ':root {\n';
    rootBlock += '    /* 1. CORES DA MARCA */\n';
    Object.entries(config.brand.colors).forEach(([name, hex]) => {
        rootBlock += `    --bs-${name}: ${hex};\n`;
    });
    
    rootBlock += '\n    /* 2. TIPOGRAFIA */\n';
    rootBlock += `    --bs-body-font-family: '${typography.body.family}', serif;\n`;
    rootBlock += `    --bs-headings-font-family: '${typography.headings.family}', sans-serif;\n`;
    
    rootBlock += '\n    /* 3. FORMAS E BORDAS */\n';
    rootBlock += `    --bs-border-radius: ${config.brand.settings.border_radius};\n`;
    rootBlock += `    --bs-border-radius-lg: calc(${config.brand.settings.border_radius} * 1.5);\n`;
    rootBlock += `    --bs-border-radius-sm: calc(${config.brand.settings.border_radius} * 0.5);\n`;
    
    rootBlock += '\n    /* 4. SOMBRAS E EFEITOS */\n';
    rootBlock += '    --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);\n';
    rootBlock += '    --q-glass-bg: rgba(255, 255, 255, 0.7);\n';
    rootBlock += '    --q-glass-blur: blur(10px);\n';
    rootBlock += '}';

    // Substituir o bloco :root antigo
    cssContent = cssContent.replace(/:root\s*{[\s\S]*?}/, rootBlock);

    // Adicionar imports de fontes se existirem
    let fontImports = '';
    if (typography.headings.url) fontImports += `@import url('${typography.headings.url}');\n`;
    if (typography.body.url) fontImports += `@import url('${typography.body.url}');\n`;

    // Limpar imports antigos e adicionar novos no topo
    cssContent = cssContent.replace(/@import url\(.*?\);\n/g, '');
    cssContent = fontImports + '\n' + cssContent;

    fs.writeFileSync(CSS_PATH, cssContent);
    console.log('✅ src/site/assets/css/theme.css atualizado.');

    console.log('✨ Hidratação finalizada com sucesso! Execute npm run build:all para aplicar.');
}

hydrate();
