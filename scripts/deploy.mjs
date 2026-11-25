#!/usr/bin/env node
/**
 * qsite2 — deploy por FTP (lftp) do public/ (primeiro deploy e deploy local).
 * Modelo: o deploy do qsite2-ghost. Nome e URL vêm do site.json (slug, url) ou do .env (PROD_URL).
 *
 * Uso:
 *   npm run deploy          # publica public/ no host do .env
 *   npm run deploy:dry      # mostra o que mudaria (lftp --dry-run), sem enviar
 *   npm run deploy:check    # valida o .env e lista o pacote; não abre conexão
 *
 * Regras da instância: ZERO dependências npm. O upload usa o `lftp` do sistema
 * (brew install lftp / apt install lftp) e a senha vai por variável de ambiente
 * (LFTP_PASSWORD), nunca em argv nem em arquivo temporário.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const CHECK_ONLY = args.includes('--check');

// Artefatos de desenvolvimento que não vão ao ar.
const EXCLUDE = ['_audit.html', 'contrast-report.json'];

/* ── .env ───────────────────────────────────────────────────────────────── */
function loadEnv(file) {
  if (!fs.existsSync(file)) return null;
  const out = {};
  for (const linha of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const l = linha.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i < 1) continue;
    const chave = l.slice(0, i).trim();
    let valor = l.slice(i + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    out[chave] = valor;
  }
  return out;
}

let site = {};
try { site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8')); } catch {}
const NOME = 'qsite2-' + (site.slug || path.basename(ROOT).replace(/^qsite2-/, ''));

const envPath = path.join(ROOT, '.env');
const env = loadEnv(envPath);

if (!env) {
  falhar(
    'Arquivo .env não encontrado.',
    ['cp .env.example .env', '# edite FTP_HOST, FTP_USER e FTP_PASS', 'npm run deploy'],
  );
}

const cfg = {
  host: env.FTP_HOST || '',
  user: env.FTP_USER || '',
  pass: env.FTP_PASS || '',
  port: Number(env.FTP_PORT || 21),
  remote: env.FTP_PATH || '/',
  tls: String(env.FTP_TLS || '').toLowerCase() === 'true',
  del: String(env.FTP_DELETE || 'true').toLowerCase() !== 'false',
  local: path.resolve(ROOT, env.FTP_LOCAL || 'public'),
};

const faltando = [
  !cfg.host && 'FTP_HOST',
  !cfg.user && 'FTP_USER',
  !cfg.pass && 'FTP_PASS',
].filter(Boolean);
if (faltando.length) {
  falhar(
    `Faltam dados no .env: ${faltando.join(', ')}.`,
    ['Edite o .env (veja .env.example) e rode de novo.', 'Para conferir sem publicar: npm run deploy:check'],
  );
}

/* ── pacote local ───────────────────────────────────────────────────────── */
if (!fs.existsSync(path.join(cfg.local, 'index.html'))) {
  falhar('public/index.html não existe — o build ainda não foi feito.', ['npm run build', 'npm run deploy']);
}

function inventario(dir) {
  const itens = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (EXCLUDE.includes(e.name)) continue;
      if (e.isDirectory()) walk(p);
      else itens.push({ rel: path.relative(dir, p), size: fs.statSync(p).size });
    }
  })(dir);
  return itens;
}

const arquivos = inventario(cfg.local);
const bytes = arquivos.reduce((s, f) => s + f.size, 0);
const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';

// Aviso de build velho: alguma fonte mais nova que o index.html publicado?
const fontes = ['paginas', 'shell', 'tokens', 'dados.json', 'site.json'];
let maisNovo = 0;
for (const f of fontes) {
  const alvo = path.join(ROOT, f);
  if (!fs.existsSync(alvo)) continue;
  const stat = fs.statSync(alvo);
  if (stat.isDirectory()) {
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else maisNovo = Math.max(maisNovo, fs.statSync(p).mtimeMs);
      }
    })(alvo);
  } else maisNovo = Math.max(maisNovo, stat.mtimeMs);
}
const buildVelho = maisNovo > fs.statSync(path.join(cfg.local, 'index.html')).mtimeMs;

