import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { type RouterOutput, trpc } from '../utils/trpc';

type CompanyListOutput = RouterOutput['company']['list'][number];

const CURRENT_TEAM_KEY = 'currentTeamId';

export const CompaniesPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('search') || '';
	const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];

	const {
		data: companies,
		isLoading,
		isFetching,
	} = trpc.company.list.useQuery(
		{
			search: searchQuery || undefined,
			categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
		},
		{
			keepPreviousData: true,
		},
	);
	const { data: categories } = trpc.company.listCategories.useQuery();

	const [localSearch, setLocalSearch] = useState(searchQuery);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
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

	const { data: companySubscriptions, refetch: refetchCompanySubscriptions } =
		trpc.team.listCompanySubscriptions.useQuery({ teamId: currentTeamId || '' }, { enabled: !!currentTeamId });

	const { data: categorySubscriptions, refetch: refetchCategorySubscriptions } =
		trpc.team.listCategorySubscriptions.useQuery({ teamId: currentTeamId || '' }, { enabled: !!currentTeamId });

	const subscribeToCompany = trpc.team.subscribeToCompany.useMutation({
		onSuccess: async () => {
			await refetchCompanySubscriptions();
		},
	});

	const unsubscribeFromCompany = trpc.team.unsubscribeFromCompany.useMutation({
		onSuccess: async () => {
			await refetchCompanySubscriptions();
		},
	});

	const subscribeToCategory = trpc.team.subscribeToCategory.useMutation({
		onSuccess: async () => {
			await refetchCategorySubscriptions();
		},
	});

	const unsubscribeFromCategory = trpc.team.unsubscribeFromCategory.useMutation({
		onSuccess: async () => {
			await refetchCategorySubscriptions();
		},
	});

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

	const handleCategoryToggle = (categoryId: string) => {
		const newParams = new URLSearchParams(searchParams);
		const currentCategories = newParams.get('categories')?.split(',').filter(Boolean) || [];
		const isSelected = currentCategories.includes(categoryId);

		if (isSelected) {
			const updated = currentCategories.filter(id => id !== categoryId);
			if (updated.length > 0) {
				newParams.set('categories', updated.join(','));
			} else {
				newParams.delete('categories');
			}
		} else {
			newParams.set('categories', [...currentCategories, categoryId].join(','));
		}

		setSearchParams(newParams, { replace: true });
	};

	if (isLoading && !companies) {
		return (
			<div className="p-8">
				<div className="space-y-4">
					<div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
					<div className="space-y-2">
						<div className="h-16 bg-gray-100 animate-pulse rounded" />
						<div className="h-16 bg-gray-100 animate-pulse rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Companies</h1>
				<p className="text-sm sm:text-base text-gray-600">
					{companies && companies.length > 0
						? `Found ${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`
						: 'Browse companies and their emails'}
				</p>
			</div>

			{/* Search and Filters */}
			<div className="mb-4 sm:mb-6 space-y-4">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
						<svg
							className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
						placeholder="Search companies..."
						value={localSearch}
						onChange={e => handleSearchChange(e.target.value)}
						className={`w-full pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:shadow-md focus:shadow-md outline-none text-gray-900 placeholder-gray-400 ${
							localSearch ? 'pr-10' : 'pr-4'
						}`}
					/>
					{localSearch && !isFetching && (
						<button
							type="button"
							onClick={handleClearSearch}
							className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
								className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-primary"
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

				{categories && categories.length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-2 sm:mb-3">
							<label className="block text-xs sm:text-sm font-medium text-gray-700">
								Filter by Category
							</label>
							{currentTeamId && (
								<span className="text-xs text-gray-500">
									Click category to filter, right-click to subscribe
								</span>
							)}
						</div>
						<div className="flex flex-wrap gap-2">
							{categories.map(category => {
								const isSelected = selectedCategories.includes(category.id);
								const isSubscribed = categorySubscriptions?.some(sub => sub.categoryId === category.id);
								return (
									<button
										key={category.id}
										type="button"
										onClick={() => handleCategoryToggle(category.id)}
										onContextMenu={e => {
											if (currentTeamId) {
												e.preventDefault();
												if (isSubscribed) {
													unsubscribeFromCategory.mutate({
														teamId: currentTeamId,
														categoryId: category.id,
													});
												} else {
													subscribeToCategory.mutate({
														teamId: currentTeamId,
														categoryId: category.id,
													});
												}
											}
										}}
										className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
											isSelected
												? 'bg-primary text-white border-2 border-primary shadow-md hover:shadow-lg'
												: ''
										} ${
											!isSelected && isSubscribed
												? 'bg-primary/20 text-primary border-2 border-primary/50'
												: ''
										} ${
											!isSelected && !isSubscribed
												? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary hover:shadow-md'
												: ''
										}`}
										style={!isSelected && isSubscribed ? { borderColor: 'rgba(165, 196, 0, 0.5)' } : undefined}
										onMouseEnter={!isSelected && isSubscribed ? (e) => { e.currentTarget.style.borderColor = '#a5c400'; } : undefined}
										onMouseLeave={!isSelected && isSubscribed ? (e) => { e.currentTarget.style.borderColor = 'rgba(165, 196, 0, 0.5)'; } : undefined}
									>
										{category.name}
										{isSubscribed && (
											<svg
												className="ml-1.5 w-3 h-3"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{companies && companies.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{companies.map((company: CompanyListOutput) => {
						const isSubscribed = companySubscriptions?.some(sub => sub.companyId === company.id);
						return (
							<div
								key={company.id}
								className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
							>
								<Link to={`/companies/${company.id}`} className="flex-1">
									<div className="mb-3">
										<h3 className="font-semibold text-gray-900 text-lg mb-1">
											{company.name}
										</h3>
										<p className="text-sm text-gray-500">{company.title}</p>
									</div>

									{company.categories && company.categories.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-4">
											{company.categories.map(category => (
												<span
													key={category.id}
													className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
												>
													{category.name}
												</span>
											))}
										</div>
									)}

									<div className="mt-4 pt-4 border-t border-gray-200">
										<p className="text-xs text-gray-400">Click to view details →</p>
									</div>
								</Link>
								{currentTeamId && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										<Button
											type="button"
											variant={isSubscribed ? 'danger' : 'primary'}
											size="sm"
											className="w-full"
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												if (isSubscribed) {
													unsubscribeFromCompany.mutate({
														teamId: currentTeamId,
														companyId: company.id,
													});
												} else {
													subscribeToCompany.mutate({
														teamId: currentTeamId,
														companyId: company.id,
													});
												}
											}}
											disabled={subscribeToCompany.isPending || unsubscribeFromCompany.isPending}
										>
											{isSubscribed ? 'Unsubscribe' : 'Subscribe'}
										</Button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
					<p className="text-gray-500">
						{searchQuery || selectedCategories.length > 0
							? 'No companies match your search criteria.'
							: 'No companies found.'}
					</p>
				</div>
			)}
		</div>
	);
};
