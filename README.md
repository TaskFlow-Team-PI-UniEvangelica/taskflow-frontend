## Taskflow - Frontend

OBS: atualmente o frontend se apresenta estático e apenas visual
o sistema de autenticação será feito e incorporado ao front e foi feito com react para os componentes e vite para deploy.

## Estrutura de pastas

taskflow-frontend/
├── public/                 # Arquivos estáticos e globais (imagens de fundo, ícones padrão).
├── src/                    # Código-fonte principal da aplicação React.
│   ├── assets/             # Recursos estáticos importados diretamente no código (ex: react.svg).
│   ├── components/         # Componentes visuais e de layout reutilizáveis.
│   │   ├── AuthLayout/     # Layouts de autenticação e lógica de rotas protegidas (ProtectedRoute).
│   │   ├── DashboardLayout/# Estrutura visual base do sistema logado.
│   │   ├── LoginForm/      # Componentes específicos de formulários e recuperação de senha.
│   │   ├── RegisterForm/   # Componentes de cadastro de novos usuários.
│   │   └── UI/             # Componentes primitivos genéricos e isolados (Button, Input, PasswordInput).
│   ├── context/            # Contextos globais da aplicação (ex: ThemeContext para temas).
│   ├── pages/              # Telas roteáveis completas da aplicação.
│   │   ├── Dashboard/      # Visão geral do usuário logado.
│   │   ├── Kanban/         # Quadro de gerenciamento interativo de tarefas.
│   │   ├── Tasks/          # Listagem e edição de tarefas.
│   │   └── Teams/          # Criação e gestão de equipes e tarefas conjuntas.
│   ├── App.jsx             # Ponto central de definição do roteamento (react-router-dom).
│   └── main.jsx            # Ponto de entrada principal que renderiza o React no DOM.
├── .gitignore              # Regras de exclusão de arquivos para o repositório.
├── package.json            # Gerenciamento de dependências e scripts de execução.
└── vite.config.js          # Configurações do empacotador Vite.


## Requisitos para rodar
- Node.js

## Passos para rodar
- Clonar o projeto e entrar no terminal na raiz do projeto

- Instale as dependências com
```bash
   npm install
   ```
- Faça o build com
```bash
   npm run build
   ```

- Rode o servidor local com
```bash
   npm run dev
   ```

- Rode o Backend SpringBoot local na porta 3000

- Acesse a url do projeto localmente
http://localhost:5173/

- Para acessar o Dashboard faça login com um usuário válido, caso não tenha crie um novo usuário.
