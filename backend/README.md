# DebtLite Backend API

Backend API server for DebtLite - Monthly Payment Tracker

## Tech Stack

- **Node.js** + **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string.

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with test data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   │   ├── database.ts # Database connection
│   │   └── env.ts      # Environment variables
│   ├── constants/      # Application constants
│   │   └── index.ts   # HTTP status codes, error messages
│   ├── controllers/    # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── payments.controller.ts
│   │   └── plans.controller.ts
│   ├── errors/         # Custom error classes
│   │   ├── app.error.ts
│   │   └── index.ts
│   ├── middleware/     # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/         # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── payments.routes.ts
│   │   └── plans.routes.ts
│   ├── schemas/        # Zod validation schemas
│   │   ├── auth.schemas.ts
│   │   ├── plans.schemas.ts
│   │   ├── payments.schemas.ts
│   │   └── index.ts
│   ├── services/       # Business logic
│   │   ├── auth.service.ts
│   │   ├── payments.service.ts
│   │   └── plans.service.ts
│   ├── types/          # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── plans.types.ts
│   │   ├── payments.types.ts
│   │   ├── common.types.ts
│   │   ├── express.d.ts  # Express type extensions
│   │   └── index.ts
│   ├── utils/          # Utility functions
│   │   ├── hash.util.ts    # Password hashing
│   │   ├── token.util.ts   # JWT token utilities
│   │   └── index.ts
│   └── server.ts       # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── tests/              # Tests
    ├── integration/    # Integration tests
    └── unit/           # Unit tests
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Plans (Coming soon)
- `GET /api/plans` - List all plans
- `POST /api/plans` - Create plan
- `GET /api/plans/:id` - Get plan by ID
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Payments (Coming soon)
- `GET /api/plans/:id/payments` - Get payment status
- `PUT /api/plans/:id/payments` - Update payment status
- `GET /api/plans/:id/totals` - Get payment totals
- `PUT /api/plans/:id/totals` - Update payment totals

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origin

## Development

The server uses `nodemon` for hot reloading during development. Changes to TypeScript files will automatically restart the server.

## Production

1. Build the project: `npm run build`
2. Set environment variables
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm start`

