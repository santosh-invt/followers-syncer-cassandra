import { Client } from 'cassandra-driver';
const contactPoints = process.env.CASSANDRA_HOST || '127.0.0.1';
const clientWithoutKeyspace = new Client({
    contactPoints: [contactPoints],
    localDataCenter: 'datacenter1'
});

export let CassandraClient: Client;

export async function connectToCassandra() {
    try {
        await clientWithoutKeyspace.connect();
        console.log('Connected to Cassandra');

        // Create keyspace if not exists
        await clientWithoutKeyspace.execute(`CREATE KEYSPACE IF NOT EXISTS influencer_tracking WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'};`);

        // Now reconnect with the keyspace
        CassandraClient = new Client({
            contactPoints: [contactPoints],
            localDataCenter: 'datacenter1',
            keyspace: 'influencer_tracking'
        });
        await CassandraClient.connect();
        console.log('Connected to Cassandra with keyspace influencer_tracking');

        // Create tables if not exist


        // Create table influencer_followers
        await CassandraClient.execute(`
            CREATE TABLE IF NOT EXISTS influencer_followers (
                influencer_id BIGINT,
                fetched_at TIMESTAMP,
                follower_count BIGINT,
                PRIMARY KEY (influencer_id, fetched_at)
            ) WITH CLUSTERING ORDER BY (fetched_at DESC);
        `);
        
        await CassandraClient.execute(`
            CREATE TABLE IF NOT EXISTS influencer_avg_followers (
                 influencer_id BIGINT PRIMARY KEY,
                 avg_follower_count DOUBLE,
                 sync_count BIGINT,
                last_synced_at TIMESTAMP
            );
        `);
    } catch (error) {
        console.error('Error connecting to Cassandra', error);
    }
}