"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocuments = listDocuments;
exports.uploadDocument = uploadDocument;
const database_1 = require("../../config/database");
const s3_1 = require("../../infra/storage/s3");
const fallbackDocuments = [];
async function listDocuments() {
    try {
        await (0, database_1.initializeDatabase)();
        const result = await (0, database_1.query)('SELECT id, title, s3_key as "s3Key", s3_url as "s3Url", file_size as "fileSize", file_type as "fileType" FROM documents ORDER BY id DESC');
        return result.rows;
    }
    catch {
        return fallbackDocuments;
    }
}
async function uploadDocument(input) {
    try {
        await (0, database_1.initializeDatabase)();
        const fileBuffer = Buffer.from(input.fileContent, 'base64');
        const upload = await (0, s3_1.uploadFileToS3)({
            fileName: input.fileName,
            contentType: input.contentType,
            fileBuffer,
        });
        const result = await (0, database_1.query)('INSERT INTO documents (title, s3_key, s3_url, file_size, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, s3_key as "s3Key", s3_url as "s3Url", file_size as "fileSize", file_type as "fileType"', [input.title, upload.key, upload.url, fileBuffer.byteLength, input.contentType]);
        return result.rows[0];
    }
    catch {
        const document = {
            id: fallbackDocuments.length + 1,
            title: input.title,
            s3Key: 'local-fallback',
            s3Url: 'not-uploaded',
            fileSize: Buffer.byteLength(input.fileContent, 'base64'),
            fileType: input.contentType,
        };
        fallbackDocuments.push(document);
        return document;
    }
}
