import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '../utils/auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const SIDEBAR_OPEN_KEY = 'sidebarOpen';

interface LayoutProps {
	children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { data: session } = useSession();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		const saved = localStorage.getItem(SIDEBAR_OPEN_KEY);
		return saved !== null ? saved === 'true' : true; // Default open
	});

	useEffect(() => {
		localStorage.setItem(SIDEBAR_OPEN_KEY, String(isSidebarOpen));
	}, [isSidebarOpen]);

	// Close sidebar on mobile when route changes
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768 && isSidebarOpen) {
				setIsSidebarOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [isSidebarOpen]);

	// Close sidebar on mobile when navigating
	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to react to pathname changes
	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsSidebarOpen(false);
		}
	}, [location.pathname]);

	// Invalidace tRPC cache při změně route
	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to react to pathname changes
	useEffect(() => {
		queryClient.invalidateQueries();
	}, [location.pathname]);

	return (
		<div className="h-screen flex flex-col overflow-hidden">
			<Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
			<div className="flex-1 flex overflow-hidden min-h-0 relative">
				{session && (
					<Sidebar
						isOpen={isSidebarOpen}
						onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
						onClose={() => setIsSidebarOpen(false)}
					/>
				)}
				<main className="flex-1 overflow-y-auto min-h-0">{children}</main>
			</div>
		</div>
	);
};
