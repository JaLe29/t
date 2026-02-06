// Service for processing Player events

import type { PlayerPayload } from './types';

interface CacheItem {
	name: string;
	data: PlayerPayload;
}

class PlayerService {
	/**
	 * Check if cache item is a Player event
	 */
	isPlayer(cacheItem: { name: string }): boolean {
		return cacheItem.name.startsWith('Player:');
	}

	/**
	 * Process Player cache item - returns the payload
	 */
	process(cacheItem: CacheItem): PlayerPayload {
		return cacheItem.data;
	}
}

// Export singleton instance
export const playerService = new PlayerService();
