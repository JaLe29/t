// Service for processing incoming API payloads

import type { ApiResponse } from './types';
import { collectionTroopsService } from './collection-troops.service';

class PayloadService {
	/**
	 * Process incoming API response
	 */
	processResponse(response: ApiResponse): void {
		// Process cache array if present
		this.processCache(response.data);
	}

	/**
	 * Process cache array if present in response data
	 */
	private processCache(data: unknown): void {
		// Check if data is an object and contains cache property
		if (data && typeof data === 'object' && 'cache' in data) {
			const cacheValue = (data as { cache?: unknown }).cache;

			// Check if cache is an array
			if (Array.isArray(cacheValue)) {
				const village: Record<string, number[]> = {};

				// Iterate through cache array
				cacheValue.forEach(cacheItem => {
					if (collectionTroopsService.isCollectionTroops(cacheItem)) {
						const processedVillage = collectionTroopsService.process(cacheItem);
						Object.assign(village, processedVillage);
					}
				});

				if (Object.keys(village).length > 0) {
					// biome-ignore lint/suspicious/noConsole: xx
					console.log(village);
				}
				// Player:
				//info o hraci
			}
		}
	}
}

// Export singleton instance
export const payloadService = new PayloadService();
