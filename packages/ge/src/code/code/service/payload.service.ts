// Service for processing incoming API payloads

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
					const name = cacheItem.name;
					if (name.startsWith('Collection:Troops:')) {
						const data = cacheItem.data;

						for (const d of data.cache) {
							const units: Record<string, number> = d.data.units;
							const villageId = d.data.villageId;

							if (!village[villageId]) {
								village[villageId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
							}

							if (typeof units === 'object') {
								const objectKeys = Object.keys(units);
								objectKeys.forEach(key => {
									village[villageId]![Number.parseInt(key, 10) - 1]! += Number.parseInt(
										(units as any)[key as any]!,
										10,
									);
								});
							}
						}
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
