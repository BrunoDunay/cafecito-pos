import mongoose from 'mongoose';
import dns from 'dns';

const dbConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // If using mongodb+srv (SRV records), Node's DNS resolver can sometimes
    // fail depending on the system DNS. Force a reliable public DNS for SRV
    // resolution as a fallback to avoid `querySrv ECONNREFUSED` errors.
    if (mongoUri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        console.log('Using fallback DNS servers for SRV resolution: 8.8.8.8, 8.8.4.4');
      } catch (dnsErr) {
        console.warn('Could not set fallback DNS servers:', dnsErr.message);
      }
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected');
} catch (error) {
  console.error('❌ MongoDB connection error');
  console.error('Message:', error.message);
  console.error('Name:', error.name);
  console.error('Code:', error.code);
  console.error(error);
  throw error;
}
};

export default dbConnection;
