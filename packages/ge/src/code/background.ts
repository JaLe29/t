// Background service worker - manages icon badge and intercepts requests
chrome.tabs.onActivated.addListener((activeInfo) => {
	updateBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		updateBadge(tabId);
	}
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "KINGDOMS_PAGE_LOADED" && sender.tab?.id) {
		updateBadge(sender.tab.id);
	}
});

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

// Intercept and log only /api requests
chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		// Filter only requests that contain /api in the path
		if (details.url.includes("/api")) {
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
