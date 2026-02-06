// Service for processing Collection:Troops events
interface CacheItem {
	name: string;
	data: {
		cache: Array<{
			data: {
				villageId: string;
				units: Record<string, number>;
			};
		}>;
	};
}

interface VillageTroops {
	[villageId: string]: number[];
}

class CollectionTroopsService {
	/**
	 * Process Collection:Troops cache item
	 */
	process(cacheItem: CacheItem): VillageTroops {
		const village: VillageTroops = {};
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

		return village;
	}

	/**
	 * Check if cache item is a Collection:Troops event
	 */
	isCollectionTroops(cacheItem: { name: string }): boolean {
		return cacheItem.name.startsWith('Collection:Troops:');
	}
}

// Export singleton instance
export const collectionTroopsService = new CollectionTroopsService();
