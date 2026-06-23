# Front-end - ChronosIA

Este diretório contém a aplicação Front-end do ChronosIA, construída com React, Vite e Tailwind CSS.

## Visão geral

- Aplicação React moderna usando Vite como bundler.
- Estilização com Tailwind CSS 4 e componentes UI baseados em Radix / shadcn.
- Suporte a importação de ativos personalizados e alias `@` para `src`.
- Inclui configuração para TypeScript e para desenvolvimento local rápido.

## Pré-requisitos

- Node.js 18+ (recomendado)
- npm

> Se você usa pnpm, pode adaptar os comandos para `pnpm install`, mas o projeto já está configurado com `npm`.

## Instalação

Abra o terminal dentro de `front-end` e execute:

```bash
npm install
```

## Execução em desenvolvimento

```bash
npm run dev
```

Depois, abra o navegador em `http://localhost:******`.

## Build de produção

```bash
npm run build
```

O bundle final será gerado em `dist/`.

## Estrutura principal do projeto

- `src/main.tsx` - ponto de entrada da aplicação.
- `src/app/App.tsx` - componente principal da interface.
- `src/app/components/` - componentes reutilizáveis e UI (Resgatados no Figma).
- `src/styles/` - estilos globais e de tema.
- `vite.config.ts` - configuração do Vite, plugins e alias.
- `tsconfig.json` - configuração do TypeScript para a aplicação.
- `tsconfig.node.json` - configuração do TypeScript para arquivos de build / Vite.

## Dependências importantes

- `react`, `react-dom`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`
- `tailwindcss`
- `lucide-react`, `sonner`
- `@radix-ui/react-*` para componentes acessíveis

## Notas úteis

- O alias `@` resolve para `./src` no `vite.config.ts`.
- O projeto suporta importação de arquivos `.svg` e `.csv` como assets.
- Caso o editor mostre erros TypeScript, reinicie o VS Code após instalar dependências.

## Como contribuir

1. Rode `npm install`.
2. Execute `npm run dev` para desenvolvimento.
3. Faça alterações em `src/`.
4. Teste o build com `npm run build`.

---