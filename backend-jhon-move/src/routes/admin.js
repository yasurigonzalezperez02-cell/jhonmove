const express = require('express');
const { listUsers, listDrivers, setUserStatus, seedAdmin } = require('../controllers/adminController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/seed', seedAdmin);
router.use(authRequired, requireRole('administrador'));
router.get('/users', listUsers);
router.get('/drivers', listDrivers);
router.patch('/users/:id/status', setUserStatus);

module.exports = router;
