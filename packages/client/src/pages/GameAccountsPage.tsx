import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Dropdown } from '../components/ui/Dropdown';
import { Input } from '../components/ui/Input';
import { NationIcon } from '../components/ui/NationIcon';
import { trpc } from '../utils/trpc';

export const GameAccountsPage = () => {
	const [selectedGameworldId, setSelectedGameworldId] = useState<string>('');
	const [playerQuery, setPlayerQuery] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	const { data: gameworlds, isLoading: isLoadingGameworlds } = trpc.gameworld.getActive.useQuery();

	const { data: players, isLoading: isLoadingPlayers } = trpc.gameAccount.searchPlayers.useQuery(
		{
			gameworldId: selectedGameworldId,
			query: playerQuery,
		},
		{
			enabled: selectedGameworldId !== '' && playerQuery.length > 0,
		},
	);

	const utils = trpc.useUtils();
	const { data: accounts, isLoading: isLoadingAccounts } = trpc.gameAccount.list.useQuery();

	const createAccount = trpc.gameAccount.create.useMutation({
		onSuccess: () => {
			setPlayerQuery('');
			setSelectedGameworldId('');
			setShowSuggestions(false);
			utils.gameAccount.list.invalidate();
		},
	});

	const deleteAccount = trpc.gameAccount.delete.useMutation({
		onSuccess: () => {
			utils.gameAccount.list.invalidate();
			setDeleteModalOpen(false);
			setAccountToDelete(null);
		},
	});

	const handleDeleteClick = (accountId: string) => {
		setAccountToDelete(accountId);
		setDeleteModalOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (accountToDelete) {
			deleteAccount.mutate({ id: accountToDelete });
		}
	};

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node) &&
				!(event.target as HTMLElement).closest('input')
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handlePlayerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPlayerQuery(value);
		setShowSuggestions(value.length > 0);
	};

	const handlePlayerSelect = (playerName: string) => {
		setPlayerQuery(playerName);
		setShowSuggestions(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedGameworldId || !playerQuery.trim()) {
			return;
		}

		createAccount.mutate({
			gameworldId: selectedGameworldId,
			playerName: playerQuery.trim(),
		});
	};

	return (
		<Layout>
			<div className="p-6 max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Game Accounts</h1>

				{/* Existing Accounts List */}
				{(() => {
					if (isLoadingAccounts) {
						return (
							<div className="card-glass p-6 mb-6">
								<div className="text-gray-500">Loading accounts...</div>
							</div>
						);
					}
					if (accounts && accounts.length > 0) {
						return (
							<div className="card-glass p-6 mb-6">
								<h2 className="text-xl font-semibold text-gray-800 mb-4">Your Accounts</h2>
								<div className="space-y-3">
									{accounts.map(account => (
										<div
											key={account.id}
											className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
										>
											<div className="flex-1">
												<div className="font-medium text-gray-900">{account.gameworld.name}</div>
												<div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
													<span>Player: {account.playerName || 'Unknown'}</span>
													{'playerTribeId' in account && account.playerTribeId && (
														<NationIcon tribeId={account.playerTribeId} size="md" />
													)}
												</div>
												<div className="text-xs text-gray-500 mt-1">
													Created: {new Date(account.createdAt).toLocaleDateString()}
												</div>
											</div>
											<button
												type="button"
												onClick={() => handleDeleteClick(account.id)}
												disabled={deleteAccount.isPending}
												className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
											>
												Delete
											</button>
										</div>
									))}
								</div>
							</div>
						);
					}
					return null;
				})()}

				{/* Add New Account Form */}
				<div className="card-glass p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Gameworld Selection */}
						<Dropdown
							label="Select active world"
							options={
								gameworlds?.map(gameworld => ({
									value: gameworld.id,
									label: gameworld.name,
								})) || []
							}
							value={selectedGameworldId}
							onChange={value => {
								setSelectedGameworldId(value);
								setPlayerQuery('');
								setShowSuggestions(false);
							}}
							placeholder="-- Select world --"
							disabled={createAccount.isPending}
							isLoading={isLoadingGameworlds}
							required
							searchable
							searchPlaceholder="Search world..."
						/>

						{/* Player Autocomplete */}
						{selectedGameworldId && (
							<div className="relative">
								<Input
									label="Account name"
									type="text"
									value={playerQuery}
									onChange={handlePlayerInputChange}
									onFocus={() => {
										if (playerQuery.length > 0) {
											setShowSuggestions(true);
										}
									}}
									disabled={createAccount.isPending}
									placeholder="Start typing player name..."
									required
									error={createAccount.error?.message}
								/>

								{/* Suggestions Dropdown */}
								{showSuggestions && playerQuery.length > 0 && (
									<div
										ref={suggestionsRef}
										className="absolute z-10 w-full mt-1 bg-glass-strong border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
									>
										{(() => {
											if (isLoadingPlayers) {
												return <div className="p-3 text-sm text-gray-500">Loading...</div>;
											}
											if (players && players.length > 0) {
												return (
													<ul className="py-1">
														{players.map(player => (
															<li
																key={player.id}
																className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-2"
																onMouseDown={e => {
																	e.preventDefault();
																	handlePlayerSelect(player.name);
																}}
															>
																<span>{player.name}</span>
																{player.tribeId && <NationIcon tribeId={player.tribeId} size="md" />}
															</li>
														))}
													</ul>
												);
											}
											return (
												<div className="p-3 text-sm text-gray-500">
													No players found
												</div>
											);
										})()}
									</div>
								)}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={
								!selectedGameworldId ||
								!playerQuery.trim() ||
								createAccount.isPending ||
								isLoadingGameworlds
							}
							className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{createAccount.isPending ? 'Creating account...' : 'Create account'}
						</button>
					</form>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={deleteModalOpen}
				onClose={() => {
					setDeleteModalOpen(false);
					setAccountToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Account"
				message="Are you sure you want to delete this account? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				confirmVariant="danger"
				isLoading={deleteAccount.isPending}
			/>
		</Layout>
	);
};
