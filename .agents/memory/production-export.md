---
name: Production Export Limits
description: Replit's production SQL query tool can terminate when returning large text values in a single JSON result.
---

Large production settings values should be exported in bounded chunks rather than aggregated into one query response.

**Why:** The production query service can terminate on multi-megabyte JSON aggregation results even when the database itself is healthy and the query is read-only.

**How to apply:** Export row data in small batches, and split unusually large text values by character range; verify the reconstructed file against live row counts before presenting it.