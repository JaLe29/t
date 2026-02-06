// Types for payload service
export interface ApiResponse {
	url: string;
	status: number;
	data: unknown;
	method?: string;
}

// Types for Player service
export interface Coordinates {
	x: string;
	y: string;
}

export interface ResourceMap {
	'1': string | number;
	'2': string | number;
	'3': string | number;
	'4': string | number;
}

export interface TributeProductionDetail {
	'1': number;
	'2': number;
	'3': number;
	'4': number;
}

export interface Tributes {
	'1': number;
	'2': number;
	'3': number;
	'4': number;
}

export interface Stars {
	bronze: number;
	silver: number;
	gold: number;
}

export interface Village {
	villageId: string;
	playerId: string;
	name: string;
	tribeId: string;
	belongsToKing: string;
	belongsToKingdom: number | string;
	type: string;
	population: string;
	coordinates: Coordinates;
	isMainVillage: boolean;
	isTown: boolean;
	isActive: boolean;
	treasuresUsable: string;
	treasures: string;
	protectionGranted: string;
	tributeCollectorPlayerId: number;
	realTributePercent: number;
	supplyBuildings: string;
	supplyTroops: string;
	production: ResourceMap;
	storage: {
		'1': number;
		'2': number;
		'3': number;
		'4': number;
	};
	treasury: ResourceMap;
	storageCapacity: ResourceMap;
	usedControlPoints: string;
	availableControlPoints: string;
	culturePoints: number;
	celebrationType: string;
	celebrationEnd: string;
	culturePointProduction: string;
	treasureResourceBonus: string;
	acceptance: number;
	acceptanceProduction: string;
	healingTentCapacity: string;
	tributes: Tributes;
	tributesCapacity: string;
	tributeTreasures: number;
	tributeProduction: number;
	tributeProductionWithCrop: number;
	tributeProductionDetail: TributeProductionDetail;
	tributeTime: string;
	tributesRequiredToFetch: number;
	estimatedWarehouseLevel: number;
	allowTributeCollection: string;
	tributesDisabledReason: string;
}

export interface PlayerPayload {
	playerId: string;
	name: string;
	tribeId: string;
	kingdomId: string;
	kingdomTag: string;
	kingdomRole: string;
	isKing: boolean;
	kingId: string;
	kingstatus: string;
	villages: Village[];
	population: string;
	active: string;
	prestige: number;
	level: number;
	stars: Stars;
	nextLevelPrestige: number;
	hasNoobProtection: boolean;
	filterInformation: boolean;
	signupTime: string;
	vacationState: string;
	uiLimitations: string;
	gold: string;
	silver: string;
	deletionTime: string;
	coronationDuration: number;
	brewCelebration: string;
	uiStatus: string;
	hintStatus: string;
	spawnedOnMap: string;
	isActivated: string;
	isInstant: string;
	productionBonusTime: string;
	cropProductionBonusTime: string;
	premiumFeatureAutoExtendFlags: string;
	plusAccountTime: string;
	limitedPremiumFeatureFlags: string;
	lastPaymentTime: string;
	isPunished: boolean;
	limitationFlags: string;
	limitation: string;
	isBannedFromMessaging: boolean;
	bannedFromMessaging: string;
	questVersion: string;
	nextDailyQuestTime: number;
	dailyQuestsExchanged: string;
	avatarIdentifier: string;
	vacationStateStart: string;
	vacationStateEnd: string;
	usedVacationDays: string;
	halloweenBoostTime: string;
	mayhemBoostTime: string;
	fealtyPoints: string;
	lastFealtyProduction: string;
	fealtyProductionBonusTime: string;
}
