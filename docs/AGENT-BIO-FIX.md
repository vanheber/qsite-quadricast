# Bio - Light Theme Fix

## Problema
No tema light, o texto da bio fica branco (invisível) porque o `bio.css` só definia variáveis CSS para tema escuro em `:root`, sem overrides para `[data-bs-theme="light"]`.

## Arquivo a corrigir
`src/bios/bio.css`

## Causa
Variáveis como `--bio-text-primary: var(--bs-light, #ffffff)` sempre resolvem para branco em qualquer tema.

## Correção necessária
Substituir `:root { ... }` por:

```css
:root, [data-bs-theme="dark"] {
  --bio-text-primary: var(--bs-light, #ffffff);
  --bio-text-secondary: rgba(255, 255, 255, 0.6);
  --bio-card-container: rgba(255, 255, 255, 0.05);
  --bio-btn-bg: rgba(255, 255, 255, 0.1);
  --bio-btn-hover: rgba(255, 255, 255, 0.15);
  --bio-border-color: rgba(255, 255, 255, 0.1);
  --bio-bg-page: var(--bs-primary, #0a0a0a);
  --bio-accent: var(--bs-secondary, #0d6efd);
  --bio-radius: var(--bs-border-radius, 12px);
}

[data-bs-theme="light"] {
  --bio-text-primary: #121212;
  --bio-text-secondary: rgba(0, 0, 0, 0.55);
  --bio-card-container: rgba(0, 0, 0, 0.03);
  --bio-btn-bg: rgba(0, 0, 0, 0.05);
  --bio-btn-hover: rgba(0, 0, 0, 0.08);
  --bio-border-color: rgba(0, 0, 0, 0.08);
  --bio-bg-page: #f8f9fa;
  --bio-accent: var(--bs-primary, #0d6efd);
  --bio-radius: var(--bs-border-radius, 12px);
}
```

## Build
Após corrigir, executar:
```sh
npm run build:bios
```

Os arquivos gerados em `public/` herdam do `src/` via cache busting (hash timestamp).
