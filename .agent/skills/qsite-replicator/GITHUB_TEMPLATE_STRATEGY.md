# 🔄 GitHub Template Strategy - QSITE

## Conceito: Template Repository

Este projeto (`vanheber/qsite`) funciona como um **Template Repository** no GitHub. Isso significa que:

- ✅ **NÃO é um fork**: Cada novo projeto é independente
- ✅ **Histórico limpo**: Novos repos começam sem commits do template
- ✅ **Evolução isolada**: Mudanças em um cliente não afetam outros
- ✅ **Template atualizado**: O repositório original pode ser melhorado sem quebrar projetos ativos

---

## 📊 Arquitetura Multi-Projeto

```
┌─────────────────────────────────────────────────────┐
│  vanheber/qsite (TEMPLATE MASTER)                   │
│  ├── Arquitetura base QSITE v2.5+                   │
│  ├── .agent/skills/qsite-replicator/ ← Esta skill   │
│  ├── Engines de build                               │
│  ├── Scripts Google Apps                            │
│  └── Documentação completa                          │
│                                                      │
│  🔒 NUNCA modificado por projetos de clientes       │
│  🔄 Atualizado apenas para melhorias do core        │
└─────────────────────────────────────────────────────┘
                         │
                         │ GitHub: "Use this template"
                         │ (Não é fork, é cópia independente)
                         ▼
        ┌────────────────────────────────────┐
        │   NOVOS REPOSITÓRIOS INDEPENDENTES │
        │   (Um por cliente/projeto)         │
        └────────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ acme-site   │ │ beta-site   │ │ gama-site   │
    ├─────────────┤ ├─────────────┤ ├─────────────┤
    │ Config:     │ │ Config:     │ │ Config:     │
    │ - slug      │ │ - slug      │ │ - slug      │
    │ - domain    │ │ - domain    │ │ - domain    │
    │ - features  │ │ - features  │ │ - features  │
    │             │ │             │ │             │
    │ Deploy:     │ │ Deploy:     │ │ Deploy:     │
    │ acme.com.br │ │ beta.io     │ │ gama.net    │
    └─────────────┘ └─────────────┘ └─────────────┘
         │                │                │
         ▼                ▼                ▼
    [FTP Server]    [FTP Server]    [FTP Server]
```

---

## 🚀 Como Criar Novo Projeto (Passo-a-Passo)

### Método 1: Via Interface GitHub (Recomendado)

1. **Acessar Template**:
   - Vá para: `https://github.com/vanheber/qsite`
   - Clique no botão verde **"Use this template"** (ao lado de Code)
   - Selecione **"Create a new repository"**

2. **Configurar Novo Repositório**:
   ```
   Owner: [sua-organização]
   Repository name: [cliente-slug]-site
   Exemplo: acme-corp-site
   
   Description: Site institucional para [Cliente]
   
   Visibility: 
   ○ Public  (se open source)
   ● Private (recomendado para clientes)
   
   ☑ Include all branches: NÃO marcar
   (queremos apenas a main)
   ```

3. **Criar**:
   - Clique em **"Create repository from template"**
   - Aguarde (~5 segundos)
   - Repositório criado! 🎉

### Método 2: Via GitHub CLI

```bash
# Instalar gh CLI: https://cli.github.com/
gh repo create [sua-org]/[cliente-slug]-site \
  --template vanheber/qsite \
  --private \
  --clone
```

### Método 3: Via API GitHub (Automação)

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/vanheber/qsite/generate \
  -d '{
    "owner":"sua-org",
    "name":"cliente-slug-site",
    "description":"Site para Cliente",
    "private":true
  }'
