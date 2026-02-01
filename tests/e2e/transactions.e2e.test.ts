import request from 'supertest';
import express from 'express';
import { InMemoryAccountRepository } from '../../src/infrastructure/repositories';
import { InMemoryTransactionRepository } from '../../src/infrastructure/repositories';
import { AccountService } from '../../src/domain/services';
import { LedgerService } from '../../src/domain/services';
import CreateAccountUseCase from '../../src/application/use-cases/CreateAccountUseCase';
import GetAccountUseCase from '../../src/application/use-cases/GetAccountUseCase';
import CreateTransactionUseCase from '../../src/application/use-cases/CreateTransactionUseCase';
import { AccountController } from '../../src/infrastructure/http/controllers';
import { TransactionController } from '../../src/infrastructure/http/controllers';
import { Router } from 'express';

describe('Ledger API E2E Tests', () => {
    let app: express.Application;
    let accountRepository: InMemoryAccountRepository;
    let transactionRepository: InMemoryTransactionRepository;

    beforeEach(() => {
        accountRepository = new InMemoryAccountRepository();
        transactionRepository = new InMemoryTransactionRepository();

        const accountService = new AccountService(accountRepository);
        const ledgerService = new LedgerService(transactionRepository, accountRepository);

        const createAccountUseCase = new CreateAccountUseCase(accountService);
        const getAccountUseCase = new GetAccountUseCase(accountRepository);
        const createTransactionUseCase = new CreateTransactionUseCase(ledgerService);

        const accountController = new AccountController(createAccountUseCase, getAccountUseCase);
        const transactionController = new TransactionController(createTransactionUseCase);

        app = express();
        app.use(express.json());

        const accountRouter = Router();
        accountRouter.post('/', (req, res) => accountController.create(req, res));
        accountRouter.get('/:id', (req, res) => accountController.getById(req, res));

        const transactionRouter = Router();
        transactionRouter.post('/', (req, res) => transactionController.create(req, res));

        app.use('/accounts', accountRouter);
        app.use('/transactions', transactionRouter);
    });

    describe('Account Creation and Retrieval', () => {
        it('should create a debit account', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({name: 'Cash', direction: 'debit'})
                .expect(201);

            expect(response.body).toMatchObject({name: 'Cash', direction: 'debit', balance: 0});
            expect(response.body.id).toBeDefined();
        });

        it('should create a credit account', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({name: 'Revenue', direction: 'credit'})
                .expect(201);

            expect(response.body).toMatchObject({name: 'Revenue', direction: 'credit', balance: 0});
        });

        it('should retrieve an account by ID', async () => {
            const createResponse = await request(app)
                .post('/accounts')
                .send({name: 'Checking', direction: 'debit'})
                .expect(201);

            const accountId = createResponse.body.id;
            const getResponse = await request(app)
                .get(`/accounts/${accountId}`)
                .expect(200);

            expect(getResponse.body).toEqual({
                id: accountId,
                name: 'Checking',
                direction: 'debit',
                balance: 0
            });
        });

        it('should return 404 for non-existent account', async () => {
            const response = await request(app)
                .get('/accounts/non-existent-id')
                .expect(404);

            expect(response.body.error).toContain('not found');
        });

        it('should reject invalid account direction', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({name: 'Invalid', direction: 'invalid'})
                .expect(400);

            expect(response.body.error).toBeDefined();
        });
    });

    describe('Transaction Creation and Balance Updates', () => {
        let cashAccountId: string;
        let revenueAccountId: string;

        beforeEach(async () => {
            const cashResponse = await request(app)
                .post('/accounts')
                .send({name: 'Cash', direction: 'debit'});
            cashAccountId = cashResponse.body.id;

            const revenueResponse = await request(app)
                .post('/accounts')
                .send({name: 'Revenue', direction: 'credit'});
            revenueAccountId = revenueResponse.body.id;
        });

        it('should create a balanced transaction', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    name: 'Sale',
                    entries: [
                        {
                            direction: 'debit',
                            account_id: cashAccountId,
                            amount: 100
                        },
                        {
                            direction: 'credit',
                            account_id: revenueAccountId,
                            amount: 100
                        }
                    ]
                })
                .expect(201);

            expect(response.body).toMatchObject({name: 'Sale'});
            expect(response.body.id).toBeDefined();
            expect(response.body.entries).toHaveLength(2);
            expect(response.body.entries[0].id).toBeDefined();
            expect(response.body.entries[1].id).toBeDefined();
        });

        it('should update account balances correctly', async () => {
            await request(app)
                .post('/transactions')
                .send({
                    name: 'Sale',
                    entries: [
                        {
                            direction: 'debit',
                            account_id: cashAccountId,
                            amount: 100
                        },
                        {
                            direction: 'credit',
                            account_id: revenueAccountId,
                            amount: 100
                        }
                    ]
                })
                .expect(201);

            const cashResponse = await request(app)
                .get(`/accounts/${cashAccountId}`)
                .expect(200);

            expect(cashResponse.body.balance).toBe(100);
            const revenueResponse = await request(app)
                .get(`/accounts/${revenueAccountId}`)
                .expect(200);
            expect(revenueResponse.body.balance).toBe(100);
        });

        it('should handle opposite direction entries correctly', async () => {
            await request(app)
                .post('/transactions')
                .send({
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 100 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 100 }
                    ]
                });

            await request(app)
                .post('/transactions')
                .send({
                    entries: [
                        { direction: 'credit', account_id: cashAccountId, amount: 50 },
                        { direction: 'debit', account_id: revenueAccountId, amount: 50 }
                    ]
                });

            const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
            expect(cashResponse.body.balance).toBe(50);
            const revenueResponse = await request(app).get(`/accounts/${revenueAccountId}`);
            expect(revenueResponse.body.balance).toBe(50);
        });

        it('should reject unbalanced transaction', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    name: 'Unbalanced',
                    entries: [
                        {
                            direction: 'debit',
                            account_id: cashAccountId,
                            amount: 100
                        },
                        {
                            direction: 'credit',
                            account_id: revenueAccountId,
                            amount: 50  // Doesn't balance!
                        }
                    ]
                })
                .expect(400);

            expect(response.body.error).toContain('balance');
        });

        it('should reject transaction with non-existent account', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    entries: [
                        {
                            direction: 'debit',
                            account_id: 'non-existent',
                            amount: 100
                        },
                        {
                            direction: 'credit',
                            account_id: revenueAccountId,
                            amount: 100
                        }
                    ]
                })
                .expect(404);

            expect(response.body.error).toContain('not found');
        });

        it('should handle complex multi-entry transactions', async () => {
            const expenseResponse = await request(app)
                .post('/accounts')
                .send({ name: 'Expenses', direction: 'debit' });
            const expenseAccountId = expenseResponse.body.id;

            await request(app)
                .post('/transactions')
                .send({
                    name: 'Complex Transaction',
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 150 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 100 },
                        { direction: 'credit', account_id: expenseAccountId, amount: 50 }
                    ]
                })
                .expect(201);

            const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
            expect(cashResponse.body.balance).toBe(150);

            const revenueResponse = await request(app).get(`/accounts/${revenueAccountId}`);
            expect(revenueResponse.body.balance).toBe(100);

            const expenseResponse2 = await request(app).get(`/accounts/${expenseAccountId}`);
            expect(expenseResponse2.body.balance).toBe(-50); // Debit account - credit entry
        });

        it('should accept custom transaction ID', async () => {
            const customId = '3256dc3c-7b18-4a21-95c6-146747cf2971';
            const response = await request(app)
                .post('/transactions')
                .send({
                    id: customId,
                    name: 'Custom Transaction',
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 100 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 100 }
                    ]
                })
                .expect(201);

            expect(response.body.id).toBe(customId);
            expect(response.body.name).toBe('Custom Transaction');
        });
    });

    describe('Edge Cases and Validation', () => {
        let cashAccountId: string;
        let revenueAccountId: string;

        beforeEach(async () => {
            const cashResponse = await request(app)
                .post('/accounts')
                .send({ name: 'Cash', direction: 'debit' });
            cashAccountId = cashResponse.body.id;

            const revenueResponse = await request(app)
                .post('/accounts')
                .send({ name: 'Revenue', direction: 'credit' });
            revenueAccountId = revenueResponse.body.id;
        });

        it('should reject negative amounts', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    name: 'Negative Amount Test',
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: -100 },
                        { direction: 'credit', account_id: revenueAccountId, amount: -100 }
                    ]
                })
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toMatch(/greater than 0|amount/i);
        });

        it('should reject empty entries array', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    name: 'Empty Entries Test',
                    entries: []
                })
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toMatch(/at least one entry|entries/i);
        });

        it('should handle same account appearing multiple times', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    name: 'Multiple Entries Same Account',
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 100 },
                        { direction: 'credit', account_id: cashAccountId, amount: 50 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 50 }
                    ]
                })
                .expect(201);

            expect(response.body.entries).toHaveLength(3);

            const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
            expect(cashResponse.body.balance).toBe(50);

            const revenueResponse = await request(app).get(`/accounts/${revenueAccountId}`);
            expect(revenueResponse.body.balance).toBe(50);
        });

        it('should reject zero amounts', async () => {
            const response = await request(app)
                .post('/transactions')
                .send({
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 0 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 0 }
                    ]
                })
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toMatch(/greater than 0|amount/i);
        });

        it('should handle floating point amounts correctly', async () => {
            await request(app)
                .post('/transactions')
                .send({
                    name: 'Penny Transaction',
                    entries: [
                        { direction: 'debit', account_id: cashAccountId, amount: 0.01 },
                        { direction: 'credit', account_id: revenueAccountId, amount: 0.01 }
                    ]
                })
                .expect(201);

            const cashResponse = await request(app).get(`/accounts/${cashAccountId}`);
            expect(cashResponse.body.balance).toBeCloseTo(0.01, 2);

            const revenueResponse = await request(app).get(`/accounts/${revenueAccountId}`);
            expect(revenueResponse.body.balance).toBeCloseTo(0.01, 2);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle a complete business scenario', async () => {
            const accounts = {
                cash: (await request(app).post('/accounts').send({ name: 'Cash', direction: 'debit' })).body.id,
                revenue: (await request(app).post('/accounts').send({ name: 'Revenue', direction: 'credit' })).body.id,
                expenses: (await request(app).post('/accounts').send({ name: 'Expenses', direction: 'debit' })).body.id,
                payable: (await request(app).post('/accounts').send({ name: 'Accounts Payable', direction: 'credit' })).body.id
            };

            await request(app).post('/transactions').send({
                name: 'Customer Payment',
                entries: [
                    { direction: 'debit', account_id: accounts.cash, amount: 1000 },
                    { direction: 'credit', account_id: accounts.revenue, amount: 1000 }
                ]
            });

            await request(app).post('/transactions').send({
                name: 'Pay Expenses',
                entries: [
                    { direction: 'debit', account_id: accounts.expenses, amount: 300 },
                    { direction: 'credit', account_id: accounts.cash, amount: 300 }
                ]
            });

            await request(app).post('/transactions').send({
                name: 'Credit Expense',
                entries: [
                    { direction: 'debit', account_id: accounts.expenses, amount: 200 },
                    { direction: 'credit', account_id: accounts.payable, amount: 200 }
                ]
            });

            const finalCash = (await request(app).get(`/accounts/${accounts.cash}`)).body;
            expect(finalCash.balance).toBe(700);

            const finalRevenue = (await request(app).get(`/accounts/${accounts.revenue}`)).body;
            expect(finalRevenue.balance).toBe(1000);

            const finalExpenses = (await request(app).get(`/accounts/${accounts.expenses}`)).body;
            expect(finalExpenses.balance).toBe(500);

            const finalPayable = (await request(app).get(`/accounts/${accounts.payable}`)).body;
            expect(finalPayable.balance).toBe(200);
        });
    });
});