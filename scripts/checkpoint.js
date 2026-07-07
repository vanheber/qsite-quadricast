#!/usr/bin/env node

/**
 * QSITE Checkpoint System
 * Gerencia branches temporários em múltiplos repositórios do ecossistema.
 * 
 * Uso:
 *   node scripts/checkpoint.js save <nome>
 *   node scripts/checkpoint.js load <nome>
 *   node scripts/checkpoint.js list
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Configuração dos repositórios
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const REPOS = ['qsite', 'qsite-core', 'qmind', 'pivdigital'];

function runGit(repoPath, command) {
    try {
        return execSync(`git ${command}`, { cwd: repoPath, encoding: 'utf8' }).trim();
    } catch (error) {
        return null;
    }
}

function isDirty(repoPath) {
    const status = runGit(repoPath, 'status --porcelain');
    return status && status.length > 0;
}

function saveCheckpoint(name) {
    log(`\n🚀 Criando Checkpoint: ${name}\n`, 'bright');

    REPOS.forEach(repo => {
        const repoPath = path.join(ROOT_DIR, repo);
        if (!fs.existsSync(repoPath)) {
            log(`[${repo}] ⚠ Pasta não encontrada. Pulando...`, 'yellow');
            return;
        }

        log(`[${repo}] Processando...`, 'blue');

        // Se estiver sujo, faz um commit temporário
        if (isDirty(repoPath)) {
            log(`  • Repositório sujo. Criando commit de segurança...`, 'yellow');
            runGit(repoPath, 'add .');
            runGit(repoPath, `commit -m "Checkpoint: ${name} (auto-commit)"`);
        }

        // Cria ou muda para o branch
        const branches = runGit(repoPath, 'branch');
        if (branches.includes(name)) {
            log(`  • Mudando para branch existente: ${name}`, 'cyan');
            runGit(repoPath, `checkout ${name}`);
        } else {
            log(`  • Criando novo branch: ${name}`, 'green');
            runGit(repoPath, `checkout -b ${name}`);
        }
    });

    log('\n✅ Checkpoint salvo com sucesso em todos os repositórios!\n', 'green');
}

function loadCheckpoint(name) {
    log(`\n📥 Carregando Checkpoint: ${name}\n`, 'bright');

    REPOS.forEach(repo => {
        const repoPath = path.join(ROOT_DIR, repo);
        if (!fs.existsSync(repoPath)) return;

        log(`[${repo}] Trocando para ${name}...`, 'blue');
        
        const result = runGit(repoPath, `checkout ${name}`);
        if (result === null) {
            log(`  ❌ Falha ao carregar branch ${name}. Ele existe?`, 'red');
        } else {
            log(`  ✓ Concluído`, 'green');
        }
    });

    log('\n✨ Workspace sincronizada!\n', 'green');
}

function listCheckpoints() {
    log('\n📋 Status da Workspace:\n', 'bright');

    REPOS.forEach(repo => {
        const repoPath = path.join(ROOT_DIR, repo);
        if (!fs.existsSync(repoPath)) {
            log(`${repo.padEnd(12)}: [NÃO ENCONTRADO]`, 'red');
            return;
        }

        const currentBranch = runGit(repoPath, 'rev-parse --abbrev-ref HEAD');
        const status = isDirty(repoPath) ? '(SUJO)' : '(LIMPO)';
        const color = isDirty(repoPath) ? 'yellow' : 'green';

        log(`${repo.padEnd(12)}: branch ${colors.cyan}${currentBranch.padEnd(20)}${colors.reset} ${status}`, color);
    });
    console.log('');
}

// CLI Routing
const [cmd, arg] = process.argv.slice(2);

switch (cmd) {
    case 'save':
        if (!arg) {
            log('Erro: Nome do checkpoint é obrigatório. Ex: node scripts/checkpoint.js save meu-backup', 'red');
            process.exit(1);
        }
        saveCheckpoint(arg);
        break;
    case 'load':
        if (!arg) {
            log('Erro: Nome do checkpoint é obrigatório.', 'red');
            process.exit(1);
        }
        loadCheckpoint(arg);
        break;
    case 'list':
        listCheckpoints();
        break;
    default:
        log('Uso:', 'bright');
        log('  node scripts/checkpoint.js save <nome>');
        log('  node scripts/checkpoint.js load <nome>');
        log('  node scripts/checkpoint.js list');
}
