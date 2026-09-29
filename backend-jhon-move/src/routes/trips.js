const express = require('express');
const {
  requestTrip,
  listOpenRequests,
  acceptTrip,
  updateTripStatus,
  getTrip,
  myTrips,
  rateTrip,
} = require('../controllers/tripController');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/', myTrips);
router.get('/requests', requireRole('conductor'), listOpenRequests);
router.post('/', requireRole('pasajero'), requestTrip);
router.get('/:id', getTrip);
router.post('/:id/accept', requireRole('conductor'), acceptTrip);
router.patch('/:id/status', updateTripStatus);
router.post('/:id/rate', requireRole('pasajero'), rateTrip);

module.exports = router;
