import express from 'express';
import dotenv from 'dotenv';
import { documentsRouter } from './modules/documents';
import { usersRouter } from './modules/users';
import { errorHandler } from './shared/middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
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

app.use(errorHandler);

export default app;
