const token = 't_00722bbbbbf8036ab3d87aa12effaa30db2c139f1e3c6a88676800b9a39ee41a';
const url = 'https://t.jale.cz/api/event';

export const sendRequest = async (body: any) => {
	try {
		const response = await fetch(url, {
			headers: {
				'x-token': `${token}`,
				'content-type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify(body),
		});
		return response;
	} catch (error) {
		console.error('Error sending request:', error);
		throw error;
	}
};
