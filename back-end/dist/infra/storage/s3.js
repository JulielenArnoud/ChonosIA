"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = uploadFileToS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../../config/env");
const s3Client = new client_s3_1.S3Client({
    region: env_1.env.awsRegion,
    credentials: env_1.env.awsAccessKeyId && env_1.env.awsSecretAccessKey
        ? {
            accessKeyId: env_1.env.awsAccessKeyId,
            secretAccessKey: env_1.env.awsSecretAccessKey,
        }
        : undefined,
});
async function uploadFileToS3({ fileName, contentType, fileBuffer, }) {
    if (!env_1.env.awsS3Bucket) {
        throw new Error('AWS_S3_BUCKET is not configured');
    }
    const key = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    await s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: env_1.env.awsS3Bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    }));
    return {
        key,
        url: `https://${env_1.env.awsS3Bucket}.s3.${env_1.env.awsRegion}.amazonaws.com/${key}`,
    };
}
