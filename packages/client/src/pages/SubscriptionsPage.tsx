import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { type RouterOutput, trpc } from '../utils/trpc';

const CURRENT_TEAM_KEY = 'currentTeamId';

type CategorySubscription = RouterOutput['team']['listCategorySubscriptions'][number];
type CompanySubscription = RouterOutput['team']['listCompanySubscriptions'][number];

export const SubscriptionsPage = () => {
	const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

	const { data: teams } = trpc.team.list.useQuery();

	useEffect(() => {
		const teamId = localStorage.getItem(CURRENT_TEAM_KEY);
		if (teamId) {
			setCurrentTeamId(teamId);
		} else if (teams && teams.length > 0 && teams[0]) {
			setCurrentTeamId(teams[0].id);
		}
	}, [teams]);

	useEffect(() => {
		const handleTeamChange = () => {
			setCurrentTeamId(localStorage.getItem(CURRENT_TEAM_KEY));
		};

		window.addEventListener('teamChanged', handleTeamChange);
		return () => {
			window.removeEventListener('teamChanged', handleTeamChange);
		};
	}, []);

	const currentTeam = teams?.find(t => t.id === currentTeamId) || (teams && teams.length > 0 ? teams[0] : undefined);

	const { data: categorySubscriptions, isLoading: isLoadingCategories } =
		trpc.team.listCategorySubscriptions.useQuery({ teamId: currentTeamId || '' }, { enabled: !!currentTeamId });

	const { data: companySubscriptions, isLoading: isLoadingCompanies } = trpc.team.listCompanySubscriptions.useQuery(
		{ teamId: currentTeamId || '' },
		{ enabled: !!currentTeamId },
	);

	const utils = trpc.useUtils();

	const unsubscribeFromCategory = trpc.team.unsubscribeFromCategory.useMutation({
		onSuccess: async () => {
			await utils.team.listCategorySubscriptions.invalidate({ teamId: currentTeamId || '' });
		},
	});

	const unsubscribeFromCompany = trpc.team.unsubscribeFromCompany.useMutation({
		onSuccess: async () => {
			await utils.team.listCompanySubscriptions.invalidate({ teamId: currentTeamId || '' });
		},
	});

	const subscribeToCategory = trpc.team.subscribeToCategory.useMutation({
		onSuccess: async () => {
			await utils.team.listCategorySubscriptions.invalidate({ teamId: currentTeamId || '' });
		},
	});

	const subscribeToCompany = trpc.team.subscribeToCompany.useMutation({
		onSuccess: async () => {
			await utils.team.listCompanySubscriptions.invalidate({ teamId: currentTeamId || '' });
		},
	});

	const { data: allCategories } = trpc.company.listCategories.useQuery();
	const { data: allCompanies } = trpc.company.list.useQuery();

	const subscribedCategoryIds = new Set(categorySubscriptions?.map(sub => sub.categoryId) || []);
	const subscribedCompanyIds = new Set(companySubscriptions?.map(sub => sub.companyId) || []);

	const availableCategories = allCategories?.filter(cat => !subscribedCategoryIds.has(cat.id)) || [];
	const availableCompanies = allCompanies?.filter(comp => !subscribedCompanyIds.has(comp.id)) || [];

	if (!teams || teams.length === 0) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
					<p className="text-gray-500">You are not a member of any teams yet.</p>
				</div>
			</div>
		);
	}

	if (!currentTeam) {
		return (
			<div className="p-8 max-w-7xl mx-auto">
				<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
					<p className="text-gray-500">Please select a team to view subscriptions.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
						<p className="text-gray-600">
							View subscriptions for <span className="font-semibold">{currentTeam.name}</span>
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Category Subscriptions */}
				<div className="bg-white border border-gray-200 rounded-lg">
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">Category Subscriptions</h2>
						<p className="text-sm text-gray-500 mt-1">Categories your team is subscribed to</p>
					</div>
					{/* Available Categories to Subscribe */}
					{currentTeamId && availableCategories.length > 0 && (
						<div className="p-6 border-b border-gray-200 bg-gray-50">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">Available Categories</h3>
							<div className="space-y-2">
								{availableCategories.map(category => (
									<div
										key={category.id}
										className="p-3 border border-gray-200 rounded-lg bg-white flex items-center justify-between gap-3"
									>
										<span className="font-medium text-gray-900 text-sm">{category.name}</span>
										<Button
											variant="primary"
											size="sm"
											onClick={() => {
												subscribeToCategory.mutate({
													teamId: currentTeamId,
													categoryId: category.id,
												});
											}}
											disabled={subscribeToCategory.isPending}
										>
											Subscribe
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="p-6">
						{isLoadingCategories && (
							<div className="space-y-3">
								<div className="h-16 bg-gray-100 animate-pulse rounded" />
								<div className="h-16 bg-gray-100 animate-pulse rounded" />
							</div>
						)}
						{!isLoadingCategories && categorySubscriptions && categorySubscriptions.length > 0 && (
							<div className="space-y-3">
								{categorySubscriptions.map((subscription: CategorySubscription) => (
									<div
										key={subscription.id}
										className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
									>
										<div className="flex items-center justify-between gap-3">
											<div className="flex-1 min-w-0">
												<h3 className="font-medium text-gray-900 truncate">
													{subscription.category.name}
												</h3>
												<p className="text-xs text-gray-500 mt-1">
													Subscribed {dayjs(subscription.createdAt).format('DD.MM.YYYY')}
												</p>
											</div>
											{currentTeamId && (
												<Button
													variant="danger"
													size="sm"
													onClick={e => {
														e.stopPropagation();
														if (
															confirm(
																`Are you sure you want to unsubscribe from "${subscription.category.name}"?`,
															)
														) {
															unsubscribeFromCategory.mutate({
																teamId: currentTeamId,
																categoryId: subscription.category.id,
															});
														}
													}}
													disabled={unsubscribeFromCategory.isPending}
												>
													Unsubscribe
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						)}
						{!isLoadingCategories && (!categorySubscriptions || categorySubscriptions.length === 0) && (
							<div className="text-center py-8">
								<p className="text-gray-500">No category subscriptions yet.</p>
								<p className="text-sm text-gray-400 mt-2">
									Subscribe to categories from the{' '}
									<Link to="/companies" className="text-primary hover:underline">
										Companies page
									</Link>
									.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Company Subscriptions */}
				<div className="bg-white border border-gray-200 rounded-lg">
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">Company Subscriptions</h2>
						<p className="text-sm text-gray-500 mt-1">Companies your team is subscribed to</p>
					</div>
					{/* Available Companies to Subscribe */}
					{currentTeamId && availableCompanies.length > 0 && (
						<div className="p-6 border-b border-gray-200 bg-gray-50">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">Available Companies</h3>
							<div className="space-y-2 max-h-64 overflow-y-auto">
								{availableCompanies.map(company => (
									<div
										key={company.id}
										className="p-3 border border-gray-200 rounded-lg bg-white flex items-center justify-between gap-3"
									>
										<div className="flex-1 min-w-0">
											<span className="font-medium text-gray-900 text-sm block truncate">
												{company.name}
											</span>
											{company.title && (
												<span className="text-xs text-gray-500 block truncate">
													{company.title}
												</span>
											)}
										</div>
										<Button
											variant="primary"
											size="sm"
											onClick={() => {
												subscribeToCompany.mutate({
													teamId: currentTeamId,
													companyId: company.id,
												});
											}}
											disabled={subscribeToCompany.isPending}
										>
											Subscribe
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="p-6">
						{isLoadingCompanies && (
							<div className="space-y-3">
								<div className="h-16 bg-gray-100 animate-pulse rounded" />
								<div className="h-16 bg-gray-100 animate-pulse rounded" />
							</div>
						)}
						{!isLoadingCompanies && companySubscriptions && companySubscriptions.length > 0 && (
							<div className="space-y-3">
								{companySubscriptions.map((subscription: CompanySubscription) => (
									<div
										key={subscription.id}
										className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
										style={{ borderColor: 'inherit' }}
										onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a5c400'; }}
										onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
									>
										<div className="flex items-center justify-between gap-3">
											<Link
												to={`/companies/${subscription.company.id}`}
												className="flex-1 min-w-0 flex items-center gap-3"
											>
												<div className="flex-1 min-w-0">
													<h3 className="font-medium text-gray-900 truncate">
														{subscription.company.name}
													</h3>
													{subscription.company.title && (
														<p className="text-sm text-gray-500 truncate mt-1">
															{subscription.company.title}
														</p>
													)}
													<p className="text-xs text-gray-400 mt-1">
														Subscribed {dayjs(subscription.createdAt).format('DD.MM.YYYY')}
													</p>
												</div>
												<svg
													className="w-5 h-5 text-gray-400 flex-shrink-0"
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
											</Link>
											{currentTeamId && (
												<Button
													variant="danger"
													size="sm"
													onClick={e => {
														e.stopPropagation();
														if (
															confirm(
																`Are you sure you want to unsubscribe from "${subscription.company.name}"?`,
															)
														) {
															unsubscribeFromCompany.mutate({
																teamId: currentTeamId,
																companyId: subscription.company.id,
															});
														}
													}}
													disabled={unsubscribeFromCompany.isPending}
												>
													Unsubscribe
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						)}
						{!isLoadingCompanies && (!companySubscriptions || companySubscriptions.length === 0) && (
							<div className="text-center py-8">
								<p className="text-gray-500">No company subscriptions yet.</p>
								<p className="text-sm text-gray-400 mt-2">
									Subscribe to companies from the{' '}
									<Link to="/companies" className="text-primary hover:underline">
										Companies page
									</Link>
									.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
