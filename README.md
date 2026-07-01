# <img src="./assets/logo.png" alt="ChonosIA" height="70"/>

> Plataforma serverless de gestão, processamento inteligente e arquivamento seguro de documentos para treinamento de Agentes de IA corporativos.

---

## 📌 Sobre o Projeto

O **ChonosIA** é uma solução de arquitetura serverless na AWS para ingestão e governança de documentos em larga escala (PDFs e imagens). A Startup XYZ recebe aproximadamente **50 mil documentos por mês** para análise de dados, e precisa que nenhum arquivo seja deletado — a base histórica é o combustível para o treinamento de futuros modelos de IA generativa e preditiva.

O sistema resolve dois desafios centrais: garantir acesso rápido durante o primeiro ano e reduzir drasticamente os custos de armazenamento histórico a partir do segundo ano — tudo sem servidores fixos para gerenciar.

---

## 👥 Integrantes do Projeto

| <img src="https://github.com/Mordev-tech.png" width="80px" style="border-radius: 50%;"/> | **André Moraes** | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Mordev-tech) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andré-moraes-99940636a/) |
| :---: | :--- | :---: | :---: |

| <img src="https://github.com/CamilaSchmitt.png" width="80px" style="border-radius: 50%;"/> | **Camila Schmitt** | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/CamilaSchmitt) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/camila-schmitt-soares/) |
| :---: | :--- | :---: | :---: |

| <img src="https://github.com/FilipeOliveira-Dev.png" width="80px" style="border-radius: 50%;"/> | **Filipe Oliveira** | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/FilipeOliveira-Dev) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/filipeoliveiradasilva/) |
| :---: | :--- | :---: | :---: |

| <img src="https://github.com/JulielenArnoud.png" width="80px" style="border-radius: 50%;"/> | **Julielen Arnoud** | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JulielenArnoud) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/julielen-arnoud-qa/) |
| :---: | :--- | :---: | :---: |

| <img src="https://github.com/paulacloudanalytics.png" width="80px" style="border-radius: 50%;"/> | **Paula Caroline Santos** | [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/paulacloudanalytics) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/paula-caroline12/) |
| :---: | :--- | :---: | :---: |



## 🏗️ Arquitetura

```
Usuários (Web / Mobile)
   │ HTTPS
   ▼
Amazon Cognito          ← Autenticação e autorização
   │
   ▼
AWS WAF                 ← Proteção contra ataques e ameaças
   │
   ▼
Amazon API Gateway      ← Ponto de entrada da API
   │
   ├──► Upload Function (Lambda)   ──► Amazon SQS ──► Amazon S3 Bucket Privado
   │                                                          │
   ├──► Download Function (Lambda) ──► GetObject              │ Lifecycle
   │         └──► Presigned URL                               │ 365 dias
   │                                                          ▼
   └──► Audit Function (Lambda) ──► Amazon CloudWatch     S3 Glacier
                                       Logs                Flexible Retrieval
```

**Fluxo de Upload (Upload Function):**

1. Lambda recebe a requisição e extrai metadados (ID do usuário, nome, tipo)
2. Valida o conteúdo — confere formato (`pdf`, `jpeg`, `png`, `txt`), tamanho (máx. 10MB) e campos obrigatórios
3. Organiza o arquivo — cria Object Key com prefixo por usuário (`user-{id}/timestamp-arquivo.pdf`)
4. Executa `PutObject` — armazena no bucket privado do S3 com metadados (`userId`, `title`, `uploadedAt`)
5. Publica evento `DOCUMENT_UPLOADED` no Amazon SQS — fila para processamento assíncrono
6. Audit Function consome a fila e registra a operação no CloudWatch Logs
7. Retorna confirmação ao cliente

**Fluxo de Download (Download Function):**

1. Lambda recebe a requisição e extrai o token JWT do header `Authorization`
2. Valida o token (`jsonwebtoken`) e extrai o ID do usuário
3. Verifica se o arquivo solicitado pertence ao prefixo do usuário (`user-{id}/`) — nega acesso (`403`) caso contrário
4. Gera uma **Presigned URL** (`getSignedUrl` do AWS SDK v3) com tempo de expiração limitado
5. Retorna a URL assinada ao cliente, que acessa o arquivo diretamente do S3
6. Operação é registrada via `console.log` — capturado automaticamente pelo CloudWatch

---

## ☁️ Serviços AWS Utilizados

