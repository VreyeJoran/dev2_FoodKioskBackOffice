import postgres, { Sql } from 'postgres';
import dotenv from "dotenv";

dotenv.config();

const SB_POSTGRES_URL: string = process.env.POSTGRES_URL || "";
const sql: Sql = postgres(SB_POSTGRES_URL);

export default sql;