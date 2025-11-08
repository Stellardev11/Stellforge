import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        asset_code VARCHAR(12) NOT NULL,
        issuer_public_key VARCHAR(56) NOT NULL UNIQUE,
        issuer_secret_encrypted TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        total_supply VARCHAR(50),
        mintable BOOLEAN DEFAULT false,
        burnable BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(56)
      );

      CREATE TABLE IF NOT EXISTS user_tokens (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(56) NOT NULL,
        token_id INTEGER REFERENCES tokens(id),
        balance VARCHAR(50) DEFAULT '0',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stakes (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(56) NOT NULL,
        amount VARCHAR(50) NOT NULL,
        staked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unlock_at TIMESTAMP,
        rewards_claimed VARCHAR(50) DEFAULT '0'
      );

      CREATE TABLE IF NOT EXISTS game_progress (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(56) NOT NULL UNIQUE,
        total_rewards VARCHAR(50) DEFAULT '0',
        quests_completed INTEGER[] DEFAULT ARRAY[]::INTEGER[],
        last_spin_at TIMESTAMP,
        score INTEGER DEFAULT 0
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    client.release();
  }
};

export default pool;
