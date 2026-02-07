import type React from 'react';
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { UnitIcon } from '../ui/UnitIcon';
import dayjs from 'dayjs';

interface HistoryDataPoint {
	date: string;
	units: number[];
	total: number;
	villages: Record<string, number[]>;
}

interface Village {
	villageId: string;
	name: string;
}

interface ArmyGrowthChartProps {
	tribeId: string | null;
	history: HistoryDataPoint[];
	villages: Village[];
}

const UNIT_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// Barvy pro jednotlivé jednotky
const unitColors = [
	'#3b82f6', // blue
	'#10b981', // green
	'#f59e0b', // amber
	'#ef4444', // red
	'#8b5cf6', // purple
	'#ec4899', // pink
	'#06b6d4', // cyan
	'#84cc16', // lime
	'#f97316', // orange
	'#6366f1', // indigo
	'#14b8a6', // teal
];

// Vlastní label s ikonou jednotky
const UnitIconLabel: React.FC<{ x?: number; y?: number; value?: number; unitIndex: number; tribeId: string | null }> = ({
	x,
	y,
	value,
	unitIndex,
	tribeId,
}) => {
	if (x === undefined || y === undefined || !value || value === 0) {
		return null;
	}

	return (
		<foreignObject x={x - 10} y={y - 20} width={20} height={20}>
			<div className="flex items-center justify-center">
				<UnitIcon tribeId={tribeId} unitIndex={unitIndex} size="sm" />
			</div>
		</foreignObject>
	);
};

