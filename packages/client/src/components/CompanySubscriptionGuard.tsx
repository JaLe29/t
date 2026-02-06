import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { useCompanySubscriptionGuard } from '../hooks/useCompanySubscriptionGuard';

interface CompanySubscriptionGuardProps {
	teamId: string | null | undefined;
	companyId: string | null | undefined;
	children: ReactNode;
	onSubscribe?: () => void;
	onUnsubscribe?: () => void;
	isSubscribing?: boolean;
}

export const CompanySubscriptionGuard = ({
	teamId,
	companyId,
	children,
	onSubscribe,
	onUnsubscribe,
	isSubscribing = false,
}: CompanySubscriptionGuardProps) => {
	const { hasSubscription, isLoading } = useCompanySubscriptionGuard(teamId, companyId);

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
						Your team does not have a subscription to this company. Please subscribe to access company details
						and emails.
					</p>
					<div className="flex gap-4 justify-center">
						<Link
							to="/companies"
							className="text-primary hover:text-primary/80 underline"
						>
							Back to companies
						</Link>
						{teamId && companyId && onSubscribe && (
							<Button
								type="button"
								variant="primary"
								size="sm"
								onClick={onSubscribe}
								disabled={isSubscribing}
							>
								Subscribe to Company
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Pokud MÁ subscription, renderujeme children (detail)
	return <>{children}</>;
};
