import { useSession } from '../utils/auth';
import { trpc } from '../utils/trpc';

export const HomePage = () => {
	const { data: session } = useSession();
	const { data: helloData, isLoading, isError } = trpc.hello.useQuery();

	return (
		<div className="p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-2xl shadow-md border border-mail-gray-200 p-12 text-center">
					<div className="space-y-6">
						<div className="inline-block">
							<div className="w-20 h-20 bg-gradient-to-br from-mail-primary to-mail-accent rounded-2xl flex items-center justify-center shadow-lg">
								<span className="text-4xl">📧</span>
							</div>
						</div>
						<div>
							<h1 className="text-5xl font-bold bg-gradient-to-r from-mail-primary to-mail-accent bg-clip-text text-transparent mb-4">
								Better Mailhunt
							</h1>
							<p className="text-lg text-mail-gray-600 mb-2">Advanced Email Analysis Platform</p>
							{session && (
								<p className="text-xl text-mail-gray-700 mt-4">
									Welcome,{' '}
									<span className="font-bold text-mail-primary">
										{session.user.name || session.user.email}
									</span>
									!
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="mt-8 bg-white rounded-2xl shadow-md border border-mail-gray-200 p-8">
					<h2 className="text-2xl font-bold text-mail-gray-900 mb-4">tRPC Hello World</h2>
					{isLoading && <div className="text-mail-gray-600">Loading...</div>}
					{isError && <div className="text-red-600">Error loading data</div>}
					{helloData && (
						<div className="bg-mail-success/10 border border-mail-success/20 rounded-lg p-4">
							<p className="text-lg font-semibold text-mail-success">{helloData.message}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
