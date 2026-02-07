import type React from 'react';

export interface Column<T> {
	key: string;
	header: string;
	render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	onRowClick?: (item: T) => void;
	emptyMessage?: string;
	isLoading?: boolean;
	selectedIds?: Set<string>;
	onSelectChange?: (id: string, selected: boolean) => void;
	onSelectAll?: (selected: boolean) => void;
}

export function DataTable<T extends { id: string }>({
	data,
	columns,
	onRowClick,
	emptyMessage = 'No data available',
	isLoading = false,
	selectedIds,
	onSelectChange,
	onSelectAll,
}: DataTableProps<T>) {
	const hasSelection = selectedIds !== undefined && onSelectChange !== undefined;
	const allSelected = hasSelection && data.length > 0 && data.every(item => selectedIds.has(item.id));
	const someSelected = hasSelection && data.some(item => selectedIds?.has(item.id));
	if (isLoading) {
		return (
			<div className="bg-white border border-mail-gray-200 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-mail-gray-50 border-b border-mail-gray-200">
							<tr>
								{hasSelection && (
									<th className="px-4 py-3 w-12">
										<div className="h-4 w-4 bg-mail-gray-100 animate-pulse rounded" />
									</th>
								)}
								{columns.map(column => (
									<th
										key={column.key}
										className="px-4 py-3 text-left text-xs font-medium text-mail-gray-700 uppercase tracking-wider"
									>
										{column.header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-mail-gray-200">
							{Array.from({ length: 5 }).map(() => {
								const rowId = Math.random().toString(36).substring(2, 11);
								return (
									<tr key={rowId}>
										{hasSelection && (
											<td className="px-4 py-3">
												<div className="h-4 w-4 bg-mail-gray-100 animate-pulse rounded" />
											</td>
										)}
										{columns.map(column => (
											<td key={`${rowId}-${column.key}`} className="px-4 py-3">
												<div className="h-4 bg-mail-gray-100 animate-pulse rounded" />
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="bg-white border border-mail-gray-200 rounded-lg p-12 text-center">
				<p className="text-mail-gray-500">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="bg-white border border-mail-gray-200 rounded-lg overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-mail-gray-50 border-b border-mail-gray-200">
						<tr>
							{hasSelection && (
								<th className="px-4 py-3 w-12">
									<input
										type="checkbox"
										checked={allSelected}
										ref={input => {
											if (input) {
												input.indeterminate = someSelected && !allSelected;
											}
										}}
										onChange={e => {
											e.stopPropagation();
											onSelectAll?.(e.target.checked);
										}}
										className="w-4 h-4 text-mail-primary bg-gray-100 border-gray-300 rounded focus:ring-mail-primary focus:ring-2"
									/>
								</th>
							)}
							{columns.map(column => (
								<th
									key={column.key}
									className="px-4 py-3 text-left text-xs font-medium text-mail-gray-700 uppercase tracking-wider"
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-mail-gray-200">
						{data.map(item => {
							const isSelected = selectedIds?.has(item.id) ?? false;
							return (
								<tr
									key={item.id}
									onClick={() => onRowClick?.(item)}
									className={`${onRowClick ? 'cursor-pointer hover:bg-mail-gray-50 transition-colors' : ''} ${isSelected ? 'bg-mail-primary/5' : ''}`}
								>
									{hasSelection && (
										<td
											className="px-4 py-3"
											onClick={e => {
												e.stopPropagation();
												onSelectChange(item.id, !isSelected);
											}}
										>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={e => {
													e.stopPropagation();
													onSelectChange(item.id, e.target.checked);
												}}
												className="w-4 h-4 text-mail-primary bg-gray-100 border-gray-300 rounded focus:ring-mail-primary focus:ring-2 cursor-pointer"
											/>
										</td>
									)}
									{columns.map(column => (
										<td key={column.key} className="px-4 py-3 text-sm text-mail-gray-900">
											{column.render(item)}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
