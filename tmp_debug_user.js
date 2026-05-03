const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).filter(Boolean).reduce((acc, line) => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (k) acc[k] = v;
  }
  return acc;
}, {});
const uri = env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI missing');
  process.exit(1);
}
const email = process.argv[2] || 'xxx@gmail.com';
(async () => {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const doc = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    console.log(JSON.stringify(doc, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
