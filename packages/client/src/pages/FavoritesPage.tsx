import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmailModal } from '../components/ui/EmailModal';
import { type RouterOutput, trpc } from '../utils/trpc';

type FavoriteEmail = RouterOutput['favorite']['list'][number];

type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

const viewportConfigs: Record<ViewportMode, { width: string; height: string; label: string }> = {
	mobile: { width: '375px', height: '667px', label: 'Mobile' },
	tablet: { width: '768px', height: '1024px', label: 'Tablet' },
	desktop: { width: '1280px', height: '800px', label: 'Desktop' },
	fullscreen: { width: '100%', height: '800px', label: 'Fullscreen' },
};

export const FavoritesPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('search') || '';
	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
	const [isFullscreenView, setIsFullscreenView] = useState(false);

	const handleCloseEmailModal = () => {
		setIsEmailModalOpen(false);
		setSelectedEmailId(null);
		setViewportMode('desktop');
	};

	const [localSearch, setLocalSearch] = useState(searchQuery);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const {
		data: favorites,
		isLoading,
		isFetching,
	} = trpc.favorite.list.useQuery(
		{
			search: searchQuery || undefined,
		},
		{
			keepPreviousData: true,
		},
	);

	// Sync localSearch with URL params when they change (e.g., browser back/forward)
	useEffect(() => {
		setLocalSearch(searchQuery);
	}, [searchQuery]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const handleSearchChange = (value: string) => {
		setLocalSearch(value);

		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new timer to update URL after user stops typing
		debounceTimerRef.current = setTimeout(() => {
			const newParams = new URLSearchParams(searchParams);
			if (value) {
				newParams.set('search', value);
			} else {
				newParams.delete('search');
			}
			setSearchParams(newParams, { replace: true });
		}, 300);
	};

	const handleClearSearch = () => {
		handleSearchChange('');
	};

	// Find email account message ID for selected email
	const selectedFavorite = favorites?.find(f => f.emailAccountMessage.emailId === selectedEmailId);
	const emailAccountMessageId = selectedFavorite?.emailAccountMessage.id;

	const { data: emailHtml, isLoading: isLoadingHtml } = trpc.company.getEmailHtml.useQuery(
		{
			emailId: selectedEmailId || '',
			emailAccountMessageId,
			companyId: selectedFavorite?.emailAccountMessage.companyId || '',
			teamId: '', // Not needed for favorites
		},
		{ enabled: !!selectedEmailId && isEmailModalOpen && !!emailAccountMessageId },
	);

	if (isLoading && !favorites) {
		return (
			<div className="p-8">
				<div className="space-y-4">
					<div className="h-8 w-48 bg-mail-gray-100 animate-pulse rounded" />
					<div className="space-y-2">
						<div className="h-16 bg-mail-gray-100 animate-pulse rounded" />
						<div className="h-16 bg-mail-gray-100 animate-pulse rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-mail-gray-900 mb-2">Favorite Emails</h1>
				<p className="text-sm sm:text-base text-mail-gray-600">
					{favorites && favorites.length > 0
						? `Found ${favorites.length} ${favorites.length === 1 ? 'favorite email' : 'favorite emails'}`
						: 'Your favorite emails will appear here'}
				</p>
			</div>

			{/* Search */}
			<div className="mb-4 sm:mb-6">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
						<svg
							className="h-4 w-4 sm:h-5 sm:w-5 text-mail-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<input
						type="text"
						placeholder="Search favorites..."
						value={localSearch}
						onChange={e => handleSearchChange(e.target.value)}
						className={`w-full pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm sm:text-base border border-mail-gray-300 rounded-lg focus:ring-2 focus:ring-mail-primary/20 focus:border-mail-primary transition-all shadow-sm hover:shadow-md focus:shadow-md outline-none text-mail-gray-900 placeholder-mail-gray-400 ${
							localSearch ? 'pr-10' : 'pr-4'
						}`}
					/>
					{localSearch && !isFetching && (
						<button
							type="button"
							onClick={handleClearSearch}
							className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-mail-gray-400 hover:text-mail-gray-600 transition-colors"
							aria-label="Clear search"
						>
							<svg
								className="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
					{isFetching && localSearch && (
						<div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
							<svg
								className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-mail-primary"
								fill="none"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
					)}
				</div>
			</div>

			{favorites && favorites.length > 0 ? (
				<div className="bg-white border border-mail-gray-200 rounded-lg divide-y divide-mail-gray-200">
					{favorites.map(favorite => (
						<FavoriteEmailItem
							key={favorite.id}
							favorite={favorite}
							onClick={() => {
								setSelectedEmailId(favorite.emailAccountMessage.emailId);
								setIsEmailModalOpen(true);
							}}
						/>
					))}
				</div>
			) : (
				<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
					<p className="text-mail-gray-500">
						{searchQuery ? 'No favorites match your search criteria.' : 'No favorite emails yet.'}
					</p>
				</div>
			)}

			{/* Email Preview Modal */}
			{isFullscreenView && emailHtml?.html && (
				<div className="fixed inset-0 z-50 bg-white flex flex-col">
					<div className="border-b border-mail-gray-200 px-6 py-4 flex items-center justify-between bg-white">
						<h1 className="text-xl font-bold text-mail-gray-900">Email Preview</h1>
						<div className="flex items-center gap-4">
							<div className="flex gap-2">
								{(['mobile', 'tablet', 'desktop', 'fullscreen'] as ViewportMode[]).map(mode => (
									<Button
										key={mode}
										type="button"
										variant={viewportMode === mode ? 'primary' : 'ghost'}
										size="sm"
										onClick={() => setViewportMode(mode)}
										className="text-xs"
									>
										{viewportConfigs[mode].label}
									</Button>
								))}
							</div>
							<Button type="button" variant="ghost" size="sm" onClick={() => setIsFullscreenView(false)}>
								Exit Fullscreen
							</Button>
						</div>
					</div>
					<div className="flex-1 overflow-auto bg-mail-gray-100 p-4 flex items-center justify-center">
						<div className="border border-mail-gray-200 rounded-lg overflow-hidden bg-mail-gray-100 shadow-lg">
							{viewportMode !== 'fullscreen' && (
								<div className="bg-mail-gray-200 px-4 py-2 flex items-center justify-center border-b border-mail-gray-300">
									<div className="flex items-center gap-2 text-xs text-mail-gray-600">
										<span className="w-2 h-2 bg-red-500 rounded-full" />
										<span className="w-2 h-2 bg-yellow-500 rounded-full" />
										<span className="w-2 h-2 bg-green-500 rounded-full" />
										<span className="ml-2">
											{viewportConfigs[viewportMode].width} ×{' '}
											{viewportConfigs[viewportMode].height}
										</span>
									</div>
								</div>
							)}
							<div
								className={`${viewportMode === 'fullscreen' ? 'w-full' : 'mx-auto'} bg-white`}
								style={
									viewportMode !== 'fullscreen'
										? {
												width: viewportConfigs[viewportMode].width,
												height: viewportConfigs[viewportMode].height,
												maxHeight: '90vh',
												overflow: 'auto',
											}
										: { height: 'calc(100vh - 80px)' }
								}
							>
								<iframe
									srcDoc={emailHtml.html}
									title="Email Preview"
									className="w-full h-full border-0"
									style={{ minHeight: viewportMode === 'fullscreen' ? 'calc(100vh - 80px)' : '100%' }}
									sandbox="allow-same-origin"
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{!isFullscreenView && (
				<EmailModal
					isOpen={isEmailModalOpen}
					onClose={handleCloseEmailModal}
					emailHtml={emailHtml?.html}
					isLoadingHtml={isLoadingHtml}
					viewportMode={viewportMode}
					onViewportModeChange={setViewportMode}
					onFullscreen={() => setIsFullscreenView(true)}
				/>
			)}
		</div>
	);
};

const FavoriteEmailItem = ({
	favorite,
	onClick,
}: {
	favorite: FavoriteEmail;
	onClick: () => void;
}) => {
	const utils = trpc.useUtils();
	const removeFavorite = trpc.favorite.remove.useMutation({
		onSuccess: () => {
			utils.favorite.list.invalidate();
		},
	});

	const handleRemoveFavorite = (e: React.MouseEvent) => {
		e.stopPropagation();
		removeFavorite.mutate({ emailAccountMessageId: favorite.emailAccountMessage.id });
	};

	return (
		<div className="flex items-start gap-2 p-6 hover:bg-mail-gray-50 transition-colors">
			<button type="button" onClick={onClick} className="flex-1 text-left">
				<div className="flex items-start justify-between mb-2">
					<h3 className="font-semibold text-mail-gray-900 text-lg">
						{favorite.emailAccountMessage.subject || (
							<span className="text-mail-gray-400">(no subject)</span>
						)}
					</h3>
				</div>
				<div className="text-sm text-mail-gray-600 mb-2">
					From: {favorite.emailAccountMessage.from || '(unknown)'}
				</div>
				{favorite.emailAccountMessage.company && (
					<div className="text-sm text-mail-gray-500 mb-2">
						Company: {favorite.emailAccountMessage.company.name}
					</div>
				)}
				<div className="text-xs text-mail-gray-400">
					{favorite.emailAccountMessage.emailAccount.user}@{favorite.emailAccountMessage.emailAccount.host} •{' '}
					{dayjs(favorite.emailAccountMessage.createdAt).format('DD.MM.YYYY HH:mm:ss')} • Added{' '}
					{dayjs(favorite.createdAt).format('DD.MM.YYYY')}
				</div>
			</button>
			<button
				type="button"
				onClick={handleRemoveFavorite}
				className="p-2 hover:bg-mail-gray-100 rounded-lg transition-colors flex-shrink-0"
				aria-label="Remove from favorites"
				disabled={removeFavorite.isPending}
			>
				<svg
					className="w-5 h-5 text-yellow-500 fill-yellow-500"
					fill="currentColor"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
					/>
				</svg>
			</button>
		</div>
	);
};
