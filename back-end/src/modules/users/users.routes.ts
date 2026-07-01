import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { createUser, listUsers } from './users.controller';

export const usersRouter = Router();

usersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json(users);
  }),
);

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json(user);
  }),
);
