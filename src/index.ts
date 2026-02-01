import { createApp } from './infrastructure/http/app';

const PORT = process.env.PORT || 5000;

const app = createApp();

app.listen(PORT, () => {
  console.log('=================================');
  console.log('📒 Ledger API Server Started');
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/accounts`);
  console.log(`   GET    http://localhost:${PORT}/accounts/:id`);
  console.log(`   POST   http://localhost:${PORT}/transactions`);
  console.log('=================================');
});