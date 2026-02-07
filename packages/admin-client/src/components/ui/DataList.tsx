import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import type { Column } from './DataTable';
import { DataTable } from './DataTable';

export type { Column };

interface DataListProps<T extends { id: string }> {
	data: T[] | undefined;
	isLoading: boolean;
	isFetching?: boolean;
	columns: Column<T>[];
	searchPlaceholder?: string;
	emptyMessage?: string;
	onSearch?: (search: string) => void;
	onRowClick?: (item: T) => void;
	onCreate?: () => void;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	onBulkDelete?: (ids: string[]) => void;
	createLabel?: string;
	title?: string;
	entityName?: string;
	headerActions?: React.ReactNode;
}

export function DataList<T extends { id: string }>({
	data = [],
	isLoading,
	isFetching = false,
	columns,
	searchPlaceholder = 'Search...',
	emptyMessage = 'No data available',
	onSearch,
	onRowClick,
	onCreate,
	onEdit,
	onDelete,
	onBulkDelete,
	createLabel = 'Create New',
	title,
	entityName = 'item',
	headerActions,
}: DataListProps<T>) {
	const [localSearch, setLocalSearch] = useState('');
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const handleSearchChange = (value: string) => {
		setLocalSearch(value);

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		debounceTimerRef.current = setTimeout(() => {
			onSearch?.(value);
		}, 300);
	};

	const handleClearSearch = () => {
		handleSearchChange('');
	};

	const handleSelectChange = (id: string, selected: boolean) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (selected) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	};

	const handleSelectAll = (selected: boolean) => {
		if (selected) {
			setSelectedIds(new Set(data.map(item => item.id)));
		} else {
			setSelectedIds(new Set());
		}
	};

	const handleBulkDelete = () => {
		if (onBulkDelete && selectedIds.size > 0) {
			onBulkDelete(Array.from(selectedIds));
			setSelectedIds(new Set());
		}
	};

	// Add action column if edit or delete is provided
	const tableColumns: Column<T>[] = [
		...columns,
		...(onEdit || onDelete
			? [
					{
						key: 'actions',
						header: 'Actions',
						render: (item: T) => (
							<div className="flex gap-2">
								{onEdit && (
									<Button
										size="sm"
										variant="ghost"
										onClick={e => {
											e.stopPropagation();
											onEdit(item);
										}}
									>
										Edit
									</Button>
								)}
								{onDelete && (
									<Button
										size="sm"
										variant="danger"
										onClick={e => {
											e.stopPropagation();
											onDelete(item);
										}}
									>
										Delete
									</Button>
								)}
							</div>
						),
					} as Column<T>,
				]
			: []),
	];

	if (isLoading && !data) {
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

	const selectedCount = selectedIds.size;
	const hasSelection = onBulkDelete !== undefined;

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
			<div className="mb-6 sm:mb-8 flex justify-between items-center flex-wrap gap-4">
				<div>
					{title && <h1 className="text-2xl sm:text-3xl font-bold text-mail-gray-900 mb-2">{title}</h1>}
					{data && (
						<p className="text-sm sm:text-base text-mail-gray-600">
							{data.length} {data.length === 1 ? 'item' : 'items'}
							{selectedCount > 0 && (
								<span className="ml-2 text-mail-primary font-medium">({selectedCount} selected)</span>
							)}
						</p>
					)}
				</div>
				<div className="flex gap-2 flex-wrap">
					{headerActions}
					{hasSelection && selectedCount > 0 && (
						<Button onClick={handleBulkDelete} size="md" variant="danger">
							Delete Selected ({selectedCount})
						</Button>
					)}
					{onCreate && (
						<Button onClick={onCreate} size="md">
							{createLabel}
						</Button>
					)}
				</div>
			</div>

			{onSearch && (
				<div className="mb-4 sm:mb-6">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
							<svg
								className="h-4 w-4 sm:h-5 sm:w-5 text-mail-gray-400"
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
							placeholder={searchPlaceholder}
							value={localSearch}
							onChange={e => handleSearchChange(e.target.value)}
							className={`w-full pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm sm:text-base border border-mail-gray-300 rounded-lg focus:ring-2 focus:ring-mail-primary/20 focus:border-mail-primary transition-all shadow-sm hover:shadow-md focus:shadow-md outline-none text-mail-gray-900 placeholder-mail-gray-400 ${
								localSearch ? 'pr-10' : 'pr-4'
							}`}
						/>
						{localSearch && !isFetching && (
							<button
								type="button"
								onClick={handleClearSearch}
								className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-mail-gray-400 hover:text-mail-gray-600 transition-colors"
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
									className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-mail-primary"
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
				</div>
			)}

			<DataTable
				data={data}
				columns={tableColumns}
				onRowClick={onRowClick}
				emptyMessage={emptyMessage}
				isLoading={isLoading}
				selectedIds={hasSelection ? selectedIds : undefined}
				onSelectChange={hasSelection ? handleSelectChange : undefined}
				onSelectAll={hasSelection ? handleSelectAll : undefined}
			/>
		</div>
	);
}
