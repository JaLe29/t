export interface TravianApiOptions {
	url: string;
	email: string;
	siteName: string;
	siteUrl: string;
	isPublic: boolean | number | string;
}

export interface RegisterOptions extends TravianApiOptions {}

export interface RegisterResponse {
	apiKey?: string;
	privateApiKey?: string;
	[key: string]: unknown;
}

export interface UpdateSiteDataOptions extends TravianApiOptions {
	privateApiKey: string;
}

export interface UpdateSiteDataResponse {
	[key: string]: unknown;
}

export interface GetMapDataOptions {
	url: string;
	privateApiKey: string;
	date?: string;
}

export interface GameworldData {
	name: string;
	startTime: number;
	speed: number;
	speedTroops: number;
	lastUpdateTime: number;
	date: number;
	version: string;
}

export interface VillageData {
	villageId: string;
	x: string;
	y: string;
	population: string;
	name: string;
	isMainVillage: boolean;
	isCity: boolean;
}

export interface PlayerData {
	playerId: string;
	name: string;
	tribeId?: string;
	kingdomId?: string;
	treasures: number;
	role: number;
	externalLoginToken?: string;
	villages: VillageData[];
}

export interface MapCellData {
	id: string;
	x: string;
	y: string;
	resType: string;
	oasis: string;
	landscape: string;
	kingdomId: string;
}

export interface MapDataStructure {
	radius?: string;
	cells?: MapCellData[];
}

export interface MapData {
	gameworld: GameworldData;
	players: PlayerData[];
	map: MapDataStructure;
	landscapes: Record<string, string>;
}

export type GetMapDataResponse = MapData;

/**
 * Registruje nový API klíč pro Travian API
 */
export async function register(options: RegisterOptions): Promise<RegisterResponse> {
	const url = new URL('/api/external.php', options.url);
	url.searchParams.set('action', 'requestApiKey');
	url.searchParams.set('email', options.email);
	url.searchParams.set('siteName', options.siteName);
	url.searchParams.set('siteUrl', options.siteUrl);
	url.searchParams.set('public', String(options.isPublic));

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as { response?: RegisterResponse; [key: string]: unknown };

	if (!data.response) {
		throw new Error('Invalid response format: missing response field');
	}

	return data.response;
}

/**
 * Aktualizuje data webu v Travian API
 */
export async function updateSiteData(options: UpdateSiteDataOptions): Promise<UpdateSiteDataResponse> {
	const url = new URL('/api/external.php', options.url);
	url.searchParams.set('action', 'updateSiteData');
	url.searchParams.set('privateApiKey', options.privateApiKey);
	url.searchParams.set('email', options.email);
	url.searchParams.set('siteName', options.siteName);
	url.searchParams.set('siteUrl', options.siteUrl);
	url.searchParams.set('public', String(options.isPublic));

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as {
		response?: UpdateSiteDataResponse;
		[key: string]: unknown;
	};

	if (!data.response) {
		throw new Error('Invalid response format: missing response field');
	}

	return data.response;
}

/**
 * Získá map data z Travian API
 */
export async function getMapData(options: GetMapDataOptions): Promise<GetMapDataResponse> {
	const url = new URL('/api/external.php', options.url);
	url.searchParams.set('action', 'getMapData');
	url.searchParams.set('privateApiKey', options.privateApiKey);

	if (options.date) {
		url.searchParams.set('date', options.date);
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as {
		response?: MapData;
		[key: string]: unknown;
	};

	if (!data.response) {
		throw new Error('Invalid response format: missing response field');
	}

	return data.response;
}
