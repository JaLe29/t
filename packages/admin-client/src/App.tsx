import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { FailedLoginAttemptsPage } from './pages/admin/FailedLoginAttemptsPage';
import { GameworldCreatePage } from './pages/admin/GameworldCreatePage';
import { GameworldEditPage } from './pages/admin/GameworldEditPage';
import { GameworldsPage } from './pages/admin/GameworldsPage';
import { UserCreatePage } from './pages/admin/UserCreatePage';
import { UserEditPage } from './pages/admin/UserEditPage';
import { UsersPage } from './pages/admin/UsersPage';
import { NotFoundPage } from './pages/NotFoundPage';
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
			path: '/admin',
			element: (
				<AdminLayout>
					<DashboardPage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/users',
			element: (
				<AdminLayout>
					<UsersPage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/users/new',
			element: (
				<AdminLayout>
					<UserCreatePage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/users/:id/edit',
			element: (
				<AdminLayout>
					<UserEditPage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/failed-login-attempts',
			element: (
				<AdminLayout>
					<FailedLoginAttemptsPage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/gameworlds',
			element: (
				<AdminLayout>
					<GameworldsPage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/gameworlds/new',
			element: (
				<AdminLayout>
					<GameworldCreatePage />
				</AdminLayout>
			),
		},
		{
			path: '/admin/gameworlds/:id/edit',
			element: (
				<AdminLayout>
					<GameworldEditPage />
				</AdminLayout>
			),
		},
		{
			path: '/',
			element: (
				<AdminLayout>
					<DashboardPage />
				</AdminLayout>
			),
		},
		{
			path: '*',
			element: <NotFoundPage />,
		},
	]);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</trpc.Provider>
	);
};
