"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    for (const record of event.Records) {
        await processRecord(record);
    }
};
exports.handler = handler;
async function processRecord(record) {
    try {
        const payload = JSON.parse(record.body);
        // Estrutura padronizada para o CloudWatch Logs
        const logEntry = {
            level: 'INFO',
            service: 'chronos-ia-audit',
            messageId: record.messageId,
            eventType: payload.event,
            userId: payload.userId,
            s3Key: payload.s3Key,
            ...(payload.title && { title: payload.title }),
            ...(payload.s3Url && { s3Url: payload.s3Url }),
            ...(payload.fileSize && { fileSize: payload.fileSize }),
            ...(payload.fileType && { fileType: payload.fileType }),
            timestamp: payload.uploadedAt || payload.timestamp || new Date().toISOString(),
            processedAt: new Date().toISOString(),
        };
        // CloudWatch captura automaticamente os console.log das Lambdas
        console.log(JSON.stringify(logEntry));
    }
    catch (error) {
        // Loga o erro mas não lança exceção para não bloquear a fila SQS
        console.error(JSON.stringify({
            level: 'ERROR',
            service: 'chronos-ia-audit',
            messageId: record.messageId,
            error: error.message,
            rawBody: record.body,
            timestamp: new Date().toISOString(),
        }));
    }
}
