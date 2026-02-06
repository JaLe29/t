import { Layout } from '../components/Layout';
import { trpc } from '../utils/trpc';

export const HomePage = () => {
	const { data: meData, isLoading: isLoadingMe } = trpc.user.me.useQuery();

	return (
		<Layout>
			<div className="flex items-center justify-center p-4 pt-8">
				<div className="max-w-2xl w-full space-y-8">
					<div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
						<h1 className="text-5xl font-bold text-gray-900 mb-8">Hello World</h1>
						
						<div className="mb-8">
							<button
								type="button"
								className="btn-primary py-3 px-8 text-lg"
							>
								Hello World
							</button>
						</div>
						
						{isLoadingMe && (
							<div className="text-gray-600">Loading user...</div>
						)}
						
						{meData && (
							<div className="space-y-4">
								<div className="bg-gray-50 rounded-lg p-6">
									<h2 className="text-2xl font-semibold text-gray-800 mb-4">User</h2>
									<div className="text-left space-y-2">
										<p className="text-gray-700">
											<span className="font-semibold">Name:</span> {meData.user.name}
										</p>
										{meData.user.email && (
											<p className="text-gray-700">
												<span className="font-semibold">Email:</span> {meData.user.email}
											</p>
										)}
										<p className="text-gray-700">
											<span className="font-semibold">ID:</span> {meData.user.id}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</Layout>
	);
};
