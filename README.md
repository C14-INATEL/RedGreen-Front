# Red & Green Cassino - Frontend

Responsável pela interface do usuário do cassino web, oferecendo uma experiência imersiva com jogos visuais em WebGL, autenticação segura, gerenciamento de carteira de fichas e integração fluida com o backend.

---




## Funcionalidades
- **Autenticação:** Gerenciamento de sessão de jogadores com JWT e redirecionamentos automáticos.
- **Carteira:** Visualização e sincronização em tempo real do saldo de fichas via SWR.
- **Jogos:** Motor de jogos WebGL com PixiJS para slots e roleta, com animações e física.
- **UI/UX:** Interface responsiva e moderna com Tailwind CSS, animações com Framer Motion.
- **Histórico e Rankings:** Painéis para histórico de apostas e rankings de jogadores.

---

## Principais Tecnologias Utilizadas

* **Framework Core:** React + Vite
* **Linguagem:** TypeScript
* **Motor de Jogos:** PixiJS + @pixi/react
* **Animações:** Framer Motion
* **Requisições e Cache:** Axios + SWR
* **Estilos:** Tailwind CSS
* **Formulários:** React Hook Form + Zod
* **Qualidade e Padronização:** ESLint, Prettier, Husky, Commitlint e lint-staged.

---

## Executando o Projeto

#### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:

* **Node.js** (versão 18 ou superior)

#### 2. Instale as dependências do projeto

```bash
npm install
```

#### 3. Iniciando o servidor de desenvolvimento

```bash
npm run dev
```

#### 4. Acesse a aplicação

Acesse a URL da aplicação: http://localhost:5173

---

## Comandos Importantes (Scripts)

**Inicia o servidor de desenvolvimento com hot reload.**

```bash
npm run dev
```

**Verifica erros de padronização com o ESLint.**

```bash
npm run lint
```

**Compila o projeto para produção.**

```bash
npm run build
```

**Formata o código automaticamente com Prettier.**

```bash
npm run format
```

---

## Estrutura do Projeto

```text
RedGreen-Front/
├── public/                     # Arquivos estáticos (assets, imagens, sons)
│   └── SlotMachine/            # Assets do caça-níquel (Exemplo)
├── src/
│   ├── main.tsx                # Ponto de entrada da aplicação
│   ├── App.tsx                 # Componente raiz
│   ├── AppProviders.tsx        # Provedores globais (React Router, etc.)
│   ├── routes.tsx              # Definição das rotas
│   ├── paths.ts                # Centralização dos paths das rotas
│   ├── config.ts               # Configurações globais (limites, cache)
│   ├── domain/                 # Contratos, tipos TypeScript, entidades e schemas Zod
│   │   ├── types.ts
│   │   └── schemas.ts
│   ├── application/            # Regras de negócio via hooks customizados
│   ├── infrastructure/         # Clientes HTTP, interceptors e funções puras
│   └── presentation/           # Camada visual
│       ├── ui/                 # Componentes React tradicionais (Botões, Modais)
│       └── games/              # Componentes do motor WebGL (Stages PixiJS)
│       └── pages/              # Telas que orquestram UI e Games
├── index.html                  # Template HTML
└── vite.config.ts              # Configurações do Vite
```