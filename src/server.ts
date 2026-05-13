import express from 'express';
import cors from 'cors';
import executionRoutes from './routes/execution.js';
import recordRoutes from './routes/record.js';
import discoveryRoutes from './routes/discovery.js';
import { config } from './config.js';

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/executions', executionRoutes);
app.use('/api/recordings', recordRoutes);
app.use('/api/discovery', discoveryRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Execution browser: headless=${config.executionHeadless}, slowMo=${config.executionSlowMo}ms`);
});
