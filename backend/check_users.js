const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/voltnexus');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const fs = require('fs');

const checkUsers = async () => {
    await connectDB();

    const users = await User.find({});
    let output = '--- Users in DB ---\n';
    users.forEach(user => {
        output += `ID: ${user._id}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}\n`;
    });
    output += '-------------------\n';

    fs.writeFileSync('users_dump.txt', output);
    console.log('Dumped to users_dump.txt');
    process.exit();
};

checkUsers();
