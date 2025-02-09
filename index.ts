// src/index.ts
import express from 'express';
import { connectToCassandra } from './src/databases/casandra';
import { startKafkaConsumer } from './src/queues/kafka';
import router from './src/influencersyncer/controller';
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use('/', router);
app.listen(PORT, async () => {
    await connectToCassandra();
    console.log(`Server running on port ${PORT}`);
    startKafkaConsumer();
});