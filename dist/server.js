import express from 'express';
import cors from 'cors';
import recordRoutes from './routes/record.js';
const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/record', recordRoutes);
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
