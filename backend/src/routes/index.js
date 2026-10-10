const express = require('express');
const {
  getHealth,
  getOperators,
  getBuses,
  searchBuses,
  getBusById,
} = require('../controllers/busController');
const { createBooking, getBookingByReference } = require('../controllers/bookingController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/operators', getOperators);
router.get('/buses', getBuses);
router.get('/buses/search', searchBuses);
router.get('/buses/:id', getBusById);
router.post('/bookings', createBooking);
router.get('/bookings/:reference', getBookingByReference);

module.exports = router;
