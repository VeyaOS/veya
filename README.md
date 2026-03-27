# Veya

**Bitcoin-native payment infrastructure for modern merchants.**

Veya is a full-stack merchant payment platform built to accept RGB asset payments like  stablecoins and tokens issued natively on Bitcoin via the RGB protocol. It integrates directly with BTCPay Server and the UTEXO RGB plugin, developed by the [UTEXO Protocol](https://github.com/UTEXO-Protocol) team, to handle real settlement on Bitcoin. On top of that payment rail, Veya gives merchants a complete business operating system: invoice generation, customer tracking, staff access controls, real-time support, and a public facing payment portal — all wired to a live database with real settlement logic.


## Status

The platform is fully operational end-to-end. The frontend talks to the backend. The backend reads and writes to a live database. Real invoices are created, real customers are stored, real stats are fetched. The payment portal polls for confirmation every 5 seconds and transitions through three states automatically.

The one remaining integration is the BTCPay Server + UTEXO RGB plugin connection, which replaces the current placeholder payment address with a real RGB invoice address. Every other part of the stack — including the BTCPay webhook handler — is already built and waiting.


## Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Socket.IO Client
- Playfair Display + Plus Jakarta Sans

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL via Supabase
- JWT authentication + bcrypt
- Socket.IO
- BTCPay Server REST API


## Architecture

```
frontend/          React + Vite client — all 8 dashboard pages
backend/
├── index.js       Entire backend — all API endpoints
├── prisma/
│   └── schema.prisma
└── .env
```

The backend is a single Express file. Every endpoint is documented inline. Prisma manages all database access. Socket.IO runs on the same Express instance for real-time support messaging.


## What is Built

### Authentication
- `POST /api/auth/signup` — creates user + merchant + store in a single transaction
- `POST /api/auth/login` — returns signed JWT (7-day expiry)
- `GET /api/auth/me` — returns current user with merchant context
- JWT middleware protects all non-auth routes

### Dashboard
Eight fully wired pages: Overview, Invoices, Customers, Payment Portal, Staff, Support, Settings, Notifications. All pages fetch live data from the backend. No mock state anywhere in the frontend.

### Invoices
- `GET /api/invoices` — filterable by status, paginated
- `POST /api/invoices` — creates invoice, finds or creates customer, generates invoice number, calculates expiry, calls BTCPay API
- Invoice statuses: `PENDING`, `PAID`, `EXPIRED`

### Payment Portal
Public-facing page at `/pay/:invoiceNum`. Polls `GET /api/invoices/:invoiceNum/status` every 5 seconds. Transitions through three states: awaiting payment → confirming → confirmed. No page reload required.

### Customers
- `GET /api/customers` — returns all customers with invoice count and total paid amount
- Customers are created automatically on first invoice

### Merchant Stats
- `GET /api/merchant/stats` — returns total volume, invoices paid, pending count, customer count

### Webhooks
- `POST /api/invoices/webhook` — receives BTCPay payment confirmation, validates HMAC signature, marks invoice as `PAID`, emits Socket.IO event to connected clients

### Staff & Roles
Role-based access: `OWNER`, `MANAGER`, `CASHIER`. Each role restricts specific dashboard views and actions.

### Real-Time Support
Threaded merchant-to-admin support channels over WebSocket. Messages push instantly to both sides without polling.

### Notifications
Live bell alerts for invoice settlements and support replies. Delivered via Socket.IO.

### Security
- HMAC validation on all BTCPay webhooks — duplicate hooks are rejected
- Rate limiting: 500 requests per 15 minutes per IP, with webhook endpoints whitelisted
- All database queries scoped to authenticated merchant UUID — no IDOR surface
- Prisma connection pool released gracefully on process exit


## BTCPay Integration

The invoice creation endpoint calls BTCPay's REST API:

```
POST /api/v1/stores/{storeId}/invoices
Authorization: token {BTCPAY_API_KEY}
```

When the UTEXO RGB plugin is installed on the BTCPay instance, the same API call begins returning RGB payment addresses in the `paymentMethods` array. The extraction logic is already written:

```javascript
const rgbMethod = btcpayResponse.data.paymentMethods?.find(
  m => m.paymentMethod === 'RGB'
);
const paymentAddr = rgbMethod?.destination || btcpayResponse.data.checkoutLink;
```

No code changes are required when the plugin is activated.


## Local Setup

### Prerequisites
- Node.js v18+
- A PostgreSQL instance (Supabase recommended)
- BTCPay Server instance with API access

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment — `backend/.env`

```env
PORT=5000

# PostgreSQL — pooled connection for runtime queries
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?sslmode=require"

# PostgreSQL — direct connection for Prisma migrations
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/postgres?sslmode=require"

# Auth
JWT_SECRET="[minimum 32 character random secret — never commit this]"

# Deployment
FRONTEND_URL="https://your-domain.com"

# BTCPay Server
BTCPAY_URL="https://your-btcpay-instance.com"
BTCPAY_API_KEY="[generated in BTCPay under Account → API Keys]"
BTCPAY_STORE_ID="[found in BTCPay Store Settings]"
BTCPAY_WEBHOOK_SECRET="[set when configuring the webhook in BTCPay]"
```

### Environment — `frontend/.env`

```env
VITE_API_BASE_URL="https://your-domain.com/api"
VITE_SOCKET_URL="https://your-domain.com"
```

> Never commit `.env` files. Both directories include `.env` in `.gitignore`.


## Deployment

BTCPay Server and the UTEXO RGB plugin require a Linux host. The recommended setup is Ubuntu 22.04 with a minimum of 2GB RAM — DigitalOcean and Hetzner both work well. The Veya backend and frontend can run on the same server or separately.

The BTCPay instance must be network-accessible from the backend server. Set `BTCPAY_URL` in the backend `.env` to the BTCPay instance address. The webhook endpoint (`POST /api/invoices/webhook`) must be reachable from BTCPay — configure this URL in the BTCPay store webhook settings pointing to your deployed backend.


## RGB + BTCPay + UTEXO

Veya is built specifically for RGB asset payments — USDT and other tokens issued natively on Bitcoin. The [UTEXO RGB plugin](https://github.com/UTEXO-Protocol/rgb-btcpay-plugin) for BTCPay Server provides the payment method layer. Once installed and configured, BTCPay handles RGB invoice generation, UTXO management, and payment confirmation. Veya handles merchant onboarding, invoice lifecycle, customer tracking, and the payment portal the end customer sees.

The UTEXO plugin is in active beta. The RGB native library requires a Linux host — it does not run on Windows or macOS x64.

