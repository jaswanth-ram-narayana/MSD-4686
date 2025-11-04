const { spawnSync } = require('child_process');
const path = require('path');

// This runner was replaced by seedOnce.js which performs idempotent upserts.
// To seed the database run `node seedOnce.js` or `npm run seed`.

const backendRoot = __dirname;
console.log('runSeeds.js is deprecated. Run `node seedOnce.js` or `npm run seed` instead.');
console.log('Using MONGODB_URI =', process.env.MONGODB_URI || '<not set - will use defaults in script>');
