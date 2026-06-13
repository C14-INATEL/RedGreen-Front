# RedGreen Frontend

Frontend do projeto **RedGreen**, desenvolvido para a disciplina **C14 - Engenharia de Software**. A aplicacao implementa a interface web de um cassino com autenticação, carteira de fichas, ranking, bonus diario, administracao de mesas e dois jogos principais: **Slot Machine** e **Gambit**.

Este documento foi elaborado a partir da analise do codigo-fonte existente neste repositorio. Funcionalidades, rotas, endpoints e testes descritos aqui correspondem ao que foi identificado no projeto.

# Integrantes 

Pedro Armengol de Oliveira - 2093
Pedro Ribeiro Nogueira - 629
Danilo Henrique Maia da Silva - 2092
Pedro Henrique de Paula Andrade - 368
Patrick Augusto Lins de Oliveira Damião - 496

## 1. Visao Geral do Projeto

O RedGreen Frontend e uma aplicacao web construida com **React**, **TypeScript** e **Vite**, com interface visual inspirada em cassino e pixel art. A aplicacao consome uma API HTTP externa para autenticacao, dados do usuario, saldo de fichas, ranking, bonus diario, mesas e sessoes de jogo.

O projeto segue uma separacao em camadas:

- `domain`: tipos e schemas de dominio.
- `application`: hooks de aplicacao e acesso a dados com SWR.
- `infrastructure`: cliente HTTP, ambiente e cookies.
- `presentation`: paginas, componentes de UI e motores visuais dos jogos.

No ponto de entrada, `src/main.tsx` registra as variaveis de ambiente em runtime, monta o `BrowserRouter`, aplica `AppProviders` e renderiza `AppRoutes`.

## 2. Funcionalidades Implementadas

Funcionalidades identificadas no codigo:

- Tela inicial com HUD, saldo de fichas, menu de usuario, ranking, bonus diario e cards de acesso aos jogos.
- Fluxo de identificacao por e-mail, login e cadastro na pagina `/login`.
- Persistencia de token JWT em cookie `token`.
- Logout com limpeza do cookie de autenticacao.
- Menu de usuario com edicao de perfil e exclusao de conta.
- Modal de sessao expirada disparado quando a API retorna `401` para usuario autenticado.
- Consulta de perfil do usuario e saldo de fichas com SWR.
- Ranking de jogadores por fichas.
- Bonus diario com progresso de 7 dias e chamada de resgate.
- Listagem de mesas de Slot Machine.
- Criacao, edicao, ativacao/desativacao e exclusao de mesas de Slot Machine para usuario administrador.
- Listagem de mesas de Gambit.
- Criacao, edicao e exclusao de mesas de Gambit para usuario administrador.
- Bloqueio visual de mesas quando o usuario nao esta logado, nao possui fichas suficientes ou a mesa esta inativa.
- Aviso quando existe sessao ativa em outra mesa antes de iniciar uma nova partida.
- Jogo Slot Machine com giro, animacao de rolos, reroll por reel, contador de rerolls, cash-out e restauracao de sessao ativa.
- Jogo Gambit com compra de cartas, tabuleiro visual, queima de cartas, eventos, efeitos, selecoes especiais, feedback de pontuacao e cash-out automatico quando a sessao termina.
- Testes automatizados para componentes, hooks, mapeadores, clientes de API e fluxos dos jogos.

Funcionalidades declaradas em rotas mas ainda nao implementadas de forma completa:

- `/register`: renderiza apenas um placeholder `Register`.
- `/dashboard`: renderiza apenas um placeholder `Dashboard`.
- `/roulette-room`: renderiza apenas um placeholder `Roulette Room`.

## 3. Tecnologias Utilizadas

Dependencias principais identificadas em `package.json`:

- **React 19** e **React DOM** para construcao da interface.
- **Vite 8** para desenvolvimento e build.
- **TypeScript 5.9** para tipagem estatica.
- **React Router DOM 6** para roteamento.
- **Axios** para comunicacao HTTP.
- **SWR** para cache e sincronizacao de dados remotos.
- **Tailwind CSS** para estilos utilitarios.
- **Framer Motion** para animacoes de interface.
- **PixiJS** e **@pixi/react** para renderizacao visual em jogos.
- **lucide-react** para icones.
- **Zod** e **React Hook Form** como dependencias de formularios e validacao.
- **Jest**, **ts-jest**, **jsdom** e **React Testing Library** para testes automatizados.
- **ESLint**, **Prettier**, **Husky**, **Commitlint** e **lint-staged** para qualidade de codigo.

Observacao: embora `react-hook-form`, `@hookform/resolvers` e `zod` estejam instalados, os formularios atualmente implementados usam majoritariamente `useState` e validacoes manuais. Os schemas Zod existentes em `src/domain/schemas.ts` nao aparecem integrados aos formularios analisados.

