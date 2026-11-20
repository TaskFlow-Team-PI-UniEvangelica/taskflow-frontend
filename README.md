## Taskflow - Frontend
Aplicação web desenvolvida para ser a interface visual do sistema Taskflow, permitindo o gerenciamento interativo de organizações, usuários, equipes e tarefas (via Kanban). Construída com **React 19** e **Vite 7** sobre **Node 26 LTS**, a aplicação é totalmente containerizada com **Docker**, garantindo alta estabilidade e separação clara entre os ambientes de desenvolvimento e produção (utilizando **Nginx Unprivileged 1.31-alpine**).
Este repositório atua em conjunto com a Taskflow API e faz parte da execução do Projeto Integrativo e do Projeto de Conclusão de Curso da Universidade Evangélica de Goiás (UniEVANGÉLICA).

- **URL oficial de produção:**
    ```
    https://taskflow.party
    ```

## Configuração e Variáveis de Ambiente
Antes de iniciar o frontend, faça uma cópia do arquivo `.env.example` renomeando-o para `.env` e preencha a URL da API do backend e as configurações de autenticação do Keycloak (Autoridade, Client ID, Redirect URI).

## Dependências e Tecnologias Usadas

* **Runtime / Engine:** Node.js **26 LTS** (`engines.node >= 26`)
* **Linguagem:** JavaScript (JSX)
* **Biblioteca Principal:** React 19
* **Build e Empacotador:** Vite 7
* **Roteamento:** React Router DOM 7
* **Autenticação OIDC:** `react-oidc-context` + `oidc-client-ts` (PKCE, Keycloak **26**)
* **Infraestrutura e Deploy:** Docker, Docker Compose, Nginx Unprivileged **1.31-alpine** (porta `8080`, CSP efetiva) e GitHub Actions + Trivy
* **Qualidade Estática:** ESLint (`eslint.config.js`)
* **Automação de Comandos:** GNU Make (`Makefile`)
* **Gerenciador de Pacotes:** NPM

## Estrutura de pastas

```
taskflow-frontend/
├── .github/workflows/ci-cd.yml       # Pipeline (lint + build + imagem ARM64 + Trivy + deploy)
├── nginx/
│   └── default.conf.template         # Configuração Nginx 1.31 com CSP efetiva e cache SPA
├── public/                           # Arquivos estáticos e globais (favicon, imagens)
├── src/                              # Código-fonte principal da aplicação React
│   ├── auth/                         # Cliente OIDC / Keycloak (sessionStorage, PKCE, clearTabSession)
│   ├── components/                   # Componentes visuais e de layout reutilizáveis
│   │   ├── DashboardLayout/          # Layout base (sidebar rolável, avatar 512x512 JPEG, convites)
│   │   ├── ErrorBoundary/            # Fallback de erro em dois níveis (global e por rota)
│   │   ├── SessionErrorModal/        # Modal acionável quando ocorre erro de autenticação (auth.error)
│   │   └── TaskHistory/              # Timeline de auditoria (TaskTimeline) e modal de tarefas excluídas
│   ├── context/                      # Contextos globais (ThemeContext, OrganizationContext com hot reload 4s)
│   ├── pages/                        # Telas roteáveis completas da aplicação
│   │   ├── Dashboard/                # Visão geral e métricas da organização ativa
│   │   ├── Kanban/                   # Quadro Kanban interativo com drag-and-drop e identificação por ID
│   │   ├── Landing/                  # Landing page pública com CTAs de login/cadastro
│   │   ├── Organizations/            # Gestão de organizações e 4 seções de governança RBAC
│   │   ├── Tasks/                    # Criação e edição de tarefas (EditTasks)
│   │   └── Teams/                    # Gestão de equipe, convites por e-mail e hierarquia de papéis
│   ├── App.jsx                       # Roteamento protegido, renovação de sessão e tratamento de callbacks OIDC
│   ├── index.css                     # Estilos globais e variáveis de tema Light/Dark
│   └── main.jsx                      # Ponto de entrada com AuthProvider e ErrorBoundary global
├── .dockerignore                     # Exclusões para build limpo da imagem
├── .env.example                      # Modelo de variáveis de ambiente para dev e prod
├── .trivyignore                      # Exceções justificadas para scan Trivy
├── docker-compose.yml                # Orquestração de Produção (Nginx na porta 80 -> 8080)
├── docker-compose-dev.yml            # Orquestração de Desenvolvimento (Vite com Hot Reload)
├── Dockerfile                        # Multi-stage (Node 26 -> Nginx Unprivileged 1.31-alpine)
├── Dockerfile-dev                    # Imagem de Desenvolvimento (Node 26 + Vite)
├── eslint.config.js                  # Regras de lint do projeto
├── Makefile                          # Atalhos Docker
├── package.json                      # Dependências e scripts NPM
└── vite.config.js                    # Configurações do Vite
```


