import { types } from "cassandra-driver";
import { CassandraClient } from "../databases/casandra";





export async function syncFollowers(influencerData : any) {
    try {
        const influencerId = influencerData.pk;
        const followerCount = influencerData.followerCount;
        const fetchedAt = new Date();

    // Insert into influencer_followers table
    const dataToInsert = [types.Long.fromString(String(influencerId)), fetchedAt, types.Long.fromString(String(followerCount))];
    console.log('dataToInsert', dataToInsert);
    await CassandraClient.execute(
        `INSERT INTO influencer_followers (influencer_id, fetched_at, follower_count)
         VALUES (?, ?, ?);`,
        dataToInsert
    );
    } catch (error) {
        console.error('Error in syncFollowers:', error);
        return;
    }
}


export async function getLatestFollowerCount(influencerId: number) {
    try {
        const query = `
            SELECT follower_count 
            FROM influencer_followers 
            WHERE influencer_id = ? 
            LIMIT 1;
    `;
    const result = await CassandraClient.execute(query, [types.Long.fromString(String(influencerId))]);
    
    if (result.rowLength === 0) {
        return null;
        }
        return result?.rows[0]?.follower_count;
    } catch (error) {
        console.error('Error in getLatestFollowerCount:', error);
        return null;
    }
}


export async function getFollowerCountHistory(influencerId: number, limit: number = 100) {
    console.log('getFollowerCountHistory', influencerId, limit);    
    try {
        const query = `
            SELECT follower_count, fetched_at 
            FROM influencer_followers 
            WHERE influencer_id = ?   
            ORDER BY fetched_at DESC
            LIMIT ?
    `;
    const result = await CassandraClient.execute(query, [
        types.Long.fromString(String(influencerId)),
        parseInt(limit.toString(),10),
    ],{prepare: true});
    return result?.rows;
    } catch (error) {
        console.error('Error in getFollowerCountHistory:', error);
        return [];
    }
}




