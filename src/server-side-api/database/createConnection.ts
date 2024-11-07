"use server";
import mysql2 from "mysql2/promise";

const defaultConnectionOptions: mysql2.ConnectionOptions = {
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "me",
  password: process.env.DATABASE_PASS || "secret",
  database: process.env.DATABASE_NAME || "my_db",
}

export default async function createConnection(options?: mysql2.ConnectionOptions): Promise<mysql2.Connection> {
  const conn = await mysql2.createConnection({
    ...defaultConnectionOptions,
    ...options
  });
  await conn.connect();
  return conn;
}