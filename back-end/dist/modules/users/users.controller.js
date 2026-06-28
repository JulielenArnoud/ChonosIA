"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
const database_1 = require("../../config/database");
const fallbackUsers = [];
async function listUsers() {
    try {
        await (0, database_1.initializeDatabase)();
        const result = await (0, database_1.query)('SELECT id, name, email, role FROM users ORDER BY id DESC');
        return result.rows;
    }
    catch {
        return fallbackUsers;
    }
}
async function createUser(input) {
    try {
        await (0, database_1.initializeDatabase)();
        const result = await (0, database_1.query)('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role', [input.name, input.email, input.password, 'user']);
        return result.rows[0];
    }
    catch {
        const user = {
            id: fallbackUsers.length + 1,
            name: input.name,
            email: input.email,
            password: input.password,
            role: 'user',
        };
        fallbackUsers.push(user);
        return user;
    }
}
