# Red & Green Cassino - Frontend

Responsável por gerenciar toda a interface do usuário, proporcionando uma experiência interativa e imersiva, incluindo navegação entre jogos, renderização gráfica e comunicação com a API backend.

---

## Funcionalidades

- **Autenticação e Formulários:** Implementação das telas de Cadastro e Login, utilizando React Hook Form para captura de dados e Zod para validação de regras no lado do cliente.
- **Gestão de Estado e Integração:** Configuração do Axios para comunicação com a API e do SWR para gerenciamento de estado global, garantindo a sincronização em tempo real do saldo de fichas e dados do perfil do usuário.
- **Estruturação de Telas:** Desenvolvimento do layout responsivo utilizando Tailwind CSS, incluindo a construção do Lobby (salão principal), da tabela do sistema de ranking e das interfaces para resgate de fichas por login diário.
- **Motor WebGL:** Implementação da biblioteca @pixi/react para isolar e renderizar os componentes visuais de alta demanda gráfica dentro da aplicação React.
- **Desenvolvimento dos Jogos:** Programação dos jogos do cassino com controle de animações, física e sincronização com o backend.
- **Animações de Interface:** Uso do Framer Motion para transições de interface, como abertura de modais e feedback visual de ações do usuário.

---

## Principais Tecnologias Utilizadas

* **Framework Core:** React + Vite  
* **Linguagem:** TypeScript  
* **Renderização Gráfica:** PixiJS + @pixi/react  
* **Estilização:** Tailwind CSS  
* **Animações:** Framer Motion  
* **Requisições HTTP:** Axios  
* **Gerenciamento de Estado:** SWR  
* **Formulários:** React Hook Form  
* **Validação:** Zod  

---

## Executando o Projeto

#### 1. Pré-requisitos Certifique-se de ter instalado em sua máquina:

* **Node.js**

---

#### 2. Instale as dependências do projeto

```bash
npm install
```

---

#### 3. Iniciando o ambiente de desenvolvimento

```bash
npm run dev
```

---

#### 4. Build para produção

```bash
npm run build
```

---

## Comandos Importantes (Scripts)

**Compila o projeto.**

```bash
npm run build
```
<br>

**Inicia o ambiente de desenvolvimento.**

```bash
npm run dev
```
<br>

**Verifica erros de padronização com o ESLint.**

```bash
npm run lint
```
<br>

**Roda o Prettier para formatar o código automaticamente.**

```bash
npm run format
```

---

## Estrutura do Projeto

```text
RedGreen-Front/
├── src/
│   ├── assets/           # Recursos visuais (imagens, ícones, etc)
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas principais (Login, Lobby, Jogos)
│   ├── hooks/            # Hooks customizados
│   ├── services/         # Configuração do Axios e integração com API
│   ├── styles/           # Configuração do Tailwind CSS
│   ├── types/            # Tipagens TypeScript
│   └── main.tsx          # Entrada da aplicação
│
└── vite.config.ts        # Configuração do Vite
```