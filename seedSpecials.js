// This file has been deprecated. Use seedOnce.js which performs idempotent upserts
// into the database instead of destructive deletes. The old separate seed files
// were consolidated to avoid accidental data loss.

console.log('seedSpecials.js is deprecated. Run `npm run seed` (seedOnce.js) to seed data.');
process.exit(0);