| Serviço | Função | Justificativa |
|---|---|---|
| Amazon Cognito | Autenticação, autorização e gerenciamento de usuários | Gerenciado, suporte a JWT nativo |
| AWS WAF | Proteção contra ataques comuns na camada de aplicação, filtrando tráfego HTTP/HTTPS | Firewall gerenciado sem servidor |
| Amazon API Gateway | Criação, publicação e proteção de APIs | Escalável, sem servidor próprio |
| AWS Lambda | Execução das funções de Upload, Download e Auditoria | Serverless — paga apenas por execução |
| Amazon SQS | Fila de mensagens para comunicação assíncrona entre Upload e Audit | Desacopla processamento sem perder eventos |
| Amazon S3 | Armazenamento de objetos (PDFs, imagens) | Durabilidade 99,999999999%, lifecycle nativo |
| S3 Glacier Flexible Retrieval | Arquivamento de longo prazo | Redução drástica de custo após 365 dias |
| DynamoDB | Armazenamento de metados dos arquivos e dados dos usuários | Consulta o local do arquivo solicitado pelo usuário |
| Amazon CloudWatch | Monitoramento, observabilidade e logs de auditoria | Rastreabilidade de todas as operações |

---

## 🔒 Segurança e IAM

- **Block Public Access** habilitado em nível de bucket — nenhum objeto do S3 é acessível publicamente
- **ACLs completamente desativadas** — governança centralizada nas políticas IAM
- **IAM Role da Lambda** com permissões de `s3:PutObject`, `s3:GetObject` e `s3:ListBucket`, estritamente limitadas ao prefixo do usuário (Least Privilege)
- **Prefixo por userId** no S3: `user-{id}/arquivo.pdf` — a Download Function verifica esse prefixo antes de liberar qualquer acesso, isolando completamente os documentos entre usuários
- **Presigned URLs** geradas pela Lambda para acesso temporário — o bucket permanece privado durante todo o processo
- **Autenticação via JWT** validado em cada requisição de download (`jsonwebtoken`)
- **Amazon Cognito** para autenticação e gerenciamento de usuários
- **AWS WAF** como camada de proteção contra ataques antes do API Gateway
- Sem credenciais hardcoded — autenticação via IAM Role em produção

---

## 💰 Custos Mensais

> Estimativa baseada em arquivos com média de 1MB · Cotação do Dólar: R$ 5,17 (28/06/2026) · Calculado via AWS Pricing Calculator

📊 [Ver estimativa completa na AWS Pricing Calculator](https://calculator.aws/#/estimate?id=74116c2bcdbe2885fad6ae15b428e1068ee128f4)

| Serviço | Custo (USD) | Custo (BRL) |
|---|---|---|
| AWS Lambda | — | — |
| Amazon Cognito | USD 0,01 | R$ 0,05 |
| Amazon SQS | USD 0,05 | R$ 0,26 |
| Amazon API Gateway | USD 0,05 | R$ 0,26 |
| Amazon DynamoDB | USD 0,29 | R$ 1,50 |
| Amazon CloudWatch | USD 0,50 | R$ 2,59 |
| Amazon S3 | USD 1,63 | R$ 8,46 |
| AWS WAF | USD 7,00 | R$ 36,32 |
| **Total mensal** | **USD 9,58** | **R$ 49,71** |
| **Total anual** | **USD 114,96** | **R$ 596,52** |

**Comportamento do custo ao longo do tempo:**

- **Meses 1–12:** o custo de manter os arquivos acessíveis instantaneamente cresce progressivamente, atingindo o teto de aproximadamente **R$ 86,00/mês**
- **A partir do mês 13:** os objetos mais antigos migram automaticamente para o S3 Glacier via Lifecycle Rule, reduzindo o custo de armazenamento histórico sem perda de dados
- **Maior item de custo:** o AWS WAF concentra a maior parte do gasto mensal (R$ 36,32 de R$ 49,71 totais) — ponto de atenção para otimização futura
- **Custo zero de infraestrutura ociosa:** arquitetura serverless — sem servidores pagos quando não há uso

---

## 🏗️ Metodologia de Desenvolvimento

O projeto foi conduzido com **Kanban** para organização visual do fluxo de tarefas (Backlog → Em Andamento → Concluído) e princípios de **Scrum**, com entregas organizadas em ciclos curtos e iterativos.

---

## 📁 Estrutura do Repositório

```
ChonosIA/
├── assets/
│   └── logo.png                            ← Logo do projeto
├── back-end/
│   ├── src/
│   │   ├── app.ts                          ← Aplicação Express (CORS, rotas, error handler)
│   │   ├── main.ts                         ← Servidor local (porta 3333)
│   │   ├── lambda.ts                       ← Handler genérico para AWS Lambda (API REST)
│   │   ├── config/
│   │   │   ├── env.ts                      ← Variáveis de ambiente
│   │   │   └── database.ts                 ← Conexão PostgreSQL
│   │   ├── infra/storage/
│   │   │   └── s3.ts                       ← Upload para S3 (PutObjectCommand)
│   │   ├── lambdas/
│   │   │   ├── Uploadfunction.ts           ← Lambda dedicada: valida, organiza e armazena no S3
│   │   │   ├── Downloadfunction.ts         ← Lambda dedicada: valida JWT e gera Presigned URL
│   │   │   └── Audifunction.ts             ← Lambda dedicada: consome SQS e registra no CloudWatch
│   │   └── modules/
│   │       ├── documents/
│   │       │   ├── documents.controller.ts ← listDocuments, uploadDocument
│   │       │   └── documents.routes.ts     ← GET / e POST /upload
│   │       └── users/
│   │           ├── users.controller.ts     ← listUsers, createUser
│   │           └── users.routes.ts         ← GET / e POST /
│   ├── scripts/
│   │   └── create-admin.js                 ← Cria tabela users e usuário admin inicial
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
│   │   ├── styles/
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
SQS_QUEUE_URL=url-da-fila-sqs           # Necessário para a Upload Function
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
- AWS CLI configurado (para testes de S3/SQS)

### Back-end

```bash
cd back-end
npm install

# Criar a tabela users e o usuário admin inicial
node scripts/create-admin.js

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
  "email": "exemplo@email.com",
  "password": "senha123"
}
```

---

## ☁️ Deploy das Lambdas

O projeto possui **três funções Lambda dedicadas**, cada uma com responsabilidade única:

| Lambda | Trigger | Responsabilidade |
|---|---|---|
| `Uploadfunction.ts` | API Gateway (POST) | Valida, organiza e armazena o documento no S3; publica evento no SQS |
| `Downloadfunction.ts` | API Gateway (GET) | Valida JWT e gera Presigned URL para acesso temporário |
| `Audifunction.ts` | Amazon SQS | Consome eventos da fila e registra logs estruturados no CloudWatch |

### 1. Build do back-end

```bash
cd back-end
npm run build
```

### 2. Empacotar cada Lambda

```bash
zip -r upload-function.zip dist/lambdas/Uploadfunction.js node_modules/
zip -r download-function.zip dist/lambdas/Downloadfunction.js node_modules/
zip -r audit-function.zip dist/lambdas/Audifunction.js node_modules/
```

### 3. Criar a Upload Function

```bash
aws lambda create-function \
  --function-name chronos-upload-function \
  --runtime nodejs18.x \
  --role arn:aws:iam::SUA_CONTA:role/chronos-lambda-role \
  --handler dist/lambdas/Uploadfunction.handler \
  --zip-file fileb://upload-function.zip \
  --environment Variables="{
    AWS_S3_BUCKET=nome-do-bucket,
    AWS_REGION=us-east-1,
    SQS_QUEUE_URL=url-da-fila-sqs
  }"
