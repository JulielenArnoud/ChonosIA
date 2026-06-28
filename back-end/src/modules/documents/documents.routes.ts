import { Router } from 'express';
import { listDocuments, uploadDocument } from './documents.controller';

export const documentsRouter = Router();

documentsRouter.get('/', async (_req, res, next) => {
  try {
    const documents = await listDocuments();
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

documentsRouter.post('/upload', async (req, res, next) => {
  try {
    const document = await uploadDocument(req.body);
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});