## 4. Arquitetura Frontend

A arquitetura observada e organizada por responsabilidades:

- **Entrada da aplicacao:** `src/main.tsx`.
- **Provedores globais:** `src/AppProviders.tsx`, responsavel por configurar `SWRConfig`.
- **Roteamento:** `src/routes.tsx` e `src/paths.ts`.
- **Dominio:** `src/domain/types.ts` e `src/domain/schemas.ts`.
- **Aplicacao:** hooks em `src/application/hooks`.
- **Infraestrutura:** cliente Axios, cookies e ambiente em `src/infrastructure`.
- **Apresentacao:** paginas, UI e jogos em `src/presentation`.

O projeto utiliza um modelo hibrido:

- Componentes React tradicionais para telas, HUDs, modais, botoes e formularios.
- PixiJS diretamente em componentes de jogo para renderizacao canvas/WebGL.
- Framer Motion para transicoes, overlays e animacoes de UI.

## 5. Estrutura de Diretorios

```text
RedGreen-Front/
|-- public/
|   |-- Gambit/
|   |-- SlotMachine/
|   |-- favicon.svg
|   `-- icons.svg
|-- src/
|   |-- application/
|   |   `-- hooks/
|   |-- assets/
|   |-- domain/
|   |-- infrastructure/
|   |   `-- http/
|   |-- presentation/
|   |   |-- games/
|   |   |-- pages/
|   |   `-- ui/
|   |-- App.css
|   |-- App.tsx
|   |-- AppProviders.tsx
|   |-- config.ts
|   |-- index.css
|   |-- main.tsx
|   |-- paths.ts
|   |-- routes.tsx
|   |-- setupTests.ts
|   `-- validators.ts
|-- test/
|-- .husky/
|-- eslint.config.js
|-- jest.config.js
|-- Jenkinsfile
|-- package.json
|-- tailwind.config.js
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
`-- vite.config.ts
```

Observacao tecnica: `src/App.tsx` e `src/App.css` mantem codigo residual do template do Vite, mas `src/main.tsx` renderiza `AppRoutes`, nao `App`.

## 6. Instalacao e Execucao

Pre-requisitos:

- Node.js compativel com o projeto. O Jenkinsfile usa `node-22`.
- npm.

Instalacao:

```bash
npm install
```

Execucao em desenvolvimento:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Preview do build:

```bash
npm run preview
```

Testes:

```bash
npm test
```

Lint:

```bash
npm run lint
```

Formatacao:

```bash
npm run format
```

## 7. Variaveis de Ambiente

Variavel identificada no codigo:

| Variavel | Obrigatoria | Padrao | Uso |
|---|---:|---|---|
| `VITE_API_BASE_URL` | Nao | `http://localhost:3000` | Define a URL base usada pelo Axios em `apiClient`. |

A configuracao esta em `src/config.ts`:

```ts
apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000'
```

O arquivo `src/infrastructure/env.ts` tambem permite registrar e ler variaveis de ambiente em runtime por meio de `globalThis.__REDGREEN_VITE_ENV__`, mas o uso direto identificado ocorre em `src/main.tsx` com `setRuntimeEnv(import.meta.env)`.

