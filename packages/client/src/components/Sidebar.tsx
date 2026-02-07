import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameAccountStore } from '../stores/gameAccount.store';
import { trpc } from '../utils/trpc';
import { NationIcon } from './ui/NationIcon';
import { useSession } from '../utils/auth';

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

export const Sidebar = ({ isOpen, onToggle, onClose }: SidebarProps) => {
	const location = useLocation();
	const { data: session } = useSession();
	const [isGameAccountMenuOpen, setIsGameAccountMenuOpen] = useState(false);
	const [isUnitsMenuOpen, setIsUnitsMenuOpen] = useState(() => {
		// Auto-expand if on units page
		return location.pathname.startsWith('/units');
	});
	const gameAccountMenuRef = useRef<HTMLDivElement>(null);

	const { activeAccountId, setActiveAccountId } = useGameAccountStore();
	const { data: accounts, isLoading: isLoadingAccounts } = trpc.gameAccount.list.useQuery(
		undefined,
		{
			enabled: !!session,
		},
	);

	// Close game account menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				gameAccountMenuRef.current &&
				!gameAccountMenuRef.current.contains(event.target as Node)
			) {
				setIsGameAccountMenuOpen(false);
			}
		};

		if (isGameAccountMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isGameAccountMenuOpen]);

	// Set active account from localStorage on mount if accounts are loaded
	useEffect(() => {
		if (accounts && accounts.length > 0 && !activeAccountId) {
			const savedAccountId = localStorage.getItem('activeGameAccountId');
			if (savedAccountId) {
				const accountExists = accounts.some(acc => acc.id === savedAccountId);
				if (accountExists) {
					setActiveAccountId(savedAccountId);
				} else {
					// If saved account doesn't exist, set first account as active
					setActiveAccountId(accounts[0]?.id || null);
				}
			} else {
				// No saved account, set first account as active
				setActiveAccountId(accounts[0]?.id || null);
			}
		}
	}, [accounts, activeAccountId, setActiveAccountId]);

	// Auto-expand Units menu when on units page
	useEffect(() => {
		if (location.pathname.startsWith('/units')) {
			setIsUnitsMenuOpen(true);
		}
	}, [location.pathname]);

	const activeAccount = accounts?.find(acc => acc.id === activeAccountId);

	const isActive = (path: string) => {
		if (path === '/units') {
			return location.pathname.startsWith('/units');
		}
		return location.pathname === path;
	};

	const isUnitsSubActive = (path: string) => location.pathname === path;

	// Mobile backdrop with fade animation
	const backdrop = (
		<div
			className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
				isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
			onClick={onClose}
			aria-hidden="true"
		/>
	);

	// Always render sidebar for animations to work
	return (
		<>
			{backdrop}
			<aside
				className={`bg-glass fixed md:relative left-0 top-0 h-full border-r border-gray-200 flex flex-col z-50 md:z-auto transition-all duration-300 ease-out shadow-xl md:shadow-none ${
					isOpen ? 'translate-x-0 w-full md:w-64' : '-translate-x-full md:translate-x-0 w-0 md:w-12'
				}`}
			>
				{!isOpen && (
					<div className="hidden md:flex flex-col h-full min-h-0">
						<button
							type="button"
							onClick={onToggle}
							className="p-3 hover:bg-gray-50 transition-colors"
							aria-label="Open sidebar"
						>
							<svg
								className="w-6 h-6 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				)}
				{isOpen && (
					<>
						{/* Game Account Selector */}
						{session && accounts && accounts.length > 0 && (
							<div ref={gameAccountMenuRef} className="px-2 pt-4 pb-2 border-b border-gray-200">
								<div className="relative">
									<button
										type="button"
										onClick={() => setIsGameAccountMenuOpen(!isGameAccountMenuOpen)}
										className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
									>
										{activeAccount && 'playerTribeId' in activeAccount && activeAccount.playerTribeId && (
											<NationIcon tribeId={activeAccount.playerTribeId} size="sm" />
										)}
										<div className="flex-1 min-w-0 text-left">
											<div className="text-sm font-medium text-gray-900 truncate">
												{(() => {
													if (!activeAccount) {
														return 'Vyberte účet';
													}
													if (activeAccount.playerName) {
														return `${activeAccount.gameworld.name} - ${activeAccount.playerName}`;
													}
													return activeAccount.gameworld.name;
												})()}
											</div>
										</div>
										<svg
											className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
												isGameAccountMenuOpen ? 'rotate-180' : ''
											}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Toggle game account menu"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>

									{/* Game Account Dropdown Menu */}
									{isGameAccountMenuOpen && (
										<div className="absolute left-0 right-0 mt-1 bg-glass-strong rounded-lg shadow-xl border border-gray-200 z-20 max-h-64 overflow-y-auto">
											<div className="py-1">
												<div className="px-4 py-2 border-b border-gray-200">
													<p className="text-xs font-semibold text-gray-500 uppercase">Game Accounts</p>
												</div>
												{isLoadingAccounts && (
													<div className="px-4 py-2 text-sm text-gray-500">Načítání...</div>
												)}
												{!isLoadingAccounts && accounts.length === 0 && (
													<div className="px-4 py-2 text-sm text-gray-500">Žádné účty</div>
												)}
												{!isLoadingAccounts && accounts.length > 0 &&
													accounts.map(account => (
														<button
															type="button"
															key={account.id}
															onClick={() => {
																setActiveAccountId(account.id);
																setIsGameAccountMenuOpen(false);
															}}
															className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
																activeAccountId === account.id
																	? 'bg-primary/10 text-primary font-medium'
																	: 'text-gray-700 hover:bg-gray-100'
															}`}
														>
															{'playerTribeId' in account && account.playerTribeId && (
																<NationIcon tribeId={account.playerTribeId} size="sm" />
															)}
															<div className="flex-1 min-w-0">
																<div className="font-medium truncate">{account.gameworld.name}</div>
																{account.playerName && (
																	<div className="text-xs text-gray-500 truncate">
																		{account.playerName}
																	</div>
																)}
															</div>
															{activeAccountId === account.id && (
																<svg
																	className="w-4 h-4 text-primary flex-shrink-0"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																	role="img"
																	aria-label="Aktivní účet"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M5 13l4 4L19 7"
																	/>
																</svg>
															)}
														</button>
													))}
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Navigation */}
						<nav className="flex-1 overflow-y-auto py-4">
							<div className="px-2 space-y-6">
								{/* Main Navigation */}
								<div>
									<p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Navigation
									</p>
									<div className="space-y-1">
										<Link
											to="/game-accounts"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/game-accounts')
													? 'bg-primary/10 text-primary'
													: 'text-gray-700 hover:bg-gray-50'
											}`}
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
												/>
											</svg>
											Game Accounts
										</Link>
										{/* Units with submenu */}
										<div>
											<button
												type="button"
												onClick={() => setIsUnitsMenuOpen(!isUnitsMenuOpen)}
												className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
													isActive('/units')
														? 'bg-primary/10 text-primary'
														: 'text-gray-700 hover:bg-gray-50'
												}`}
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												<span className="flex-1 text-left">Units</span>
												<svg
													className={`w-4 h-4 transition-transform ${isUnitsMenuOpen ? 'rotate-90' : ''}`}
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</button>
											{isUnitsMenuOpen && (
												<div className="ml-4 mt-1 space-y-1">
													<Link
														to="/units/overview"
														className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
															isUnitsSubActive('/units/overview')
																? 'bg-primary/10 text-primary font-medium'
																: 'text-gray-600 hover:bg-gray-50'
														}`}
													>
														<span>Overview</span>
													</Link>
													<Link
														to="/units/history"
														className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
															isUnitsSubActive('/units/history')
																? 'bg-primary/10 text-primary font-medium'
																: 'text-gray-600 hover:bg-gray-50'
														}`}
													>
														<span>History</span>
													</Link>
												</div>
											)}
										</div>
									</div>
								</div>


								{/* Account */}
								<div>
									<p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Account
									</p>
									<div className="space-y-1">
										<Link
											to="/profile"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/profile')
													? 'bg-primary/10 text-primary'
													: 'text-gray-700 hover:bg-gray-50'
											}`}
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
											Profile
										</Link>
										<Link
											to="/tokens"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/tokens')
													? 'bg-primary/10 text-primary'
													: 'text-gray-700 hover:bg-gray-50'
											}`}
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
												/>
											</svg>
											Tokens
										</Link>
									</div>
								</div>
							</div>
						</nav>
						<div className="py-2 px-3 border-t border-gray-200 flex justify-end">
							<button
								type="button"
								onClick={onToggle}
								className="p-1 hover:bg-gray-100 rounded transition-colors"
								aria-label="Close sidebar"
							>
								<svg
									className="w-5 h-5 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
						</div>
					</>
				)}
			</aside>
		</>
	);
};
