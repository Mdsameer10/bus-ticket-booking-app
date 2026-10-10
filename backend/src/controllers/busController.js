const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const Operator = require('../models/Operator');
const Trip = require('../models/Trip');
const { isValidDateOnly, todayDateString, formatTripResponse } = require('../utils/formatters');

const CITY_OPTIONS = ['Cochin', 'Calicut'];

async function getHealth(req, res) {
  const databaseStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Bus booking API is running.',
    status: 'ok',
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
}

async function getOperators(req, res, next) {
  try {
    const operators = await Operator.find({ active: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: operators.length,
      data: operators.map((operator) => ({
        id: operator._id,
        name: operator.name,
        description: operator.description,
        contactInfo: operator.contactInfo,
        active: operator.active,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function getBuses(req, res, next) {
  try {
    const trips = await Trip.find({ status: 'scheduled' })
      .populate({
        path: 'bus',
        populate: { path: 'operator' },
      })
      .sort({ journeyDate: 1, departureTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips.map((trip) => formatTripResponse(trip)),
    });
  } catch (error) {
    next(error);
  }
}

async function searchBuses(req, res, next) {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      const error = new Error('From city, to city, and date are required.');
      error.statusCode = 400;
      throw error;
    }

    if (!CITY_OPTIONS.includes(from) || !CITY_OPTIONS.includes(to)) {
      const error = new Error('Departure and destination cities must be Cochin or Calicut.');
      error.statusCode = 400;
      throw error;
    }

    if (from === to) {
      const error = new Error('Departure and destination cities cannot be the same.');
      error.statusCode = 400;
      throw error;
    }

    if (!isValidDateOnly(date)) {
      const error = new Error('Journey date must be a valid date in YYYY-MM-DD format.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date(`${todayDateString()}T00:00:00`);
    const selectedDate = new Date(`${date}T00:00:00`);

    if (selectedDate < today) {
      const error = new Error('Past journey dates are not allowed.');
      error.statusCode = 400;
      throw error;
    }

    const trips = await Trip.find({
      from,
      to,
      journeyDate: date,
      status: 'scheduled',
    })
      .populate({
        path: 'bus',
        populate: { path: 'operator' },
      })
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips.map((trip) => formatTripResponse(trip)),
    });
  } catch (error) {
    next(error);
  }
}

async function getBusById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      const error = new Error('Invalid bus or trip identifier.');
      error.statusCode = 400;
      throw error;
    }

    const trip = await Trip.findById(id)
      .populate({
        path: 'bus',
        populate: { path: 'operator' },
      })
      .exec();

    if (!trip) {
      const error = new Error('Trip not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: formatTripResponse(trip),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
  getOperators,
  getBuses,
  searchBuses,
  getBusById,
};
