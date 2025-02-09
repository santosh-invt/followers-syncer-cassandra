export function generateInfluencerIds(startId: number, endId: number): number[] {
    return Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
}


export function validateIdRange(startId: number, endId: number): void {
    if (endId - startId > 500) {
        throw new Error('Range between startId and endId cannot exceed 500');
    }
}
