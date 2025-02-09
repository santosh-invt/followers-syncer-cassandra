import express, { Request, Response, Router } from 'express';
import { generateInfluencerIds } from '../utils/influencerSyncerUtil';
import { getInfluencerAvgFollowers, processInfluencerSync } from './influencerAvgService';
import { getFollowerCountHistory, getLatestFollowerCount, syncFollowers } from './influencerFollowers';
import { fetchMockstagramData } from './mockstagram';

const router: Router = express.Router();


/**
 * ✅ Handler for `/follower-timeline`
 * Fetches follower sync timeline (Placeholder for future implementation).
 */
const handleFollowerTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const influencerId = req.params.influencerId as string;
        if (!influencerId) {
            res.status(400).json({ error: 'Missing influencerId' });
            return;
        }
        const limit = req.query?.limit  || 10;
        const followerCountHistory = await getFollowerCountHistory(Number(influencerId),Number(limit));
        res.status(200).json({ message: 'Follower timeline fetched successfully' , followerCountHistory: followerCountHistory ? followerCountHistory : []});
    } catch (error) {
        console.error('Error in handleFollowerTimeline:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * ✅ Handler for `/follower-avg`
 * Updates the influencer's average follower count.
 */
const handleFollowerAvg = async (req: Request, res: Response): Promise<void> => {
    try {
        const influencerId = req.params.influencerId as string;
        if (!influencerId) {
            res.status(400).json({ error: 'Missing influencerId' });
            return;
        }
        const influencerAvgFollowers = await getInfluencerAvgFollowers(Number(influencerId));
      

        res.status(200).json({ message: 'Follower average updated successfully' , influencerAvgFollowers: influencerAvgFollowers ? influencerAvgFollowers : 0});
    } catch (error) {
        console.error('Error in handleFollowerAvg:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const handleFollowerCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const influencerId = req.params.influencerId as string;
        if (!influencerId) {
            res.status(400).json({ error: 'Missing influencerId' });
            return;
        }

        const followerCount = await getLatestFollowerCount(Number(influencerId));

        res.status(200).json({ message: 'Follower count updated successfully' , followerCount: followerCount ? followerCount : 0});
    } catch (error) {
        console.error('Error in handleFollowerCount:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.get('/follower-count/:influencerId', handleFollowerCount);
router.get('/follower-timeline/:influencerId', handleFollowerTimeline);
router.get('/follower-avg/:influencerId', handleFollowerAvg);

export default router;

export async function fetchInfluencersByKafka(startId: number, endId: number) {
    console.log('fetchInfluencersByKafka', startId, endId);
    const influencerIds = generateInfluencerIds(startId, endId);
    console.log('influencerIds', influencerIds);
    try {
        await Promise.allSettled(influencerIds.map(async (id) => {
            try {
                const influencer = await fetchMockstagramData(id);
                if (!influencer) {
                    return;
                }
               await syncFollowers(influencer);
                // Insert into influencer_followers table
               await processInfluencerSync(influencer);
            } catch (error) {
                console.error(`Failed to fetch influencer ${id}:`, error);
            }
        }));
    } catch (error) {
        console.error('Error fetching influencer data via Kafka:', error);
        return ;
    }
}


