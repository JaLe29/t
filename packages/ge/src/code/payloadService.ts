// Service for processing incoming API payloads

interface ApiResponse {
	url: string;
	status: number;
	data: unknown;
	method?: string;
}

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
		if (data && typeof data === "object" && "cache" in data) {
			const cacheValue = (data as { cache?: unknown }).cache;

			// Check if cache is an array
			if (Array.isArray(cacheValue)) {
				console.log(`📦 Found cache array with ${cacheValue.length} items`);

				// Iterate through cache array
				cacheValue.forEach((cacheItem, index) => {
					console.log(`📦 Cache item [${index}]:`, cacheItem);
				});
			}
		}
	}
}

// Export singleton instance
export const payloadService = new PayloadService();
