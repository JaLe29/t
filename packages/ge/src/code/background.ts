// Background service worker - processes API responses
import { payloadService } from './code/service/payload.service';
import { playerService } from './code/service/player.service';

function updateBadge(tabId?: number) {
	if (tabId !== undefined) {
		chrome.tabs.get(tabId, (tab) => {
			if (tab.url?.includes('kingdoms.com')) {
				chrome.action.setBadgeText({ text: '●', tabId });
				chrome.action.setBadgeBackgroundColor({ color: '#00BC00', tabId });
			} else {
				chrome.action.setBadgeText({ text: '●', tabId });
				chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId });
			}
		});
	} else {
		// Update for all tabs
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				if (tab.id !== undefined) {
					if (tab.url?.includes('kingdoms.com')) {
						chrome.action.setBadgeText({ text: '●', tabId: tab.id });
						chrome.action.setBadgeBackgroundColor({ color: '#00BC00', tabId: tab.id });
					} else {
						chrome.action.setBadgeText({ text: '●', tabId: tab.id });
						chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId: tab.id });
					}
				}
			});
		});
	}
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url?.includes('kingdoms.com')) {
		setTimeout(() => {
			injectFetchInterceptor(tabId);
		}, 1000);
	}
	// Update badge when tab URL changes
	if (changeInfo.url || changeInfo.status === 'complete') {
		updateBadge(tabId);
	}
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	updateBadge(activeInfo.tabId);
});

// Clean up player data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
	playerService.clearCurrentPlayer(tabId).catch((error) => {
		console.error('Failed to clear player data for closed tab:', error);
	});
});

// Initialize badge on extension startup
chrome.runtime.onStartup.addListener(() => {
	updateBadge();
});

// Also update badge when extension is installed/enabled
chrome.runtime.onInstalled.addListener(() => {
	updateBadge();
});

chrome.runtime.onMessage.addListener((message, sender) => {
	if (message.type === 'KINGDOMS_PAGE_LOADED' && sender.tab?.id) {
		injectFetchInterceptor(sender.tab.id);
	}
	if (message.type === 'API_RESPONSE') {
		payloadService.processResponse({
			url: message.url,
			status: message.status,
			data: message.data,
			method: message.method,
			tabId: sender.tab?.id,
		});
	}
	if (message.type === 'API_RESPONSE_TEXT') {
		payloadService.processResponse({
			url: message.url,
			status: message.status,
			data: message.data,
			method: message.method,
			tabId: sender.tab?.id,
		});
	}
});

function injectFetchInterceptor(tabId: number) {
	chrome.scripting
		.executeScript({
			target: { tabId },
			func: () => {
				const sendResponse = (type: string, payload: object) => {
					document.dispatchEvent(new CustomEvent('__EXT_API_RESPONSE__', { detail: { type, ...payload } }));
				};

				const originalFetch = window.fetch;
				(window as any).fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
					const urlString =
						// biome-ignore lint/style/noNestedTernary: xxx
						typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

					if (urlString.includes('/api')) {
						const response = await originalFetch.call(this, input, init);
						const clonedResponse = response.clone();

						(async () => {
							try {
								const text = await clonedResponse.text();
								if (text) {
									try {
										const json = JSON.parse(text);
										sendResponse('API_RESPONSE', {
											url: urlString,
											status: response.status,
											data: json,
										});
									} catch {
										sendResponse('API_RESPONSE_TEXT', {
											url: urlString,
											status: response.status,
											data: text.substring(0, 500),
										});
									}
								}
							} catch (_e) {
								// Silently fail
							}
						})();

						return response;
					}

					return originalFetch.call(this, input, init);
				};

				const originalXHROpen = XMLHttpRequest.prototype.open;
				const originalXHRSend = XMLHttpRequest.prototype.send;

				(XMLHttpRequest.prototype as any).open = function (
					this: XMLHttpRequest,
					method: string,
					url: string | URL,
					async?: boolean,
				) {
					(this as any)._url = typeof url === 'string' ? url : url.toString();
					(this as any)._method = method;
					return originalXHROpen.call(this, method, url, async ?? true);
				};

				(XMLHttpRequest.prototype as any).send = function (
					this: XMLHttpRequest,
					body?: Document | XMLHttpRequestBodyInit | null,
				) {
					const xhr = this as any;
					if (xhr._url?.includes('/api')) {
						this.addEventListener('load', function (this: XMLHttpRequest) {
							try {
								const json = JSON.parse(this.responseText);
								sendResponse('API_RESPONSE', {
									url: xhr._url,
									status: this.status,
									data: json,
								});
							} catch {
								sendResponse('API_RESPONSE_TEXT', {
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
			world: 'MAIN',
		})
		.catch(() => {
			// Silently fail
		});
}
