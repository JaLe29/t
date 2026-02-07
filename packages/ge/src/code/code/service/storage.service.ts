// Service for managing Chrome extension storage

class StorageService {
	private readonly STORAGE_KEY_PREFIX = 'ge_';

	/**
	 * Get value from storage
	 */
	async get<T>(key: string): Promise<T | undefined> {
		return new Promise(resolve => {
			chrome.storage.local.get([this.getStorageKey(key)], result => {
				resolve(result[this.getStorageKey(key)] as T | undefined);
			});
		});
	}

	/**
	 * Set value in storage
	 */
	async set<T>(key: string, value: T): Promise<void> {
		return new Promise(resolve => {
			chrome.storage.local.set({ [this.getStorageKey(key)]: value }, () => {
				resolve();
			});
		});
	}

	/**
	 * Remove value from storage
	 */
	async remove(key: string): Promise<void> {
		return new Promise(resolve => {
			chrome.storage.local.remove([this.getStorageKey(key)], () => {
				resolve();
			});
		});
	}

	/**
	 * Clear all storage
	 */
	async clear(): Promise<void> {
		return new Promise(resolve => {
			chrome.storage.local.clear(() => {
				resolve();
			});
		});
	}

	/**
	 * Get storage key with prefix
	 */
	private getStorageKey(key: string): string {
		return `${this.STORAGE_KEY_PREFIX}${key}`;
	}
}

// Export singleton instance
export const storageService = new StorageService();
