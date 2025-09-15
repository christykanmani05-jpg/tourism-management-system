const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testAdminLogin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://tourism:tourism@tourismcluster.dg05mvl.mongodb.net/tourismDB');
    console.log('Connected to MongoDB');

    // Test admin login query
    const adminUser = await User.findOne({ 
      username: 'admin', 
      password: 'admin123', 
      role: 'admin' 
    });

    if (adminUser) {
      console.log('✅ Admin login test successful!');
      console.log('Admin user found:', {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        profilePhoto: adminUser.profilePhoto
      });
    } else {
      console.log('❌ Admin login test failed - user not found');
    }

    // Test regular user query (should not find admin)
    const regularUser = await User.findOne({ 
      username: 'admin', 
      password: 'admin123' 
    });

    console.log('Regular user query result:', regularUser ? 'Found user' : 'No user found');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminLogin();



