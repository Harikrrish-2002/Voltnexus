const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/voltnexus').then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).project({ email: 1, role: 1 }).toArray();
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
