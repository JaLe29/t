import dayjs from 'dayjs';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { PageWrapper } from '../components/PageWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { trpc } from '../utils/trpc';

export const GameworldRequestPage = () => {
	const [name, setName] = useState('');
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const utils = trpc.useUtils();
	const { data: requests, isLoading } = trpc.gameworld.listRequests.useQuery();

	const createRequest = trpc.gameworld.createRequest.useMutation({
		onSuccess: () => {
			setName('');
			setSuccessMessage('Request submitted successfully. Thank you!');
			setTimeout(() => {
				setSuccessMessage(null);
			}, 5000);
			utils.gameworld.listRequests.invalidate();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			return;
		}

		createRequest.mutate({
			name: name.trim(),
		});
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
			approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
			rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

		return <span className={`px-2 py-1 text-xs font-medium rounded ${config.className}`}>{config.label}</span>;
	};

	return (
		<Layout>
			<PageWrapper maxWidth="6xl">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Server Requests</h1>

				{/* Create Request Form */}
				<div className="card-glass p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Request to Add Server</h2>
					{successMessage && (
						<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
							{successMessage}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<Input
							label="Server Name"
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							disabled={createRequest.isPending}
							placeholder="e.g. ts1.travian.com"
							required
							error={createRequest.error?.message}
						/>

						<div className="flex gap-4">
							<Button type="submit" disabled={createRequest.isPending || !name.trim()}>
								{createRequest.isPending ? 'Submitting...' : 'Submit Request'}
							</Button>
						</div>
					</form>
				</div>

				{/* Requests List */}
				<div className="card-glass">
					<h2 className="text-xl font-semibold text-gray-900 mb-4 p-6 pb-4">All Requests</h2>
					{isLoading && (
						<div className="p-6">
							<div className="space-y-3">
								<div className="h-20 bg-gray-100 animate-pulse rounded" />
								<div className="h-20 bg-gray-100 animate-pulse rounded" />
							</div>
						</div>
					)}

					{!isLoading && requests && requests.length > 0 && (
						<div className="divide-y divide-gray-200">
							{requests.map(request => (
								<div key={request.id} className="p-6">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
												{getStatusBadge(request.status)}
											</div>
											<div className="text-sm text-gray-600 space-y-1">
												<div>
													<span className="font-medium">Requester:</span> {request.user.name}
													{request.user.email && ` (${request.user.email})`}
												</div>
												<div>
													<span className="font-medium">Created:</span>{' '}
													{dayjs(request.createdAt).format('DD.MM.YYYY HH:mm:ss')}
												</div>
												{request.updatedAt !== request.createdAt && (
													<div>
														<span className="font-medium">Updated:</span>{' '}
														{dayjs(request.updatedAt).format('DD.MM.YYYY HH:mm:ss')}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{!isLoading && (!requests || requests.length === 0) && (
						<div className="p-6 text-center text-gray-500">No server requests found.</div>
					)}
				</div>
			</PageWrapper>
		</Layout>
	);
};