## Segurança, Autenticação e Resiliência
O TaskFlow Frontend utiliza **OIDC (OpenID Connect)** integrado ao **Keycloak 26**, adotando as seguintes diretrizes:
- **Fluxo Authorization Code com PKCE:** Implementado via `react-oidc-context` e `oidc-client-ts`, garantindo troca criptográfica de tokens no navegador sem exposição de *client secrets*.
- **Tokens no `sessionStorage` e Renovação Silenciosa:** A sessão da aba fica isolada no `sessionStorage` (`clearTabSession()` remove apenas os tokens da aba ao invalidar, preservando o `state` de logins em andamento em outras abas; tokens legados no `localStorage` são limpos na inicialização). Novas abas autenticam via SSO sem pedir senha, e acessos com access token vencido tentam renovação silenciosa via refresh token antes de encerrar a sessão.
- **Fluxo de Cadastro com Confirmação Manual de Login:** Ao concluir cadastro ou verificação de e-mail (`verified=1`), a sessão temporária é encerrada e o usuário é direcionado ao login explícito (`prompt: 'login'`), evitando auto-login indevido.
- **Content Security Policy (CSP) Efetiva e Headers Nginx:** O servidor Nginx Unprivileged (`1.31-alpine`, UID `101`, porta `8080`) envia cabeçalho efetivo `Content-Security-Policy` (`script-src 'self'`, origens de API/Keycloak injetadas em build, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `object-src 'none'`), além de `X-Frame-Options: DENY` e `X-Content-Type-Options: nosniff`.
- **Resiliência de Interface (`ErrorBoundary` + `SessionErrorModal`):** `ErrorBoundary` em dois níveis (raiz e `<Outlet />`, resetando automaticamente ao mudar de rota) evita tela branca em falhas inesperadas de renderização, e `SessionErrorModal` oferece recuperação acionável quando há `auth.error`.
- **Upload de Avatar Otimizado:** O recorte no cliente redimensiona a imagem para no máximo **512×512 JPEG** (qualidade `0.9` com fundo branco para PNGs transparentes), mantendo conformidade com o limite de 2 MB da API.
- **Rotas Protegidas:** Usuários sem token ativo que acessam rotas internas (`/dashboard`, `/kanban`, `/tasks`, `/edit-tasks`, `/teams`, `/organizations`) são redirecionados para `/`.

## Requisitos para rodar
- Docker e Docker Compose V2
- Make (para executar os atalhos no Linux)
- NodeJS **26 LTS** (caso queira executar manualmente fora do Docker)

## Configuração do `.env` (Desenvolvimento e Produção)
Crie um arquivo chamado `.env` na raiz do projeto. Ele será lido pelo Vite em Desenvolvimento e passado como `build-arg` pelo Docker em Produção.

### Para Desenvolvimento Local (`make run-dev`)
Use as URLs locais. O Vite usará a porta `5173`.
```env
# URL da sua API Java (Local)
VITE_API_URL=http://localhost:8080

# Configurações do Keycloak (Local)
VITE_KEYCLOAK_AUTHORITY=http://localhost:9090/realms/taskflow-realm
VITE_KEYCLOAK_CLIENT_ID=taskflow-frontend
VITE_REDIRECT_URI=http://localhost:5173
```

### Para Produção (`make run`)
Em produção, são utilizados os domínios oficiais protegidos pelo Cloudflare Tunnel.
```env
# URL da sua API Pública (Com HTTPS)
VITE_API_URL=https://api.taskflow.party

# Configurações do Keycloak (Público via Cloudflare)
VITE_KEYCLOAK_AUTHORITY=https://auth.taskflow.party/realms/taskflow-realm
VITE_KEYCLOAK_CLIENT_ID=taskflow-frontend

# URL de redirecionamento (URL oficial do Front-end)
VITE_REDIRECT_URI=https://taskflow.party
```

## Passos para rodar via Linux (Docker + Makefile)

1. **Clone o repositório:**
Clone o repositório do frontend usando terminal ou baixando o arquivo ZIP.

