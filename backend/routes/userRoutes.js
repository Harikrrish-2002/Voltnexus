const express = require('express');
const router = express.Router();
const {
    getUsers,
    getDealers,
    getPendingUsers,
    updateUserStatus,
    deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getUsers);
router.route('/dealers').get(protect, getDealers);
router.route('/pending').get(protect, admin, getPendingUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

router.route('/:id/status').put(protect, admin, updateUserStatus);

module.exports = router;
