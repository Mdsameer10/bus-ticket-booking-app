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

const routePairs = [
  { from: 'Cochin', to: 'Calicut' },
  { from: 'Calicut', to: 'Cochin' },
];

const formatDate = (date) => date.toISOString().slice(0, 10);

function getNextDates(count) {
  const dates = [];
  const today = new Date();
  for (let offset = 0; offset < count; offset += 1) {
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
      { $set: { ...item, operator: operator._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdBuses.push(created);
  }

  return createdBuses;
}

async function seedTrips() {
  const dates = getNextDates(12);
  const createdTrips = [];

  for (const date of dates) {
    for (const [index, route] of routePairs.entries()) {
      const busList = await Bus.find({ active: true }).populate('operator');
      const sampleBus = busList[index % busList.length];

      if (!sampleBus) continue;

      const tripData = {
        bus: sampleBus._id,
        from: route.from,
        to: route.to,
        journeyDate: date,
        departureTime: index === 0 ? '06:30' : '18:15',
        arrivalTime: index === 0 ? '11:45' : '23:40',
        duration: index === 0 ? '5h 15m' : '5h 25m',
        ticketPrice: index === 0 ? 520 : 640,
        availableSeats: 25 + (date.length % 8),
        status: 'scheduled',
      };

      const saved = await Trip.findOneAndUpdate(
        {
          bus: sampleBus._id,
          from: route.from,
          to: route.to,
          journeyDate: date,
          departureTime: tripData.departureTime,
        },
        { $set: tripData },
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
    await seedTrips();
    console.log('Sample travel data inserted successfully.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
