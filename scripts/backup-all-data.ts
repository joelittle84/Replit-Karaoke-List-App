import { db } from "../server/db";
import { settings, songs, guestMusicians, preSignups, bookingInquiries, requests } from "../shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

async function backup() {
  console.log("Starting backup...\n");

  // Settings
  const allSettings = await db.select().from(settings);
  console.log(`Settings: ${allSettings.length}`);

  // Songs
  const allSongs = await db.select().from(songs).orderBy(songs.id);
  console.log(`Songs: ${allSongs.length}`);

  // Guest musicians
  const allGM = await db.select().from(guestMusicians);
  console.log(`Guest musicians: ${allGM.length}`);

  // Pre-signups
  const allPS = await db.select().from(preSignups);
  console.log(`Pre-signups: ${allPS.length}`);

  // Booking inquiries
  const allBI = await db.select().from(bookingInquiries);
  console.log(`Booking inquiries: ${allBI.length}`);

  // Requests (just count to avoid huge file)
  const allReqs = await db.select().from(requests);
  console.log(`Requests: ${allReqs.length}`);

  const backup = {
    exportedAt: new Date().toISOString(),
    source: "Guilty Pleasures Karaoke",
    environment: "development",
    tables: {
      settings: allSettings,
      songs: allSongs,
      guestMusicians: allGM,
      preSignups: allPS,
      bookingInquiries: allBI,
      requests: allReqs.map(r => ({
        id: r.id,
        participantName: r.participantName,
        status: r.status,
        createdAt: r.createdAt
      }))
    }
  };

  fs.writeFileSync("exports/complete-backup.json", JSON.stringify(backup, null, 2));
  console.log("\nBackup saved to: exports/complete-backup.json");
}

backup().catch(console.error);