```

---

## 📦 Após Criar o Repositório

### Passo 1: Clonar Localmente
```bash
git clone https://github.com/[sua-org]/[cliente-slug]-site.git
cd [cliente-slug]-site
npm install
```

### Passo 2: Executar Setup Wizard
```bash
node .agent/skills/qsite-replicator/scripts/setup-new-client.js
```

Isto irá:
- ✅ Configurar `site.config.json`
- ✅ Criar `.env` template
- ✅ Criar estrutura de diretórios
- ✅ Gerar checklist personalizado

### Passo 3: Personalizar
```bash
# Editar conforme necessário:
- site.config.json (dados do cliente)
- .env (variáveis de ambiente)
- src/site/assets/css/theme.css (cores)
- src/site/assets/img/ (logo, favicon)
```

### Passo 4: Primeiro Commit
```bash
git add .
git commit -m "Initial setup for [CLIENTE]"
git push origin main
```

---

## 🔐 Isolamento de Projetos

### O que é COMPARTILHADO entre projetos:
- ✅ Google Apps Scripts (`QSITE_FORMS_GATEWAY.gs`, etc)
  - Um script pode gerenciar múltiplos projetos via planilha de permissões
- ✅ Planilha de Permissões (multi-tenant)
  - Uma planilha, múltiplos slugs
- ✅ Gateway de Leads (multi-tenant)
  - Uma planilha, múltiplos domínios

### O que é ISOLADO por projeto:
- 🔒 Repositório Git (histórico independente)
- 🔒 GitHub Secrets (credenciais FTP, tokens)
- 🔒 Domínio e hospedagem
- 🔒 Conteúdo (markdown, imagens, áudios)
- 🔒 Identidade visual (CSS, logos)
- 🔒 Configuração (`site.config.json`)

---

## 🔄 Atualização do Template Master

### Quando atualizar o template original:
- Nova versão do QSITE (ex: v2.6)
- Melhorias nos engines de build
- Correções de bugs críticos
- Novos recursos na skill de replicação
- Atualizações de dependências (package.json)

### Como projetos ATIVOS recebem atualizações:

**Opção 1: Cherry-pick Manual** (Recomendado)
```bash
# No repo do cliente:
git remote add template https://github.com/vanheber/qsite.git
git fetch template
git cherry-pick [commit-hash-específico]
```

**Opção 2: Merge Seletivo** (Cuidado)
```bash
git remote add template https://github.com/vanheber/qsite.git
git fetch template
git merge template/main --allow-unrelated-histories
# Resolver conflitos manualmente
```

**Opção 3: Atualização Manual** (Mais seguro)
- Copiar arquivos específicos do template
- Testar localmente
- Commitar se tudo OK

---

## 📌 Boas Práticas

### ✅ DO (Faça):
1. **Use template para cada cliente novo**
2. **Configure GitHub Secrets ANTES do primeiro deploy**
3. **Mantenha o template master limpo** (sem conteúdo de cliente)
4. **Documente customizações específicas** no README de cada projeto
5. **Use branches para features** nos repos de clientes
6. **Faça backup da planilha de Leads** periodicamente

### ❌ DON'T (Não faça):
1. **Modificar o template master com dados de cliente**
2. **Fazer fork em vez de usar template**
3. **Commitar .env ou secrets** no repo
4. **Usar o mesmo QSITE_SECRET** para todos os clientes
5. **Compartilhar FTP entre clientes**
6. **Deployar sem validar** (use `validate-setup.js`)

---

## 🎯 Cenários de Uso

### Cenário 1: Agência com 10 clientes
```
Template Master: vanheber/qsite
├── Cliente A: agencia/cliente-a-site → deploy em clientea.com
├── Cliente B: agencia/cliente-b-site → deploy em clienteb.com.br
├── Cliente C: agencia/cliente-c-site → deploy em clientec.io
└── ... (7 projetos)

Google Sheets:
├── QSITE_PERMISSIONS (1 planilha, 10 linhas)
└── QSITE_LEADS_CENTRAL (1 planilha, aba por cliente opcional)
```

### Cenário 2: Desenvolvedor Freelancer
```
Template Master: seu-user/qsite
├── Projeto Pessoal: seu-user/meu-blog → meublog.com
├── Cliente 1: seu-user/empresa-x → empresax.com.br
└── Cliente 2: seu-user/loja-y → lojay.com

Cada um com:
- Repo independente
- FTP independente
- Secrets independentes
```

### Cenário 3: White Label SaaS (Futuro)
```
Template Master: saas-corp/qsite-engine
└── Script automatizado cria repos via API:
    - POST /repos/template/generate
    - Configuração via painel admin
    - Deploy automático ao criar
```

---

## 🛡️ Segurança Multi-Tenant

### Isolamento de Credenciais:
```
Projeto A                    Projeto B
├── .env (local)            ├── .env (local)
├── GitHub Secrets:         ├── GitHub Secrets:
│   FTP_SERVER: srv-a.com   │   FTP_SERVER: srv-b.io
│   QSITE_SECRET: abc123    │   QSITE_SECRET: xyz789
└── Deploy: clienteA.com    └── Deploy: clienteB.net
```

### Validação de Permissões:
```
Planilha QSITE_PERMISSIONS:
Slug        | Emails                | Bridge URL
------------|----------------------|-------------------------
cliente-a   | dev@agencia.com      | https://clientea.com/bridge.php
cliente-b   | dev@agencia.com      | https://clienteb.net/bridge.php

Script Gateway verifica:
1. E-mail está autorizado?
2. Slug corresponde ao projeto?
3. Bridge URL corresponde ao servidor?
```

---

## 📚 Referências

- **GitHub Template Repos**: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository
- **Template vs Fork**: https://github.blog/2019-06-06-generate-new-repositories-with-repository-templates/
- **Multi-tenant Strategy**: Ver `docs/setup/manual.md` seção "Planilha de Permissões"

---

**Conclusão**: Este projeto é 100% compatível com estratégia de template Git, permitindo criar repositórios independentes para cada cliente mantendo a arquitetura base centralizada e evolutiva.

**Última atualização**: 2026-01-26
