Essa é uma excelente estratégia. Você está atacando o principal gargalo de conversões (a fricção no momento do pagamento) com uma solução leve, de baixo custo e altamente focada no usuário mobile. O uso de JavaScript Vanilla garante carregamento rápido via 3G/4G, e a combinação de Firebase Auth com Cloudinary é um "hack" de arquitetura perfeito para contornar limitações de orçamento inicial.

Abaixo está o PRD atualizado e detalhado, estruturado em Markdown e incorporando a modelagem do banco de dados em Português do Brasil, conforme você solicitou.

---

# PRD: Portal de Pagamentos icouTv (V1.0)

## 1. Visão Geral

Desenvolver uma aplicação web *mobile-first* em Vanilla JS para facilitar o pagamento de assinaturas da icouTv. O sistema será acessado via link enviado pelo WhatsApp, exigindo login simples do cliente. O painel exibirá informações da assinatura, a fatura em PDF para visualização/download e o código PIX copiável, tudo organizado em cartões (cards) verticais.

## 2. Personas

* **Cliente Final:** Usuário de smartphone que recebe a cobrança via WhatsApp e deseja um fluxo de pagamento sem atritos, rápido e direto pelo celular.
* **Administrador (Você):** Necessita de um painel web simples para fazer o upload ágil dos PDFs e cadastrar os códigos PIX vinculados a cada cliente.

## 3. Design e UX

A interface será minimalista, focada em usabilidade e conversão rápida.

* **Cores Principais:** * Laranja icouTv (`#FD8A24`) para botões de ação primária (Copiar, Visualizar).
* Cinza Escuro (`#605F54`) para textos e contrastes.


* **Tipografia:** `Inter` (fonte sem serifa moderna, de alta legibilidade em telas pequenas).
* **Layout:** Coluna única (Single Column), com informações divididas em blocos empilhados horizontalmente com bordas arredondadas (cards).

## 4. Fluxo do Sistema

1. **Notificação:** O cliente recebe uma mensagem de WhatsApp com o link de cobrança (ex: `icoutv.com/pagamento`).
2. **Autenticação:** O cliente acessa a página e faz login via:
   - **E-mail + Senha** (validados via Firebase Authentication), ou
   - **Link de acesso sem senha** (Firebase Email Link Sign-In), ou
   - **Recuperação de senha** (e-mail de redefinição via Firebase).
3. **Dashboard (Área do Cliente - `portal.html`):**

* **Mensagens do Admin:** Banners informativos personalizados por status do cliente (info/aviso/erro).
* **Card 1 (Cabeçalho):** Exibe a logo da icouTv, saudação personalizada (Bom dia/Boa tarde/Boa noite), status atual da assinatura (ativa/inativa), mês de referência e **data de vencimento** da fatura.
* **Card 2 (Fatura):** Apresenta um ícone/miniatura do PDF. O botão "Visualizar PDF" abre o documento em nova aba via `window.open()`.
* **Card 3 (Pagamento):** Exibe o código PIX em texto. O botão "Copiar" salva o código na área de transferência (clipboard) do aparelho e exibe um feedback de sucesso com mudança de cor do botão.

4. **Painel Admin (`admin.html`):** Rota protegida por e-mail de administrador para:
   - Cadastrar faturas: buscar cliente por e-mail, informar mês de referência, **data de vencimento**, upload de PDF (Cloudinary) ou URL manual, código PIX e status.
   - Cadastrar clientes: nome + e-mail (senha gerada automaticamente, e-mail de redefinição enviado).
   - Gerenciar clientes: ativar, inativar ou excluir contas com botões diretos (sem diálogos de confirmação).
   - Mensagens personalizadas: criar, listar e excluir mensagens direcionadas a clientes ativos, inativos ou excluídos.
   - Gerenciar faturas: alternar status (pendente/pago), visualizar PDF, excluir faturas.
5. **Logout:** Exibe overlay de carregamento ("Saindo...") durante o processo de signOut em todas as páginas.

## 5. Arquitetura de Pastas

Estrutura enxuta para facilitar a manutenção em Vanilla JS.

```text
/icoutv-portal
├── /public                           (Root do Firebase Hosting)
│   ├── /assets                       (Imagens, ícones, logo)
│   ├── /css
│   │   ├── style.css                 (Estilos globais, mobile-first)
│   │   └── auth.css                  (Estilos da tela de login)
│   ├── /js
│   │   ├── firebase-config.js        (Config Firebase + Cloudinary + constantes)
│   │   ├── auth.js                   (Login, Email Link, recuperação de senha)
│   │   ├── portal.js                 (Dashboard do cliente)
│   │   └── admin.js                  (Painel de gerenciamento)
│   ├── index.html                    (Tela de Login)
│   ├── portal.html                   (Dashboard do Cliente)
│   └── admin.html                    (Painel Admin)
├── /scripts
│   ├── seed-clientes.js              (Script de seed para Firestore)
│   └── package.json                  (Dependências do script)
├── firestore.rules                   (Regras de segurança do Firestore)
└── README.md
```

## 6. Modelagem do Banco de Dados (Firestore)

Para garantir clareza e seguir as nomenclaturas em Português do Brasil, o banco (Firebase Firestore) utilizará a seguinte estrutura de coleções e documentos.

