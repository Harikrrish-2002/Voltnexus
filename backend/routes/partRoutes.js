const express = require('express');
const router = express.Router();
const {
    getParts,
    createPart,
    updatePart,
    deletePart,
} = require('../controllers/partController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getParts)
    .post(protect, createPart);

router.route('/:id')
    .put(protect, updatePart)
    .delete(protect, deletePart);

module.exports = router;
