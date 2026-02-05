// backend/initializers/seed.js (o donde tengas este archivo)
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const initializeData = async () => {
  const adminEmail = 'admin@cafecito.com';

  const adminExists = await User.findOne({ email: adminEmail });

  if (adminExists) {
    console.log('✅ Admin user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  await User.create({
    name: 'Administrador',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    is_active: true,  
  });

  console.log('✅ Admin user created successfully');
};

export default initializeData;