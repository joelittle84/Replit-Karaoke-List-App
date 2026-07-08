import { db } from "../server/db";
import { settings, songs } from "../shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

async function restore() {
  const raw = fs.readFileSync("exports/complete-backup.json", "utf8");
  const backup = JSON.parse(raw);

  console.log(`Restoring from backup created: ${backup.exportedAt}\n`);

  // Restore settings (upsert)
  for (const s of backup.tables.settings) {
    await db.insert(settings)
      .values({ key: s.key, value: s.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: s.value } });
  }
  console.log(`Restored ${backup.tables.settings.length} settings`);

  // Restore songs (skip existing by title+artist)
  let added = 0, skipped = 0;
  for (const s of backup.tables.songs) {
    const existing = await db.select().from(songs)
      .where(eq(songs.title, s.title))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
    } else {
      await db.insert(songs).values({
        title: s.title,
        artist: s.artist,
        spotifyUrl: s.spotifyUrl,
        genre: s.genre,
        group: s.group,
        isDuet: s.isDuet,
        isSolo: s.isSolo,
        isActive: s.isActive
      });
      added++;
    }
  }
  console.log(`Songs: ${added} added, ${skipped} skipped (already existed)`);

  console.log("\nRestore complete!");
}

import { eq } from "drizzle-orm";
restore().catch(console.error);
