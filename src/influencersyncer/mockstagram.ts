import axios from 'axios';

const enum MockstagramApi {
    BASE_URL = 'http://host.docker.internal:3000/api/v1',
    INFLUENCERS_ENDPOINT = '/influencers',
}



/**
 * 
 * @param influencerId 
 * @description This function is used to fetch the influencer data from the mockstagram api
 * @returns 
 */
export async function fetchMockstagramData(influencerId: number) {
    try {
        const response = await axios.get(`${MockstagramApi.BASE_URL}${MockstagramApi.INFLUENCERS_ENDPOINT}/${influencerId}`);
        const data = response.data;
        console.log('influencer data response', data);
        return data;
    } catch (error) {
        console.error(`Failed to fetch influencer ${influencerId}:`, error);
        return null;
    }
}

