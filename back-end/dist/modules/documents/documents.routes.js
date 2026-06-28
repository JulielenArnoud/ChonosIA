"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const documents_controller_1 = require("./documents.controller");
exports.documentsRouter = (0, express_1.Router)();
exports.documentsRouter.get('/', async (_req, res, next) => {
    try {
        const documents = await (0, documents_controller_1.listDocuments)();
        res.json(documents);
    }
    catch (error) {
        next(error);
    }
});
exports.documentsRouter.post('/upload', async (req, res, next) => {
    try {
        const document = await (0, documents_controller_1.uploadDocument)(req.body);
        res.status(201).json(document);
    }
    catch (error) {
        next(error);
    }
});
