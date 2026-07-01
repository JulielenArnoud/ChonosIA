"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = exports.listDocuments = exports.documentsRouter = void 0;
var documents_routes_1 = require("./documents.routes");
Object.defineProperty(exports, "documentsRouter", { enumerable: true, get: function () { return documents_routes_1.documentsRouter; } });
var documents_controller_1 = require("./documents.controller");
Object.defineProperty(exports, "listDocuments", { enumerable: true, get: function () { return documents_controller_1.listDocuments; } });
Object.defineProperty(exports, "uploadDocument", { enumerable: true, get: function () { return documents_controller_1.uploadDocument; } });
