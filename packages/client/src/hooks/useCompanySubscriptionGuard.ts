import { trpc } from '../utils/trpc';

export const useCompanySubscriptionGuard = (
	teamId: string | null | undefined,
	companyId: string | null | undefined,
) => {
	const {
		data: hasSubscription,
		isLoading: isLoadingSubscriptionCheck,
		refetch: refetchSubscriptionCheck,
	} = trpc.team.checkCompanySubscription.useQuery(
		{ teamId: teamId || '', companyId: companyId || '' },
		{
			enabled: !!teamId && !!companyId,
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: 30000, // Cache na 30 sekund
		},
	);

	return {
		hasSubscription: hasSubscription === true,
		isLoading: isLoadingSubscriptionCheck,
		refetch: refetchSubscriptionCheck,
	};
};
