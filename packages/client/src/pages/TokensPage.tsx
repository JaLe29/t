import dayjs from 'dayjs';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { PageWrapper } from '../components/PageWrapper';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Input } from '../components/ui/Input';
import { trpc } from '../utils/trpc';

export const TokensPage = () => {
	const [tokenName, setTokenName] = useState('');
	const [newToken, setNewToken] = useState<string | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);

	const utils = trpc.useUtils();
	const { data: tokens, isLoading } = trpc.token.list.useQuery();

	const createToken = trpc.token.create.useMutation({
		onSuccess: data => {
			setTokenName('');
			setNewToken(data.token);
			utils.token.list.invalidate();
		},
	});

	const deleteToken = trpc.token.delete.useMutation({
		onSuccess: () => {
			utils.token.list.invalidate();
			setDeleteModalOpen(false);
			setTokenToDelete(null);
		},
	});

	const handleCreateToken = async (e: React.FormEvent) => {
		e.preventDefault();
		await createToken.mutateAsync({ name: tokenName || undefined });
	};

	const handleDeleteClick = (tokenId: string) => {
		setTokenToDelete(tokenId);
		setDeleteModalOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (tokenToDelete) {
			deleteToken.mutate({ id: tokenToDelete });
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<Layout>
			<PageWrapper>
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">API Tokens</h1>
					<p className="text-gray-600">Manage your API tokens for accessing the API</p>
				</div>

				{/* Create New Token */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Token</h2>
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<form onSubmit={handleCreateToken} className="space-y-4">
							<Input
								id="tokenName"
								label="Token Name (optional)"
								type="text"
								value={tokenName}
								onChange={e => setTokenName(e.target.value)}
								placeholder="e.g., Production API, Development"
								maxLength={100}
								disabled={createToken.isPending}
							/>
							{createToken.error && (
								<ErrorMessage message={createToken.error.message || 'Failed to create token'} />
							)}
							<Button type="submit" disabled={createToken.isPending}>
								{createToken.isPending ? 'Generating...' : 'Generate Token'}
							</Button>
						</form>

						{/* Display new token */}
						{newToken && (
							<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-sm font-medium text-green-900 mb-2">
									Token generated successfully! Copy it now - you won't be able to see it again.
								</p>
								<div className="flex items-center gap-2">
									<code className="flex-1 p-2 bg-white border border-green-300 rounded text-sm font-mono break-all">
										{newToken}
									</code>
									<Button
										type="button"
										size="sm"
										onClick={() => copyToClipboard(newToken)}
										aria-label="Copy token to clipboard"
									>
										Copy
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Tokens List */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tokens</h2>
					<div className="bg-white border border-gray-200 rounded-lg">
						{isLoading && (
							<div className="p-6">
								<div className="space-y-3">
									<div className="h-16 bg-gray-100 animate-pulse rounded" />
									<div className="h-16 bg-gray-100 animate-pulse rounded" />
								</div>
							</div>
						)}
						{!isLoading && tokens && tokens.length > 0 && (
							<div className="divide-y divide-gray-200">
								{tokens.map(token => (
									<div key={token.id} className="p-6">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-medium text-gray-900">
														{token.name || (
															<span className="text-gray-400">(unnamed token)</span>
														)}
													</h3>
													<span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
														{token.token.substring(0, 20)}...
													</span>
												</div>
												<div className="text-sm text-gray-600 space-y-1">
													<div>
														Created: {dayjs(token.createdAt).format('DD.MM.YYYY HH:mm:ss')}
													</div>
													{token.lastUsage ? (
														<div>
															Last used:{' '}
															{dayjs(token.lastUsage.usedAt).format(
																'DD.MM.YYYY HH:mm:ss',
															)}
														</div>
													) : (
														<div className="text-gray-400">Never used</div>
													)}
													{token.lastUsage && (
														<div className="text-xs text-gray-500 mt-1">
															{token.lastUsage.ipAddress && (
																<span>IP: {token.lastUsage.ipAddress}</span>
															)}
															{token.lastUsage.userAgent && (
																<span className="ml-2">
																	UA: {token.lastUsage.userAgent.substring(0, 50)}
																	{token.lastUsage.userAgent.length > 50 ? '...' : ''}
																</span>
															)}
														</div>
													)}
												</div>
											</div>
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleDeleteClick(token.id)}
												disabled={deleteToken.isPending}
											>
												Delete
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
						{!isLoading && (!tokens || tokens.length === 0) && (
							<div className="p-6 text-center text-gray-500">
								No tokens yet. Generate your first token above.
							</div>
						)}
					</div>
				</div>

				<ConfirmModal
					isOpen={deleteModalOpen}
					onClose={() => {
						setDeleteModalOpen(false);
						setTokenToDelete(null);
					}}
					onConfirm={handleDeleteConfirm}
					title="Delete Token"
					message="Are you sure you want to delete this token? This action cannot be undone."
					confirmText="Delete"
					cancelText="Cancel"
					confirmVariant="danger"
				/>
			</PageWrapper>
		</Layout>
	);
};
