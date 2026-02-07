import { useMemo } from 'react';
import { UnitIcon } from '../components/ui/UnitIcon';
import { useGameAccountStore } from '../stores/gameAccount.store';
import { trpc } from '../utils/trpc';
import dayjs from 'dayjs';

export const UnitsOverviewPage = () => {
	const { activeAccountId } = useGameAccountStore();
	const { data: unitsData, isLoading } = trpc.gameAccount.getUnits.useQuery(
		{
			gameAccountId: activeAccountId!,
		},
		{
			enabled: !!activeAccountId,
		},
	);

	const UNIT_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

	// Vypočítat součty jednotek
	const totals = useMemo(() => {
		if (!unitsData || unitsData.villages.length === 0) {
			return Array(11).fill(0);
		}

		const sums = Array(11).fill(0);
		for (const village of unitsData.villages) {
			for (let i = 0; i < village.units.length && i < 11; i++) {
				sums[i] += village.units[i] || 0;
			}
		}
		return sums;
	}, [unitsData]);

	// Najít nejnovější datum aktualizace
	const lastUpdateDate = useMemo(() => {
		if (!unitsData || unitsData.villages.length === 0) {
			return null;
		}

		const dates = unitsData.villages
			.map(v => v.unitsUpdatedAt)
			.filter((date): date is Date => date !== null);

		if (dates.length === 0) {
			return null;
		}

		return new Date(Math.max(...dates.map(d => d.getTime())));
	}, [unitsData]);

	if (!activeAccountId) {
		return (
			<div className="card-glass p-6">
				<p className="text-gray-600">Please select an active game account to view units.</p>
			</div>
		);
	}

	return (
		<>
			{isLoading && (
				<div className="card-glass p-6">
					<div className="text-gray-500">Loading units...</div>
				</div>
			)}

			{!isLoading && unitsData && unitsData.villages.length === 0 && (
				<div className="card-glass p-6">
					<p className="text-gray-600">No villages with units found.</p>
				</div>
			)}

			{!isLoading && unitsData && unitsData.villages.length > 0 && (
				<div className="card-glass overflow-x-auto">
					<table className="w-full border-collapse text-sm">
						<thead>
							<tr className="bg-gray-100">
								<th className="text-left px-2 py-1.5 border-b border-gray-200 font-semibold text-gray-700 text-xs">
									Village Name
								</th>
								{UNIT_INDICES.map(unitIndex => (
									<th
										key={`unit-header-${unitIndex}`}
										className="px-1 py-1.5 border-b border-gray-200 text-center"
									>
										<UnitIcon
											tribeId={unitsData.tribeId}
											unitIndex={unitIndex}
											size="sm"
											className="mx-auto"
										/>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{unitsData.villages.map((village, villageIndex) => (
								<tr
									key={village.villageId}
									className={villageIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
								>
									<td className="px-2 py-1.5 border-b border-gray-200">
										<span className="font-medium text-gray-900 text-xs">{village.name}</span>
									</td>
									{UNIT_INDICES.map(unitIndex => {
										const count = village.units[unitIndex] || 0;
										return (
											<td
												key={`${village.villageId}-unit-${unitIndex}`}
												className="px-1 py-1.5 border-b border-gray-200 text-center text-gray-900 text-sm"
											>
												{count}
											</td>
										);
									})}
								</tr>
							))}
							{/* Total row */}
							<tr className="bg-gray-100 font-bold">
								<td className="px-2 py-1.5 border-b border-gray-300 text-gray-900 text-xs">Total</td>
								{UNIT_INDICES.map(unitIndex => (
									<td
										key={`total-unit-type-${unitIndex}`}
										className="px-1 py-1.5 border-b border-gray-300 text-center text-gray-900 text-sm"
									>
										{totals[unitIndex]}
									</td>
								))}
							</tr>
						</tbody>
					</table>
					{lastUpdateDate && (
						<div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
							Last updated: {dayjs(lastUpdateDate).format('DD.MM.YYYY HH:mm')}
						</div>
					)}
				</div>
			)}
		</>
	);
};
