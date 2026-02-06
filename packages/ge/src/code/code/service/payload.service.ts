// Service for processing incoming API payloads

import { collectionTroopsService } from './collection-troops.service';
import { playerService } from './player.service';
import { sendRequest } from './request-service';
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
					// console.log(JSON.stringify(cacheItem, null, 2));
					if (collectionTroopsService.isCollectionTroops(cacheItem)) {
						const processedVillage = collectionTroopsService.process(cacheItem);
						// Merge units for each villageId instead of overwriting
						for (const [villageId, units] of Object.entries(processedVillage)) {
							if (!village[villageId]) {
								village[villageId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
							}
							// Add units from processedVillage to existing village units
							for (let i = 0; i < units.length; i++) {
								village[villageId]![i] = village[villageId]![i]! + units[i]!;
							}
						}
						return;
					}

					if (playerService.isPlayer(cacheItem)) {
						//const payload = playerService.process(cacheItem);
						//console.log(payload);
					}
				});

				// console.log(village);
				if (Object.keys(village).length > 0) {
					// biome-ignore lint/suspicious/noConsole: xx
					console.log(village);
					const array = Object.entries(village).map(([villageId, units]) => ({
						villageId,
						units,
					}));

					sendRequest({
						action: 'game.units.update',
						payload: {
							villages: array,
						},
					});
				}
			}
		}
	}
}

// Export singleton instance
export const payloadService = new PayloadService();
