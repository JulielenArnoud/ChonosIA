"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET;
const JWT_SECRET = process.env.JWT_SECRET;
const SIGNED_URL_EXPIRES = 300; // 5 minutos
const handler = async (event) => {
    try {
        // 1. Extrair token JWT do header
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response(401, { message: 'Token de autenticação não fornecido' });
        }
        const token = authHeader.replace('Bearer ', '');
        // 2. Validar token JWT e permissões
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
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
        const command = new client_s3_1.GetObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, {
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
    }
    catch (error) {
        console.error('Erro no downloadFunction:', error);
        return response(500, { message: 'Erro interno no servidor' });
    }
};
exports.handler = handler;
function response(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}
