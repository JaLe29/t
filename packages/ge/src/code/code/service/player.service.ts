// Service for processing Player events

import { storageService } from './storage.service';
import type { PlayerPayload } from './types';

interface CacheItem {
	name: string;
	data: PlayerPayload;
}

const CURRENT_PLAYER_STORAGE_KEY_PREFIX = 'currentPlayer_';

class PlayerService {
	/**
	 * Check if cache item is a Player event
	 */
	isPlayer(cacheItem: { name: string }): cacheItem is CacheItem {
		return cacheItem.name.startsWith('Player:');
	}

	/**
	 * Process Player cache item - returns the payload
	 */
	process(cacheItem: CacheItem): PlayerPayload {
		return cacheItem.data;
	}

	/**
	 * Set current player in storage for a specific tab
	 */
	async setCurrentPlayer(player: PlayerPayload, tabId?: number): Promise<void> {
		if (!tabId) {
			console.warn('setCurrentPlayer called without tabId, player not stored');
			return;
		}
		const key = `${CURRENT_PLAYER_STORAGE_KEY_PREFIX}${tabId}`;
		await storageService.set(key, player);
	}

	/**
	 * Get current player from storage for a specific tab
	 */
	async getCurrentPlayer(tabId?: number): Promise<PlayerPayload | undefined> {
		if (!tabId) {
			return undefined;
		}
		const key = `${CURRENT_PLAYER_STORAGE_KEY_PREFIX}${tabId}`;
		return storageService.get<PlayerPayload>(key);
	}

	/**
	 * Clear current player from storage for a specific tab
	 */
	async clearCurrentPlayer(tabId?: number): Promise<void> {
		if (!tabId) {
			return;
		}
		const key = `${CURRENT_PLAYER_STORAGE_KEY_PREFIX}${tabId}`;
		await storageService.remove(key);
	}

	/**
	 * Get all stored players (for all tabs)
	 */
	async getAllPlayers(): Promise<Map<number, PlayerPayload>> {
		return new Promise((resolve) => {
			chrome.storage.local.get(null, (items) => {
				const players = new Map<number, PlayerPayload>();
				for (const [key, value] of Object.entries(items)) {
					if (key.startsWith(CURRENT_PLAYER_STORAGE_KEY_PREFIX)) {
						const tabIdStr = key.replace(CURRENT_PLAYER_STORAGE_KEY_PREFIX, '');
						const tabId = Number.parseInt(tabIdStr, 10);
						if (!Number.isNaN(tabId) && value) {
							players.set(tabId, value as PlayerPayload);
						}
					}
				}
				resolve(players);
			});
		});
	}
}

// Export singleton instance
export const playerService = new PlayerService();
