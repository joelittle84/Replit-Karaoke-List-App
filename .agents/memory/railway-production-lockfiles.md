---
name: Railway production lockfiles
description: Production-only npm installs and manually moved build-tool dependencies
---

When build tools move from `devDependencies` to `dependencies`, every transitive package required while running the production build must also be reachable as non-development metadata in `package-lock.json`; otherwise `npm ci --omit=dev` installs the direct tools but prunes runtime-loaded helpers and native packages.

**Why:** Railway-style production installs exposed missing packages one at a time even though the normal development install and build passed. npm’s lockfile metadata, not only `package.json`, controls whether transitive packages are retained.

**How to apply:** Validate with a clean temporary `npm ci --omit=dev` followed by the real build. Preserve versions and integrity values; update only the relevant `dev`/`devOptional` classification, and verify the package firewall’s canonical integrity for any hand-edited entry.