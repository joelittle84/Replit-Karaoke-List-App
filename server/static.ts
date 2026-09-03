import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Set cache-control headers based on file type before serving static assets
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (path.basename(filePath) === "index.html") {
          // Never cache index.html so deployments are visible immediately
          res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate, proxy-revalidate",
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // Hashed filenames under /assets are immutable, cache aggressively
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
        } else {
          // Reasonable default for other static files (images, fonts, etc.)
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
