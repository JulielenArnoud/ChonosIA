import { initializeDatabase, query } from '../../config/database';
import { uploadFileToS3 } from '../../infra/storage/s3';

type DocumentRecord = {
  id: number;
  title: string;
  s3Key: string;
  s3Url: string;
  fileSize: number;
  fileType: string;
};

const fallbackDocuments: DocumentRecord[] = [];

export async function listDocuments() {
  try {
    await initializeDatabase();
    const result = await query('SELECT id, title, s3_key as "s3Key", s3_url as "s3Url", file_size as "fileSize", file_type as "fileType" FROM documents ORDER BY id DESC');
    return result.rows;
  } catch {
    return fallbackDocuments;
  }
}

export async function uploadDocument(input: {
  title: string;
  fileName: string;
  contentType: string;
  fileContent: string;
}) {
  try {
    await initializeDatabase();

    const fileBuffer = Buffer.from(input.fileContent, 'base64');
    const upload = await uploadFileToS3({
      fileName: input.fileName,
      contentType: input.contentType,
      fileBuffer,
    });

    const result = await query(
      'INSERT INTO documents (title, s3_key, s3_url, file_size, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, s3_key as "s3Key", s3_url as "s3Url", file_size as "fileSize", file_type as "fileType"',
      [input.title, upload.key, upload.url, fileBuffer.byteLength, input.contentType],
    );

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao fazer upload para o S3:', error);
    throw new Error(error instanceof Error ? error.message : 'Erro ao fazer upload para o S3');
  }
}
