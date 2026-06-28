# ChonosIA 

O **ChonosIA** é uma solução de arquitetura *serverless* desenhada para o gerenciamento, processamento inteligente e arquivamento seguro de documentos em larga escala (PDFs e imagens). O projeto atua como o motor de ingestão e governança de dados para subsidiar o treinamento de Agentes de IA corporativos.

---

## 🏗️ Arquitetura do Sistema

A solução foi projetada utilizando os principais serviços da **Amazon Web Services (AWS)**, garantindo escalabilidade automática, desacoplamento e custo otimizado:

*   **Camada de Entrada:** Amazon API Gateway gerenciando requisições HTTPS e servindo de barreira inicial de tráfego.
*   **Processamento Assíncrono:** Funções AWS Lambda responsáveis pela lógica de negócio e geração de acessos efêmeros.
*   **Orquestração:** AWS Step Functions coordenando o pipeline de extração e análise dos documentos.
*   **Inteligência Artificial & OCR:** Integração com Amazon Textract, Amazon Comprehend e Amazon Bedrock (Modelos Nova Lite e Titan Embeddings) para indexação semântica.
*   **Armazenamento e Cache:** Amazon S3 para armazenamento de objetos e DynamoDB para persistência de metadados e logs operacionais.

---

## 🔒 Governança e Segurança (IAM)

A segurança foi implementada seguindo rigorosamente as melhores práticas do *AWS Well-Architected Framework*:

*   **Princípio do Menor Privilégio:** A *Execution Role* da Lambda possui apenas permissões explícitas para as ações necessárias (`s3:PutObject`, `s3:GetObject` e `s3:ListBucket`).
*   **Isolamento Multi-tenant:** Organização estrutural do S3 baseada em prefixos dinâmicos por ID de usuário (`/userId/documento.pdf`). O IAM restringe matematicamente o acesso, impedindo vazamento cruzado de dados entre clientes.
*   **Acesso Efêmero:** Documentos privados protegidos por **Presigned URLs** com tempo de expiração rígido de 15 minutos.
*   **Proteção de Infraestrutura:** Ativação global do *Block Public Access* no nível do bucket S3 e **ACLs completamente desativadas**, centralizando toda a governança nas políticas do IAM.

---

## 💰 Otimização de Custos (S3 Lifecycle)

Visando a viabilidade financeira do histórico massivo de arquivos da plataforma:
*   Os documentos permanecem na camada quente/morna para acesso imediato da IA e do usuário.
*   Uma regra automatizada de **S3 Lifecycle** faz a transição de objetos com mais de **365 dias** diretamente para a camada **Amazon S3 Glacier**, reduzindo drasticamente o custo de armazenamento de longo prazo sem perder o ativo intelectual.

---

## 📁 Estrutura do Repositório

Conforme visualizado na raiz do projeto, o ecossistema está dividido em:

```text
├── back-end/       # Código-fonte das funções Lambda, políticas IAM e infraestrutura como código (IaC)
├── front-end/      # Interface do usuário para interação, upload e visualização dos documentos
└── README.md       # Documentação principal do projeto
