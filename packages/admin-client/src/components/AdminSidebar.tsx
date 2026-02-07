import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

interface NavItem {
	path: string;
	label: string;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const navSections: NavSection[] = [
	{
		title: 'Users',
		items: [
			{ path: '/admin/users', label: 'Users' },
			{ path: '/admin/failed-login-attempts', label: 'Failed Logins' },
		],
	},
	{
		title: 'Game',
		items: [{ path: '/admin/gameworlds', label: 'Gameworlds' }],
	},
];

const NavSectionComponent: React.FC<{
	section: NavSection;
	location: ReturnType<typeof useLocation>;
	onItemClick: () => void;
}> = ({ section, location, onItemClick }) => {
	const hasActiveItem = section.items.some(item => location.pathname === item.path);
	const [isOpen, setIsOpen] = useState(hasActiveItem);

	useEffect(() => {
		if (hasActiveItem) {
			setIsOpen(true);
		}
	}, [hasActiveItem]);

	return (
		<div className="mb-2">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-mail-gray-700 hover:bg-mail-gray-50 rounded-lg transition-colors"
			>
				<span>{section.title}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{isOpen && (
				<ul className="mt-1 space-y-1 pl-4">
					{section.items.map(item => {
						const isActive = location.pathname === item.path;
						return (
							<li key={item.path}>
								<Link
									to={item.path}
									onClick={onItemClick}
									className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
										isActive
											? 'bg-mail-primary text-white'
											: 'text-mail-gray-600 hover:bg-mail-gray-100'
									}`}
								>
									<span className="text-sm font-medium">{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
	const location = useLocation();
	const isDashboardActive = location.pathname === '/admin';

	const handleItemClick = () => {
		if (window.innerWidth < 768) {
			onClose();
		}
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/50 z-20 md:hidden"
					onClick={onClose}
					aria-label="Close sidebar"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-mail-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="h-full flex flex-col">
					<div className="p-4 border-b border-mail-gray-200">
						<h2 className="text-lg font-bold text-mail-gray-900">Admin Panel</h2>
					</div>
					<nav className="flex-1 overflow-y-auto p-4">
						<ul className="space-y-2">
							{/* Dashboard - always visible */}
							<li>
								<Link
									to="/admin"
									onClick={handleItemClick}
									className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
										isDashboardActive
											? 'bg-mail-primary text-white'
											: 'text-mail-gray-700 hover:bg-mail-gray-100'
									}`}
								>
									<span className="font-medium">Dashboard</span>
								</Link>
							</li>

							{/* Sections */}
							{navSections.map(section => (
								<NavSectionComponent
									key={section.title}
									section={section}
									location={location}
									onItemClick={handleItemClick}
								/>
							))}
						</ul>
					</nav>
				</div>
			</aside>
		</>
	);
};
