import type React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../components/Layout';

export const UnitsPage: React.FC = () => {
	return (
		<Layout>
			<div className="p-6 max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Units</h1>
				<Outlet />
			</div>
		</Layout>
	);
};
