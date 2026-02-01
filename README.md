# Ledger API - Double-Entry Accounting System

A TypeScript/Node.js implementation of a double-entry accounting ledger system with a clean hexagonal architecture.

## 📋 Requirements

- Node.js >= 18.x
- npm >= 9.x

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ledger-api

# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

The server will start on `http://localhost:5000`

### Running Tests

```bash
# Run all tests
npm test
```

## 📚 API Documentation

### POST /accounts

Create a new account.

**Request:**
```bash
curl --request POST \
     --url http://localhost:5000/accounts \
     --header 'Content-Type: application/json' \
     --data '{
       "name": "Cash",
       "direction": "debit"
     }'
```

**Response:**
```json
{
  "id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
  "name": "Cash",
  "balance": 0,
  "direction": "debit"
}
```

**Fields:**
- `name` (optional): Account name/label
- `direction` (required): Either "debit" or "credit"
- `balance` (read-only): Current account balance in USD

### GET /accounts/:id

Retrieve an account by ID.

**Request:**
```bash
curl --request GET \
     --url http://localhost:5000/accounts/71cde2aa-b9bc-496a-a6f1-34964d05e6fd
```

**Response:**
```json
{
  "id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
  "name": "Cash",
  "balance": 1000,
  "direction": "debit"
}
```

### POST /transactions

Create a new transaction with multiple entries.

**Request:**
```bash
curl --request POST \
     --url http://localhost:5000/transactions \
     --header 'Content-Type: application/json' \
     --data '{
       "name": "Customer Payment",
       "entries": [
         {
           "direction": "debit",
           "account_id": "eb45b12f-13f1-4b56-9208-59f571d14fcd",
           "amount": 100
         },
         {
           "direction": "credit",
           "account_id": "0b5acce8-3d40-4874-a8b7-e48ad6638de6",
           "amount": 100
         }
       ]
     }'
```

**Response:**
```json
{
  "id": "3256dc3c-7b18-4a21-95c6-146747cf2971",
  "name": "Customer Payment",
  "entries": [
    {
      "id": "9f694f8c-9c4c-44cf-9ca9-0cb1a318f0a7",
      "direction": "debit",
      "amount": 100,
      "account_id": "fa967ec9-5be2-4c26-a874-7eeeabfc6da8"
    },
    {
      "id": "a5c1b7f0-e52e-4ab6-8f31-c380c2223efa",
      "direction": "credit",
      "amount": 100,
      "account_id": "dbf17d00-8701-4c4e-9fc5-6ae33c324309"
    }
  ]
}
```

**Fields:**
- `name` (optional): Transaction name/label
- `entries` (required): Array of ledger entries
    - `direction` (required): Either "debit" or "credit"
    - `amount` (required): Amount in USD (must be > 0)
    - `account_id` (required): ID of the account to apply this entry to

**Validation Rules:**
- Total debits must equal total credits
- All referenced accounts must exist
- Amount must be greater than 0

## 💡 Core Concepts

### Double-Entry Accounting

Every transaction has entries that balance to zero:
- **Debits** = withdrawals/increases in asset accounts
- **Credits** = deposits/increases in liability accounts

Example: Receiving $100 cash from a customer
```
Cash (debit account):     +$100 (debit entry)
Revenue (credit account): +$100 (credit entry)
```

### Account Directions

Accounts have a natural direction:
- **Debit accounts**: Assets, Expenses (increase with debits)
- **Credit accounts**: Liabilities, Revenue (increase with credits)

### Entry Application Rules

When applying an entry to an account:
- **Same direction**: Balance increases (add)
- **Opposite direction**: Balance decreases (subtract)

| Account Direction | Entry Direction | Effect on Balance |
|------------------|-----------------|-------------------|
| debit            | debit           | +amount           |
| debit            | credit          | -amount           |
| credit           | credit          | +amount           |
| credit           | debit           | -amount           |

## 🎯 Example Usage

### Complete Business Scenario

```bash
# 1. Create accounts
curl -X POST http://localhost:5000/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name": "Cash", "direction": "debit"}'
# Response: {"id": "cash-id", ...}

curl -X POST http://localhost:5000/accounts \
  -H 'Content-Type: application/json' \
  -d '{"name": "Revenue", "direction": "credit"}'
# Response: {"id": "revenue-id", ...}

# 2. Record a sale ($500 cash received)
curl -X POST http://localhost:5000/transactions \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Customer Sale",
    "entries": [
      {"direction": "debit", "account_id": "cash-id", "amount": 500},
      {"direction": "credit", "account_id": "revenue-id", "amount": 500}
    ]
  }'

# 3. Check balances
curl http://localhost:5000/accounts/cash-id
# Response: {"balance": 500, ...}

curl http://localhost:5000/accounts/revenue-id
# Response: {"balance": 500, ...}
```

### Considerations

- Decided not to allow client to specify the account id to achieve id consistency;
- Allowing the client to specific the name field already gives them personalization feature;
- Tests coverage is not at production level. Future enhancements would include unit and integration tests.
- Decided to use generic exceptions with dedicated messages instead of custom exceptions for better error handling. Future enhancements would include dedicated custom exceptions.
- Decided to follow hexagonal architecture give that this represents a financial application that requires clear layer isolation to achieve a better long-term maintenance.
