const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('--- StudyMate DB Test ---');
  console.log('MONGODB_URI loaded?', !!uri);
  if (!uri) {
    console.log('FAIL: MONGODB_URI missing in .env');
    process.exit(1);
  }
  const safe = uri.replace(/:([^:@]+)@/, ':****@');
  console.log('URI:', safe);

  try {
    console.log('Connecting...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('SUCCESS: Connected to', mongoose.connection.host);
    await mongoose.disconnect();
  } catch (e) {
    console.log('FAIL:', e.message);
    process.exit(1);
  }
}
main();
