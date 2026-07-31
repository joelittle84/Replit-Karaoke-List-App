import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function ensureDatabaseSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('rest-express-schema'))");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar UNIQUE,
        first_name varchar,
        last_name varchar,
        profile_image_url varchar,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS songs (
        id serial PRIMARY KEY,
        title text NOT NULL,
        artist text NOT NULL,
        spotify_url text,
        genre text,
        song_group text,
        is_duet boolean DEFAULT false NOT NULL,
        is_solo boolean DEFAULT false NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS requests (
        id serial PRIMARY KEY,
        participant_name text NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        is_presignup boolean DEFAULT false NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        id serial PRIMARY KEY,
        key text NOT NULL UNIQUE,
        value text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS guest_musicians (
        id serial PRIMARY KEY,
        name text NOT NULL,
        instrument text DEFAULT 'Guitar' NOT NULL,
        num_songs integer DEFAULT 2 NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trivia_sessions (
        id serial PRIMARY KEY,
        song_title text NOT NULL,
        song_artist text NOT NULL,
        questions text NOT NULL,
        status text DEFAULT 'waiting' NOT NULL,
        current_question_index integer DEFAULT 0 NOT NULL,
        question_started_at timestamp,
        question_duration_seconds integer DEFAULT 25 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pre_signups (
        id serial PRIMARY KEY,
        name text NOT NULL,
        email text,
        phone text,
        notes text,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS booking_inquiries (
        id serial PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        phone text,
        event_date text,
        venue text,
        event_type text,
        message text,
        status text DEFAULT 'new' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar PRIMARY KEY,
        sess jsonb NOT NULL,
        expire timestamp NOT NULL
      );

      CREATE TABLE IF NOT EXISTS request_songs (
        id serial PRIMARY KEY,
        request_id integer NOT NULL REFERENCES requests(id),
        song_id integer NOT NULL REFERENCES songs(id),
        preference_order integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS trivia_participants (
        id serial PRIMARY KEY,
        session_id integer NOT NULL REFERENCES trivia_sessions(id),
        player_name text NOT NULL,
        answers text DEFAULT '[]' NOT NULL,
        score integer DEFAULT 0 NOT NULL,
        joined_at timestamp DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
    `);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
