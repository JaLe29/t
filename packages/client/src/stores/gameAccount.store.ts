import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ACTIVE_GAME_ACCOUNT_STORAGE_KEY = 'activeGameAccountId';

interface GameAccountStore {
	activeAccountId: string | null;
	setActiveAccountId: (accountId: string | null) => void;
}

export const useGameAccountStore = create<GameAccountStore>()(
	persist(
		set => ({
			activeAccountId: null,
			setActiveAccountId: accountId => {
				set({ activeAccountId: accountId });
			},
		}),
		{
			name: ACTIVE_GAME_ACCOUNT_STORAGE_KEY,
		},
	),
);
