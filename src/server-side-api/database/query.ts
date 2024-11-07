"use server";
import mysql2 from 'mysql2/promise';
import createConnection from './createConnection';

export default async function query(query: string, options?: mysql2.ConnectionOptions): Promise<string | false> {
  try {
    const connection = await createConnection(options);
    const [results, fields] = await connection.query(query);
    return JSON.stringify([results, fields]);
  } catch {
    return false;
  }
}