const token = 't_00722bbbbbf8036ab3d87aa12effaa30db2c139f1e3c6a88676800b9a39ee41a';

export const sendRequest = async (url: string, body: any) => {
	const response = await fetch(url, {
		headers: {
			'x-token': `${token}`,
			'content-type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	return response;
};
