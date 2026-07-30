---
name: Settings Save Authentication
description: All protected fetch calls must include credentials for session cookies to work.
---

## The Bug

The `useUpdateSetting` hook in `client/src/hooks/use-settings.ts` was missing `credentials: 'include'` on its `fetch()` call. The settings API is protected by `isBandAuthed` middleware, which checks `req.session.bandAuthed`. Without sending cookies, every PATCH request returned 401 Unauthorized, so settings (including YouTube videos) appeared to not save.

## The Fix

Always include `credentials: 'include'` on fetch calls that hit protected endpoints:

```javascript
const res = await fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value }),
  credentials: 'include',  // Required for session auth
});
```

**Why:** The band dashboard uses PIN-based session auth (`req.session.bandAuthed`), not Replit Auth. The session cookie must be sent with every request.

**How to apply:** Check any custom `fetch()` call (not using `apiRequest()` from `queryClient.ts`) that hits a protected endpoint. `apiRequest()` already includes `credentials: "include"`, but hooks that use raw `fetch()` may not.
