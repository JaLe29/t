import dayjs from 'dayjs';
import { useState } from 'react';
import { BulkDeleteConfirmModal } from '../../components/ui/BulkDeleteConfirmModal';
import { type Column, DataList } from '../../components/ui/DataList';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { type RouterOutput, trpc } from '../../utils/trpc';

type FailedLoginAttempt = RouterOutput['adminFailedLoginAttempt']['list']['attempts'][number];

export const FailedLoginAttemptsPage = () => {
	const [search, setSearch] = useState('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
	const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
	const [selectedAttempt, setSelectedAttempt] = useState<FailedLoginAttempt | null>(null);
	const [selectedIdsForBulkDelete, setSelectedIdsForBulkDelete] = useState<string[]>([]);

	const utils = trpc.useUtils();
	const {
		data: result,
		isLoading,
		isFetching,
	} = trpc.adminFailedLoginAttempt.list.useQuery({ search: search || undefined }, { keepPreviousData: true });

	const attempts = result?.attempts || [];
	const total = result?.total || 0;

	const deleteMutation = trpc.adminFailedLoginAttempt.delete.useMutation({
		onSuccess: () => {
			utils.adminFailedLoginAttempt.list.invalidate();
			setIsDeleteModalOpen(false);
			setSelectedAttempt(null);
		},
	});

	const bulkDeleteMutation = trpc.adminFailedLoginAttempt.deleteMany.useMutation({
		onSuccess: () => {
			utils.adminFailedLoginAttempt.list.invalidate();
			setIsBulkDeleteModalOpen(false);
			setSelectedIdsForBulkDelete([]);
		},
	});

	const deleteAllMutation = trpc.adminFailedLoginAttempt.deleteAll.useMutation({
		onSuccess: () => {
			utils.adminFailedLoginAttempt.list.invalidate();
			setIsDeleteAllModalOpen(false);
		},
	});

	const columns: Column<FailedLoginAttempt>[] = [
		{
			key: 'email',
			header: 'Email',
			render: attempt => (
				<div className="text-sm text-mail-gray-600">
					{attempt.email || <span className="text-mail-gray-400">No email</span>}
				</div>
			),
		},
		{
			key: 'ipAddress',
			header: 'IP Address',
			render: attempt => (
				<div className="text-sm text-mail-gray-600 font-mono">
					{attempt.ipAddress || <span className="text-mail-gray-400">-</span>}
				</div>
			),
		},
		{
			key: 'reason',
			header: 'Reason',
			render: attempt => (
				<div className="text-sm text-mail-gray-600">
					{attempt.reason || <span className="text-mail-gray-400">-</span>}
				</div>
			),
		},
		{
			key: 'userAgent',
			header: 'User Agent',
			render: attempt => (
				<div className="text-sm text-mail-gray-600 max-w-md truncate" title={attempt.userAgent || undefined}>
					{attempt.userAgent || <span className="text-mail-gray-400">-</span>}
				</div>
			),
		},
		{
			key: 'createdAt',
			header: 'Date',
			render: attempt => (
				<div className="text-sm text-mail-gray-600">
					{dayjs(attempt.createdAt).format('DD.MM.YYYY HH:mm:ss')}
				</div>
			),
		},
	];

	const handleDelete = (attempt: FailedLoginAttempt) => {
		setSelectedAttempt(attempt);
		setIsDeleteModalOpen(true);
	};

	const handleBulkDelete = (ids: string[]) => {
		setSelectedIdsForBulkDelete(ids);
		setIsBulkDeleteModalOpen(true);
	};

	const handleDeleteAll = () => {
		setIsDeleteAllModalOpen(true);
	};

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-mail-gray-900">Failed Login Attempts</h1>
					<p className="text-sm text-mail-gray-600 mt-1">
						Total: {total} attempt{total !== 1 ? 's' : ''}
					</p>
				</div>
				{total > 0 && (
					<button
						type="button"
						onClick={handleDeleteAll}
						className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
					>
						Delete All
					</button>
				)}
			</div>

			<DataList
				data={attempts}
				isLoading={isLoading}
				isFetching={isFetching}
				columns={columns}
				searchPlaceholder="Search by email, IP address, or reason..."
				emptyMessage="No failed login attempts found"
				onSearch={setSearch}
				onDelete={handleDelete}
				onBulkDelete={handleBulkDelete}
				title=""
				entityName="failed login attempt"
			/>

			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedAttempt(null);
				}}
				onConfirm={() => {
					if (selectedAttempt) {
						deleteMutation.mutate({ id: selectedAttempt.id });
					}
				}}
				title="Delete Failed Login Attempt"
				message={`Are you sure you want to delete this failed login attempt from ${selectedAttempt?.email || selectedAttempt?.ipAddress || 'unknown'}?`}
				isDeleting={deleteMutation.isPending}
			/>

			<BulkDeleteConfirmModal
				isOpen={isBulkDeleteModalOpen}
				onClose={() => {
					setIsBulkDeleteModalOpen(false);
					setSelectedIdsForBulkDelete([]);
				}}
				onConfirm={() => {
					if (selectedIdsForBulkDelete.length > 0) {
						bulkDeleteMutation.mutate({ ids: selectedIdsForBulkDelete });
					}
				}}
				title="Delete Failed Login Attempts"
				message="Are you sure you want to delete the selected failed login attempts?"
				count={selectedIdsForBulkDelete.length}
				isDeleting={bulkDeleteMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={isDeleteAllModalOpen}
				onClose={() => {
					setIsDeleteAllModalOpen(false);
				}}
				onConfirm={() => {
					deleteAllMutation.mutate();
				}}
				title="Delete All Failed Login Attempts"
				message={`Are you sure you want to delete all ${total} failed login attempts? This action cannot be undone.`}
				isDeleting={deleteAllMutation.isPending}
			/>
		</>
	);
};
