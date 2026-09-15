# Sistema de Estoque de Motos --- Especificação Inicial

## 1. Visão geral

O projeto será um sistema web interno para gerenciamento do estoque de
motos usadas de uma loja.

Atualmente, o estoque é controlado por planilha. A primeira versão do
sistema deve substituir esse fluxo por uma aplicação simples, rápida e
organizada, centralizando o cadastro das motos e integrando os dados de
preço da Tabela FIPE.

O foco inicial é **estoque + cadastro de motos + integração FIPE**.
Funcionalidades comerciais, financeiras, CRM, relatórios avançados e
outras automações ficam fora do MVP neste momento.

------------------------------------------------------------------------

## 2. Objetivos do MVP

A primeira versão deverá permitir:

-   autenticação de usuários;
-   cadastro de motos;
-   edição de motos;
-   visualização das motos cadastradas;
-   controle do status das motos no estoque;
-   cálculo automático de dias em estoque;
-   consulta à API da FIPE/fipeX;
-   associação de uma moto cadastrada ao respectivo veículo da FIPE;
-   armazenamento dos dados relevantes da FIPE no banco;
-   exibição do preço FIPE atual junto aos dados da moto.

O sistema deve ser desenvolvido de maneira modular, pensando na inclusão
de novas funcionalidades futuramente.

------------------------------------------------------------------------

## 3. Stack

### Aplicação

-   **Next.js** na versão estável mais recente disponível no início do
    projeto;
-   **TypeScript**;
-   App Router;
-   React Server Components por padrão;
-   Client Components somente quando houver necessidade de
    interatividade no navegador.

### Banco de dados

-   **PostgreSQL** hospedado no **Neon**;
-   **Drizzle ORM** para schema, queries e migrations.

### Validação

-   **Zod** para validação dos dados de entrada;
-   schemas reutilizáveis entre formulários e backend sempre que fizer
    sentido;
-   nenhuma entrada do usuário deve ser considerada confiável apenas por
    ter sido validada no frontend.

### Autenticação

-   **NextAuth / Auth.js**;
-   autenticação obrigatória para acessar a área administrativa;
-   inicialmente haverá apenas a necessidade do perfil de administrador;
-   a primeira conta administrativa poderá ser criada através do **seed
    do banco**;
-   credenciais e secrets nunca devem ficar hardcoded no código-fonte.

### Feedback visual

Utilizar **Sonner** para toasts.

Os textos exibidos nos toasts devem ser centralizados em
constantes/variáveis reutilizáveis quando forem mensagens recorrentes,
evitando strings duplicadas espalhadas pelos componentes.

Exemplos:

``` ts
export const TOAST_MESSAGES = {
  motorcycleCreated: "Moto cadastrada com sucesso.",
  motorcycleUpdated: "Moto atualizada com sucesso.",
  motorcycleDeleted: "Moto removida com sucesso.",
  genericError: "Não foi possível concluir a operação.",
  fipeError: "Não foi possível consultar a FIPE.",
} as const;
```

------------------------------------------------------------------------

## 4. Padrão de UI

A interface deve ser construída com **componentes reutilizáveis**.

Não criar inputs, labels, botões e outros elementos básicos do zero
dentro de cada página.

Criar uma camada de componentes compartilhados, por exemplo:

``` text
components/
└── ui/
    ├── button.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── textarea.tsx
    ├── dialog.tsx
    ├── badge.tsx
    ├── card.tsx
    ├── table.tsx
    ├── combobox.tsx
    └── ...
```

Exemplo:

``` tsx
<Label htmlFor="plate">Placa</Label>
<Input
  id="plate"
  name="plate"
  placeholder="ABC1D23"
/>
```

O mesmo componente `Input` deve ser utilizado em toda a aplicação.

### Regras gerais

-   priorizar composição de componentes;
-   evitar duplicação de markup e estilos;
-   componentes de UI genéricos não devem conter regras de negócio;
-   componentes específicos do domínio podem ser criados separadamente.

Exemplo:

``` text
components/
├── ui/
│   ├── input.tsx
│   ├── button.tsx
│   └── ...
│
└── motorcycles/
    ├── motorcycle-form.tsx
    ├── motorcycle-card.tsx
    ├── motorcycle-table.tsx
    ├── motorcycle-status-badge.tsx
    └── fipe-model-combobox.tsx
```

------------------------------------------------------------------------

## 5. Cadastro de motos

O cadastro deverá contemplar inicialmente informações como:

