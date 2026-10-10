# Intercity Bus Booking Application

 Intercity bus booking application built with Angular on the frontend and Express + MongoDB on the backend. It supports the Cochin and Calicut routes, includes sample travel operators, lets users search trips, book tickets, and retrieve existing bookings by reference.

## Features

- Responsive Angular search form for Cochin and Calicut routes
- Express backend with validation, error handling, and centralized JSON responses
- MongoDB Atlas-ready Mongoose models for operators, buses, trips, and bookings
- Search results filtered by exact route and journey date
- Atomic seat reservation logic to prevent overbooking
- Booking creation and retrieval by unique reference
- Data seeding script for sample operators, buses, and trips
- Automated backend tests for key booking and search scenarios
- Deployment-ready instructions for AWS EC2 with Nginx and PM2

## Technologies

- Frontend: Angular, TypeScript, RxJS
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas / MongoDB compatible server
- Testing: Jest, Supertest, mongodb-memory-server
- Deployment: Nginx, PM2, AWS EC2

## Project structure

```text
.
├── backend/
│   ├── scripts/
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── .env.example
├── .gitignore
├── README.md
└── .git
```

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB Atlas account or a MongoDB-compatible local database
- Angular CLI is installed with `npx @angular/cli` for project setup

## Local installation

1. Clone or open this project in the workspace.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Copy the environment example file and update the values (PowerShell):

```bash
Set-Location ..\backend
Copy-Item .env.example .env
```

5. Set `MONGODB_URI` in `backend/.env` to a reachable MongoDB Atlas cluster URI, or to a local MongoDB instance that is installed and running.

## Environment variables

Add a `.env` file inside `backend` with values such as:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/intercity-bus-booking
CLIENT_ORIGIN=http://localhost:4200
```

Do not leave the `<...>` placeholders in the URI. The backend intentionally does not substitute an in-memory or fake database when `MONGODB_URI` is missing. A local URI such as `mongodb://127.0.0.1:27017/intercity-bus-booking` works only when MongoDB Server is installed and running on your computer. The frontend uses `http://localhost:5000/api` by default. If you run the backend on another port, update the Angular environment configuration in `frontend/src/environments/environment.ts`.

If Node.js reports `querySrv ECONNREFUSED` for the Atlas hostname even though Windows DNS tools resolve it, optionally add `DNS_SERVERS=1.1.1.1,1.0.0.1` to `backend/.env` and restart the backend. This directs Node's MongoDB SRV lookup to those DNS servers. Omit this setting when your normal system DNS works.

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster.
2. Create a database user and generate a connection string.
3. Copy the Atlas connection string into `backend/.env` as `MONGODB_URI`; replace its username, password, and cluster host with the values from Atlas.
4. In Atlas, allow your current IP address under **Network Access** and ensure the database user has database access.
5. Configure `CLIENT_ORIGIN` for your front-end origin.
6. Restart `npm run dev`. You should see `MongoDB connected successfully.` followed by `API server running on port 5000`.

## Database seeding

Run the seed script from the backend directory:

```bash
cd backend
npm run seed
```

This inserts sample operators, buses, and trips for both directions and multiple journey dates. The script is safe to run repeatedly because it uses upsert logic and avoids duplicate data.

## API endpoints

### Health and operators

- `GET /api/health`
- `GET /api/operators`
- `GET /api/buses`

### Search and trip lookup

- `GET /api/buses/search?from=Cochin&to=Calicut&date=YYYY-MM-DD`
- `GET /api/buses/:id`

### Booking endpoints

- `POST /api/bookings`
- `GET /api/bookings/:reference`

### Example requests

```bash
curl "http://localhost:5000/api/buses/search?from=Cochin&to=Calicut&date=2026-10-15"
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "<trip-id>",
    "passengerName": "Aisha",
    "contactNumber": "+91 98765 43210",
    "passengerCount": 2
  }'
```

## Running the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm start
```

The frontend is usually available at `http://localhost:4200` and proxies to the backend at `http://localhost:5000`.

## Running tests

From the backend folder:

```bash
cd backend
npm test
```

The automated tests use an in-memory MongoDB instance and verify the main search and booking flows.

## Common errors and troubleshooting

- If `MongoDB connection failed` is shown, verify the `MONGODB_URI` value and database network access.
- If the Angular app shows no data, ensure the backend is running and the frontend is configured with the correct API URL.
- If the date search fails, make sure the route uses the exact values `Cochin` or `Calicut` and a valid `YYYY-MM-DD` date.
- If bookings are rejected, check that the requested seats are less than or equal to the trip’s available seats.

## Production build and AWS EC2 deployment

Build the Angular frontend:

```bash
cd frontend
npm run build
```

Use Nginx as the reverse proxy and PM2 to keep the Express backend running on EC2.

Suggested deployment flow:

1. Copy the built frontend files to the Nginx document root.
2. Configure Nginx to serve the Angular app and proxy `/api` requests to the backend port.
3. Start the backend with PM2 using a production `.env` file.
4. Set `NODE_ENV=production` and `CLIENT_ORIGIN` to the public frontend URL.
5. Keep credentials outside the Git repository and only in the server environment.

This project is prepared for local implementation and deployment instructions, but no live AWS deployment is performed here without explicit approval and credentials.

## Known limitations

- This is an assessment-style sample app and does not process real payments.
- Bookings are simulated, and no payment gateway is configured.
- Real MongoDB Atlas credentials are not committed to the repository.
- The frontend and backend are designed for local testing and deployment preparation.

## How a request flows through the app

When a user searches for a route:

1. Angular sends a GET request from the search form to `GET /api/buses/search`.
2. Express validates the origin, destination, and date.
3. Mongoose queries the Trip collection for matching `from`, `to`, and `journeyDate` values.
4. The backend populates operator and bus details and returns JSON to Angular.
5. Angular displays the bus cards and allows the user to click Book Now.

When a booking is saved:

1. Angular submits the booking form with the selected trip ID and passenger details.
2. Express validates the trip and seat count.
3. The backend performs an atomic MongoDB update to reserve seats only if enough capacity remains.
4. A unique booking reference is generated and a record is created in the Bookings collection.
5. The API responds with the confirmation details, and Angular shows the booking receipt.

## Final note

This project implements the full required local workflow for a functional intercity bus booking app while keeping the backend and front-end responsibilities separated and ready for deployment preparation.
