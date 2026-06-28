import express from 'express';
import dotenv from 'dotenv';
import { usersRouter } from './modules/users/users.routes';
import { documentsRouter } from './modules/documents/documents.routes';

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get('/', (_req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

app.use('/users', usersRouter);
app.use('/documents', documentsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: err instanceof Error ? err.message : 'Erro interno do servidor',
  });
});

export default app;
