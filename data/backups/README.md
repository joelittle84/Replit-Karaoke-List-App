# Database Backups

This directory contains backups of all critical app data.

## Files

- `complete-backup.json` - Full database export including:
  - All 25 settings (booking page content, guitar instructions, PIN, etc.)
  - All songs (129 total with Spotify URLs and genres)
  - All requests, guest musicians, pre-signups, booking inquiries

## How to Restore (if data is lost after downgrade)

1. Make sure the dev database is running
2. Run the restore script:
   ```bash
   npx tsx scripts/restore-from-backup.ts
   ```

## How to Create a Fresh Backup

1. Run the backup script:
   ```bash
   npx tsx scripts/backup-all-data.ts
   ```
2. Copy the generated `exports/complete-backup.json` into this directory
3. Commit to git

## Last Updated

2026-07-08 - 129 songs, 25 settings, full booking page content preserved
