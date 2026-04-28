import express from 'express';
import cors from 'cors';
import recordRoutes from './routes/record.js';
import { config } from './config.js';

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/recordings', recordRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
