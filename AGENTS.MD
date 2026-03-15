# AGENTS

Este arquivo resume os padroes de arquitetura, stack tecnologica e convencoes do projeto para manter consistencia ao evoluir o frontend do Cassino Web. O projeto utiliza uma abordagem hibrida (UI baseada em DOM tradicional + Motor de jogo em WebGL).

**Visao Geral (Stack)**

- React + Vite
- TypeScript
- PixiJS + `@pixi/react` (Motor do Jogo WebGL)
- Framer Motion (Animacoes de transicao e UI)
- Axios + SWR (Requisicoes e Cache)
- Tailwind CSS
- React Hook Form + Zod

**Entradas e Fluxo**

- `src/main.tsx` inicializa React, aplica `AppProviders` e carrega `AppRoutes`.

- `src/routes.tsx` define as rotas (React Router).

- `src/paths.ts` centraliza os paths usados nas rotas para evitar strings soltas.

- `src/config.ts` concentra variaveis de ambiente e configuracoes globais (limites de reroll, tempo de cache SWR).

**Estrutura Principal (Clean Architecture)**

- `public/` arquivos estaticos, assets visuais (imagens da roleta, slots) e sons.

- `src/domain/` contratos, tipos TypeScript, entidades (ex: `User`, `Wallet`) e schemas do Zod.

- `src/application/` regras de negocio via custom hooks (ex: `useSpinMachine`, `useDailyLogin`) e gerenciamento de estado global.

- `src/infrastructure/` clientes HTTP (Axios), interceptors de autenticacao e funcoes de requisicao puras.

- `src/presentation/` a camada visual, estritamente dividida:
  -- `ui/` componentes React tradicionais (Botoes, Modais, Inputs).
  -- `games/` componentes do motor WebGL (Stages do PixiJS, fisicas, animacoes da roleta).
  -- `pages/` telas que orquestram a uniao de UI e Games.

**Padroes de Arquitetura e UI**

- Separacao Rigida: Componentes de UI padrao NUNCA devem ser inseridos diretamente na arvore do PixiJS. Use React para criar overlays HTML em cima do `<Stage>` do PixiJS.

- Componentes em `src/presentation/ui` nao devem conter logica de negocio (Data Fetching ou RNG); eles apenas recebem props e emitem eventos.

- Atomic Design flexivel em `src/presentation/ui` para reaproveitamento de botoes e modais.

**Padroes de Jogos (PixiJS)**

- Texturas e assets pesados devem ser pre-carregados antes de o componente do jogo montar.

- Gerencie o ciclo de vida das animacoes com o `useTick` do `@pixi/react`.

- O resultado visual do jogo (onde a roleta para) e SEMPRE ditado pelo payload recebido da API, nunca decidido no frontend.

**Roteamento e Permissoes**

- React Router em `src/routes.tsx`.

- Guards de Autenticacao: Modulos de jogo (`SlotRoom`, `RouletteRoom`) exigem verificacao de token JWT ativo.

- Redirecionamento automatico para `/login` caso o interceptor do Axios pegue um `401 Unauthorized`.

**API e Dados**

- Instancia centralizada do Axios em `src/infrastructure/http/client.ts`.

- SWR e utilizado intensamente para garantir que o "Saldo de Fichas" do `Header` esteja sempre em sync com o banco de dados apos cada aposta.

- Tratamento de erros de API mapeados para toasts/notificacoes amigaveis.

**Testes e Qualidade**

- Framework de testes: Jest + React Testing Library.

- Testes unitarios (`.test.tsx`) focam em hooks de negocio na camada `application/` e validacoes na camada `domain/`.

- ESLint e Prettier padronizam o codigo da equipe.

- Husky + lint-staged impedem commits de codigo quebrado ou nao formatado.

**Scripts Principais**

`npm run dev`, `npm run build`, `npm run lint`, `npm test`.

**Aliases de Importacao**

`@domain` -> `src/domain`

`@application` -> `src/application`

`@infrastructure` -> `src/infrastructure`

`@presentation` -> `src/presentation`

`@ui` -> `src/presentation/ui`

`@games` -> `src/presentation/games`

`@assets` -> `public/assets`
