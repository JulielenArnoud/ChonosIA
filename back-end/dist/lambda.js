"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const app_1 = __importDefault(require("./app"));
const handler = async (event, context) => {
    const { httpMethod, path, body, headers, queryStringParameters } = event;
    const req = {
        method: httpMethod,
        path,
        body: body ? JSON.parse(body) : {},
        headers: headers || {},
        query: queryStringParameters || {},
    };
    const res = {
        statusCode: 200,
        body: '',
        headers: { 'Content-Type': 'application/json' },
    };
    const expressApp = app_1.default;
    const mockReq = req;
    const mockRes = {
        statusCode: 200,
        setHeader: () => { },
        json: (payload) => {
            res.body = JSON.stringify(payload);
            res.statusCode = 200;
            return res;
        },
        status: (code) => {
            res.statusCode = code;
            return mockRes;
        },
        send: (payload) => {
            res.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
            return res;
        },
    };
    const mockNext = () => { };
    try {
        await new Promise((resolve, reject) => {
            expressApp.handle(mockReq, mockRes, (err) => {
                if (err)
                    return reject(err);
                resolve(undefined);
            });
        });
    }
    catch (error) {
        res.statusCode = 500;
        res.body = JSON.stringify({ message: error.message });
    }
    return res;
};
exports.handler = handler;