Exemplo de `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 8. Rotas da Aplicacao

Rotas centralizadas em `src/paths.ts` e renderizadas em `src/routes.tsx`:

| Rota | Componente | Status identificado |
|---|---|---|
| `/` | `Home` | Implementada |
| `/login` | `Login` dentro de `GuestRoute` | Implementada |
| `/register` | `Register` dentro de `GuestRoute` | Placeholder |
| `/dashboard` | `Dashboard` | Placeholder |
| `/slot-machine-room` | `SlotMachineRoom` | Implementada |
| `/slotmachine-tables` | `SlotMachineTablesRoom` | Implementada |
| `/gambit-room` | `GambitRoom` | Implementada |
| `/gambit-tables` | `GambitTablesRoom` | Implementada |
| `/roulette-room` | `RouletteRoom` | Placeholder |

Protecoes de rota identificadas:

- `GuestRoute` redireciona usuarios com token para `/`, impedindo acesso a telas de visitante como `/login` e `/register`.
- Nao foi identificado um guard dedicado para proteger rotas de jogo ou rotas administrativas no roteamento. O bloqueio de acesso aparece implementado principalmente na UI, com base em token, saldo de fichas e perfil de administrador.

## 9. Integracao com API

A integracao HTTP usa uma instancia centralizada de Axios em `src/infrastructure/http/client.ts`:

- `baseURL`: `config.apiBaseUrl`.
- `timeout`: `10000` ms.
- Interceptor de request adiciona `Authorization: Bearer <token>` quando existe cookie `token`.
- Interceptor de response remove o token e dispara o evento `session-expired` quando recebe `401` e havia token armazenado.

Endpoints identificados no codigo:

### Autenticacao e usuario

| Metodo | Endpoint | Uso no frontend |
|---|---|---|
| `GET` | `/auth/check-email` | Verifica se o e-mail ja existe para decidir entre login e cadastro. |
| `POST` | `/auth/login` | Autentica usuario e valida senha atual na edicao de perfil. |
| `POST` | `/auth/register` | Cadastra novo usuario. |
| `GET` | `/auth/rank` | Consulta ranking de jogadores. |
| `GET` | `/user/profile` | Consulta dados do perfil e estado do bonus diario. |
| `GET` | `/user/chips` | Consulta saldo de fichas. |
| `PATCH` | `/user` | Atualiza nome, data de nascimento e senha. |
| `DELETE` | `/user` | Exclui conta do usuario. |
| `POST` | `/user/daily-login` | Resgata bonus diario. |

### Slot Machine

| Metodo | Endpoint | Uso no frontend |
|---|---|---|
| `GET` | `/slot/machine` | Lista mesas de Slot Machine. |
| `POST` | `/slot/machine` | Cria mesa de Slot Machine. |
| `PUT` | `/slot/machine/:id` | Atualiza mesa de Slot Machine. |
| `PATCH` | `/slot/machine/:id/deactivate` | Alterna status ativo/inativo da mesa. |
| `DELETE` | `/slot/machine/:id` | Remove mesa inativa. |
| `GET` | `/slot-machines/:id/sessions` | Consulta sessoes da mesa antes de desativar. |
| `POST` | `/slot-machines/:id/sessions` | Cria sessao de Slot Machine. |
| `POST` | `/slot-machines/:id/sessions/:sessionId/cash-out` | Encerra sessoes ativas antes da desativacao da mesa. |
| `GET` | `/sessions/active` | Consulta sessao ativa de Slot Machine. |
| `POST` | `/sessions/active/reroll/:reelIndex` | Executa reroll em um reel. |
| `POST` | `/sessions/active/cash-out` | Encerra a sessao ativa da Slot Machine. |

### Gambit

| Metodo | Endpoint | Uso no frontend |
|---|---|---|
| `GET` | `/gambit-table` | Lista mesas de Gambit. |
| `GET` | `/gambit-table/:id` | Busca mesa de Gambit por id. |
| `POST` | `/gambit-table` | Cria mesa de Gambit. |
| `PATCH` | `/gambit-table/:id` | Atualiza mesa de Gambit. |
| `DELETE` | `/gambit-table/:id` | Remove mesa de Gambit. |
| `GET` | `/gambit/sessions/active` | Consulta sessao ativa de Gambit. |
| `POST` | `/gambit-tables/:id/sessions` | Cria sessao de Gambit com quantidade de cartas compradas. |
| `POST` | `/gambit/sessions/active/burn/:position` | Queima carta na posicao informada. |
| `POST` | `/gambit/sessions/active/resolve-event` | Resolve evento pendente com `GoodIndex` e `BadIndex`. |
| `POST` | `/gambit/sessions/active/resolve-effect` | Resolve efeito pendente com lista de `Positions`. |
| `POST` | `/gambit/sessions/active/cash-out` | Encerra sessao ativa de Gambit. |

## 10. Gerenciamento de Estado

Estratégias identificadas:

- **Estado local com `useState`:** usado em paginas, modais, controles visuais, fluxo de login, salas de jogo e paineis.
- **Efeitos com `useEffect`:** usados para carregamento inicial, sincronizacao de dados, eventos globais, timers e ciclo de vida de elementos PixiJS.
- **Cache remoto com SWR:** usado em `useUserProfile`, `useUserChips`, `useRanking` e `UseDailyLogin`.
- **Configuracao global do SWR:** definida em `AppProviders`, com `revalidateOnFocus: false` e `dedupingInterval` baseado em `config.cacheTime`.
- **Mutacoes de cache:** usadas para atualizar saldo de fichas e ranking apos apostas, cash-out e bonus diario.
- **Cookies:** `src/infrastructure/Cookies.ts` gerencia `token` e `session_active`.
- **sessionStorage:** `SlotMachineRoom` usa `hudActive` para manter o HUD ativo durante a sala da Slot Machine.
- **Eventos globais:** `session-expired` e emitido pelo interceptor Axios e consumido por `SessionExpiredListener`.

Nao foi identificado uso de Redux, Zustand, Context API customizada ou outro gerenciador global alem do SWR e dos estados locais React.

## 11. Sistema de Formularios

Formularios e entradas identificadas:

- Login e cadastro em `Login.tsx`.
- Edicao de perfil em `EditProfileModal.tsx`.
- Exclusao de conta em `DeleteAccountModal.tsx`.
- Criacao e edicao de mesas de Slot Machine.
- Criacao e edicao de mesas de Gambit.
- Painel de aposta do Gambit com selecao de quantidade de cartas.

Validacoes implementadas:

- E-mail obrigatorio e formato basico por regex.
- Senha obrigatoria, confirmacao de senha e tamanho minimo de 8 caracteres.
- Nome e nickname obrigatorios no cadastro.
- Data de nascimento em formato `DD/MM/YYYY`, validada por `src/validators.ts`.
- Valores numericos inteiros para mesas.
- Limites para mesa Gambit, como maximo de 25 cartas e minimo menor que maximo.
- Campos obrigatorios e mensagens de erro em modais.

Observacao importante:

- Apesar das dependencias `react-hook-form`, `@hookform/resolvers` e `zod`, nao foi identificado uso de `useForm`, `zodResolver` ou schemas Zod nos formularios atuais.
- `src/domain/schemas.ts` contem `userSchema` e `walletSchema`, mas eles nao aparecem conectados aos fluxos de UI analisados.

## 12. Sistema de Jogos

O sistema de jogos existe e esta implementado em `src/presentation/games`.

### Slot Machine

Arquivos principais:

- `src/presentation/games/SlotMachine.tsx`
- `src/presentation/games/SlotMachineGame/SlotMachinePixi.tsx`
- `src/presentation/games/SlotMachineGame/SlotMachineReels.tsx`
- `src/presentation/games/SlotMachineGame/SlotMachineApi.ts`
- `src/presentation/games/SlotMachineGame/SlotMachineLever.tsx`
- `src/presentation/games/SlotMachineGame/SlotMachineButtons.tsx`
- `src/presentation/games/SlotMachineGame/SlotMachineCounters.tsx`

Comportamentos identificados:

- Entrada visual com aproximacao da maquina.
- Animacao do sprite da maquina apos entrada.
- Renderizacao dos rolos com PixiJS.
- Carregamento de texturas dos simbolos.
- Criacao de sessao no backend.
- Adaptacao do resultado recebido da API para animacao visual.
- Reroll por reel.
- Cash-out para voltar ao estado idle.
- Restauracao de sessao ativa.
- Bloqueio de inputs durante animacoes e chamadas pendentes.

### Gambit

Arquivos principais:

- `src/presentation/games/Gambit.tsx`
- `src/presentation/games/GambitGame/GambitApi.ts`
- `src/presentation/games/GambitGame/GambitBoard.tsx`
- `src/presentation/games/GambitGame/GambitCard.tsx`
- `src/presentation/games/GambitGame/GambitMapper.ts`
- `src/presentation/games/GambitGame/GambitEventTable.tsx`
- `src/presentation/games/cardReward/`

Comportamentos identificados:

- Criacao de sessao com quantidade de cartas compradas.
- Tabuleiro visual com cartas reveladas e nao reveladas.
- Queima de cartas por endpoint ativo.
- Resolucao de eventos com escolhas boas e ruins.
- Resolucao de efeitos com selecao de posicoes.
- Efeitos especiais mapeados para assets visuais.
- Modal de escolha de recompensas.
- Feedback visual de pontuacao.
- Cash-out automatico quando o backend marca a sessao como finalizada.

### Roleta

A rota `/roulette-room` existe, mas a implementacao atual e apenas um placeholder textual. Nao foi identificado sistema de roleta implementado no codigo.

## 13. Interface e UX

Caracteristicas visuais identificadas:

- Estetica de cassino com pixel art.
- Variaveis CSS globais para cores, sombras e fontes.
- Fonte importada do Google Fonts em `src/index.css`.
- Padrao visual com bordas pixeladas, sombras duras e elementos em vermelho, verde e dourado.
- Animações com Framer Motion em paginas, modais, cards, ranking e paineis.
- Icones com `lucide-react` em HUD, ranking e bonus diario.
- Feedbacks por modais e toasts.
- Estados de carregamento, erro, bloqueio e vazio em paineis e listagens.
- Overlays visuais para mesas bloqueadas, inativas ou indisponiveis.

## 14. Testes Automatizados

Configuracao:

- Framework: Jest.
- Ambiente: `jsdom`.
- Transformacao TypeScript: `ts-jest`.
- Setup: `src/setupTests.ts` com `@testing-library/jest-dom`.
- Mapeamento de aliases configurado em `jest.config.js`.

Foram identificados **26 arquivos de teste** em `test/`.

Areas cobertas:

- Login, autenticacao e conta excluida.
- Home, logout, ranking, bonus diario, edicao de perfil e exclusao de conta.
- `GuestRoute`.
- Ranking e `RankingPanel`.
- Validador de data de nascimento.
- Modais de resultado e aviso de sessao.
- Criacao e edicao de mesas de Slot Machine.
- Criacao de mesas de Gambit.
- Cards de mesas de Slot e Gambit.
- Cores de mesa.
- API e fluxo visual da Slot Machine.
- Entrada/aproximacao da Slot Machine.
- Fluxo de jogo da Slot Machine com sessao ativa, reroll, cash-out e bloqueio de input.
- API, mapeadores, cartas, auto cash-out, sala e fluxo de jogo do Gambit.
- Controller de recompensa por cartas.

Comando:

```bash
npm test
```

Observacao: o Jenkinsfile atual nao executa `npm test` no pipeline.

## 15. Qualidade de Codigo

Ferramentas configuradas:

- **ESLint:** `eslint.config.js`, com regras recomendadas de JavaScript, TypeScript, React Hooks e React Refresh.
- **Prettier:** `.prettierrc`, com ponto e virgula, aspas simples, largura de 80 colunas e trailing comma `es5`.
- **Husky:** hook `commit-msg`.
- **Commitlint:** configurado com `@commitlint/config-conventional`.
- **lint-staged:** executa `eslint --fix` e `prettier --write` em arquivos `ts` e `tsx`.

Tipos de commit aceitos pelo Commitlint:

- `ci`
- `test`
- `chore`
- `docs`
- `feat`
- `fix`
- `hotfix`
- `perf`
- `refactor`
- `revert`
- `style`

Scripts relevantes:

```bash
npm run lint
npm run format
npm run build
npm test
```

## 16. Pipeline CI/CD

O arquivo `Jenkinsfile` define um pipeline Jenkins com:

1. Checkout do repositorio.
2. Instalacao de dependencias com `npm install --legacy-peer-deps`.
3. Execucao de lint com `npm run lint`.
4. Execucao de formatacao com `npm run format`.
5. Build com `npm run build`.
6. Deploy na Vercel via `curl -X POST $VERCEL_DEPLOY_HOOK_URL`.
7. Limpeza do workspace com `cleanWs()`.

Configuracoes identificadas:

- Node configurado como `node-22`.
- Variavel segura `VERCEL_DEPLOY_HOOK_URL` carregada via credentials do Jenkins.

Lacuna identificada:

- Nao ha stage de testes automatizados no Jenkinsfile, apesar de existir `npm test` e uma suite de testes no repositorio.

## 17. Refatoracoes Identificadas

Possiveis refatoracoes observadas a partir do codigo atual:

- Remover ou atualizar `src/App.tsx` e `src/App.css`, pois mantem conteudo residual do template Vite e nao sao usados pelo ponto de entrada atual.
- Integrar `react-hook-form` e `zod` aos formularios ou remover as dependencias/schemas nao utilizados.
- Extrair regras repetidas de validacao de formularios para helpers ou schemas compartilhados.
- Criar guard de rota para rotas que exigem autenticacao, caso a regra de negocio seja impedir acesso direto por URL.
- Implementar ou remover rotas placeholders (`/register`, `/dashboard`, `/roulette-room`) de acordo com o escopo final do projeto.
- Adicionar `npm test` ao pipeline CI/CD.
- Revisar a etapa `npm run format` no Jenkins, pois ela altera arquivos no workspace em vez de apenas verificar formatacao.

## 18. Decisoes Tecnicas

Decisoes identificadas no codigo:

- Uso de Vite para ambiente de desenvolvimento rapido e build.
- Uso de TypeScript com configuracao `strict`.
- Centralizacao de paths em `src/paths.ts`.
- Centralizacao de API em `apiClient` com interceptors de autenticacao e sessao expirada.
- Uso de SWR para dados remotos com cache, deduplicacao e mutacao manual.
- Persistencia do token em cookies com `SameSite=Strict` e `Secure`.
- Separacao entre paginas, componentes de UI e componentes de jogo.
- Uso de PixiJS diretamente em componentes de jogo para renderizacao e animacao visual.
- Resultado dos jogos orientado por payloads do backend, com o frontend adaptando os dados para animacoes.
- Uso de Framer Motion para transicoes e feedback visual.
- Uso de testes unitarios e de integracao de componentes para fluxos criticos.

## 19. Uso de IA

Modelos utilizados

Claude Sonnet (Anthropic): utilizado por meio da interface de chat em claude.ai.
ChatGPT (OpenAI): utilizado por meio da interface de chat em chatgpt.com.

Para que foram usados
O Claude foi utilizado como apoio no desenvolvimento do front-end do projeto, auxiliando na refatoração de componentes, criação de novas funcionalidades e resolução de problemas técnicos. As principais áreas de atuação foram:

Refatoração do sistema de mesas do Slot Machine, separando um arquivo grande em componentes menores e reutilizáveis
Criação do sistema de mesas do jogo Gambit, seguindo o mesmo padrão já estabelecido no projeto
Implementação do HUD e painel de aposta do jogo Gambit
Implementação do fluxo de sessão expirada com interceptor 401, modal de aviso e redirecionamento
Orientação na correção de bugs como casing incorreto de variáveis no route state, chave de token errada e rotas incorretas
Apoio na atualização de testes automatizados para refletir as mudanças realizadas
Sugestão de mensagens de commit seguindo o padrão Conventional Commits

O ChatGPT foi utilizado como apoio no desenvolvimento do front-end do projeto, auxiliando na implementação de novas funcionalidades, criação e validação de testes automatizados, refatoração de componentes, correção de erros de tipagem e documentação das alterações realizadas. As principais áreas de atuação foram:

Criação e revisão de testes unitários para os componentes do sistema de mesas
Explicação do funcionamento de testes com e sem mocks
Auxílio na implementação do sistema de mesas e progressão dos jogos
Integração do painel de ranking às telas dos jogos
Migração do armazenamento do token de autenticação de LocalStorage para Cookies
Correção de erros de TypeScript relacionados a interfaces e hooks
Revisão da documentação da Pull Request
Criação de instruções de teste para validação das funcionalidades implementadas
Sugestões para internacionalização de mensagens retornadas pelo backend
Apoio em refatorações e organização dos componentes da aplicação

Exemplos reais de prompts usados
Claude
1. Refatoração do sistema de mesas

"Ok claude eu preciso fazer um refactor, pois o arquivo está muito grande. Eu queria separar em arquivos para depois fazer imports. Me ajude a fazer, fazendo passo a passo, a parte do arquivo que eu vou retirar e colocar no novo."

O Claude orientou a extração dos componentes um a um, indicando o que remover do arquivo original e o que adicionar ao novo, mantendo os imports e props corretos.
2. Implementação da sessão expirada

"Eu preciso mudar isso. O usuário possui um timer de quanto tempo o token dele não expira, e quando expira é necessário um aviso de que a sessão dele expirou e é preciso relogar."

O Claude sugeriu adicionar um interceptor de resposta no apiClient para capturar erros 401, disparar um evento customizado e criar um componente listener que exibe o modal e redireciona para o login.
3. Sistema de mesas do Gambit

"Ok, claude chegou as apis que eu estava precisando. Por onde podemos começar?"

A partir dos endpoints e campos retornados pelo Swagger, o Claude orientou a criação dos modais de criação e edição, do card da mesa e da página de listagem, seguindo o padrão já existente no projeto.
ChatGPT
1. Explicação dos testes unitários

"Eu vou mandar todos os testes que eu fiz, depois preciso que me explica cada teste e o que está testando."

O ChatGPT analisou os testes unitários criados para os componentes do sistema de mesas e explicou individualmente o objetivo de cada caso de teste, quais comportamentos estavam sendo validados e quais cenários de sucesso e erro estavam sendo cobertos.
2. Migração da autenticação para Cookies

"Uma coisa que estávamos fazendo é salvar o token no localStorage, isso tem que ser salvo no cookie."

O ChatGPT auxiliou na migração do mecanismo de autenticação, sugerindo uma estrutura para armazenamento, leitura e remoção de cookies e identificando pontos do projeto que precisariam ser atualizados.
3. Tradução das mensagens do Backend

"Possui mensagens que ainda vêm do backend, que precisam ser em português."

O ChatGPT auxiliou na criação de uma estratégia para mapear mensagens retornadas pela API e exibi-las em português para o usuário final sem necessidade de alterações no backend.
4. Documentação da Pull Request

"Como posso explicar a mudança que eu fiz no SlotMachine?"

O ChatGPT auxiliou na elaboração da descrição das alterações realizadas, ajudando a documentar as funcionalidades implementadas e o impacto das mudanças no projeto.
5. Correção de erros de tipagem

"A propriedade 'userType' não existe no tipo..."

O ChatGPT auxiliou na análise de erros de TypeScript relacionados a interfaces, hooks e propriedades inexistentes, sugerindo ajustes nos tipos e retornos das funções utilizadas.
Dinâmica de uso
As ferramentas foram utilizadas individualmente como apoio durante o desenvolvimento, sempre com o desenvolvedor conduzindo as decisões. Os arquivos eram compartilhados na conversa e as ferramentas orientavam as mudanças passo a passo, cabendo ao desenvolvedor aplicar, testar e validar cada alteração.
As respostas não foram aplicadas sem revisão. Sugestões foram analisadas, ajustadas ou descartadas de acordo com os requisitos e padrões do projeto.
O que não foi feito por IA
A definição dos requisitos, regras de negócio, arquitetura, identidade visual e experiência dos jogos foi realizada. A validação funcional de todas as alterações, a abertura e merge de pull requests e as decisões finais durante code reviews permaneceram sob responsabilidade dos desenvolvedores.
Correções pontuais como ajustes de imports incorretos, erros de digitação em nomes de arquivos e pequenas correções de tipagem foram feitas manualmente. Alguns testes também foram escritos e ajustados diretamente , sem auxílio da IA. A implementação final das funcionalidades, ajustes de layout, execução dos testes e validação das regras de negócio foram realizadas manualmente. As ferramentas atuaram apenas como apoio técnico durante o processo de desenvolvimento e documentação do projeto.

## 20. Metodologia de Desenvolvimento

No começo do desenvolvimento do projeto não chegamos a pensar e formalizar uma metodologia específica. Em vez disso, definimos alguns combinados para que o projeto progredisse da melhor maneira possível, adotando, na prática, um fluxo ágil informal e adaptado à realidade do grupo.
Começamos nos dividindo em 3 duplas, em que cada integrante seria responsável por validar e testar as Pull Requests da sua dupla. Cada dupla ficou responsável por um aspecto do projeto: uma com o front na parte de Interface e Integração de Usuário, outra com o front na parte de Motor Gráfico e Animações dos jogos, e a última com o backend — Regras de Negócio e Persistência de Dados.
Definimos também duas reuniões semanais, uma na terça-feira e outra na quinta-feira, cada uma com um intuito diferente. Na reunião de terça-feira, apresentávamos e explicávamos o que fizemos ao decorrer da semana para os outros e já alinhávamos quais seriam as próximas funções que faríamos. Nas de quinta-feira, nos reuníamos para colocar a mão na massa e progredir no projeto.
Nosso principal meio de comunicação foi o Discord, onde fazíamos as reuniões. Além disso, também usamos o WhatsApp para dar feedbacks mais informais e o próprio fluxo das PRs no GitHub, onde já apontávamos mais detalhadamente o que deveria ser mudado.
Vale destacar que não definimos uma Definição de Pronto (DoD) nem uma Definição de Preparado (DoR), e não tivemos sprints propriamente ditas — trabalhamos com uma cadência fixa de reuniões em vez de ciclos formais.

## 21. Dinâmica de Desenvolvimento

As decisões técnicas foram tomadas, em sua maioria, pelas próprias duplas responsáveis por cada camada, já que cada uma tinha o maior contexto sobre o que estava construindo. Ainda assim, o feedback dos demais integrantes era sempre bem-vindo, principalmente no momento da revisão das Pull Requests, onde pontos de melhoria e abordagens alternativas eram discutidos abertamente. No início, as decisões sobre o que implementar foram guiadas por cobrir os requisitos pedidos no laboratório; conforme o projeto avançou, a priorização passou a ser orientada pela próxima funcionalidade que cada dupla precisava para destravar seu trabalho.
Para manter o histórico do repositório limpo e legível, estabelecemos um padrão obrigatório tanto para commits quanto para Pull Requests. Os commits seguiam o formato de tipo e descrição (feat:, fix:, chore:, docs:, test:, refactor:, style:), e as branches seguiam a convenção tipo/escopo-descrição-curta (feat/, bugfix/, hotfix/, chore/). As Pull Requests também seguiam um modelo padronizado, com seções explicando o porquê e o que foi feito, como testar e as evidências de funcionamento. Esse padrão facilitou bastante a visualização do que cada PR entregava e tornou as revisões entre as duplas mais ágeis.
O maior desafio da dinâmica de desenvolvimento veio da criação do Gambit, um jogo completamente original concebido por nós. Por não ser baseado em um jogo já existente, não tínhamos, no início, uma definição clara de como ele deveria funcionar. Muitas regras e mecânicas só foram se consolidando ao longo do desenvolvimento, e novas ideias surgiam à medida que o jogo ganhava forma. Isso gerou atrasos e exigiu diversas alterações e refactors em código que já havia sido escrito, tanto no backend (regras de negócio e persistência) quanto no front (motor gráfico e fluxo de telas). Em vários momentos foi necessário voltar a partes já "prontas" para adaptá-las a uma nova decisão de design.
Esses ajustes também geraram bloqueios pontuais entre as duplas, já que mudanças na lógica do Gambit no backend impactavam diretamente o trabalho das duplas de front, que dependiam dessas definições para avançar. Nesses casos, nos reorganizamos priorizando as implementações que destravavam o trabalho das outras duplas.
A principal lição aprendida foi sobre a importância de definir melhor o escopo e as regras de uma funcionalidade original antes de começar a implementá-la. Boa parte dos refactors do Gambit poderia ter sido evitada com um planejamento inicial mais detalhado das mecânicas do jogo. Também percebemos que a ausência de uma Definição de Pronto (DoD) clara deixou alguns critérios de "terminado" subjetivos, e que adotá-la desde o início teria tornado as entregas mais previsíveis. Em um próximo projeto, investiríamos mais tempo no alinhamento de escopo logo no começo e formalizaríamos esses combinados que, neste projeto, ficaram apenas implícitos.

## 22. Historias de usuario 

História 1 — Cadastro de usuário · Prioridade: Alta
Como visitante, eu quero criar uma conta com e-mail e senha para que eu possa acessar o cassino e receber meu saldo inicial de fichas.
Critérios de aceitação:

Dado que estou na tela de cadastro, quando preencho e-mail válido e senha forte e confirmo, então minha conta é criada e recebo um saldo inicial de fichas.
Dado que informo um e-mail já cadastrado, quando submeto, então recebo mensagem de erro e o cadastro não é concluído.
Dado que a senha não atende às regras de validação, quando submeto, então o Zod bloqueia o envio e exibe o erro antes de chamar a API.

Rastreabilidade: 
PR Back: #2 Feat/create user entity and #3 Feat/auth user routes 
PR Front: #4 Feat loginpage creation

História 2 — Reroll de slot · Prioridade: Alta
Como jogador do cassino, eu quero selecionar um slot específico para realizar um reroll para que eu possa tentar melhorar minha combinação e aumentar minhas chances de obter uma recompensa maior.
Critérios de aceitação:

Dado que possuo rerolls disponíveis, quando seleciono um dos slots permitidos, então o sistema destaca visualmente o slot escolhido.
Dado que um slot foi selecionado, quando confirmo a ação de reroll, então apenas o slot escolhido executa novamente a animação de giro.
Dado que o reroll foi concluído, quando o backend retorna o novo resultado, então o símbolo exibido no slot corresponde exatamente ao valor recebido.
Dado que um reroll foi utilizado, quando a operação é concluída, então a quantidade restante de rerolls é atualizada na interface.
Dado que não possuo mais rerolls disponíveis, quando tento realizar um novo reroll, então o sistema não permite a ação e mantém o estado atual dos slots.

Rastreabilidade:
PR Back: #22 Feat/integrating slot machines
PR Front: #18 Feat/adding logic to slot machine, #21 Feat/slot machine organization

História 3 — Ranking de jogadores · Prioridade: Média
Como jogador competitivo, eu quero ver um ranking dos jogadores para que eu possa comparar meu desempenho com os demais.
Critérios de aceitação:

Dado que existem jogadores cadastrados, quando acesso a tela de ranking, então vejo a lista ordenada pelo saldo de fichas.
Dado que meu saldo é alterado, quando o ranking é recalculado, então minha posição reflete a mudança.

Rastreabilidade:
PR Back: #17 Feat/new user routes
PR Front: #11 Feat: homepage creation, #30Feat: add rank route

História 4 — Bônus diário · Prioridade: Média
Como jogador autenticado, eu quero resgatar meu bônus diário de fichas para que eu possa aumentar meu saldo e continuar jogando.
Critérios de aceitação:
Dado que estou logado e ainda não resgatei o bônus do dia, quando acesso o painel de bônus diário, então vejo o dia atual da sequência e posso resgatar a recompensa.
Dado que o bônus diário já foi resgatado, quando acesso o painel novamente, então o botão de resgate aparece bloqueado com a informação de que o bônus já foi coletado.
Dado que o resgate é concluído com sucesso, quando a API retorna a recompensa, então o saldo de fichas é atualizado na interface.

Rastreabilidade:
PR Back: #7 feat/user-profile-routes
PR Front: #15 add-diary-rewards

História 5 — Gerenciamento de mesas de jogo · Prioridade: Alta
Como administrador, eu quero criar, editar, desativar e remover mesas de jogo para que eu possa controlar quais mesas estarão disponíveis aos jogadores.
Critérios de aceitação:
Dado que estou autenticado como administrador, quando acesso a tela de mesas, então vejo a opção de criar uma nova mesa.
Dado que informo dados inválidos ao criar ou editar uma mesa, quando tento salvar, então recebo uma mensagem de erro e a operação não é concluída.
Dado que uma mesa está ativa, quando tento excluí-la, então a exclusão fica bloqueada até que a mesa seja desativada.
Dado que uma mesa possui sessões ativas, quando tento desativá-la, então o sistema exibe um aviso antes de concluir a operação.

Rastreabilidade:
PR Back: #6 feat/create-SlotMachine-entity, #8 feat/admin-guard,  #15 fix/Slot-game-logic
PR Front: #26 feat-table-system 

## 23. Refactor 

Refactor: changing token storage to cookie#35
Refactor Movimentação de Método
Esse refactor foi feito para realocar o token dos usuarios que estava no LocalStorage para o Cookie, tbm foi retirado o user que era salvo no LocalStorage

## 24. Conclusao

O RedGreen Frontend apresenta uma aplicacao React com arquitetura organizada em camadas, integracao com API, cache com SWR, interface visual consistente e dois sistemas de jogo implementados. A base de testes cobre diversos fluxos relevantes, especialmente autenticação, ranking, modais, Slot Machine e Gambit.

As principais lacunas identificadas para evolucao academica e tecnica sao a remocao ou conclusao de placeholders, a integracao real de schemas/formularios com as bibliotecas ja instaladas, a inclusao dos testes no pipeline CI/CD e a limpeza de arquivos residuais do template inicial.
