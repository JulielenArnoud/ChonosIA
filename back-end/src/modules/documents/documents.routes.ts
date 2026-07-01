import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { listDocuments, uploadDocument } from './documents.controller';

export const documentsRouter = Router();

documentsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const documents = await listDocuments();
    res.json(documents);
  }),
);

documentsRouter.post(
  '/upload',
  asyncHandler(async (req, res) => {
    const document = await uploadDocument(req.body);
    res.status(201).json(document);
  }),
);
