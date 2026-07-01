"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
        message: err instanceof Error ? err.message : 'Erro interno do servidor',
    });
};
exports.errorHandler = errorHandler;
