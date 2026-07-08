import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error('No DATABASE_URL'); process.exit(1); }

const u = new URL(dbUrl);
const env = { ...process.env, PGPASSWORD: u.password };
const conn = `-h ${u.hostname} -p ${u.port} -U ${u.username} -d ${u.pathname.slice(1)}`;

// Export all settings as JSON
const settingsSql = `SELECT json_agg(json_build_object('key', key, 'value', value) ORDER BY key) FROM settings;`;
const settingsJson = execSync(`psql ${conn} -t -c "${settingsSql}"`, { env, encoding: 'utf8' }).trim();

// Parse and pretty-print
const settings = JSON.parse(settingsJson);
const output = {
  exportedAt: new Date().toISOString(),
  totalSettings: settings.length,
  settings: settings
};

import fs from 'fs';
fs.writeFileSync('exports/booking-settings-backup.json', JSON.stringify(output, null, 2));
console.log(`Exported ${settings.length} settings to exports/booking-settings-backup.json`);

// Export songs
const songsSql = `COPY (SELECT id, title, artist, spotify_url, genre, song_group, is_duet, is_solo, is_active, created_at FROM songs ORDER BY id) TO STDOUT CSV HEADER;`;
const songsCsv = execSync(`psql ${conn} -c "${songsSql}"`, { env, encoding: 'utf8' });
fs.writeFileSync('exports/all-songs-backup.csv', songsCsv);
console.log(`Exported songs to exports/all-songs-backup.csv`);

// Export requests count for reference
const reqSql = `SELECT COUNT(*) as count, MAX(created_at) as latest FROM requests;`;
const reqData = execSync(`psql ${conn} -t -c "${reqSql}"`, { env, encoding: 'utf8' }).trim();
console.log(`Requests: ${reqData}`);

// Export guest musicians
const gmSql = `SELECT COUNT(*) as count FROM guest_musicians;`;
const gmData = execSync(`psql ${conn} -t -c "${gmSql}"`, { env, encoding: 'utf8' }).trim();
console.log(`Guest musicians: ${gmData}`);

// Export pre-signups
const psSql = `SELECT COUNT(*) as count FROM pre_signups;`;
const psData = execSync(`psql ${conn} -t -c "${psSql}"`, { env, encoding: 'utf8' }).trim();
console.log(`Pre-signups: ${psData}`);
