"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const users_controller_1 = require("./users.controller");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.get('/', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const users = await (0, users_controller_1.listUsers)();
    res.json(users);
}));
exports.usersRouter.post('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await (0, users_controller_1.createUser)(req.body);
    res.status(201).json(user);
}));
