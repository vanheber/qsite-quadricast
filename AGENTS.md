# AGENTS — qsite2-quadricast

## Regra do projeto: só QSite2

**A partir de 25/11/2026, o Quadricast é QSite2 e apenas QSite2.**

- Motor válido: **`../qsite2-core`** (resolvido por caminho; esta instância não tem `node_modules`).
- **Não construir, não deploiar e não editar** nada pelo motor antigo `qsite-core`.
- A instância legada `/Volumes/Arquivos/projetos-git/qsite-quadricast` está **congelada**: é arquivo morto e não é fonte de verdade. Não sincronize nem copie dela para cá.
- `_legado/` (páginas do qsite-core movidas na migração) existe só como histórico. Não é buildado e não deve receber conteúdo novo.

Fonte de verdade do site: este repositório (`paginas/`, `shell/`, `tokens/`, `site.json`, `dados.json`).

## Comandos

```bash
npm run build       # node ../qsite2-core/lib/publish.js build:all  → public/
npm run icons       # regenera o sprite /assets/icons.svg
npm run all         # icons + build
npm run deploy:check   # valida .env, não abre conexão
npm run deploy:dry     # lftp --dry-run, sem enviar
npm run deploy         # publica public/ via FTP (lftp)
```

`public/` é saída de build e está no `.gitignore` — nunca edite à mão.

## Estrutura

| Caminho | Papel |
|---|---|
| `site.json` | URL, locale, menu, tipos de página, matriz `editavel` |
| `dados.json` | Dados de contato, marca (cores), logos, `agenda` |
| `paginas/*.html` | Páginas com frontmatter (`title`, `date`, …) e blocos `data-block` |
| `shell/` | `head.html`, `nav.html`, `footer.html` — comuns a todas as páginas |
| `tokens/theme.css` | Design tokens e estilos do redesign |
| `assets/` | Ícones, imagens, `js/` (`qs-*.js` do core + `qc-agenda.js` da instância) |
| `scripts/deploy.mjs` | Deploy FTP por `lftp`; senha só via `LFTP_PASSWORD` |
| `_ref/` | Referências de layout (`pagina.html`, `artigo.html`) |
| `servidor/agenda-api/` | API PHP da agenda (fora do build; ver o LEIA-ME da pasta). `config.php` não vai para o Git |
| `assets/img/agenda/` | Fotos dos estúdios usadas nas galerias da agenda (`ID-N.webp`) |

## Deploy

Depende de `.env` (copie de `.env.example`): `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_PATH`, `FTP_TLS`, `FTP_DELETE`. A senha nunca vai em argv nem em arquivo temporário.

## Agenda

- `paginas/agenda.html` carrega `assets/js/qc-agenda.js` com `data-api="{{agenda.api}}"`.
- Com `agenda.api` preenchido no `dados.json`, a página mostra só os horários livres e envia o pedido para a API (QG).
- Com `agenda.api` vazio, o pedido segue pelo WhatsApp da produção.
