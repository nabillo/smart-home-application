import express from 'express';
import cors from 'cors';
//import cookieParser from 'cookie-parser';
import 'dotenv/config';

import authRoutes from './api/routes/authRoutes.js';
import userRoutes from './api/routes/userRoutes.js';
import roleRoutes from './api/routes/roleRoutes.js';
import permissionRoutes from './api/routes/permissionRoutes.js';
import homeRoutes from './api/routes/homeRoutes.js';
import functionalityTypeRoutes from './api/routes/functionalityTypeRoutes.js';
import homeParameterTypeRoutes from './api/routes/homeParameterTypeRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
//app.use(cookieParser());

// Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/homes', homeRoutes);
app.use('/api/v1/functionality-types', functionalityTypeRoutes);
app.use('/api/v1/home-parameter-types', homeParameterTypeRoutes);

app.get('/', (req, res) => {
  res.send('Smart Home API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
