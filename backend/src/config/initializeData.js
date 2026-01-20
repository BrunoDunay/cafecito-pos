import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const initializeData = async () => {
  const adminEmail = 'admin@cafecito.com';

  const adminExists = await User.findOne({ email: adminEmail });

  if (adminExists) {
    console.log('Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  await User.create({
    name: 'Administrador',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log('Admin user created');
};

export default initializeData;
