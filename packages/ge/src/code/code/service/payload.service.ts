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
		this.processCache(response.data, response.tabId);
	}

	/**
	 * Process cache array if present in response data
	 */
	private async processCache(data: unknown, tabId?: number): Promise<void> {
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
						const payload = playerService.process(cacheItem);
						// Store current player in storage for this tab
						playerService.setCurrentPlayer(payload, tabId).catch(error => {
							console.error('Failed to store current player:', error);
						});
					}
				});

				// console.log(village);
				if (Object.keys(village).length > 0) {
					const array = Object.entries(village).map(([villageId, units]) => ({
						villageId,
						units,
					}));

					const player = await playerService.getCurrentPlayer(tabId);
					if (!player) {
						return;
					}
					sendRequest({
						action: 'game.units.update',
						payload: {
							playerId: player?.playerId,
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