/* ── relatório ──────────────────────────────────────────────────────────── */
console.log('');
console.log(`  ${NOME} · deploy`);
console.log('  ' + '─'.repeat(52));
console.log(`  destino   ${cfg.host}:${cfg.port}${cfg.remote}  (usuário ${cfg.user})${cfg.tls ? '  · FTPS' : ''}`);
console.log(`  origem    ${path.relative(ROOT, cfg.local)}/  ·  ${arquivos.length} arquivos · ${mb(bytes)}`);
console.log(`  espelho   ${cfg.del ? 'apaga no servidor o que saiu do build' : 'envia sem apagar (FTP_DELETE=false)'}`);
console.log(`  exclusões ${EXCLUDE.join(', ')}`);
if (buildVelho) {
  console.log('');
  console.log('  ⚠  há fontes mais recentes que public/index.html — rode `npm run build` antes.');
}
console.log('');

if (CHECK_ONLY) {
  for (const f of arquivos.slice(0, 12)) console.log(`   · ${f.rel}  (${(f.size / 1024).toFixed(0)} kB)`);
  if (arquivos.length > 12) console.log(`   · … e mais ${arquivos.length - 12} arquivo(s)`);
  console.log('\n  ✓ configuração lida. Nada foi enviado (--check).');
  process.exit(0);
}

/* ── lftp ───────────────────────────────────────────────────────────────── */
const temLftp = spawnSync('which', ['lftp'], { encoding: 'utf8' });
if (temLftp.status !== 0) {
  falhar('lftp não encontrado no PATH.', [
    'macOS:  brew install lftp',
    'Debian: sudo apt install lftp',
    'Windows: use WSL ou Git Bash com lftp instalado',
  ]);
}

const script = [
  'set net:timeout 25',
  'set net:max-retries 3',
  'set net:reconnect-interval-base 3',
  'set net:reconnect-interval-max 15',
  'set ftp:use-mlsd true',
  'set ssl:verify-certificate no',
  cfg.tls ? 'set ftp:ssl-force true' : '',
  cfg.tls ? 'set ftp:ssl-protect-data true' : '',
  `open --env-password -u ${aspas(cfg.user)} -p ${cfg.port} ${aspas(cfg.host)}`,
  `cd ${aspas(cfg.remote)}`,
  [
    'mirror -R',
    cfg.del ? '--delete' : '',
    '--verbose',
    '--no-perms',
    '--parallel=4',
    '--exclude-glob _audit.html',
    '--exclude-glob contrast-report.json',
    DRY ? '--dry-run' : '',
    aspas(cfg.local),
    '.',
  ].filter(Boolean).join(' '),
  'bye',
].filter(Boolean).join('\n');

const tmp = path.join(os.tmpdir(), `qsite2-deploy-${process.pid}.lftp`);
fs.writeFileSync(tmp, script, { mode: 0o600 });

let codigo = 0;
try {
  const r = spawnSync('lftp', ['-f', tmp], { stdio: 'inherit', env: { ...process.env, LFTP_PASSWORD: cfg.pass } });
  codigo = r.status ?? 1;
} finally {
  try { fs.unlinkSync(tmp); } catch {}
}

if (codigo !== 0) {
  falhar(`lftp terminou com código ${codigo}.`, [
    'Confira host, usuário, senha e FTP_PATH no .env.',
    'Se o servidor exigir FTPS, use FTP_TLS=true.',
    'Para ver o que seria enviado sem tocar no servidor: npm run deploy:dry',
  ]);
}

console.log('');
console.log(DRY ? '  ✓ simulação concluída (nada foi enviado).' : '  ✓ publicado.');
console.log(`  → ${env.PROD_URL || site.url || cfg.host}  ·  ${arquivos.length} arquivos, ${mb(bytes)}`);
process.exit(0);

/* ── util ───────────────────────────────────────────────────────────────── */
function aspas(s) {
  return '"' + String(s).replace(/(["\\$`])/g, '\\$1') + '"';
}

function falhar(msg, dicas = []) {
  console.error('');
  console.error('  ✗ ' + msg);
  for (const d of dicas) console.error('    ' + d);
  console.error('');
  process.exit(1);
}
