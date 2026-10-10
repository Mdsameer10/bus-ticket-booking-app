const request = require('supertest');
const app = require('../src/app');
const { connectTestDB, disconnectTestDB } = require('./testDb');
const Operator = require('../src/models/Operator');
const Bus = require('../src/models/Bus');
const Trip = require('../src/models/Trip');
const Booking = require('../src/models/Booking');

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const journeyDate = tomorrow.toISOString().slice(0, 10);

beforeAll(async () => {
  await connectTestDB();

  const operator = await Operator.create({
    name: 'Asian Travels',
    description: 'Sample assessment operator.',
    contactInfo: '+91 90000 10000',
    active: true,
  });

  const bus = await Bus.create({
    busNumber: 'KL-99-AB-4040',
    name: 'Volvo 9600',
    operator: operator._id,
    capacity: 30,
    type: 'AC',
    details: 'Sample bus for test coverage.',
    active: true,
  });

  await Trip.create({
    bus: bus._id,
    from: 'Cochin',
    to: 'Calicut',
    journeyDate,
    departureTime: '06:30',
    arrivalTime: '11:45',
    duration: '5h 15m',
    ticketPrice: 520,
    availableSeats: 5,
    status: 'scheduled',
  });

  await Trip.create({
    bus: bus._id,
    from: 'Calicut',
    to: 'Cochin',
    journeyDate,
    departureTime: '18:15',
    arrivalTime: '23:40',
    duration: '5h 25m',
    ticketPrice: 610,
    availableSeats: 3,
    status: 'scheduled',
  });
});

afterAll(async () => {
  await Booking.deleteMany({});
  await Trip.deleteMany({});
  await Bus.deleteMany({});
  await Operator.deleteMany({});
  await disconnectTestDB();
});

describe('Intercity bus booking API', () => {
  it('returns API health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('ok');
  });

  it('returns operators list', async () => {
    const response = await request(app).get('/api/operators');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('searches buses for the exact route and date', async () => {
    const response = await request(app).get('/api/buses/search').query({
      from: 'Cochin',
      to: 'Calicut',
      date: journeyDate,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].from).toBe('Cochin');
    expect(response.body.data[0].to).toBe('Calicut');
  });

  it('rejects same-city searches', async () => {
    const response = await request(app).get('/api/buses/search').query({
      from: 'Cochin',
      to: 'Cochin',
      date: journeyDate,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns empty state when no buses are available', async () => {
    const response = await request(app).get('/api/buses/search').query({
      from: 'Cochin',
      to: 'Calicut',
      date: '2099-12-31',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  it('creates a valid booking and confirms the total price', async () => {
    const trip = await Trip.findOne({ from: 'Cochin', to: 'Calicut', journeyDate });

    const response = await request(app)
      .post('/api/bookings')
      .send({
        tripId: trip._id.toString(),
        passengerName: 'Aisha Khan',
        contactNumber: '+91 98765 43210',
        passengerCount: 2,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalPrice).toBe(1040);
    expect(response.body.data.bookingReference).toMatch(/^BTR-/);
  });

  it('rejects a booking with more seats than are available', async () => {
    const trip = await Trip.findOne({ from: 'Cochin', to: 'Calicut', journeyDate });

    const response = await request(app)
      .post('/api/bookings')
      .send({
        tripId: trip._id.toString(),
        passengerName: 'Kiran Nair',
        contactNumber: '9876543210',
        passengerCount: 10,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('retrieves a booking by reference', async () => {
    const trip = await Trip.findOne({ from: 'Cochin', to: 'Calicut', journeyDate });
    const bookingResponse = await request(app)
      .post('/api/bookings')
      .send({
        tripId: trip._id.toString(),
        passengerName: 'Thomas Joseph',
        contactNumber: '9999988888',
        passengerCount: 1,
      });

    const ref = bookingResponse.body.data.bookingReference;
    const lookupResponse = await request(app).get(`/api/bookings/${ref}`);

    expect(lookupResponse.status).toBe(200);
    expect(lookupResponse.body.success).toBe(true);
    expect(lookupResponse.body.data.bookingReference).toBe(ref);
  });

  it('returns not found for an unknown reference', async () => {
    const response = await request(app).get('/api/bookings/UNKNOWN-REF');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