-   marca;
-   modelo;
-   ano de fabricação;
-   ano/modelo;
-   cor;
-   placa;
-   quilometragem;
-   data de entrada no estoque;
-   status;
-   código FIPE;
-   identificadores da fipeX necessários para consultas futuras;
-   valor FIPE atual;
-   mês/ano de referência da FIPE.

Os campos definitivos podem ser ajustados durante o desenvolvimento
conforme a planilha atual da loja.

### Dias em estoque

A quantidade de dias em estoque **não deve ser armazenada manualmente**.

Ela deve ser calculada utilizando a data de entrada:

``` text
dias em estoque = data atual - data de entrada
```

Dessa forma, o valor permanece sempre atualizado.

------------------------------------------------------------------------

## 6. Integração FIPE

Nesta primeira versão, a integração externa principal será com a
**fipeX**.

A integração deve ficar isolada da UI e das regras principais da
aplicação.

Não espalhar chamadas diretas para a fipeX pelos componentes.

Criar uma camada própria, por exemplo:

``` text
lib/
└── fipe/
    ├── client.ts
    ├── types.ts
    ├── schemas.ts
    └── service.ts
```

A aplicação deve consumir essa camada:

``` text
UI
 ↓
Server Action / Route Handler
 ↓
FipeService
 ↓
fipeX API
```

Isso permitirá substituir a fipeX futuramente sem precisar reescrever o
restante do sistema.

### Segurança

A API v1 da fipeX é pública e não exige API key no MVP.

As chamadas continuarão sendo feitas apenas pelo servidor, para manter o
contrato externo isolado da UI e permitir tratamento centralizado de erros.

Nunca utilizar uma variável `NEXT_PUBLIC_*` para uma credencial privada
da API.

------------------------------------------------------------------------

## 7. Fluxo de seleção da FIPE

O funcionário não deverá precisar conhecer ou digitar o código FIPE.

A experiência desejada é baseada no veículo:

``` text
Cadastrar moto

Modelo
[ CB 500________________ ]

        ↓

Busca na integração FIPE

        ↓

Usuário seleciona o veículo correto

        ↓

Sistema obtém internamente:
- marca;
- modelo;
- ano;
- código FIPE;
- identificadores necessários;
- preço FIPE;
- referência da tabela.
```

O código FIPE é um dado técnico interno e deve ser salvo automaticamente
após a seleção.

A implementação exata da busca deverá seguir o contrato oficial do
endpoint `/search` da fipeX. Não assumir parâmetros ou comportamento que
não estejam documentados/testados.

### Autocomplete

A busca por veículo deve utilizar um componente reutilizável de
`Combobox/Autocomplete`.

Não realizar uma request a cada tecla imediatamente.

Aplicar debounce, por exemplo:

``` text
CB
CB 5
CB 50
CB 500
     ↓
  debounce
     ↓
consulta API
```

Um intervalo inicial entre **300 e 500 ms** é adequado e poderá ser
ajustado posteriormente.

------------------------------------------------------------------------

## 8. Persistência dos dados FIPE

Depois que o usuário selecionar um veículo da FIPE, os principais dados
devem ser persistidos junto à moto.

Não depender da API externa para renderizar informações básicas de uma
moto já cadastrada.

Exemplo conceitual:

``` ts
{
  make: "HONDA",
  model: "CB 500F",
  modelYear: 2022,
  fipeCode: "...",
  fipeModelId: "...",
  fipePriceCents: 3684200,
  fipeReferenceMonth: 9,
  fipeReferenceYear: 2026
}
```

Valores monetários devem preferencialmente ser armazenados como
**inteiros em centavos**, evitando problemas de precisão com `float`.

------------------------------------------------------------------------

## 9. Schema inicial

O schema abaixo é apenas uma referência inicial e poderá evoluir:

``` text
users
-----
id
name
email
passwordHash / dados necessários ao provider de autenticação
role
createdAt
updatedAt


motorcycles
-----------
id
make
model
manufactureYear
modelYear
color
plate
mileage
entryDate
status

fipeCode
fipeModelId
fipePriceCents
fipeReferenceMonth
fipeReferenceYear
fipeUpdatedAt

createdAt
updatedAt
```

O schema real deverá ser implementado utilizando Drizzle.

### Status

Inicialmente podem existir estados como:

``` text
AVAILABLE
RESERVED
SOLD
```

Os valores devem ser representados de maneira consistente no banco e no
código, evitando strings arbitrárias espalhadas pela aplicação.

------------------------------------------------------------------------

## 10. Organização sugerida

Uma estrutura possível:

