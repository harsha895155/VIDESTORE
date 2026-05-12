const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    
    const email = 'videstore2027@gmail.com';
    const password = 'VideStore2027';
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists, updating role and password...');
      user.role = 'admin';
      user.password = password;
      await user.save();
      console.log('Admin account updated successfully!');
    } else {
      console.log('Creating new admin account...');
      user = await User.create({
        name: 'Admin',
        email: email,
        password: password,
        role: 'admin',
        isActive: true
      });
      console.log('Admin account created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
