// server/cleanDB.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Database...");

    // This command deletes the 'users' collection completely
    // ensuring all old indexes (rules) are gone.
    try {
        await mongoose.connection.db.dropCollection('users');
        console.log("🗑️  Old 'users' collection dropped (indexes cleared).");
    } catch (e) {
        console.log("⚠️  Collection might not exist, skipping drop.");
    }

    console.log("✨ Database is clean. Please restart your server to re-seed the Admin.");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

cleanDB();