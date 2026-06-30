import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET!;
const JWT_SECRET = process.env.JWT_SECRET!;
const SIGNED_URL_EXPIRES = 300; // 5 minutos

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 1. Extrair token JWT do header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response(401, { message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Validar token JWT e permissões
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return response(401, { message: 'Token inválido ou expirado' });
    }

    const userId = decoded.sub || decoded.id;

    // Extrair s3Key da query string ou path
    const s3Key = event.queryStringParameters?.key || event.pathParameters?.key;
    if (!s3Key) {
      return response(400, { message: 'Parâmetro "key" é obrigatório' });
    }

    // 3. Verificar se o arquivo pertence ao usuário (prefixo user-{id}/)
    const expectedPrefix = `user-${userId}/`;
    if (!s3Key.startsWith(expectedPrefix)) {
      return response(403, { message: 'Acesso negado a este documento' });
    }

    // 4. Gerar URL assinada (pre-signed URL) com tempo limitado
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: SIGNED_URL_EXPIRES,
    });

    // Log para auditoria (CloudWatch captura automaticamente)
    console.log(JSON.stringify({
      event: 'DOCUMENT_DOWNLOADED',
      userId,
      s3Key,
      timestamp: new Date().toISOString(),
    }));

    // 5. Retornar URL assinada ao cliente
    return response(200, {
      signedUrl,
      expiresIn: SIGNED_URL_EXPIRES,
      message: 'URL válida por 5 minutos',
    });

  } catch (error) {
    console.error('Erro no downloadFunction:', error);
    return response(500, { message: 'Erro interno no servidor' });
  }
};

function response(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}