``` text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── estoque/
│   │   └── motos/
│   └── api/
│
├── components/
│   ├── ui/
│   └── motorcycles/
│
├── db/
│   ├── index.ts
│   ├── schema/
│   └── seed.ts
│
├── lib/
│   ├── auth/
│   ├── fipe/
│   ├── validations/
│   └── constants/
│
└── types/
```

A estrutura pode ser adaptada durante o desenvolvimento. O mais
importante é manter separação clara entre:

-   UI;
-   domínio/regras de negócio;
-   banco de dados;
-   autenticação;
-   validação;
-   serviços externos.

------------------------------------------------------------------------

## 11. Seed

Criar um seed inicial para permitir a primeira utilização do sistema.

O seed deverá criar pelo menos:

``` text
Administrador
```

A senha não deve ficar exposta em um repositório público. Em
desenvolvimento, as credenciais podem vir de variáveis de ambiente
utilizadas pelo script de seed.

Exemplo:

``` env
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

O script deverá armazenar apenas o hash da senha quando autenticação por
credenciais for utilizada.

------------------------------------------------------------------------

## 12. Variáveis de ambiente

Exemplo inicial:

``` env
DATABASE_URL=

AUTH_SECRET=

FIPEX_API_BASE_URL=https://api.fipex.com.br

SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

Outras variáveis podem ser adicionadas conforme a implementação.

Criar também um `.env.example` sem valores sensíveis.

------------------------------------------------------------------------

## 13. Tratamento de erros

Erros de integrações externas não devem quebrar a aplicação inteira.

Exemplo:

``` text
Usuário busca CB 500
        ↓
fipeX indisponível
        ↓
Sistema trata o erro
        ↓
Toast:
"Não foi possível consultar a FIPE. Tente novamente."
```

Erros devem ser tratados no servidor e apresentados ao usuário de
maneira compreensível através da interface.

Não exibir stack traces, mensagens internas do banco ou informações
sensíveis ao usuário final.

------------------------------------------------------------------------

## 14. Princípios de desenvolvimento

Durante todo o desenvolvimento:

1.  evitar duplicação de código;
2.  criar componentes reutilizáveis para elementos recorrentes de UI;
3.  manter regras de negócio fora dos componentes puramente visuais;
4.  validar entradas com Zod;
5.  utilizar Drizzle para acesso ao PostgreSQL/Neon;
6.  manter integrações externas isoladas em services;
7.  nunca expor secrets no frontend;
8.  utilizar tipagem TypeScript adequadamente;
9.  evitar `any` quando houver uma tipagem razoável disponível;
10. manter funções e componentes pequenos e com responsabilidade clara;
11. utilizar Sonner para feedback de sucesso/erro;
12. manter mensagens e constantes recorrentes centralizadas;
13. priorizar Server Components e código server-side quando não houver
    necessidade de execução no navegador;
14. implementar apenas a complexidade necessária para o escopo atual,
    sem criar abstrações prematuras.

------------------------------------------------------------------------

## 15. Escopo atual

### Faz parte do MVP

-   login;
-   usuário administrador inicial via seed;
-   listagem do estoque;
-   cadastro de moto;
-   edição de moto;
-   alteração de status;
-   dados básicos da moto;
-   cálculo de dias em estoque;
-   integração com a fipeX;
-   pesquisa/seleção de veículo FIPE;
-   armazenamento do código/IDs FIPE;
-   exibição do preço FIPE e sua referência;
-   componentes de UI reutilizáveis;
-   validação com Zod;
-   persistência com Drizzle + Neon;
-   feedback com Sonner.

### Fora do escopo por enquanto

Não implementar nesta etapa, salvo nova definição:

-   CRM/leads;
-   QR Code;
-   página pública da moto;
-   despesas por veículo;
-   lucro/margem;
-   histórico de vendas avançado;
-   relatórios financeiros;
-   histórico de preço FIPE;
-   integração com anúncios;
-   integração por placa;
-   notificações;
-   múltiplas lojas;
-   dashboards avançados;
-   IA.

Essas funcionalidades poderão ser adicionadas posteriormente sem fazer
parte do MVP inicial.

------------------------------------------------------------------------

## 16. Critério principal

A primeira versão deve resolver muito bem uma tarefa simples:

> **Cadastrar, consultar e gerenciar as motos usadas em estoque, tendo a
> FIPE integrada ao cadastro sem exigir que o funcionário conheça
> códigos ou realize consultas manuais externas.**

Antes de adicionar funcionalidades adicionais, esse fluxo deve estar
rápido, confiável e simples de utilizar.
