"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
exports.usersRouter = (0, express_1.Router)();
exports.usersRouter.get('/', async (_req, res, next) => {
    try {
        const users = await (0, users_controller_1.listUsers)();
        res.json(users);
    }
    catch (error) {
        next(error);
    }
});
exports.usersRouter.post('/', async (req, res, next) => {
    try {
        const user = await (0, users_controller_1.createUser)(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
});
