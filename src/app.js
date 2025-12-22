import express from 'express';
import cors from 'cors';

// Routes
// import userRoutes from './routes/user.routes.js';
// import groupRoutes from './routes/group.routes.js';
// import expenseRoutes from './routes/expense.routes.js';

const app = express();

/* ---------- Global Middlewares ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Health Check ---------- */
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Settle-Kar API running' });
});

/* ---------- API Routes ---------- */
// app.use('/api/users', userRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/expenses', expenseRoutes);

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

export default app;