export const ArmyGrowthChart: React.FC<ArmyGrowthChartProps> = ({ tribeId, history, villages }) => {
	const [selectedUnits, setSelectedUnits] = useState<Set<number>>(new Set(UNIT_INDICES));
	const [selectedVillages, setSelectedVillages] = useState<Set<string>>(new Set(villages.map(v => v.villageId)));

	// Filtrovat data podle vybraných jednotek a vesnic
	const filteredHistory = useMemo(() => {
		return history.map(point => {
			// Projít všechny vybrané vesnice a sečíst pouze vybrané jednotky
			const filteredUnits = Array(11).fill(0);

			for (const [villageId, villageUnits] of Object.entries(point.villages)) {
				// Zahrnout pouze vybrané vesnice
				if (selectedVillages.has(villageId)) {
					// Zajistit správnou délku pole
					const units = Array.isArray(villageUnits) ? villageUnits : [];
					const paddedUnits = [...units];
					while (paddedUnits.length < 11) {
						paddedUnits.push(0);
					}
					const finalUnits = paddedUnits.slice(0, 11);

					// Přidat pouze vybrané jednotky
					for (let i = 0; i < 11; i++) {
						if (selectedUnits.has(i)) {
							filteredUnits[i] += finalUnits[i] || 0;
						}
					}
				}
			}

			// Vypočítat celkový součet pouze vybraných jednotek
			const total = Array.from(selectedUnits).reduce((sum, unitIndex) => {
				return sum + (filteredUnits[unitIndex] || 0);
			}, 0);

			return {
				...point,
				units: filteredUnits,
				total,
			};
		});
	}, [history, selectedUnits, selectedVillages]);

	// Transformovat data pro recharts
	const chartData = useMemo(() => {
		return filteredHistory.map(point => {
			const dataPoint: Record<string, string | number> = {
				date: dayjs(point.date).format('DD.MM'),
				fullDate: point.date,
			};

			// Přidat data pro každý typ jednotky (pouze vybrané)
			UNIT_INDICES.forEach((unitIndex) => {
				if (selectedUnits.has(unitIndex)) {
					dataPoint[`unit${unitIndex}`] = point.units[unitIndex] || 0;
				} else {
					dataPoint[`unit${unitIndex}`] = 0;
				}
			});

			// Použít celkový součet z filtrovaných dat
			dataPoint.total = point.total;

			return dataPoint;
		});
	}, [filteredHistory, selectedUnits]);

	// Vlastní tooltip s ikonami jednotek
	const CustomTooltip = ({ active, payload }: any) => {
		if (!active || !payload || payload.length === 0) {
			return null;
		}

		const data = payload[0]?.payload;
		if (!data) {
			return null;
		}

		// Vypočítat součet pouze vybraných jednotek
		const selectedTotal = Array.from(selectedUnits).reduce((sum, unitIndex) => {
			const value = data[`unit${unitIndex}`] as number;
			return sum + (value || 0);
		}, 0);

		return (
			<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]">
				<p className="font-semibold text-gray-900 mb-2 text-sm">
					{dayjs(data.fullDate).format('DD.MM.YYYY')}
				</p>
				<div className="space-y-1">
					{Array.from(selectedUnits).map((unitIndex) => {
						const value = data[`unit${unitIndex}`] as number;
						if (value === 0) return null;
						return (
							<div key={unitIndex} className="flex items-center gap-2 text-xs">
								<UnitIcon tribeId={tribeId} unitIndex={unitIndex} size="sm" />
								<span className="text-gray-700 font-medium">{value.toLocaleString()}</span>
							</div>
						);
					})}
					<div className="pt-2 mt-2 border-t border-gray-200">
						<span className="text-gray-900 font-bold text-sm">
							Total: {selectedTotal.toLocaleString()}
						</span>
					</div>
				</div>
			</div>
		);
	};

	const toggleUnit = (unitIndex: number) => {
		const newSet = new Set(selectedUnits);
		if (newSet.has(unitIndex)) {
			newSet.delete(unitIndex);
		} else {
			newSet.add(unitIndex);
		}
		setSelectedUnits(newSet);
	};

	const toggleVillage = (villageId: string) => {
		const newSet = new Set(selectedVillages);
		if (newSet.has(villageId)) {
			newSet.delete(villageId);
		} else {
			newSet.add(villageId);
		}
		setSelectedVillages(newSet);
	};

	const selectAllUnits = () => {
		setSelectedUnits(new Set(UNIT_INDICES));
	};

	const deselectAllUnits = () => {
		setSelectedUnits(new Set());
	};

	const selectAllVillages = () => {
		setSelectedVillages(new Set(villages.map(v => v.villageId)));
	};

	const deselectAllVillages = () => {
		setSelectedVillages(new Set());
	};

	if (history.length === 0) {
		return (
			<div className="card-glass p-6">
				<p className="text-gray-600 text-center">No historical data to display</p>
			</div>
		);
	}

	return (
		<div className="card-glass p-6">
			<h2 className="text-xl font-bold text-gray-900 mb-4">Army Growth</h2>

			{/* Filters */}
			<div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Unit Filters */}
				<div className="border border-gray-200 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-gray-900">Units</h3>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={selectAllUnits}
								className="text-xs text-primary hover:underline"
							>
								All
							</button>
							<button
								type="button"
								onClick={deselectAllUnits}
								className="text-xs text-gray-500 hover:underline"
							>
								None
							</button>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{UNIT_INDICES.map((unitIndex) => {
							const hasData = history.some(point => (point.units[unitIndex] || 0) > 0);
							if (!hasData) return null;

							return (
								<button
									key={unitIndex}
									type="button"
									onClick={() => toggleUnit(unitIndex)}
									className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${
										selectedUnits.has(unitIndex)
											? 'bg-primary/10 border-primary text-primary'
											: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
									}`}
								>
									<UnitIcon tribeId={tribeId} unitIndex={unitIndex} size="sm" />
								</button>
							);
						})}
					</div>
				</div>

				{/* Village Filters */}
				<div className="border border-gray-200 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-gray-900">Villages</h3>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={selectAllVillages}
								className="text-xs text-primary hover:underline"
							>
								All
							</button>
							<button
								type="button"
								onClick={deselectAllVillages}
								className="text-xs text-gray-500 hover:underline"
							>
								None
							</button>
						</div>
					</div>
					<div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
						{villages.map((village) => (
							<button
								key={village.villageId}
								type="button"
								onClick={() => toggleVillage(village.villageId)}
								className={`px-2 py-1 rounded border text-xs transition-colors ${
									selectedVillages.has(village.villageId)
										? 'bg-primary/10 border-primary text-primary'
										: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
							>
								{village.name}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className="w-full" style={{ height: '350px' }}>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
						<XAxis
							dataKey="date"
							stroke="#6b7280"
							fontSize={11}
							tick={{ fill: '#6b7280' }}
							interval="preserveStartEnd"
						/>
						<YAxis
							stroke="#6b7280"
							fontSize={11}
							tick={{ fill: '#6b7280' }}
							tickFormatter={(value) => value.toLocaleString()}
							width={60}
						/>
						<Tooltip content={<CustomTooltip />} />
						{Array.from(selectedUnits).map((unitIndex) => {
							const hasData = filteredHistory.some(point => (point.units[unitIndex] || 0) > 0);
							if (!hasData) return null;

							return (
								<Line
									key={unitIndex}
									type="monotone"
									dataKey={`unit${unitIndex}`}
									stroke={unitColors[unitIndex]}
									strokeWidth={2}
									dot={false}
									activeDot={{ r: 4, fill: unitColors[unitIndex] }}
									name={`Unit ${unitIndex + 1}`}
								/>
							);
						})}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};
