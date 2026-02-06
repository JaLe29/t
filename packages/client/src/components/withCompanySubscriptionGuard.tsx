import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { useCompanySubscriptionGuard } from '../hooks/useCompanySubscriptionGuard';
import { trpc } from '../utils/trpc';

const CURRENT_TEAM_KEY = 'currentTeamId';

export const withCompanySubscriptionGuard = <P extends object>(Component: ComponentType<P>) => {
	return (props: P) => {
		const { id: companyId } = useParams<{ id: string }>();
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

		const { hasSubscription, isLoading, refetch: refetchSubscriptionCheck } =
			useCompanySubscriptionGuard(currentTeamId, companyId);

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

		// Loading state
		if (isLoading) {
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

		// Pokud NEMÁ subscription, zobrazíme zprávu s tlačítkem
		if (!hasSubscription) {
			return (
				<div className="p-8 max-w-7xl mx-auto">
					<div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
						<p className="text-gray-500 mb-4">
							Your team does not have a subscription to this company. Please subscribe to access company
							details and emails.
						</p>
						<div className="flex gap-4 justify-center">
							<Link
								to="/companies"
								className="text-primary hover:text-primary/80 underline"
							>
								Back to companies
							</Link>
							{currentTeamId && companyId && (
								<Button
									type="button"
									variant="primary"
									size="sm"
									onClick={() => {
										subscribeToCompany.mutate({
											teamId: currentTeamId,
											companyId,
										});
									}}
									disabled={subscribeToCompany.isPending}
								>
									Subscribe to Company
								</Button>
							)}
						</div>
					</div>
				</div>
			);
		}

		// Pokud MÁ subscription, renderujeme původní komponentu
		return <Component {...props} />;
	};
};
