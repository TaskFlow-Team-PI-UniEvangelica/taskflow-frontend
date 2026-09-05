## Taskflow - Frontend
Aplicação web desenvolvida para ser a interface visual do sistema Taskflow, permitindo o gerenciamento interativo de usuários, equipes e tarefas (via Kanban). Construída com **React** e **Vite**, a aplicação é totalmente containerizada com **Docker**, garantindo alta estabilidade e separação clara entre os ambientes de desenvolvimento e produção (utilizando Nginx).
Este repositório atua em conjunto com a Taskflow API e faz parte da execução do Projeto Integrativo e do Projeto de Conclusão de Curso da Universidade Evangélica de Anápolis.

- URL de deploy de testes, cole no navegador para acessar a aplicação sem executar localmente:
    ```
    http://124.198.128.120/
    ```

## Dependências e Tecnologias Usadas

* **Linguagem:** JavaScript (JSX)
* **Biblioteca Principal:** React
* **Build e Empacotador:** Vite
* **Roteamento:** React Router DOM
* **Infraestrutura e Deploy:** Docker, Docker Compose e Nginx
* **Automação de Comandos:** GNU Make (Makefile)
* **Gerenciador de Pacotes:** NPM

## Estrutura de pastas

```
taskflow-frontend/
├── public/                  # Arquivos estáticos e globais (imagens de fundo, ícones padrão).
├── src/                     # Código-fonte principal da aplicação React.
│   ├── assets/              # Recursos estáticos importados diretamente no código (ex: react.svg).
│   ├── components/          # Componentes visuais e de layout reutilizáveis.
│   │   ├── DashboardLayout/ # Estrutura visual base do sistema logado.
│   │   └── UI/              # Componentes primitivos genéricos e isolados (Button, Input, PasswordInput).
│   ├── context/             # Contextos globais da aplicação (ex: ThemeContext para temas).
│   ├── pages/               # Telas roteáveis completas da aplicação.
│   │   ├── Dashboard/       # Visão geral do usuário logado.
│   │   ├── Kanban/          # Quadro de gerenciamento interativo de tarefas.
│   │   ├── Tasks/           # Listagem e edição de tarefas.
│   │   └── Teams/           # Criação e gestão de equipes e tarefas conjuntas.
│   ├── _deprecated/         # Componentes de autenticação antigos e inativos.
│   ├── _deprecated/         # Componentes de autenticação antigos e inativos.
│   ├── App.jsx              # Ponto central de definição do roteamento (react-router-dom).
│   └── main.jsx             # Ponto de entrada principal que renderiza o React no DOM.
├── .gitignore               # Regras de exclusão de arquivos para o repositório.
├── docker-compose.yml       # Orquestração do ambiente de Produção (Nginx).
├── docker-compose.dev.yml   # Orquestração do ambiente de Desenvolvimento (Vite).
├── Dockerfile               # Imagem de Produção (Build Node + Deploy Nginx).
├── Dockerfile.dev           # Imagem de Desenvolvimento (Node + Vite).
├── Makefile                 # Atalhos para rodar os comandos do Docker.
├── package.json             # Gerenciamento de dependências e scripts de execução.
└── vite.config.js           # Configurações do empacotador Vite.
```


## Segurança e Autenticação
O TaskFlow Frontend utiliza o padrão **OIDC (OpenID Connect)** integrado ao Keycloak. 
Por motivos de segurança (prevenção contra ataques XSS - *Cross-Site Scripting*), a aplicação **não armazena Tokens JWT no LocalStorage ou SessionStorage**. O estado da sessão é gerenciado de forma puramente em memória através da biblioteca `react-oidc-context`.

## Requisitos para rodar
- Docker e Docker Compose V2
- Make (Para executar os atalhos apenas Linux)
- NodeJS (Caso queira executar manualmente)

