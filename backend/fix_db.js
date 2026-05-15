const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/voltnexus').then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
        { email: { $regex: /dealer/i } },
        { $set: { role: 'Dealer' } }
    );
    console.log(`Updated ${result.modifiedCount} dealer accounts to Dealer role.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
