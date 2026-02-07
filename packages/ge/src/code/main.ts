/** biome-ignore-all lint/suspicious/noConsole: xxx */
console.log('Extension loaded - script is running!');

function handleButtonClick() {
	console.log('Button clicked!');
	alert('Button clicked! Check console for logx.');
}

function updateStatusIndicator() {
	const statusDot = document.getElementById('statusDot');
	const statusText = document.getElementById('statusText');

	if (!statusDot || !statusText) {
		return;
	}

	// Get current active tab
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]?.url) {
			const url = tabs[0].url;
			const isKingdomsDomain = url.includes('kingdoms.com');

			if (isKingdomsDomain) {
				statusDot.className = 'status-indicator active';
				statusText.textContent = 'Active';
			} else {
				statusDot.className = 'status-indicator inactive';
				statusText.textContent = 'Inactive';
			}
		} else {
			statusDot.className = 'status-indicator inactive';
			statusText.textContent = 'Inactive';
		}
	});
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM loaded');
	const button = document.getElementById('actionButton');
	if (button) {
		console.log('Button found, adding listener');
		button.addEventListener('click', handleButtonClick);
	} else {
		console.error('Button not foundx!');
	}

	// Update status indicator on load
	updateStatusIndicator();
});
