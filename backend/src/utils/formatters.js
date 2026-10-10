function isValidDateOnly(dateString) {
  if (typeof dateString !== 'string') return false;

  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  if (!match) return false;

  const date = new Date(`${dateString}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function todayDateString() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

function formatTripResponse(trip) {
  return {
    id: trip._id,
    bus: trip.bus
      ? {
          id: trip.bus._id,
          name: trip.bus.name,
          busNumber: trip.bus.busNumber,
          type: trip.bus.type,
          capacity: trip.bus.capacity,
          operator: trip.bus.operator
            ? {
                id: trip.bus.operator._id,
                name: trip.bus.operator.name,
                description: trip.bus.operator.description,
              }
            : null,
        }
      : null,
    from: trip.from,
    to: trip.to,
    journeyDate: trip.journeyDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    duration: trip.duration,
    ticketPrice: trip.ticketPrice,
    availableSeats: trip.availableSeats,
    status: trip.status,
  };
}

function formatBookingResponse(booking) {
  return {
    id: booking._id,
    bookingReference: booking.bookingReference,
    passengerName: booking.passengerName,
    contactNumber: booking.contactNumber,
    journeyDate: booking.journeyDate,
    passengerCount: booking.passengerCount,
    pricePerPassenger: booking.pricePerPassenger,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
    trip: booking.trip
      ? {
          id: booking.trip._id,
          from: booking.trip.from,
          to: booking.trip.to,
          departureTime: booking.trip.departureTime,
          arrivalTime: booking.trip.arrivalTime,
          duration: booking.trip.duration,
          ticketPrice: booking.trip.ticketPrice,
          bus: booking.trip.bus
            ? {
                id: booking.trip.bus._id,
                name: booking.trip.bus.name,
                busNumber: booking.trip.bus.busNumber,
                type: booking.trip.bus.type,
                operator: booking.trip.bus.operator
                  ? {
                      id: booking.trip.bus.operator._id,
                      name: booking.trip.bus.operator.name,
                    }
                  : null,
              }
            : null,
        }
      : null,
  };
}

module.exports = {
  isValidDateOnly,
  todayDateString,
  formatTripResponse,
  formatBookingResponse,
};
