"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_routes_1 = require("./modules/users/users.routes");
const documents_routes_1 = require("./modules/documents/documents.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ message: 'Backend funcionando!' });
});
app.use('/users', users_routes_1.usersRouter);
app.use('/documents', documents_routes_1.documentsRouter);
exports.default = app;
