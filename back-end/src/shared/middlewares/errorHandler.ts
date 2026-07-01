import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    message: err instanceof Error ? err.message : 'Erro interno do servidor',
  });
};