2. **Acesse a pasta do projeto pelo terminal:**
   ```bash
   cd taskflow-frontend
   ```

3. **Tenha seu `.env` configurado:**
Siga as instruções do tópico anterior para criar o `.env` da aplicação.

4. **Rode o Backend Spring Boot:**
Instruções de execução do backend estão no README do repositório da API.

5. **Escolha o ambiente que deseja subir:**
- Garanta que o Docker tenha permissão de execução no seu sistema.

### Ambiente de desenvolvimento
- Rodar em ambiente de desenvolvimento usando Vite:
   ```
   make run-dev
   ```
   Acesse no navegador: `http://localhost:5173`
- Para desligar os containers:
   ```
   make down
   ```
- Derruba o container de desenvolvimento e apaga as imagens:
   ```
   make clean-dev
   ```
- Acessar os logs do container de desenvolvimento:
   ```
   make logs-dev
   ```
- Acessar container de desenvolvimento para executar comandos Linux:
   ```
   make terminal-dev
   ```
   Para sair digite `exit` no terminal.

### Ambiente de produção (build local)
- Rodar em ambiente de produção usando Nginx (mapeado para porta `80 -> 8080`):
   ```
   make run
   ```
   Acesse no navegador: `http://localhost/`
- Para desligar container de produção:
   ```
   make down
   ```
- Derruba o container de produção e apaga as imagens:
   ```
   make clean
   ```
- Acessar os logs do container de produção:
   ```
   make logs
   ```
- Acessar container de produção para executar comandos Linux (a imagem Alpine usa `sh`):
   ```
   make terminal
   ```
   Para sair digite `exit` no terminal.

6. **Como acessar o Dashboard:** Faça o login com um usuário válido; caso não tenha conta, registre um novo usuário e confirme o e-mail.


## Passos para rodar via Windows (Docker)

1. **Clone o repositório:**
Clone o repositório do frontend usando terminal ou baixando o arquivo ZIP.

2. **Acesse a pasta do projeto pelo terminal:**
   ```bash
   cd taskflow-frontend
   ```

3. **Tenha seu `.env` configurado:**
Siga as instruções do tópico anterior para criar o `.env` da aplicação.

4. **Rode o Backend Spring Boot:**
Instruções de execução do backend estão no README do repositório da API.

5. **Escolha o ambiente que deseja subir:**

### Ambiente de desenvolvimento
- Rodar em ambiente de desenvolvimento usando Vite:
   ```
   docker compose -f docker-compose-dev.yml up --build
   ```
   Acesse no navegador: `http://localhost:5173`
- Para desligar container de desenvolvimento:
   ```
   docker compose -f docker-compose-dev.yml down
   ```
- Derruba o container de desenvolvimento e apaga as imagens:
   ```
   docker compose -f docker-compose-dev.yml down --rmi all
   ```
- Acessar os logs do container de desenvolvimento:
   ```
   docker compose -f docker-compose-dev.yml logs -f
   ```
- Acessar container de desenvolvimento:
   ```
   docker exec -it taskflow_frontend_dev bash
   ```
   Para sair digite `exit` no terminal.

### Ambiente de produção
- Rodar em ambiente de produção usando Nginx:
   ```
   docker compose up --build
   ```
   Acesse no navegador: `http://localhost/`
- Para desligar container de produção:
   ```
   docker compose down
   ```
- Derruba o container de produção e apaga as imagens:
   ```
   docker compose down --rmi all
   ```
- Acessar os logs do container de produção:
   ```
   docker compose logs -f
   ```
- Acessar container de produção (imagem Alpine possui `sh`, não `bash`):
   ```
   docker exec -it taskflow_frontend sh
   ```
   Para sair digite `exit` no terminal.

6. **Como acessar o Dashboard:** Faça o login com um usuário válido; caso não tenha conta, registre um novo usuário e confirme o e-mail.

## Passos para rodar manualmente (Node 26 LTS)
- Necessário ter o **Node.js 26 LTS** instalado no computador.
- Clonar o projeto e entrar no terminal na raiz do projeto.
- Rode o Backend Spring Boot (instruções no README do repositório da API).
- Instale as dependências com:
  ```bash
  npm ci
  ```
- Valide lint e build de produção com:
  ```bash
  npm run lint
  npm run build
  ```
- Rode o servidor local com:
  ```bash
  npm run dev
  ```
- Acesse a URL local pelo Vite: `http://localhost:5173/`
