require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const Operator = require('../src/models/Operator');
const Bus = require('../src/models/Bus');
const Trip = require('../src/models/Trip');

const operatorData = [
  { name: 'Asian Travels', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43210', active: true },
  { name: 'A1 Travels', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43211', active: true },
  { name: 'Kerala Lines', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43212', active: true },
  { name: 'Kallada Travels', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43213', active: true },
  { name: 'Kerala RTC', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43214', active: true },
  { name: 'Greenline Travels', description: 'Sample operator data for demonstration only.', contactInfo: 'Phone: +91 98765 43215', active: true },
];

const busData = [
  { busNumber: 'KL-01-AB-1001', name: 'Volvo 9600', operatorName: 'Asian Travels', capacity: 40, type: 'AC', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-05-CD-2002', name: 'Super Luxury', operatorName: 'A1 Travels', capacity: 36, type: 'Sleeper', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-07-EF-3003', name: 'Executive', operatorName: 'Kerala Lines', capacity: 32, type: 'AC', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-09-GH-4004', name: 'Comfort Plus', operatorName: 'Kallada Travels', capacity: 38, type: 'Seater', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-11-IJ-5005', name: 'Royal Coach', operatorName: 'Kerala RTC', capacity: 34, type: 'Sleeper', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-12-KL-6006', name: 'Green Ride', operatorName: 'Greenline Travels', capacity: 42, type: 'AC', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-13-MN-7007', name: 'Premium Express', operatorName: 'Asian Travels', capacity: 28, type: 'AC', details: 'Sample bus data for assessment only.' },
  { busNumber: 'KL-15-OP-8008', name: 'Night Service', operatorName: 'Greenline Travels', capacity: 30, type: 'Sleeper', details: 'Sample bus data for assessment only.' },
];

const tripSchedules = [
  {
    busNumber: 'KL-01-AB-1001',
    from: 'Cochin',
    to: 'Calicut',
    departureTime: '06:30',
    arrivalTime: '11:45',
    duration: '5h 15m',
    ticketPrice: 520,
  },
  {
    busNumber: 'KL-05-CD-2002',
    from: 'Cochin',
    to: 'Calicut',
    departureTime: '08:15',
    arrivalTime: '13:40',
    duration: '5h 25m',
    ticketPrice: 640,
  },
  {
    busNumber: 'KL-07-EF-3003',
    from: 'Cochin',
    to: 'Calicut',
    departureTime: '10:00',
    arrivalTime: '15:20',
    duration: '5h 20m',
    ticketPrice: 580,
  },
  {
    busNumber: 'KL-09-GH-4004',
    from: 'Calicut',
    to: 'Cochin',
    departureTime: '09:00',
    arrivalTime: '14:20',
    duration: '5h 20m',
    ticketPrice: 590,
  },
  {
    busNumber: 'KL-11-IJ-5005',
    from: 'Calicut',
    to: 'Cochin',
    departureTime: '14:30',
    arrivalTime: '19:45',
    duration: '5h 15m',
    ticketPrice: 560,
  },
  {
    busNumber: 'KL-12-KL-6006',
    from: 'Calicut',
    to: 'Cochin',
    departureTime: '18:15',
    arrivalTime: '23:40',
    duration: '5h 25m',
    ticketPrice: 680,
  },
];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getRemainingDatesThisMonth() {
  const dates = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const daysRemaining = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate() + 1;

  for (let offset = 0; offset < daysRemaining; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dates.push(formatDate(date));
  }
  return dates;
}

async function seedOperators() {
  const createdOperators = [];

  for (const operator of operatorData) {
    const created = await Operator.findOneAndUpdate(
      { name: operator.name },
      { $set: { ...operator } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdOperators.push(created);
  }

  return createdOperators;
}

async function seedBuses() {
  const createdBuses = [];

  for (const item of busData) {
    const operator = await Operator.findOne({ name: item.operatorName });
    if (!operator) {
      continue;
    }

    const created = await Bus.findOneAndUpdate(
      { busNumber: item.busNumber },
      {
        $set: {
          name: item.name,
          operator: operator._id,
          capacity: item.capacity,
          type: item.type,
          details: item.details,
          active: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdBuses.push(created);
  }

  return createdBuses;
}

async function seedTrips() {
  const dates = getRemainingDatesThisMonth();
  const createdTrips = [];
  const buses = await Bus.find({
    busNumber: { $in: tripSchedules.map((schedule) => schedule.busNumber) },
    active: true,
  });
  const busesByNumber = new Map(buses.map((bus) => [bus.busNumber, bus]));

  for (const [dateIndex, date] of dates.entries()) {
    for (const schedule of tripSchedules) {
      const bus = busesByNumber.get(schedule.busNumber);
      if (!bus) {
        throw new Error(`Sample bus ${schedule.busNumber} was not found after seeding.`);
      }
      const tripFields = {
        bus: bus._id,
        from: schedule.from,
        to: schedule.to,
        journeyDate: date,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        duration: schedule.duration,
        ticketPrice: schedule.ticketPrice,
        status: 'scheduled',
      };
      const saved = await Trip.findOneAndUpdate(
        {
          bus: bus._id,
          from: schedule.from,
          to: schedule.to,
          journeyDate: date,
          departureTime: schedule.departureTime,
        },
        {
          $set: tripFields,
          $setOnInsert: { availableSeats: 25 + (dateIndex % 8) },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      createdTrips.push(saved);
    }
  }

  return createdTrips;
}

async function seed() {
  try {
    await connectDB();
    await seedOperators();
    await seedBuses();
    const trips = await seedTrips();
    console.log(`Sample travel data inserted or updated: ${operatorData.length} operators, ${busData.length} buses, ${trips.length} trips.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
