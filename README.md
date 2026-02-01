# Ledger API - Double-Entry Accounting System

A TypeScript/Node.js implementation of a double-entry accounting ledger system with a clean hexagonal architecture.

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles with clear separation of concerns:

```
src/
├── domain/                    # Core business logic (no dependencies)
│   ├── models/               # Domain entities
│   │   ├── Account.ts        # Account aggregate root
│   │   ├── Entry.ts          # Entry value object
│   │   ├── Transaction.ts    # Transaction aggregate root
│   │   ├── AccountCommand.ts # Command for account creation
│   │   └── TransactionCommand.ts # Command for transaction creation
│   ├── repositories/         # Repository interfaces (ports)
│   │   ├── AccountRepository.ts
│   │   └── TransactionRepository.ts
│   └── services/             # Domain services
│       ├── AccountService.ts # Account domain logic
│       └── LedgerService.ts  # Transaction processing logic
│
├── application/              # Application layer (use cases)
│   ├── use-cases/           # Application services
│   │   ├── CreateAccountUseCase.ts
│   │   ├── GetAccountUseCase.ts
│   │   └── CreateTransactionUseCase.ts
│   ├── request/             # Input DTOs
│   │   ├── Direction.ts
│   │   ├── CreateAccountRequest.ts
│   │   └── CreateTransactionRequest.ts
│   └── response/            # Output DTOs
│       ├── CreateAccountResponse.ts
│       └── CreateTransactionResponse.ts
│
└── infrastructure/           # External adapters
    ├── repositories/        # Repository implementations
    │   ├── InMemoryAccountRepository.ts
    │   └── InMemoryTransactionRepository.ts
    └── http/                # HTTP adapter
        ├── controllers/     # Request handlers
        │   ├── AccountController.ts
        │   └── TransactionController.ts
        └── routes/          # Route definitions
            ├── AccountRoutes.ts
            └── TransactionRoutes.ts
```

### Key Design Decisions

1. **Hexagonal Architecture**: Domain logic is isolated from infrastructure concerns
2. **Command Pattern**: Input validation happens in command objects before domain logic
3. **Immutability**: Domain models use getters and return copies to prevent external mutations
4. **Atomic Updates**: Transaction entries are applied to accounts atomically using repository locks
5. **Request/Response DTOs**: Clear separation between HTTP contracts and domain models

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

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
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
- `id` (optional): Account ID (auto-generated if not provided)
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
           "account_id": "fa967ec9-5be2-4c26-a874-7eeeabfc6da8",
           "amount": 100
         },
         {
           "direction": "credit",
           "account_id": "dbf17d00-8701-4c4e-9fc5-6ae33c324309",
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
- `id` (optional): Transaction ID (auto-generated if not provided)
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

## 🧪 Testing Strategy

The project includes comprehensive tests at multiple levels:

1. **Unit Tests**: Test domain models in isolation
    - Account balance updates
    - Transaction validation
    - Entry creation

2. **Integration Tests**: Test repository implementations
    - Data persistence
    - Concurrent updates
    - Lock mechanisms

3. **E2E Tests**: Test complete workflows
    - Account creation and retrieval
    - Transaction processing
    - Balance updates
    - Error handling

## 🔒 Concurrency Control

The `InMemoryAccountRepository` implements a locking mechanism to prevent race conditions:

```typescript
// Atomic update of multiple accounts
await accountRepository.updateMultiple([
  { accountId: 'account-1', updateFn: (acc) => acc.applyEntry('debit', 100) },
  { accountId: 'account-2', updateFn: (acc) => acc.applyEntry('credit', 100) }
]);
```

- Locks are acquired in sorted order to prevent deadlocks
- All updates succeed or all fail (transaction semantics)
- Snapshots ensure consistency on errors

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

## 🛠️ Technologies

- **TypeScript**: Type-safe application code
- **Express**: HTTP server framework
- **UUID**: Unique identifier generation
- **Jest**: Testing framework
- **Supertest**: HTTP integration testing

## 📝 Design Patterns Used

1. **Hexagonal Architecture**: Clear separation of domain, application, and infrastructure
2. **Command Pattern**: Input validation via command objects
3. **Repository Pattern**: Abstract data access
4. **Use Case Pattern**: Application-specific business rules
5. **Factory Pattern**: Domain object creation
6. **Value Object**: Immutable Entry objects

## 🔮 Future Enhancements

- [ ] Add transaction reversal functionality
- [ ] Implement audit trail
- [ ] Add pagination for account/transaction listings
- [ ] Support for different currencies
- [ ] Transaction filtering and search
- [ ] Database persistence (PostgreSQL)
- [ ] GraphQL API
- [ ] Event sourcing for complete audit history

## 📄 License

MIT

## 👤 Author

João Fonseca

---

**Note**: This is a take-home exercise demonstrating clean architecture, domain-driven design, and professional TypeScript development practices.