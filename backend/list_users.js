const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email role password');
        console.log('Users in DB:');
        users.forEach(u => console.log(`- Role: ${u.role}, Email: ${u.email}, Password (Hashed): ${u.password}`));
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

listUsers();
