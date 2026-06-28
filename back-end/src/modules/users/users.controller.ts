import { query, initializeDatabase } from '../../config/database';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
};

const fallbackUsers: UserRecord[] = [];

export async function listUsers() {
  try {
    await initializeDatabase();
    const result = await query('SELECT id, name, email, role FROM users ORDER BY id DESC');
    return result.rows;
  } catch {
    return fallbackUsers;
  }
}

export async function createUser(input: { name: string; email: string; password: string }) {
  try {
    await initializeDatabase();
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [input.name, input.email, input.password, 'user'],
    );

    return result.rows[0];
  } catch {
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