**Coleção: `clientes`** (Armazena os metadados fixos do usuário)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id_documento` | String | UID gerado pelo Firebase Auth (usado como ID do documento) |
| `nome_completo` | String | Nome de exibição na saudação |
| `email` | String | E-mail de login |
| `status_conta` | String | "ativa", "inativa" ou "excluida" |

**Coleção: `faturas`** (Armazena as cobranças mensais)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id_cliente` | String | Referência ao UID do cliente |
| `mes_referencia` | String | Ex: "03/2026" |
| `data_vencimento` | String | Data de vencimento no formato "yyyy-mm-dd" |
| `url_pdf_cloudinary`| String | Link direto do PDF hospedado no Cloudinary |
| `codigo_pix_copia` | String | Código longo do PIX Copia e Cola |
| `status_pagamento` | String | "pendente" ou "pago" |
| `data_geracao` | Timestamp | Data em que a fatura foi criada (serverTimestamp) |

**Coleção: `configuracoes`** (Configurações globais do sistema)
| Documento | Campo | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `mensagens` | `lista` | Array | Lista de mensagens personalizadas |
| | `lista[].id` | String | Identificador único (timestamp+random) |
| | `lista[].texto` | String | Texto da mensagem |
| | `lista[].destino` | String | "ativa", "inativa" ou "excluida" |
| | `lista[].criadoEm` | String | Data ISO de criação |

## 7. Requisitos Funcionais

* **RF01 - Autenticação:** Login via Firebase Auth (e-mail+senha, Email Link sem senha, recuperação de senha) para acessar `portal.html`.
* **RF02 - Integração de Armazenamento:** Upload e busca de PDFs via API do Cloudinary (configuração unsigned com upload preset).
* **RF03 - Visualizador de PDF:** O botão "Visualizar PDF" abre o arquivo do Cloudinary em nova aba via `window.open()`.
* **RF04 - Função Clipboard:** O botão "Copiar" aciona `navigator.clipboard.writeText()` com fallback para `document.execCommand('copy')` e retorna feedback visual no botão.
* **RF05 - Admin Upload:** O formulário de administração vincula URL (Cloudinary), código PIX, mês de referência, data de vencimento e status ao `id_cliente` no Firestore.
* **RF06 - Gerenciamento de Clientes:** Admin pode cadastrar (sem campo de senha, com email de redefinição automático), ativar, inativar e excluir clientes.
* **RF07 - Mensagens Personalizadas:** Admin pode criar, listar e excluir mensagens direcionadas a clientes por status (ativa/inativa/excluida). As mensagens são exibidas como banners no portal do cliente.
* **RF08 - Bloqueio de Acesso:** Clientes com status "excluida" são bloqueados no login e recebem mensagem personalizada.
* **RF09 - Overlay de Logout:** Todas as páginas exibem overlay com spinner durante o processo de logout.

## 8. Stack Tecnológica

* **Frontend:** HTML5, CSS3 (CSS Grid/Flexbox, mobile-first), JavaScript (Vanilla ES Modules).
* **Backend / Banco de Dados:** Firebase Authentication (e-mail/senha + Email Link) e Firebase Firestore.
* **Armazenamento de Arquivos:** Cloudinary (cloud name: "icoutech", upload preset: "icoutv").
* **Hospedagem:** Firebase Hosting (deploy do diretório `public/`).
* **SDK:** Firebase JS SDK 11.4.0 via CDN.

## 9. Considerações de Segurança

* **Regras do Firestore:** Clientes só leem seus próprios dados (`request.auth.uid == clienteId`). Faturas só são lidas se `id_cliente == request.auth.uid`. Admin (e-mail específico) tem acesso total. Coleção `configuracoes` é legível por qualquer autenticado e gravável apenas pelo admin.
* **Acesso ao Admin:** Verificação de e-mail específico (`ADMIN_EMAIL`) no client-side, reforçada nas Firestore Rules.
* **Firebase Auth secundário:** Criação de usuários usa app Firebase secundário para não deslogar o admin.
* **XSS Prevention:** Função `escapeHTML()` aplicada a todos os dados exibidos no DOM.
* **Autofill Override:** CSS override com `-webkit-box-shadow` para remover fundo azul do navegador nos inputs.

## 10. Deploy (Firebase Hosting)

### Pré-requisitos
1. Node.js instalado
2. Firebase CLI: `npm install -g firebase-tools`

### Passos
```bash
# 1. Login no Firebase
firebase login

# 2. Inicializar projeto (executar na raiz /icoutv-portal)
firebase init hosting
#   - Selecionar projeto: icoutv-435d4
#   - Diretório público: public
#   - Single-page app: Não
#   - Sobrescrever index.html: Não

# 3. Deploy
firebase deploy --only hosting

# 4. Deploy das Firestore Rules
firebase deploy --only firestore:rules
```

### Domínios
Após o deploy, a aplicação estará disponível em:
- `https://icoutv-435d4.web.app`
- `https://icoutv-435d4.firebaseapp.com`

### Configurações necessárias no Firebase Console
1. **Authentication > Sign-in method:** Habilitar "E-mail/senha" e "Link do e-mail (login sem senha)"
2. **Authentication > Settings > Authorized domains:** Adicionar o domínio de produção (se diferente dos padrões Firebase)
3. **Firestore Database > Rules:** Colar/deploy as regras de `firestore.rules`
4. **Cloudinary:** Configurar cloud name "icoutech" e upload preset "icoutv" (unsigned)

---

Gostaria que eu já criasse a estrutura inicial de arquivos e te enviasse o código do `index.html` e `style.css` focado nesse design de cartões mobile-first?