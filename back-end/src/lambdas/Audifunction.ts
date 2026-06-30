import { SQSEvent, SQSRecord } from 'aws-lambda';

// Tipos de eventos que a Audit Function processa
type AuditEvent = {
  event: 'DOCUMENT_UPLOADED' | 'DOCUMENT_DOWNLOADED' | 'DOCUMENT_DELETED';
  userId: string;
  title?: string;
  s3Key: string;
  s3Url?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
  timestamp?: string;
};

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

async function processRecord(record: SQSRecord): Promise<void> {
  try {
    const payload: AuditEvent = JSON.parse(record.body);

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

  } catch (error) {
    // Loga o erro mas não lança exceção para não bloquear a fila SQS
    console.error(JSON.stringify({
      level: 'ERROR',
      service: 'chronos-ia-audit',
      messageId: record.messageId,
      error: (error as Error).message,
      rawBody: record.body,
      timestamp: new Date().toISOString(),
    }));
  }
}