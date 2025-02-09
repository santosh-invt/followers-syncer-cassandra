import { types } from "cassandra-driver";
import { CassandraClient } from "../databases/casandra";



export async function syncInfluencerFollowers() {
    const influencerIds = await CassandraClient.execute(`
        SELECT influencer_id FROM influencer_avg_followers;
    `);
    console.log('influencerIds', influencerIds);
}


async function getPreviousStats(influencerId: number) {
    const query = `SELECT avg_follower_count, sync_count FROM influencer_avg_followers WHERE influencer_id = ?`;
    const result = await CassandraClient.execute(query, [types.Long.fromString(String(influencerId))]);

    if (result.rowLength > 0) {
        return {
            avgFollowerCount: Number(result.rows[0].avg_follower_count),
            syncCount: Number(result.rows[0].sync_count)
        };
    }
    return { avgFollowerCount: 0, syncCount: 0 }; // Default values if no record found
}

function computeNewAverage(previousAvg: number, previousCount: number, newFollowerCount: number) {
    if (previousCount === 0) return newFollowerCount; // If first sync, set current count as average
 
    previousAvg = Number(previousAvg.toFixed(2));
    previousCount = Number(previousCount);
    newFollowerCount = Number(newFollowerCount);
    console.log('previousAvg', previousAvg);
    console.log('previousCount', previousCount);
    console.log('newFollowerCount', newFollowerCount);
    return Number(((previousAvg * previousCount + newFollowerCount) / (previousCount + 1)).toFixed(2));
}

async function updateInfluencerStats(influencerId: number, avgFollowerCount: number, syncCount: number) {
    const query = `INSERT INTO influencer_avg_followers (influencer_id, avg_follower_count, sync_count, last_synced_at)
                   VALUES (?, ?, ?, ?)`;
    await CassandraClient.execute(query, [
        types.Long.fromString(String(influencerId)),
        avgFollowerCount,
        types.Long.fromString(String(syncCount)),
        new Date() // Current timestamp
    ]);
}


/**
 * 
 * @param influencer 
 * @description This function is used to process the influencer sync , update avg follower count and sync count
 */
export async function processInfluencerSync(influencer: { pk: number, followerCount: number }) {
    const influencerId = influencer.pk;
    const newFollowerCount = influencer.followerCount;

    // Fetch previous stats
    const { avgFollowerCount: previousAvg, syncCount: previousCount } = await getPreviousStats(influencerId);

    // Compute new average
    const newAvgFollowerCount = computeNewAverage(previousAvg, previousCount, newFollowerCount);
    const newSyncCount = previousCount + 1;
    console.log('newAvgFollowerCount', newAvgFollowerCount);
    console.log('newSyncCount', newSyncCount);
    // Update the new stats in Cassandra
    await updateInfluencerStats(influencerId, newAvgFollowerCount, newSyncCount);
}



export async function getInfluencerAvgFollowers(influencerId: number) {
    try {   
        const query = `SELECT avg_follower_count FROM influencer_avg_followers WHERE influencer_id = ?`;
        const result = await CassandraClient.execute(query, [types.Long.fromString(String(influencerId))]);
        return result?.rows[0]?.avg_follower_count;
    } catch (error) {
        console.error('Error in getInfluencerAvgFollowers:', error);
        return null;
    }
}

