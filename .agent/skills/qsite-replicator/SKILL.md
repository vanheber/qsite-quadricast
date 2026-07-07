---
name: QSITE Replicator
description: Skill para replicar o projeto QSITE para novos clientes com conteúdo personalizado via GEM
---

# QSITE Replicator Skill

Esta skill é o cérebro automatizado para replicar o ecossistema QSITE.

## 🎯 Objetivo
Automatizar a criação de novos clusters de sites estáticos, garantindo que toda a arquitetura de gateways, segurança e performance seja mantida.

## 📚 Documentação de Referência

- **README.md** na raiz do projeto
- **BACKLOG.md** com backlog de melhorias
- **scripts/sync_template.py** para sincronizar arquivos do template base
- **scripts/replicate.js** para criar nova instância de cliente

## 🛠️ Ferramentas

A replicação é feita via `scripts/replicate.js`:

## 🔄 Fluxo Sugerido
Ao ser solicitado a replicar um projeto:
1. Execute `node scripts/replicate.js <slug-do-cliente>`
2. Preencha os secrets no `.env` gerado
3. Execute o build para validar

---
**Versão**: 1.1.0 (Centralized Edition)
