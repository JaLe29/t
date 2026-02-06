// Background service worker - manages icon badge and intercepts requests

// Payload service for processing API responses
class PayloadService {
	/**
	 * Process incoming API response
	 */
	processResponse(response: { url: string; status: number; data: unknown; method?: string }): void {
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

const payloadService = new PayloadService();
chrome.tabs.onActivated.addListener((activeInfo) => {
	updateBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		updateBadge(tabId);
		// Try to inject interceptors when page loads
		if (tab.url.includes("kingdoms.com")) {
			setTimeout(() => {
				injectFetchInterceptor(tabId);
			}, 1000);
		}
	}
});

// Listen for messages from content script and injected page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "KINGDOMS_PAGE_LOADED" && sender.tab?.id) {
		updateBadge(sender.tab.id);
		injectFetchInterceptor(sender.tab.id);
	}
	if (message.type === "API_RESPONSE") {
		// Process response through payload service
		payloadService.processResponse({
			url: message.url,
			status: message.status,
			data: message.data,
			method: message.method,
		});
	}
	if (message.type === "API_RESPONSE_TEXT") {
		console.log("📥 API RESPONSE TEXT:", {
			url: message.url,
			status: message.status,
			data: message.data,
		});
		// You can also process text responses if needed
		payloadService.processResponse({
			url: message.url,
			status: message.status,
			data: message.data,
			method: message.method,
		});
	}
	if (message.type === "API_RESPONSE_ERROR") {
		console.error("❌ API RESPONSE ERROR:", message);
	}
});

// Inject fetch interceptor into page context
function injectFetchInterceptor(tabId: number) {
	chrome.scripting.executeScript({
		target: { tabId },
		func: () => {
			// Send to content script via custom event (page context has no chrome.runtime)
			const sendResponse = (type: string, payload: object) => {
				document.dispatchEvent(new CustomEvent("__EXT_API_RESPONSE__", { detail: { type, ...payload } }));
			};
			
			// Intercept fetch
			const originalFetch = window.fetch;
			(window as any).fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
				const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
				
				if (urlString.includes("/api")) {
					const response = await originalFetch.call(this, input, init);
					const clonedResponse = response.clone();
					
					(async () => {
						try {
							const text = await clonedResponse.text();
							if (text) {
								try {
									const json = JSON.parse(text);
									sendResponse("API_RESPONSE", {
										url: urlString,
										status: response.status,
										data: json,
									});
								} catch {
									sendResponse("API_RESPONSE_TEXT", {
										url: urlString,
										status: response.status,
										data: text.substring(0, 500),
									});
								}
							}
						} catch (e) {
							sendResponse("API_RESPONSE_ERROR", { url: urlString, error: String(e) });
						}
					})();
					
					return response;
				}
				
				return originalFetch.call(this, input, init);
			};
			
			// Intercept XMLHttpRequest
			const originalXHROpen = XMLHttpRequest.prototype.open;
			const originalXHRSend = XMLHttpRequest.prototype.send;
			
			(XMLHttpRequest.prototype as any).open = function(this: XMLHttpRequest, method: string, url: string | URL, async?: boolean) {
				(this as any)._url = typeof url === "string" ? url : url.toString();
				(this as any)._method = method;
				return originalXHROpen.call(this, method, url, async ?? true);
			};
			
			(XMLHttpRequest.prototype as any).send = function(this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
				const xhr = this as any;
				if (xhr._url && xhr._url.includes("/api")) {
					this.addEventListener("load", function(this: XMLHttpRequest) {
						try {
							const json = JSON.parse(this.responseText);
							sendResponse("API_RESPONSE", {
								url: xhr._url,
								status: this.status,
								data: json,
							});
						} catch {
							sendResponse("API_RESPONSE_TEXT", {
								url: xhr._url,
								status: this.status,
								data: this.responseText.substring(0, 500),
							});
						}
					});
				}
				return originalXHRSend.call(this, body as XMLHttpRequestBodyInit | null | undefined);
			};
		},
		world: "MAIN",
	}).catch((err) => {
		console.error("❌ Error injecting interceptors:", err);
	});
}

function updateBadge(tabId: number) {
	chrome.tabs.get(tabId, (tab) => {
		if (!tab.url) return;

		const isKingdoms = tab.url.includes("kingdoms.com");
		
		if (isKingdoms) {
			// Set green badge when on kingdoms.com
			chrome.action.setBadgeText({ text: "●", tabId });
			chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId });
		} else {
			// Clear badge when not on kingdoms.com
			chrome.action.setBadgeText({ text: "", tabId });
		}
	});
}

// Helper function to decode ArrayBuffer to string
function decodeArrayBuffer(buffer: ArrayBuffer): string {
	try {
		const decoder = new TextDecoder("utf-8");
		return decoder.decode(buffer);
	} catch (e) {
		return `[Unable to decode ArrayBuffer: ${e}]`;
	}
}

// Store request details for response matching
const requestMap = new Map<string, { url: string; method: string }>();

// Intercept and log only /api requests
chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		// Filter only requests that contain /api in the path
		if (details.url.includes("/api")) {
			requestMap.set(details.requestId, {
				url: details.url,
				method: details.method,
			});
			
			console.log("🌐 API REQUEST:", {
				url: details.url,
				method: details.method,
				requestId: details.requestId,
			});
			
			// Log request body if available (POST, PUT, etc.)
			if (details.requestBody) {
				const payload: any = {
					requestId: details.requestId,
				};
				
				// Handle formData
				if (details.requestBody.formData) {
					payload.formData = details.requestBody.formData;
				}
				
				// Handle raw ArrayBuffer data
				if (details.requestBody.raw && details.requestBody.raw.length > 0) {
					try {
						// Decode all ArrayBuffers
						const decodedRaw = details.requestBody.raw.map((item: { bytes?: ArrayBuffer }) => {
							if (item.bytes) {
								const decoded = decodeArrayBuffer(item.bytes);
								// Try to parse as JSON
								try {
									return JSON.parse(decoded);
								} catch {
									return decoded;
								}
							}
							return item;
						});
						payload.body = decodedRaw.length === 1 ? decodedRaw[0] : decodedRaw;
					} catch (e) {
						payload.raw = details.requestBody.raw;
						payload.decodeError = String(e);
					}
				}
				
				console.log("📦 REQUEST PAYLOAD:", payload);
			}
		}
		
		return {};
	},
	{
		urls: ["*://*.kingdoms.com/*", "*://kingdoms.com/*"],
	},
	["requestBody"]
);

// Note: In Manifest V3, getResponseBody is not available via webRequest API
// Response logging is handled by fetch interceptor in content script
