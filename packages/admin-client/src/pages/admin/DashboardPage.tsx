import { trpc } from '../../utils/trpc';

export const DashboardPage = () => {
	const { data: users } = trpc.adminUser.list.useQuery();

	const stats = [{ label: 'Users', value: users?.length || 0, icon: '👤', color: 'bg-blue-500' }];

	return (
		<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
			<div className="mb-6 sm:mb-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-mail-gray-900 mb-2">Admin Dashboard</h1>
				<p className="text-sm sm:text-base text-mail-gray-600">Overview of all entities in the system</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
				{stats.map(stat => (
					<div
						key={stat.label}
						className="bg-white border border-mail-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
					>
						<div className="flex items-center justify-between mb-4">
							<span className="text-3xl">{stat.icon}</span>
							<div className={`w-12 h-12 ${stat.color} rounded-lg opacity-10`} />
						</div>
						<div className="text-3xl font-bold text-mail-gray-900 mb-1">{stat.value}</div>
						<div className="text-sm text-mail-gray-600">{stat.label}</div>
					</div>
				))}
			</div>
		</div>
	);
};