```

### 4. Criar a Download Function

```bash
aws lambda create-function \
  --function-name chronos-download-function \
  --runtime nodejs18.x \
  --role arn:aws:iam::SUA_CONTA:role/chronos-lambda-role \
  --handler dist/lambdas/Downloadfunction.handler \
  --zip-file fileb://download-function.zip \
  --environment Variables="{
    AWS_S3_BUCKET=nome-do-bucket,
    AWS_REGION=us-east-1,
    JWT_SECRET=seu_secret
  }"
```

### 5. Criar a Audit Function e conectar ao SQS

```bash
aws lambda create-function \
  --function-name chronos-audit-function \
  --runtime nodejs18.x \
  --role arn:aws:iam::SUA_CONTA:role/chronos-lambda-role \
  --handler dist/lambdas/Audifunction.handler \
  --zip-file fileb://audit-function.zip

aws lambda create-event-source-mapping \
  --function-name chronos-audit-function \
  --event-source-arn arn:aws:sqs:us-east-1:SUA_CONTA:nome-da-fila \
  --batch-size 10
```

### 6. Configurar Lifecycle Rule do S3 (365 dias)

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

### 7. Bloquear acesso público ao S3

```bash
aws s3api put-public-access-block \
  --bucket nome-do-bucket \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## 🗺️ Roadmap

| Fase | Entregável |
|---|---|
| 1 | Configuração de Buckets S3 com Block Public Access |
| 2 | Desenvolvimento das Lambdas e integração com API Gateway |
| 3 | Implementação de políticas IAM e Lifecycle Rules de 365 dias |
| 4 | Monitoramento de custos via AWS Budgets e validação de dados |

---

## 🛠️ Stack Tecnológica

**Back-end:**
- Node.js 18 + TypeScript 6
- Express 5
- AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-sqs`, `@aws-sdk/s3-request-presigner`, `@aws-sdk/client-cognito-identity-provider`)
- jsonwebtoken (validação de JWT)
- Prisma ORM + PostgreSQL (`pg`)
- Dotenv, Joi

**Front-end:**
- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide React (ícones)
- Motion (animações)
- Sonner (notificações)

---

## 📎 Referências

- [AWS Lambda com Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [AWS S3 Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html)
- [Amazon SQS](https://docs.aws.amazon.com/AmazonSQS/latest/dg/welcome.html)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [Prisma com PostgreSQL](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
