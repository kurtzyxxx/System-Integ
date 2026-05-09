import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables!');
  process.exit(1);
}

const sql = postgres(connectionString, {
  max: 10,                    // Max connections in pool
  idle_timeout: 20,           // Idle connection timeout (seconds)
  connect_timeout: 10,        // Connection timeout (seconds)
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export default sql;
