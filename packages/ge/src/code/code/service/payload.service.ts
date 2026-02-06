// Service for processing incoming API payloads

import { collectionTroopsService } from './collection-troops.service';
import { playerService } from './player.service';
import type { ApiResponse } from './types';

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

					if (playerService.isPlayer(cacheItem)) {
						const payload = playerService.process(cacheItem);
						// biome-ignore lint/suspicious/noConsole: xx
						console.log(payload);
					}
				});

				if (Object.keys(village).length > 0) {
					// biome-ignore lint/suspicious/noConsole: xx
					//console.log(village);
				}
			}
		}
	}
}

// Export singleton instance
export const payloadService = new PayloadService();
