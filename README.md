# ChonosIA 🧠

> Plataforma serverless de gestão, processamento inteligente e arquivamento seguro de documentos para treinamento de Agentes de IA corporativos.

---

## 📌 Sobre o Projeto

O **ChonosIA** é uma solução de arquitetura serverless na AWS para ingestão e governança de documentos em larga escala (PDFs e imagens). A Startup XYZ recebe aproximadamente **50 mil documentos por mês** e precisa que nenhum arquivo seja deletado — a base histórica é o combustível para o treinamento de futuros modelos de IA generativa e preditiva.

O sistema resolve dois desafios centrais: garantir acesso rápido durante o primeiro ano e reduzir drasticamente os custos de armazenamento histórico a partir do segundo ano — tudo sem servidores fixos para gerenciar.

---

## 🏗️ Arquitetura

```
Usuários (Web / Mobile)
   │ HTTPS
   ▼
Amazon Cognito          ← Autenticação e autorização
   │
   ▼
Amazon API Gateway      ← Ponto de entrada da API
   │
   ├──► Upload Function (Lambda)  ──► Amazon SQS ──► Amazon S3 Bucket Privado
   │                                                        │
   ├──► Download Function (Lambda) ──► GetObject            │ Lifecycle
   │         └──► Presigned URL (15 min)                    │ 365 dias
   │                                                        ▼
   └──► Audit Function (Lambda) ──► Amazon CloudWatch   S3 Glacier
                                       Logs              Flexible Retrieval
```

**Fluxo de Upload (7 etapas):**

1. Requisição chega na Lambda — extrai nome, tipo e metadados do usuário
2. Valida o conteúdo — confere formato, tamanho e campos obrigatórios
3. Organiza o arquivo — cria Object Key com prefixo por usuário (`user-123/documento.pdf`)
4. Executa `PutObject` — armazena no bucket privado do S3
5. Publica evento no Amazon SQS — fila para processamento assíncrono
6. Audit Function registra a operação no CloudWatch Logs
7. Retorna confirmação ao cliente

**Fluxo de Download (7 etapas):**

1. Requisição chega na Lambda — extrai ID do usuário e documento solicitado
2. Valida permissões — verifica no token (JWT) se o usuário tem acesso ao prefixo
3. Verifica o S3 — confere se o arquivo existe no prefixo autorizado
4. Gera Presigned URL — cria URL temporária com permissão de leitura (15 min)
5. Retorna a URL ao cliente
6. Cliente acessa o arquivo diretamente do S3 via URL assinada
7. CloudWatch Logs registra a operação para auditoria

---

## ☁️ Serviços AWS Utilizados

| Serviço | Função | Justificativa |
|---|---|---|
| Amazon Cognito | Autenticação e autorização de usuários | Gerenciado, suporte a JWT nativo |
| Amazon API Gateway | Ponto de entrada HTTPS | Escalável, sem servidor próprio |
| AWS Lambda | Upload, Download e Auditoria | Serverless — paga apenas por execução |
| Amazon SQS | Fila para processamento assíncrono | Desacoplamento entre upload e processamento |
| Amazon S3 | Armazenamento dos documentos | Durabilidade 99,999999999%, lifecycle nativo |
| S3 Glacier Flexible Retrieval | Arquivamento de longo prazo | Redução ~70% no custo após 365 dias |
| Amazon CloudWatch Logs | Monitoramento e auditoria | Rastreabilidade de todas as operações |

---

## 🔒 Segurança e IAM

- **Block Public Access** habilitado no bucket S3 — nenhum objeto exposto publicamente
- **ACLs completamente desativadas** — governança centralizada nas políticas IAM
- **IAM Role da Lambda** com permissões mínimas: `s3:PutObject`, `s3:GetObject` e `s3:ListBucket` estritamente limitadas ao prefixo do usuário
- **Prefixo por userId** no S3: `userId/arquivo.pdf` — isolamento entre clientes garantido em nível de política, não apenas de código
- **Presigned URLs** com expiração de 15 minutos para acesso temporário e seguro
- **Amazon Cognito** para autenticação com validação JWT em cada requisição
- Sem credenciais hardcoded — autenticação via IAM Role em produção

---

## 💰 Custos Mensais

> Estimativa baseada em arquivos com média de 1MB · Cotação do Dólar: R$ 5,17 (28/06/2026)

| Serviço | Custo (USD) | Custo (BRL) |
|---|---|---|
| S3 PUT Requests (50k uploads/mês) | USD 0,25 | R$ 1,30 |
| S3 Standard — Armazenamento | USD 1,15 | R$ 5,94 |
| S3 Glacier (após 1 ano) | USD 2,16 | R$ 11,17 |
| API Gateway + Lambda | USD 2,50 | R$ 13,00 |

**Comportamento do custo ao longo do tempo:**

- **Meses 1–12:** Custo cresce progressivamente à medida que os documentos acumulam no S3 Standard, atingindo o teto de aproximadamente **R$ 86,00/mês** no final do primeiro ano
- **A partir do mês 13:** Os objetos mais antigos migram automaticamente para o S3 Glacier via Lifecycle Rule, reduzindo o custo de armazenamento em ~70% sem perda de dados
- **Custo zero de infraestrutura ociosa:** arquitetura serverless — sem servidores pagos quando não há uso

---

## 📁 Estrutura do Repositório

