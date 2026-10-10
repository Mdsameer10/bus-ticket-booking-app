const mongoose = require('mongoose');
const dns = require('node:dns');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dnsServers = process.env.DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  mongoose.set('strictQuery', true);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured. Copy backend/.env.example to backend/.env and set MONGODB_URI to your MongoDB Atlas URI or a running local MongoDB instance.'
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDB };
