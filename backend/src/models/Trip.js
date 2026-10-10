const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    from: {
      type: String,
      required: true,
      enum: ['Cochin', 'Calicut'],
    },
    to: {
      type: String,
      required: true,
      enum: ['Cochin', 'Calicut'],
    },
    journeyDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    departureTime: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    arrivalTime: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ from: 1, to: 1, journeyDate: 1, status: 1 });

module.exports = mongoose.model('Trip', tripSchema);
