# QSITE | Instância do Cliente

Este repositório utiliza o padrão de documentação **Quadri Doc**.

## 🚀 Documentação Centralizada
Toda a documentação técnica, manuais de operação e arquitetura foram unificados no Core.

**Acesse a interface oficial:**
👉 [https://qsite.agenciaquadri.com/docs](https://qsite.agenciaquadri.com/docs)

## 💻 Configuração Local (Setup)

Ao clonar este repositório para o desenvolvimento local, execute a instalação limpa de dependências:

```bash
npm ci
```

> [!IMPORTANT]
> **Use sempre `npm ci`** em vez de `npm install`. Isso força o instalador a ler estritamente o `package-lock.json` congelado do template, garantindo a integridade dos binários locais do build-system (`qsite`) e prevenindo erros como `qsite: command not found` durante a compilação local com `npm run build`.

Para gerar os arquivos do site localmente após a instalação:
```bash
npm run build
npm run preview
```

---
*Propriedade Agência Quadri*
