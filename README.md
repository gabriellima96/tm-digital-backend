# Projeto BFF Agro-Insumos TM Digital

## Descrição

Este projeto é um Backend para Frontend (BFF) desenvolvido como parte de um desafio técnico. O objetivo é criar uma solução para um cliente do setor de agronegócio, especificamente um **distribuidor de insumos**, para apoiá-lo em estratégias de expansão de market share na região de **Minas Gerais (MG)**. O foco do distribuidor é a venda de **fertilizantes aplicados na produção de soja, milho e algodão**.

A solução visa permitir que o cliente identifique onde e como pode expandir seu mercado, com foco em encontrar **produtores rurais ocultos** com base na realidade agrícola de suas fazendas, desconsiderando sua carteira de clientes consolidada.

## Funcionalidades Implementadas

* **Autenticação:**
    * Login de usuários (`POST /auth/login`) com JWT.
* **Gerenciamento de Usuários (Equipe Comercial):**
    * CRUD completo para `Usuario` (`/usuarios`).
* **Dados de Referência Geográfica:**
    * `Estado`: `GET`, `POST` (`/estados`).
    * `Município`: `POST` (`/municipios`), `GET` por estado (`/estados/:idEstado/municipios`).
* **Dados de Produção Agrícola:**
    * `Cultura`: `GET`, `POST` (`/culturas`).
* **Gerenciamento de Clientes Potenciais:**
    * `Proprietário`: CRUD completo (`/proprietarios`).
    * `PropriedadeRural`: CRUD completo (`/propriedades-rurais`), incluindo associações com municípios, proprietários e culturas.
* **Prospecção e Leads:**
    * `CampanhaProspeccao`: CRUD completo (`/campanhas`).
    * `Lead`:
        * Geração de leads baseada em campanhas (`POST /campanhas/:idCampanha/gerar-leads`).
        * Atualização de status e atribuição (`PATCH /leads/:idLead`).
        * Busca de leads por campanha (`GET /campanhas/:idCampanha/leads`) e por ID de lead (`GET /leads/:idLead`).
* _(A funcionalidade de "Atividades de Prospecção" não foi implementada)._

## Tecnologias Utilizadas

* **Backend:** NestJS (TypeScript)
* **Banco de Dados:** PostgreSQL com extensão PostGIS (para dados geoespaciais)
* **ORM:** TypeORM
* **Autenticação:** Passport.js com estratégias Local e JWT
* **Containerização:** Docker, Docker Compose
* **Linting/Formatting:** ESLint, Prettier
* **Testes E2E:** Jest, Supertest

## Pré-requisitos

* Node.js (versão LTS recomendada, ex: v22.x)
* npm ou Yarn
* Docker Engine
* Docker Compose
* Git

## Como Iniciar e Rodar o Projeto

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/gabriellima96/tm-digital-backend
    cd tm-digital-backend
    ```

2.  **Configurar Variáveis de Ambiente:**
    * Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
        ```bash
        cp .env.example .env
        ```
    * Preencha o arquivo `.env` com as configurações necessárias (portas, credenciais do banco, segredo JWT, etc.).
        Exemplo de `.env`:
        ```env
          PORT=3000
          APP_PORT_HOST=3000 # Porta do host para acessar a app

          DB_USER=admin
          DB_PASSWORD=secret
          DB_NAME=postgres
          DB_HOST=db # Nome do serviço do banco no docker-compose
          DB_PORT_CONTAINER=5432 # Porta interna do container do DB
          DB_PORT_HOST=5432 # Porta do host para acessar o DB

          NODE_ENV=development

          JWT_SECRET=segredosupersecreto
          JWT_EXPIRATION_TIME=3600s
        ```

3.  **Instalar Dependências do Projeto:**
    ```bash
    npm install
    # ou
    # yarn install
    ```

4.  **Iniciar os Contêineres Docker (Aplicação + Banco de Dados):**
    ```bash
    docker-compose up --build -d
    ```

5.  **Executar as Migrações do Banco de Dados:**
    Após os contêineres estarem rodando (especialmente o do banco de dados), execute as migrações para criar as tabelas:
    ```bash
    npm run migration:run
    ```
6.  **A Aplicação Estará Rodando:**
    * A API estará acessível em `http://localhost:PORTA_CONFIGURADA` (ex: `http://localhost:3000`).

## Executando a Aplicação (Desenvolvimento Local Fora do Docker, após setup inicial)

Se você configurou o banco de dados para ser acessível localmente e instalou as dependências:
```bash
npm run start:dev
```

