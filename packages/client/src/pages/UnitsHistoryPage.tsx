import { ArmyGrowthChart } from '../components/features/ArmyGrowthChart';
import { useGameAccountStore } from '../stores/gameAccount.store';
import { trpc } from '../utils/trpc';

export const UnitsHistoryPage = () => {
	const { activeAccountId } = useGameAccountStore();
	const { data: unitsHistoryData, isLoading: isLoadingHistory } = trpc.gameAccount.getUnitsHistory.useQuery(
		{
			gameAccountId: activeAccountId!,
			days: 30,
		},
		{
			enabled: !!activeAccountId,
		},
	);

	if (!activeAccountId) {
		return (
			<div className="card-glass p-6">
				<p className="text-gray-600">Please select an active game account to view units history.</p>
			</div>
		);
	}

	return (
		<>
			{isLoadingHistory && (
				<div className="card-glass p-6">
					<div className="text-gray-500">Loading units history...</div>
				</div>
			)}

			{!isLoadingHistory && unitsHistoryData && unitsHistoryData.history.length > 0 && (
				<ArmyGrowthChart
					tribeId={unitsHistoryData.tribeId}
					history={unitsHistoryData.history}
					villages={unitsHistoryData.villages}
				/>
			)}

			{!isLoadingHistory && unitsHistoryData && unitsHistoryData.history.length === 0 && (
				<div className="card-glass p-6">
					<p className="text-gray-600 text-center">No historical data available.</p>
				</div>
			)}
		</>
	);
};
