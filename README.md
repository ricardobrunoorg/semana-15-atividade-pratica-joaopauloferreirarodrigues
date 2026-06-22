# Trabalho Prático - Semana 15

Login de usuário + funcionalidade de personalização (Favoritos) para o projeto **Getting Freak**.

## Informações do trabalho

- Nome: João Paulo Ferreira Rodrigues
- Matrícula: 908448
- Proposta de projeto escolhida: Getting Freak
- Breve descrição: O site é voltado para compartilhar treinos, dietas e dicas de saúde, além de contar com um blog pessoal para dividir experiências e atualizações do dia a dia.

## Funcionalidades implementadas

### 1. Integração do módulo de login

O módulo de login fornecido pelo template (`codigo/public/assets/js/login.js`) foi integrado ao site sem alterações no arquivo original. Para permitir o comportamento solicitado na orientação (a home deve mostrar "Entrar" para usuários deslogados em vez de redirecionar automaticamente para a tela de login), foi criado um módulo auxiliar `auth.js` que apenas gerencia o estado da UI a partir do `sessionStorage`:

- **`auth.js`** — incluído em `index.html`, `detalhes.html` e `estatisticas.html`. Lê o objeto `usuarioCorrente` do `sessionStorage` (sem redirecionar) e renderiza no elemento `#userInfo` da navbar:
  - `Entrar` (link para `/modulos/login/login.html`) quando o usuário está deslogado;
  - `Olá, <primeiro_nome> | Sair` quando o usuário está logado.

- **`login.js`** (do template) — incluído em `favoritos.html`. Por ser uma página estritamente pessoal, o usuário não logado é automaticamente redirecionado para a tela de login.

Usuários de teste já cadastrados no `db.json`:

| Login    | Senha | Nome                        |
|----------|-------|-----------------------------|
| `admin`  | `123` | Administrador do Sistema    |
| `user`   | `123` | Usuario Comum               |
| `rommel` | `123` | Rommel                      |

### 2. Favoritos por usuário

Cada card de treino (na home e na página de detalhes) possui um botão em formato de coração no canto superior direito.

- Se o usuário **não está logado** e clica no coração, uma mensagem é exibida e ele pode optar por ir à tela de login.
- Se o usuário **está logado**, o treino é adicionado ou removido dos seus favoritos.

**Persistência por usuário:** os favoritos são armazenados no `localStorage` com chave composta `favoritos_<idDoUsuario>` (ex.: `favoritos_1`, `favoritos_2`), garantindo que listas de usuários diferentes nunca se misturem. O valor é um array de ids de treinos: `[1, 3, 8]`.

**Indicação visual:** treinos já favoritados aparecem com o coração preenchido em vermelho. Treinos não favoritados aparecem com o coração transparente.

### 3. Página "Meus Favoritos" (`favoritos.html`)

Página dedicada acessível pelo menu lateral. Lista somente os treinos favoritados pelo usuário logado. A página inclui o `login.js`, portanto exige login para ser acessada.

Recursos da página:
- Resumo com a quantidade de treinos favoritados;
- Cards no mesmo layout da home (com o coração já preenchido);
- Possibilidade de remover um favorito clicando no coração — o card é removido da lista em tempo real;
- Estado vazio com mensagem amigável e botão "Ver treinos disponíveis" quando o usuário ainda não favoritou nada;
- Botão "Sair" na navbar, que chama `logoutUser()` do `login.js`.

## Como executar

```bash
cd codigo
npm install
npm start
```

Em seguida acesse:
- **Home:** http://localhost:3000
- **Login:** http://localhost:3000/modulos/login/login.html
- **Estatísticas:** http://localhost:3000/estatisticas.html
- **Meus Favoritos:** http://localhost:3000/favoritos.html

## Estrutura do projeto

```
codigo/
├── db/db.json                              # Banco de dados (treinos + categorias + usuarios)
├── index.js                                # Servidor JSON Server (do template)
├── package.json
└── public/
    ├── index.html                          # Home (com área de login + cards com coração)
    ├── detalhes.html                       # Detalhes do treino (com coração e área de login)
    ├── estatisticas.html                   # Gráficos Chart.js (semana 14)
    ├── favoritos.html                      # ◄ NOVA — lista de favoritos (página protegida)
    ├── assets/
    │   ├── css/styles.css
    │   ├── img/                            # Fotos de treinos e exercícios
    │   └── js/
    │       ├── login.js                    # ◄ módulo de login do template
    │       ├── auth.js                     # ◄ NOVO — gestão da UI de autenticação
    │       ├── app.js                      # Home + detalhes + lógica de favoritos
    │       ├── estatisticas.js             # Gráficos (semana 14)
    │       └── favoritos.js                # ◄ NOVO — página de favoritos
    └── modulos/login/
        ├── index.html                      # Pós-login + lista de usuários (do template)
        └── login.html                      # Formulário de login (do template)
```

## Checklist da orientação

- [x] Login funciona e redireciona corretamente para a home (URL de retorno) quando ok
- [x] Usuário logado é obtido via `sessionStorage` e usado na interface
- [x] Funcionalidade de favoritos exige login (clique no coração bloqueia se deslogado)
- [x] Persistência por usuário: dados não se misturam entre admin/user/rommel
- [x] Página "Meus Favoritos" lista os favoritos do usuário logado

## Prints obrigatórios

**Home mostrando o usuário logado**
![alt text](codigo/public/assets/img/print1.jpg)

**Funcionalidade de favoritar treinos**
![alt text](codigo/public/assets/img/print2.jpg)

**Página "Meus Favoritos"**
![alt text](codigo/public/assets/img/print3.jpg)
