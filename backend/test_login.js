const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'harikrishnandilip353@gmail.com',
            password: 'Password@123', // I don't know the password actually...
            role: 'Worker'
        });
        console.log(res.data);
    } catch (e) {
        console.log(e.response ? e.response.data : e.message);
    }
}

testLogin();
