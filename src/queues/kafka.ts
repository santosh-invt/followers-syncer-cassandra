import { Kafka } from 'kafkajs';
import { fetchInfluencersByKafka } from '../influencersyncer/controller';  
import { validateIdRange } from '../utils/influencerSyncerUtil';
const kafka = new Kafka({
    clientId: 'influencer-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] // Use environment variable
});


const consumer = kafka.consumer({ groupId: 'influencer-sync-group' });

export async function startKafkaConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'sync-influencers', fromBeginning: false });
    
    await consumer.run({
        eachMessage: async ({ message }) => {
            if (message.value) {
                // Convert buffer to string and parse JSON
                const messageValue = message.value.toString('utf-8');
                try {
                    const { startId, endId } = JSON.parse(messageValue);
                    if(!startId || !endId) {
                        console.error('Invalid message value:', messageValue);
                        throw new Error('Invalid message value')    ;
                    }
                    validateIdRange(startId, endId);
                    await fetchInfluencersByKafka(startId, endId);
                } catch (error) {
                    console.error('Error parsing message value:', error);
                }
            }
        }
    });
}
