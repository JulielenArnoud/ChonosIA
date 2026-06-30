import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

const BUCKET = process.env.AWS_S3_BUCKET!;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL!;

// Tipos permitidos e tamanho máximo (10MB)
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 1. Extrair dados da requisição
    const body = event.body 
  ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
  : {};
    const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous';

    const { fileName, contentType, fileContent, title } = body;

    // 2. Validar dados obrigatórios
    if (!fileName || !contentType || !fileContent || !title) {
      return response(400, { message: 'Campos obrigatórios: fileName, contentType, fileContent, title' });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return response(400, { message: `Tipo não permitido. Use: ${ALLOWED_TYPES.join(', ')}` });
    }

    const fileBuffer = Buffer.from(fileContent, 'base64');

    if (fileBuffer.byteLength > MAX_SIZE_BYTES) {
      return response(400, { message: 'Arquivo excede o limite de 10MB' });
    }

    // 3. Organizar arquivo com prefixo por usuário (user-123/documento.pdf)
    const key = `user-${userId}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    // 4. PutObject no S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        userId,
        title,
        uploadedAt: new Date().toISOString(),
      },
    }));

    const s3Url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 5. Publicar evento no SQS para processamento assíncrono
    await sqs.send(new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        event: 'DOCUMENT_UPLOADED',
        userId,
        title,
        s3Key: key,
        s3Url,
        fileSize: fileBuffer.byteLength,
        fileType: contentType,
        uploadedAt: new Date().toISOString(),
      }),
    }));

    // 7. Retorno ao cliente
    return response(201, {
      message: 'Upload concluído com sucesso.',
      document: {
        title,
        s3Key: key,
        s3Url,
        fileSize: fileBuffer.byteLength,
        fileType: contentType,
      },
    });

  } catch (error) {
    console.error('Erro no uploadFunction:', error);
    return response(500, { message: 'Erro interno no servidor' });
  }
};

function response(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}