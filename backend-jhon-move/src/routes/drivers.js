const express = require('express');
const {
  setAvailability,
  registerVehicle,
  listVehicles,
  getProfile,
} = require('../controllers/driverController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, requireRole('conductor'));

router.get('/me', getProfile);
router.patch('/availability', setAvailability);
router.post('/vehicles', registerVehicle);
router.get('/vehicles', listVehicles);

module.exports = router;