```
ChonosIA/
├── back-end/
│   ├── src/
│   │   ├── app.ts                          ← Aplicação Express (CORS, rotas, error handler)
│   │   ├── main.ts                         ← Servidor local (porta 3333)
│   │   ├── lambda.ts                       ← Handler para AWS Lambda
│   │   ├── config/
│   │   │   ├── env.ts                      ← Variáveis de ambiente
│   │   │   └── database.ts                 ← Conexão PostgreSQL
│   │   ├── infra/storage/
│   │   │   └── s3.ts                       ← Upload para S3 (PutObjectCommand)
│   │   └── modules/
│   │       ├── documents/
│   │       │   ├── documents.controller.ts ← listDocuments, uploadDocument
│   │       │   └── documents.routes.ts     ← GET / e POST /upload
│   │       └── users/
│   │           ├── users.controller.ts     ← listUsers, createUser
│   │           └── users.routes.ts         ← GET / e POST /
│   ├── prisma/
│   │   └── schema.prisma                   ← Model User (PostgreSQL)
│   ├── package.json
│   └── tsconfig.json
│
├── front-end/
│   ├── src/
│   │   ├── app/App.tsx                     ← Componente raiz React
│   │   ├── features/
│   │   │   ├── auth/constants/credentials.ts
│   │   │   └── documents/data/seed.ts
│   │   ├── lib/api.ts                      ← apiRequest(), formatBytes()
│   │   ├── shared/components/
│   │   │   ├── ChronosLogo.tsx
│   │   │   └── DocIllustration.tsx
│   │   └── types/app.ts                    ← Screen, AppUser, DocFile
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na pasta `back-end/`:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chronos_ia
DB_USER=postgres
DB_PASSWORD=sua_senha

# Servidor
PORT=3333
NODE_ENV=development
JWT_SECRET=seu_secret_aqui

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key       # Deixar vazio em produção (usa IAM Role)
AWS_SECRET_ACCESS_KEY=sua_secret_key   # Deixar vazio em produção (usa IAM Role)
AWS_S3_BUCKET=nome-do-seu-bucket
```

> ⚠️ Em produção na AWS Lambda, **não preencher** `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`. A Lambda usa a IAM Role automaticamente.

Para o front-end, crie `front-end/.env`:

```env
VITE_API_URL=http://localhost:3333
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente
- AWS CLI configurado (para testes de S3)

### Back-end

```bash
cd back-end
npm install

# Criar o banco
createdb chronos_ia

# Rodar migrations do Prisma
npx prisma migrate dev

# Iniciar em modo desenvolvimento
npm run dev
# Servidor disponível em http://localhost:3333
```

### Front-end

```bash
cd front-end
npm install
npm run dev
# Interface disponível em http://localhost:5173
```

---

## 🔌 Endpoints da API

### Documentos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/documents` | Lista todos os documentos |
| `POST` | `/documents/upload` | Faz upload de um documento para o S3 |

**Body do upload (JSON):**
```json
{
  "title": "Contrato Q3",
  "fileName": "contrato.pdf",
  "contentType": "application/pdf",
  "fileContent": "<base64 do arquivo>"
}
```

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/users` | Lista todos os usuários |
| `POST` | `/users` | Cria um novo usuário |

**Body de criação (JSON):**
```json
{
  "name": "Alan Turing",
  "email": "user@email.com",
  "password": "senha546"
}
```

---

## ☁️ Deploy na AWS Lambda

### 1. Fazer build

```bash
cd back-end
npm run build
```

### 2. Empacotar

```bash
zip -r function.zip dist/ node_modules/ package.json
```

### 3. Criar a função Lambda

```bash
aws lambda create-function \
  --function-name chonosIA-backend \
  --runtime nodejs18.x \
  --role arn:aws:iam::SUA_CONTA:role/chonosIA-lambda-role \
  --handler dist/lambda.handler \
  --zip-file fileb://function.zip \
  --environment Variables="{
    DB_HOST=seu_postgres_host,
    DB_NAME=chronos_ia,
    DB_USER=postgres,
    DB_PASSWORD=sua_senha,
    AWS_S3_BUCKET=nome-do-bucket,
    AWS_REGION=us-east-1
  }"
```

### 4. Configurar ciclo de vida do S3 (Lifecycle Rule — 365 dias)

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket nome-do-bucket \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "ArquivarApos365Dias",
      "Status": "Enabled",
      "Filter": { "Prefix": "" },
      "Transitions": [{
        "Days": 365,
        "StorageClass": "GLACIER"
      }]
    }]
  }'
```

### 5. Bloquear acesso público ao S3

```bash
aws s3api put-public-access-block \
  --bucket nome-do-bucket \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## 🗺️ Roadmap de Implementação

| Fase | Entregável |
|---|---|
| 1 | Configuração de IaC (Terraform) e Buckets S3 com Block Public Access |
| 2 | Desenvolvimento das Lambdas e integração com API Gateway |
| 3 | Implementação de políticas IAM e Lifecycle Rules de 365 dias |
| 4 | Monitoramento de custos via AWS Budgets e validação de dados |

---

## 🛠️ Stack Tecnológica

**Back-end:**
- Node.js 18 + TypeScript 6
- Express 5
- AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-cognito-identity-provider`)
- Prisma ORM + PostgreSQL
- Dotenv, Joi

**Front-end:**
- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- shadcn/ui (componentes)
- Lucide React (ícones)
- Motion (animações)

---

## 📎 Referências

- [AWS Lambda com Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [AWS S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [Prisma com PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
