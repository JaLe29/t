import type React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PageWrapper } from '../components/PageWrapper';

export const UnitsPage: React.FC = () => {
	return (
		<Layout>
			<PageWrapper maxWidth="6xl">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Units</h1>
				<Outlet />
			</PageWrapper>
		</Layout>
	);
};
