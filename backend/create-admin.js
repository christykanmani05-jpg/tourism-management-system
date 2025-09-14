const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://tourism:tourism@tourismcluster.dg05mvl.mongodb.net/tourismDB');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      email: 'admin@triotrails.com',
      role: 'admin',
      profilePhoto: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
