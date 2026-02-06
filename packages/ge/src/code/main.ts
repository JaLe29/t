/** biome-ignore-all lint/suspicious/noConsole: xxx */
console.log('Extension loaded - script is running!');

function handleButtonClick() {
	console.log('Button clicked!');
	alert('Button clicked! Check console for logx.');
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
});
