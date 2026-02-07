import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulkDeleteConfirmModal } from '../../components/ui/BulkDeleteConfirmModal';
import { type Column, DataList } from '../../components/ui/DataList';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { type RouterOutput, trpc } from '../../utils/trpc';

type Gameworld = RouterOutput['adminGameworld']['list'][number];

export const GameworldsPage = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
	const [selectedGameworld, setSelectedGameworld] = useState<Gameworld | null>(null);
	const [selectedIdsForBulkDelete, setSelectedIdsForBulkDelete] = useState<string[]>([]);

	const utils = trpc.useUtils();
	const {
		data: gameworlds,
		isLoading,
		isFetching,
	} = trpc.adminGameworld.list.useQuery({ search: search || undefined }, { keepPreviousData: true });

	const deleteMutation = trpc.adminGameworld.delete.useMutation({
		onSuccess: () => {
			utils.adminGameworld.list.invalidate();
			setIsDeleteModalOpen(false);
			setSelectedGameworld(null);
		},
	});

	const bulkDeleteMutation = trpc.adminGameworld.deleteMany.useMutation({
		onSuccess: () => {
			utils.adminGameworld.list.invalidate();
			setIsBulkDeleteModalOpen(false);
			setSelectedIdsForBulkDelete([]);
		},
	});

	const columns: Column<Gameworld>[] = [
		{
			key: 'name',
			header: 'Name',
			render: gameworld => <div className="font-medium">{gameworld.name}</div>,
		},
		{
			key: 'version',
			header: 'Version',
			render: gameworld => <div className="text-sm text-mail-gray-600">{gameworld.version}</div>,
		},
		{
			key: 'speed',
			header: 'Speed',
			render: gameworld => <div className="text-sm text-mail-gray-600">{gameworld.speed}x</div>,
		},
		{
			key: 'speedTroops',
			header: 'Speed Troops',
			render: gameworld => <div className="text-sm text-mail-gray-600">{gameworld.speedTroops}x</div>,
		},
		{
			key: 'startTime',
			header: 'Start Time',
			render: gameworld => (
				<div className="text-sm text-mail-gray-600">
					{dayjs.unix(gameworld.startTime).format('DD.MM.YYYY HH:mm:ss')}
				</div>
			),
		},
		{
			key: 'isActive',
			header: 'Status',
			render: gameworld => (
				<div>
					{gameworld.isActive ? (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
							Active
						</span>
					) : (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							Inactive
						</span>
					)}
				</div>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: gameworld => <div>{dayjs(gameworld.createdAt).format('DD.MM.YYYY HH:mm:ss')}</div>,
		},
	];

	const handleCreate = () => {
		navigate('/admin/gameworlds/new');
	};

	const handleEdit = (gameworld: Gameworld) => {
		navigate(`/admin/gameworlds/${gameworld.id}/edit`);
	};

	const handleDelete = (gameworld: Gameworld) => {
		setSelectedGameworld(gameworld);
		setIsDeleteModalOpen(true);
	};

	const handleRowClick = (gameworld: Gameworld) => {
		handleEdit(gameworld);
	};

	const handleBulkDelete = (ids: string[]) => {
		setSelectedIdsForBulkDelete(ids);
		setIsBulkDeleteModalOpen(true);
	};

	return (
		<>
			<DataList
				data={gameworlds}
				isLoading={isLoading}
				isFetching={isFetching}
				columns={columns}
				searchPlaceholder="Search gameworlds by name..."
				emptyMessage="No gameworlds found"
				onSearch={setSearch}
				onCreate={handleCreate}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onBulkDelete={handleBulkDelete}
				onRowClick={handleRowClick}
				createLabel="Create Gameworld"
				title="Gameworlds"
				entityName="gameworld"
			/>

			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedGameworld(null);
				}}
				onConfirm={() => {
					if (selectedGameworld) {
						deleteMutation.mutate({ id: selectedGameworld.id });
					}
				}}
				title="Delete Gameworld"
				message={`Are you sure you want to delete gameworld "${selectedGameworld?.name}"? This action cannot be undone.`}
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
				title="Delete Gameworlds"
				message="Are you sure you want to delete the selected gameworlds?"
				count={selectedIdsForBulkDelete.length}
				isDeleting={bulkDeleteMutation.isPending}
			/>
		</>
	);
};