Este comando inicia a aplicação em modo de desenvolvimento com hot-reloading. A API estará acessível em `http://localhost:PORTA_CONFIGURADA` (ex: `http://localhost:3000)`.

## Visão Geral dos Endpoints da API

A seguir, uma lista dos principais grupos de endpoints. Recomenda-se o uso de uma ferramenta como Postman ou Insomnia para interagir com a API. *(Nota: A maioria dos endpoints, exceto `/auth/login`, deve ser protegida por JWT após a autenticação).*

* **Autenticação (`/auth`)**
    * `POST /login`: Realiza o login do usuário e retorna um token JWT.

* **Usuários (`/usuarios`)** - *Protegido por JWT*
    * `POST /`: Cria um novo usuário.
    * `GET /`: Lista todos os usuários.
    * `GET /:id`: Busca um usuário por ID.
    * `GET /email/:email`: Busca um usuário por email.
    * `PATCH /:id`: Atualiza um usuário.
    * `DELETE /:id`: Remove um usuário.

* **Estados (`/estados`)** -*Protegido por JWT*
    * `POST /`: Cria um novo estado.
    * `GET /`: Lista todos os estados.
    * `GET /:id`: Busca um estado por ID.
    * `GET /uf/:uf`: Busca um estado por UF.
    * `GET /:idEstado/municipios`: Lista os municípios de um estado específico.

* **Municípios (`/municipios`)** - *Protegido por JWT*
    * `POST /`: Cria um novo município (requer `idEstado` válido).
    * `GET /:id`: Busca um município por ID.
    * *(Listagem principal de municípios via `/estados/:idEstado/municipios`)*

* **Culturas (`/culturas`)** - *Protegido por JWT*
    * `POST /`: Cria uma nova cultura.
    * `GET /`: Lista todas as culturas.
    * `GET /:id`: Busca uma cultura por ID.
    * `GET /nome/:nome`: Busca uma cultura por nome.

* **Proprietários (`/proprietarios`)** - *Protegido por JWT*
    * `POST /`: Cria um novo proprietário.
    * `GET /`: Lista todos os proprietários.
    * `GET /:id`: Busca um proprietário por ID.
    * `GET /cpf/:cpf`: Busca um proprietário por CPF.
    * `PATCH /:id`: Atualiza um proprietário.
    * `DELETE /:id`: Remove um proprietário.

* **Propriedades Rurais (`/propriedades-rurais`)** - *Protegido por JWT*
    * `POST /`: Cria uma nova propriedade rural.
    * `GET /`: Lista todas as propriedades rurais.
    * `GET /:id`: Busca uma propriedade rural por ID.
    * `PATCH /:id`: Atualiza uma propriedade rural.
    * `DELETE /:id`: Remove uma propriedade rural.

* **Campanhas de Prospecção (`/campanhas`)** - *Protegido por JWT*
    * `POST /`: Cria uma nova campanha.
    * `GET /`: Lista todas as campanhas.
    * `GET /:id`: Busca uma campanha por ID.
    * `PATCH /:id`: Atualiza uma campanha.
    * `DELETE /:id`: Remove uma campanha.
    * `POST /:idCampanha/gerar-leads`: Dispara a geração de leads para a campanha.

* **Leads (`/leads`)** - *Protegido por JWT*
    * `GET /:idLead`: Busca um lead por ID.
    * `PATCH /:idLead`: Atualiza um lead (status, usuário atribuído, etc.).
    * *(Listagem de leads de uma campanha via `/campanhas/:idCampanha/leads`)*

## Testes

* **Testes End-to-End (E2E):**
    ```bash
    npm run test:e2e
    ```
    Para rodar um arquivo de teste E2E específico:
    ```bash
    npm run test:e2e -- test/nome-do-arquivo.e2e-spec.ts
    ```

## Estrutura do Projeto (Visão Geral)

O projeto segue a arquitetura modular padrão do NestJS:
* `src/`
    * `app.module.ts`: Módulo raiz.
    * `main.ts`: Arquivo de inicialização da aplicação.
    * `auth/`: Módulo de autenticação (JWT, Passport).
    * `db/`: Módulo de configuração do banco de dados e migrações.
    * `usuarios/`: Módulo para a entidade `Usuario`.
    * `estados/`: Módulo para a entidade `Estado`.
    * `municipios/`: Módulo para a entidade `Municipio`.
    * `culturas/`: Módulo para a entidade `Cultura`.
    * `proprietarios/`: Módulo para a entidade `Proprietario`.
    * `propriedades-rurais/`: Módulo para a entidade `PropriedadeRural`.
    * `campanhas/`: Módulo para a entidade `CampanhaProspeccao`.
    * `leads/`: Módulo para a entidade `Lead`.
* `test/`: Contém os testes E2E.
* `Dockerfile`: Para construir a imagem Docker da aplicação.
* `docker-compose.yml`: Para orquestrar os serviços Docker (app e banco de dados).
* `.env`: Arquivo para variáveis de ambiente (não versionado).
* `.eslintrc.js`, `.prettierrc.js`, `.editorconfig`: Arquivos de configuração para linting e formatação.

## Visão Geral dos Endpoints da API

A seguir, uma lista dos principais grupos de endpoints. Recomenda-se o uso de uma ferramenta como Postman ou Insomnia para interagir com a API. *(Nota: A maioria dos endpoints, exceto `/auth/login`, deve ser protegida por JWT após a autenticação).*

* **Autenticação (`/auth`)**
    * `POST /login`: Realiza o login do usuário e retorna um token JWT.
    * `GET /perfil`: Retorna o perfil do usuário autenticado (requer token JWT).

* **Usuários (`/usuarios`)** - *Protegido por JWT*
    * `POST /`: Cria um novo usuário.
    * `GET /`: Lista todos os usuários.
    * `GET /:id`: Busca um usuário por ID.
    * `GET /email/:email`: Busca um usuário por email.
    * `PATCH /:id`: Atualiza um usuário.
    * `DELETE /:id`: Remove um usuário.

* **Estados (`/estados`)** - *Endpoints `POST` podem ser protegidos ou para uso administrativo*
    * `POST /`: Cria um novo estado.
    * `GET /`: Lista todos os estados.
    * `GET /:id`: Busca um estado por ID.
    * `GET /uf/:uf`: Busca um estado por UF.
    * `GET /:idEstado/municipios`: Lista os municípios de um estado específico.

* **Municípios (`/municipios`)** - *Endpoint `POST` pode ser protegido ou para uso administrativo*
    * `POST /`: Cria um novo município (requer `idEstado` válido).
    * `GET /:id`: Busca um município por ID.
    * *(Listagem principal de municípios via `/estados/:idEstado/municipios`)*

* **Culturas (`/culturas`)** - *Endpoint `POST` pode ser protegido ou para uso administrativo*
    * `POST /`: Cria uma nova cultura.
    * `GET /`: Lista todas as culturas.
    * `GET /:id`: Busca uma cultura por ID.
    * `GET /nome/:nome`: Busca uma cultura por nome.

* **Proprietários (`/proprietarios`)** - *Protegido por JWT*
    * `POST /`: Cria um novo proprietário.
    * `GET /`: Lista todos os proprietários.
    * `GET /:id`: Busca um proprietário por ID.
    * `GET /cpf/:cpf`: Busca um proprietário por CPF.
    * `PATCH /:id`: Atualiza um proprietário.
    * `DELETE /:id`: Remove um proprietário.

* **Propriedades Rurais (`/propriedades-rurais`)** - *Protegido por JWT*
    * `POST /`: Cria uma nova propriedade rural.
    * `GET /`: Lista todas as propriedades rurais.
    * `GET /:id`: Busca uma propriedade rural por ID.
    * `PATCH /:id`: Atualiza uma propriedade rural.
    * `DELETE /:id`: Remove uma propriedade rural.

* **Campanhas de Prospecção (`/campanhas`)** - *Protegido por JWT*
    * `POST /`: Cria uma nova campanha.
    * `GET /`: Lista todas as campanhas.
    * `GET /:id`: Busca uma campanha por ID.
    * `PATCH /:id`: Atualiza uma campanha.
    * `DELETE /:id`: Remove uma campanha.
    * `POST /:idCampanha/gerar-leads`: Dispara a geração de leads para a campanha.

* **Leads (`/leads`)** - *Protegido por JWT*
    * `GET /:idLead`: Busca um lead por ID.
    * `PATCH /:idLead`: Atualiza um lead (status, usuário atribuído, etc.).
    * *(Listagem de leads de uma campanha via `/campanhas/:idCampanha/leads`)*

---
## Esquema do Banco de Dados

Abaixo está uma representação visual simplificada do esquema do banco de dados e suas principais tabelas e relacionamentos.

![Diagrama do Banco de Dados](https://github.com/gabriellima96/tm-digital-backend/blob/main/postgres%20-%20public.png)

**Principais Tabelas:**
* `usuarios` 
* `estados`
* `municipios` 
* `culturas` 
* `proprietarios` 
* `propriedades_rurais` 
* `propriedade_proprietario` (tabela de junção)
* `propriedade_cultura` (tabela de junção)
* `campanhas_prospeccao` (prospecting_campaigns)
* `leads` (leads)
* `migrations_history` (histórico de migrações do TypeORM)

---
## Coleção da API (Postman/Insomnia)

Para facilitar os testes e a exploração da API, você pode importar uma coleção de requisições para o Postman ou Insomnia.

[Baixar Coleção do Postman](https://github.com/gabriellima96/tm-digital-backend/blob/main/collections/tm-digital-backend.postman_collection.json)

[Baixar Environment](https://github.com/gabriellima96/tm-digital-backend/blob/main/collections/local.postman_environment.json)

---
