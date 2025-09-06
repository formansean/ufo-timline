import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@/types/user';

const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

export async function getUsers(): Promise<User[]> {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.username === username) || null;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}