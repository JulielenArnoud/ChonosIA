"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentsRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const documents_controller_1 = require("./documents.controller");
exports.documentsRouter = (0, express_1.Router)();
exports.documentsRouter.get('/', (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const documents = await (0, documents_controller_1.listDocuments)();
    res.json(documents);
}));
exports.documentsRouter.post('/upload', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const document = await (0, documents_controller_1.uploadDocument)(req.body);
    res.status(201).json(document);
}));
