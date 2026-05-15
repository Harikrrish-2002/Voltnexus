const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatbotController');

router.post('/', handleChatQuery);

module.exports = router;
