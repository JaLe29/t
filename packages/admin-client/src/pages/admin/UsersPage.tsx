import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulkDeleteConfirmModal } from '../../components/ui/BulkDeleteConfirmModal';
import { type Column, DataList } from '../../components/ui/DataList';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { type RouterOutput, trpc } from '../../utils/trpc';

type User = RouterOutput['adminUser']['list'][number];

export const UsersPage = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedIdsForBulkDelete, setSelectedIdsForBulkDelete] = useState<string[]>([]);

	const utils = trpc.useUtils();
	const {
		data: users,
		isLoading,
		isFetching,
	} = trpc.adminUser.list.useQuery({ search: search || undefined }, { keepPreviousData: true });

	const deleteMutation = trpc.adminUser.delete.useMutation({
		onSuccess: () => {
			utils.adminUser.list.invalidate();
			setIsDeleteModalOpen(false);
			setSelectedUser(null);
		},
	});

	const bulkDeleteMutation = trpc.adminUser.deleteMany.useMutation({
		onSuccess: () => {
			utils.adminUser.list.invalidate();
			setIsBulkDeleteModalOpen(false);
			setSelectedIdsForBulkDelete([]);
		},
	});

	const columns: Column<User>[] = [
		{
			key: 'image',
			header: 'Avatar',
			render: user => (
				<div>
					{user.image ? (
						<img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
					) : (
						<div className="w-10 h-10 rounded-full bg-mail-gray-200 flex items-center justify-center">
							<span className="text-mail-gray-400 text-xs">{user.name[0]}</span>
						</div>
					)}
				</div>
			),
		},
		{
			key: 'name',
			header: 'Name',
			render: user => <div className="font-medium">{user.name}</div>,
		},
		{
			key: 'email',
			header: 'Email',
			render: user => (
				<div className="text-sm text-mail-gray-600">
					{user.email || <span className="text-mail-gray-400">No email</span>}
				</div>
			),
		},
		{
			key: 'emailVerified',
			header: 'Verified',
			render: user => (
				<div>
					{user.emailVerified ? (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
							Verified
						</span>
					) : (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
							Not verified
						</span>
					)}
				</div>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: user => <div>{dayjs(user.createdAt).format('DD.MM.YYYY HH:mm:ss')}</div>,
		},
	];

	const handleCreate = () => {
		navigate('/admin/users/new');
	};

	const handleEdit = (user: User) => {
		navigate(`/admin/users/${user.id}/edit`);
	};

	const handleDelete = (user: User) => {
		setSelectedUser(user);
		setIsDeleteModalOpen(true);
	};

	const handleRowClick = (user: User) => {
		handleEdit(user);
	};

	const handleBulkDelete = (ids: string[]) => {
		setSelectedIdsForBulkDelete(ids);
		setIsBulkDeleteModalOpen(true);
	};

	return (
		<>
			<DataList
				data={users}
				isLoading={isLoading}
				isFetching={isFetching}
				columns={columns}
				searchPlaceholder="Search users by name or email..."
				emptyMessage="No users found"
				onSearch={setSearch}
				onCreate={handleCreate}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onBulkDelete={handleBulkDelete}
				onRowClick={handleRowClick}
				createLabel="Create User"
				title="Users"
				entityName="user"
			/>

			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedUser(null);
				}}
				onConfirm={() => {
					if (selectedUser) {
						deleteMutation.mutate({ id: selectedUser.id });
					}
				}}
				title="Delete User"
				message={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
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
				title="Delete Users"
				message="Are you sure you want to delete the selected users?"
				count={selectedIdsForBulkDelete.length}
				isDeleting={bulkDeleteMutation.isPending}
			/>
		</>
	);
};
