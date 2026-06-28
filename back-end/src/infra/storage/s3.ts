import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env';

const s3Client = new S3Client({
  region: env.awsRegion,
  credentials: env.awsAccessKeyId && env.awsSecretAccessKey
    ? {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey,
      }
    : undefined,
});

export async function uploadFileToS3({
  fileName,
  contentType,
  fileBuffer,
}: {
  fileName: string;
  contentType: string;
  fileBuffer: Buffer;
}) {
  if (!env.awsS3Bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  const key = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.awsS3Bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`,
  };
}