## Configuração do `.env` (Desenvolvimento e Produção)
Crie um arquivo chamado `.env` na raiz do projeto. Ele será lido pelo Vite no ambiente de Desenvolvimento e empacotado no Build pelo Docker para o ambiente de Produção.

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
No servidor, é usado domínios oficiais que apontam para o Cloudflare Tunnels.
```env
# URL da sua API Pública (Com HTTPS)
VITE_API_URL=https://api.taskflow.com.br

# Configurações do Keycloak (Público via Cloudflare)
VITE_KEYCLOAK_AUTHORITY=https://auth.taskflow.com.br/realms/taskflow-realm
VITE_KEYCLOAK_CLIENT_ID=taskflow-frontend

# URL de redirecionamento (A URL oficial do Front-end)
VITE_REDIRECT_URI=https://taskflow.com.br
```

## Passos para rodar via Linux (Docker + Makefile)

1. **Clone o repositório:**
Clone o repositório do backend seja usando terminal ou baixando o arquivo ZIP.

2. **Acesse a pasta do projeto pelo terminal:**
   ```bash
   cd taskflow-frontend
   ```

3. **Tenha seu .env configurado:**
Siga as instruções do tópico anterior para criar o .env da aplicação.

4. **Rode o Backend SpringBoot:**
Instruções de execução do back esta no README do repositório da API.

5. **Escolha o ambiente que deseja subir a aplicação:**
Escolha o ambiente que deseja subir a aplicação.

- Garanta que o Docker tenha acesso administrador ao seu sistema.

### Ambiente de desenvolvimento.
- Rodar em ambiente de desenvolvimento usando Vite:
   ```
   make run-dev
   ```
   Acessar a url local: ``` http://localhost:5173 ```
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
- Acessar container de desenvolvimento para executar comandos linux:
   ```
	make terminal-dev
   ```
   Para sair digite ``` exit ``` no terminal.

### Ambiente de produção.
- Rodar em ambiente de produção usando Nginx:
   ```
   make run
   ```
   Acessar a url local: ``` http://localhost/ ```
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
- Acessar container de produção para executar comandos linux:
   ```
	make terminal
   ```
   Para sair digite ``` exit ``` no terminal.

6. **Como acessar o Dashboard:** Faça o login com um usuário válido, caso não tenha crie um novo usuário.


## Passos para rodar via Windows (Docker)

1. **Clone o repositório:**
Clone o repositório do backend seja usando terminal ou baixando o arquivo ZIP.

2. **Acesse a pasta do projeto pelo terminal:**
   ```bash
   cd taskflow-frontend
   ```

3. **Tenha seu .env configurado:**
Siga as instruções do tópico anterior para criar o .env da aplicação.

4. **Rode o Backend SpringBoot:**
Instruções de execução do back esta no README do repositório da API.

5. **Escolha o ambiente que deseja subir a aplicação:**
Escolha o ambiente que deseja subir a aplicação.

### Ambiente de desenvolvimento.
- Rodar em ambiente de desenvolvimento usando Vite:
   ```
   docker compose -f docker-compose-dev.yml up --build
   ```
   Acessar a url local: ``` http://localhost:5173 ```
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
- Acessar container de desenvolvimento para executar comandos linux:
   ```
	docker exec -it taskflow_frontend_dev bash
   ```
   Para sair digite ``` exit ``` no terminal.

### Ambiente de produção.
- Rodar em ambiente de produção usando Nginx:
   ```
   docker compose up --build
   ```
   Acessar a url local: ``` http://localhost/ ```
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
- Acessar container de produção para executar comandos linux:
   ```
	docker exec -it taskflow_frontend bash
   ```
   Para sair digite ``` exit ``` no terminal.

6. **Como acessar o Dashboard:** Faça o login com um usuário válido, caso não tenha crie um novo usuário.

## Passos para rodar manualmente (Node)
- Necessário ter o Node instalado no computador.

- Clonar o projeto e entrar no terminal na raiz do projeto.

- Rode o Backend SpringBoot: Instruções de execução do back esta no README do repositório do Backend.

- Instale as dependências com:
```
   npm install
   ```
- Faça o build com:
```
   npm run build
   ```
- Rode o servidor local com:
```
   npm run dev
   ```

- Acesse a url do projeto pelo vite localmente: ``` http://localhost:5173/ ```

- Para acessar o Dashboard faça login com um usuário válido, caso não tenha crie um novo usuário.