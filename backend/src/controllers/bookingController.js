const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const { formatBookingResponse } = require('../utils/formatters');

function generateReference() {
  return `BTR-${Date.now().toString().slice(-6)}-${uuidv4().slice(0, 5).toUpperCase()}`;
}

async function createBooking(req, res, next) {
  try {
    const { tripId, passengerName, contactNumber, passengerCount, journeyDate } = req.body;

    if (!tripId) {
      const error = new Error('Trip ID is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.isValidObjectId(tripId)) {
      const error = new Error('Invalid trip identifier.');
      error.statusCode = 400;
      throw error;
    }

    if (!passengerName || !String(passengerName).trim()) {
      const error = new Error('Passenger name is required.');
      error.statusCode = 400;
      throw error;
    }

    if (!contactNumber || !String(contactNumber).trim()) {
      const error = new Error('Contact number is required.');
      error.statusCode = 400;
      throw error;
    }

    const cleanedContact = String(contactNumber).trim();
    if (!/^(?:\+?\d[\d\s()-]{6,18})$/.test(cleanedContact)) {
      const error = new Error('Contact number must be a valid phone number.');
      error.statusCode = 400;
      throw error;
    }

    const requestedSeats = Number(passengerCount);
    if (!Number.isInteger(requestedSeats) || requestedSeats <= 0 || requestedSeats > 20) {
      const error = new Error('Passenger count must be a positive integer between 1 and 20.');
      error.statusCode = 400;
      throw error;
    }

    const trip = await Trip.findById(tripId).populate({
      path: 'bus',
      populate: { path: 'operator' },
    });

    if (!trip) {
      const error = new Error('Selected trip does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (trip.status !== 'scheduled') {
      const error = new Error('Selected trip is not active.');
      error.statusCode = 400;
      throw error;
    }

    if (journeyDate && journeyDate !== trip.journeyDate) {
      const error = new Error('Journey date does not match the selected trip.');
      error.statusCode = 400;
      throw error;
    }

    if (!trip.availableSeats || trip.availableSeats < requestedSeats) {
      const error = new Error('Requested seats exceed the available seat count.');
      error.statusCode = 409;
      throw error;
    }

    let updatedTrip = null;
    let createdBooking = null;

    try {
      updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: 'scheduled', availableSeats: { $gte: requestedSeats } },
        { $inc: { availableSeats: -requestedSeats } },
        { new: true, runValidators: true }
      );

      if (!updatedTrip) {
        const error = new Error('Insufficient available seats for this booking.');
        error.statusCode = 409;
        throw error;
      }

      const bookingReference = generateReference();
      const totalPrice = trip.ticketPrice * requestedSeats;

      const booking = new Booking({
        bookingReference,
        passengerName: String(passengerName).trim(),
        contactNumber: cleanedContact,
        trip: tripId,
        journeyDate: trip.journeyDate,
        passengerCount: requestedSeats,
        pricePerPassenger: trip.ticketPrice,
        totalPrice,
        status: 'confirmed',
      });

      createdBooking = await booking.save();
    } catch (error) {
      if (updatedTrip) {
        await Trip.findByIdAndUpdate(tripId, { $inc: { availableSeats: requestedSeats } });
      }
      throw error;
    }

    const populatedBooking = await Booking.findById(createdBooking._id).populate({
      path: 'trip',
      populate: { path: 'bus', populate: { path: 'operator' } },
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: formatBookingResponse(populatedBooking),
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingByReference(req, res, next) {
  try {
    const { reference } = req.params;

    if (!reference) {
      const error = new Error('Booking reference is required.');
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.findOne({ bookingReference: reference }).populate({
      path: 'trip',
      populate: { path: 'bus', populate: { path: 'operator' } },
    });

    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: formatBookingResponse(booking),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBookingByReference,
};
