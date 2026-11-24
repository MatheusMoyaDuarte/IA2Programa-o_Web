# AulaReact02 — Sistema de Produtos, Carrinho e Vendas

Aplicação full-stack desenvolvida para a disciplina de **Programação Web**, composta por uma API RESTful em Node.js e uma interface web em React para gerenciamento de produtos, carrinho de compras e registro de vendas.

---

## 📁 Estrutura do Projeto

```text
AulaReact02/
├── api/                     # Backend (API REST em Node.js)
│   ├── controller/          # Regras de negócio (Produto, Carrinho, Venda)
│   ├── db/                  # Configuração e conexão com o banco de dados
│   ├── middleware/          # Middleware para upload de arquivos/imagens
│   ├── model/               # Modelos de dados (Produto, Carrinho, ItemCarrinho, Venda, ItemVenda)
│   ├── router/              # Definição das rotas da API
│   ├── index.js             # Ponto de entrada do servidor
│   └── package.json
│
└── frontend/                # Frontend (Aplicação React)
    ├── public/              # Arquivos estáticos e HTML principal
    ├── src/
    │   ├── components/      # Componentes reutilizáveis (Navbar, InputGroup)
    │   ├── hooks/           # Custom Hooks (useProduto, useCarrinho, useVenda)
    │   ├── pages/           # Páginas da aplicação (Home, Produtos)
    │   ├── utils/           # Configuração de comunicação com a API (api.js)
    │   ├── App.js           # Componente raiz e rotas
    │   └── index.js         # Ponto de entrada do React
    └── package.json
```

---

## 🚀 Funcionalidades

* **Gerenciamento de Produtos:** Cadastro, listagem, atualização e upload de imagens de produtos.
* **Carrinho de Compras:** Adição, remoção e controle de itens no carrinho.
* **Finalização de Vendas:** Registro e histórico de vendas realizadas a partir dos itens do carrinho.
* **Arquitetura Separada:** Comunicação desacoplada entre o frontend React (via custom hooks e utilitário `api.js`) e a API backend.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, JavaScript (ES6+), CSS
* **Backend:** Node.js, Express
* **Arquitetura:** MVC (Model-View-Controller) na API e Hooks customizados no Frontend

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado na máquina
* Gerenciador de pacotes `npm` (instalado junto com o Node.js)
* Banco de dados configurado conforme `api/db/conn.js`

### 1. Clonando o repositório
```bash
git clone https://github.com/MatheusMoyaDuarte/IA2Programa-o_Web.git
cd IA2Programa-o_Web/AulaReact02
```

### 2. Iniciando o Backend (`api`)
Abra um terminal na pasta `api`, instale as dependências e inicie o servidor:
```bash
cd api
npm install
npm start
```

### 3. Iniciando o Frontend (`frontend`)
Em outro terminal, acesse a pasta `frontend`, instale as dependências e inicie a aplicação React:
```bash
cd frontend
npm install
npm start
```
A aplicação estará disponível no navegador em `http://localhost:3000` (ou na porta indicada no terminal).

---

## 👨‍💻 Autor

* **Matheus Alves** — [@MatheusMoyaDuarte](https://github.com/MatheusMoyaDuarte)