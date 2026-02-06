import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmailModal } from '../components/ui/EmailModal';
import { useCompanySubscriptionGuard } from '../hooks/useCompanySubscriptionGuard';
import { type RouterOutput, trpc } from '../utils/trpc';

type EmailAccountMessage = RouterOutput['company']['listEmailAccountMessages'][number];

const CURRENT_TEAM_KEY = 'currentTeamId';

type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

const viewportConfigs: Record<ViewportMode, { width: string; height: string; label: string }> = {
	mobile: { width: '375px', height: '667px', label: 'Mobile' },
	tablet: { width: '768px', height: '1024px', label: 'Tablet' },
	desktop: { width: '1280px', height: '800px', label: 'Desktop' },
	fullscreen: { width: '100%', height: '800px', label: 'Fullscreen' },
};

const EmailListItem = ({ message, onClick }: { message: EmailAccountMessage; onClick: () => void }) => {
	const { data: isFavoriteData } = trpc.favorite.isFavorite.useQuery({
		emailAccountMessageId: message.id,
	});
	const isFavorite = isFavoriteData?.isFavorite ?? false;

	const utils = trpc.useUtils();
	const addFavorite = trpc.favorite.add.useMutation({
		onSuccess: () => {
			utils.favorite.isFavorite.invalidate({ emailAccountMessageId: message.id });
			utils.favorite.list.invalidate();
		},
	});
	const removeFavorite = trpc.favorite.remove.useMutation({
		onSuccess: () => {
			utils.favorite.isFavorite.invalidate({ emailAccountMessageId: message.id });
			utils.favorite.list.invalidate();
		},
	});

	const handleFavoriteToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFavorite) {
			removeFavorite.mutate({ emailAccountMessageId: message.id });
		} else {
			addFavorite.mutate({ emailAccountMessageId: message.id });
		}
	};

	return (
		<div className="flex items-start gap-2 p-6 hover:bg-mail-gray-50 transition-colors">
			<button type="button" onClick={onClick} className="flex-1 text-left">
				<div className="flex items-start justify-between mb-2">
					<h3 className="font-semibold text-mail-gray-900 text-lg">
						{message.subject || <span className="text-mail-gray-400">(no subject)</span>}
					</h3>
				</div>
				<div className="text-sm text-mail-gray-600 mb-2">From: {message.from || '(unknown)'}</div>
				<div className="text-xs text-mail-gray-400">
					{message.emailAccount.user}@{message.emailAccount.host} •{' '}
					{dayjs(message.createdAt).format('DD.MM.YYYY HH:mm:ss')}
				</div>
			</button>
			<button
				type="button"
				onClick={handleFavoriteToggle}
				className="p-2 hover:bg-mail-gray-100 rounded-lg transition-colors flex-shrink-0"
				aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
				disabled={addFavorite.isPending || removeFavorite.isPending}
			>
				<svg
					className={`w-5 h-5 transition-colors ${
						isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-mail-gray-400'
					}`}
					fill={isFavorite ? 'currentColor' : 'none'}
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

export const CompanyDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
	const [isFullscreenView, setIsFullscreenView] = useState(false);

	const handleCloseEmailModal = () => {
		setIsEmailModalOpen(false);
		setSelectedEmailId(null);
		setViewportMode('desktop');
	};

	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
	const { data: teams } = trpc.team.list.useQuery();

	useEffect(() => {
		const teamId = localStorage.getItem(CURRENT_TEAM_KEY);
		if (teamId) {
			setCurrentTeamId(teamId);
		} else if (teams && teams.length > 0 && teams[0]) {
			setCurrentTeamId(teams[0].id);
		}
		const handleTeamChange = () => {
			const newTeamId = localStorage.getItem(CURRENT_TEAM_KEY);
			if (newTeamId) {
				setCurrentTeamId(newTeamId);
			} else if (teams && teams.length > 0 && teams[0]) {
				setCurrentTeamId(teams[0].id);
			}
		};
		window.addEventListener('teamChanged', handleTeamChange);
		return () => {
			window.removeEventListener('teamChanged', handleTeamChange);
		};
	}, [teams]);

	// Kontrola subscription - zobrazí se v headeru
	const { hasSubscription, isLoading: isLoadingSubscriptionCheck, refetch: refetchSubscriptionCheck } =
		useCompanySubscriptionGuard(currentTeamId, id);

	const { refetch: refetchCompanySubscriptions } = trpc.team.listCompanySubscriptions.useQuery(
		{ teamId: currentTeamId || '' },
		{ enabled: false },
	);

	const subscribeToCompany = trpc.team.subscribeToCompany.useMutation({
		onSuccess: async () => {
			await refetchCompanySubscriptions();
			await refetchSubscriptionCheck();
		},
	});

	const unsubscribeFromCompany = trpc.team.unsubscribeFromCompany.useMutation({
		onSuccess: async () => {
			await refetchCompanySubscriptions();
			await refetchSubscriptionCheck();
		},
	});

	// Vždy načteme company data (bez subscription check) - potřebujeme pro header
	const { data: company, isLoading } = trpc.company.get.useQuery(
		{ companyId: id || '' },
		{
			enabled: !!id,
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		},
	);

	// Emaily načteme pouze pokud má subscription
	const { data: emailAccountMessages } = trpc.company.listEmailAccountMessages.useQuery(
		{ companyId: id || '', teamId: currentTeamId || '' },
		{
			enabled: !!id && !!currentTeamId && !isLoadingSubscriptionCheck && hasSubscription,
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		},
	);

	const { data: emailHtml, isLoading: isLoadingHtml } = trpc.company.getEmailHtml.useQuery(
		{
			emailId: selectedEmailId || '',
			emailAccountMessageId: selectedEmailId
				? emailAccountMessages?.find(m => m.emailId === selectedEmailId)?.id
				: undefined,
			companyId: id || '',
			teamId: currentTeamId || '',
		},
		{ enabled: !!selectedEmailId && isEmailModalOpen && !!currentTeamId && !!id },
	);

	if (!currentTeamId) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
					<p className="text-mail-gray-500 mb-4">Please select a team first</p>
					<Link to="/teams" className="underline" style={{ color: '#a5c400' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#00BC00'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#a5c400'; }}>
						Go to teams
					</Link>
				</div>
			</div>
		);
	}

	if (!currentTeamId) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
					<p className="text-mail-gray-500 mb-4">Please select a team first</p>
					<Link to="/teams" className="underline" style={{ color: '#a5c400' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#00BC00'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#a5c400'; }}>
						Go to teams
					</Link>
				</div>
			</div>
		);
	}

	if (isLoading || isLoadingSubscriptionCheck) {
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

	if (!company) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
					<p className="text-mail-gray-500 mb-4">Company not found</p>
					<Link to="/companies" className="underline" style={{ color: '#a5c400' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#00BC00'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#a5c400'; }}>
						Back to companies
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			{/* HEADER - vždy zobrazen s názvem společnosti a stavem subscription */}
			<div className="mb-6">
				<Link
					to="/companies"
					className="text-sm mb-4 inline-block underline"
					style={{ color: '#a5c400' }}
					onMouseEnter={(e) => { e.currentTarget.style.color = '#00BC00'; }}
					onMouseLeave={(e) => { e.currentTarget.style.color = '#a5c400'; }}
				>
					← Back to companies
				</Link>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-mail-gray-900 mb-2">{company.name}</h1>
						<p className="text-mail-gray-600 mb-4">{company.title}</p>

						{company.categories && company.categories.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-6">
								{company.categories.map(category => (
									<span
										key={category.id}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-mail-primary/10 text-mail-primary border border-mail-primary/20"
									>
										{category.name}
									</span>
								))}
							</div>
						)}
					</div>
					{currentTeamId && (
						<Button
							type="button"
							variant={hasSubscription ? 'danger' : 'primary'}
							size="sm"
							onClick={() => {
								if (hasSubscription) {
									unsubscribeFromCompany.mutate({
										teamId: currentTeamId,
										companyId: id || '',
									});
								} else {
									subscribeToCompany.mutate({
										teamId: currentTeamId,
										companyId: id || '',
									});
								}
							}}
							disabled={subscribeToCompany.isPending || unsubscribeFromCompany.isPending}
						>
							{hasSubscription ? 'Unsubscribe' : 'Subscribe'}
						</Button>
					)}
				</div>
			</div>

			<div className="mb-6">
				<h2 className="text-xl font-semibold text-mail-gray-900 mb-4">
					Email Messages ({emailAccountMessages?.length || 0})
				</h2>
			</div>

			{/* Pokud NEMÁ subscription, zobrazíme zprávu místo emailů */}
			{!hasSubscription && (
				<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
					<p className="text-mail-gray-500 mb-4">
						Your team does not have a subscription to this company. Please subscribe to access company emails.
					</p>
					{currentTeamId && id && (
						<Button
							type="button"
							variant="primary"
							size="md"
							onClick={() => {
								subscribeToCompany.mutate({
									teamId: currentTeamId,
									companyId: id,
								});
							}}
							disabled={subscribeToCompany.isPending}
						>
							Subscribe to Company
						</Button>
					)}
				</div>
			)}

			{/* Pokud MÁ subscription, zobrazíme emaily */}
			{hasSubscription && emailAccountMessages && emailAccountMessages.length > 0 && (
				<div className="bg-white border border-mail-gray-200 rounded-lg divide-y divide-mail-gray-200">
					{emailAccountMessages.map(message => (
						<EmailListItem
							key={message.id}
							message={message}
							onClick={() => {
								setSelectedEmailId(message.emailId);
								setIsEmailModalOpen(true);
							}}
						/>
					))}
				</div>
			)}

			{hasSubscription && (!emailAccountMessages || emailAccountMessages.length === 0) && (
				<div className="bg-white border border-mail-gray-200 rounded-lg p-8 text-center">
					<p className="text-mail-gray-500">No email messages found for this company.</p>
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
