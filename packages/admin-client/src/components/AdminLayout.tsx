import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';

const SIDEBAR_OPEN_KEY = 'adminSidebarOpen';

interface AdminLayoutProps {
	children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		const saved = localStorage.getItem(SIDEBAR_OPEN_KEY);
		return saved !== null ? saved === 'true' : false;
	});

	useEffect(() => {
		localStorage.setItem(SIDEBAR_OPEN_KEY, String(isSidebarOpen));
	}, [isSidebarOpen]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768 && isSidebarOpen) {
				setIsSidebarOpen(false);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [isSidebarOpen]);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsSidebarOpen(false);
		}
	}, []);

	return (
		<div className="h-screen flex flex-col overflow-hidden">
			<div className="h-16 bg-white border-b border-mail-gray-200 flex items-center px-4">
				<button
					type="button"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="p-2 hover:bg-mail-gray-100 rounded-lg transition-colors"
					aria-label="Toggle sidebar"
				>
					<svg
						className="w-6 h-6 text-mail-gray-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<h1 className="ml-4 text-xl font-bold text-mail-gray-900">Admin Panel</h1>
			</div>
			<div className="flex-1 flex overflow-hidden min-h-0 relative">
				<AdminSidebar
					isOpen={isSidebarOpen}
					onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
					onClose={() => setIsSidebarOpen(false)}
				/>
				<main className="flex-1 overflow-y-auto min-h-0">{children}</main>
			</div>
		</div>
	);
};
