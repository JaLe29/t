import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { GameAccountsPage } from './pages/GameAccountsPage';
import { GameworldRequestPage } from './pages/GameworldRequestPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { TokensPage } from './pages/TokensPage';
import { UnitsHistoryPage } from './pages/UnitsHistoryPage';
import { UnitsOverviewPage } from './pages/UnitsOverviewPage';
import { UnitsPage } from './pages/UnitsPage';
import { trpc, trpcClient } from './utils/trpc';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

export const App: React.FC = () => {
	const router = createBrowserRouter([
		{
			path: '/',
			element: (
				<AuthGuard>
					<HomePage />
				</AuthGuard>
			),
		},
		{
			path: '/login',
			element: <LoginPage />,
		},
		{
			path: '/register',
			element: <RegisterPage />,
		},
		{
			path: '/game-accounts',
			element: (
				<AuthGuard>
					<GameAccountsPage />
				</AuthGuard>
			),
		},
		{
			path: '/profile',
			element: (
				<AuthGuard>
					<ProfilePage />
				</AuthGuard>
			),
		},
		{
			path: '/tokens',
			element: (
				<AuthGuard>
					<TokensPage />
				</AuthGuard>
			),
		},
		{
			path: '/gameworld-request',
			element: (
				<AuthGuard>
					<GameworldRequestPage />
				</AuthGuard>
			),
		},
		{
			path: '/units',
			element: (
				<AuthGuard>
					<UnitsPage />
				</AuthGuard>
			),
			children: [
				{
					index: true,
					element: <Navigate to="/units/overview" replace />,
				},
				{
					path: 'overview',
					element: <UnitsOverviewPage />,
				},
				{
					path: 'history',
					element: <UnitsHistoryPage />,
				},
			],
		},
		{
			path: '*',
			element: (
				<AuthGuard>
					<HomePage />
				</AuthGuard>
			),
		},
	]);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider
					router={router}
					future={{
						v7_startTransition: true,
					}}
				/>
			</QueryClientProvider>
		</trpc.Provider>
	);
};
