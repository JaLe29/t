import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

export const Sidebar = ({ isOpen, onToggle, onClose }: SidebarProps) => {
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	// Mobile backdrop with fade animation
	const backdrop = (
		<div
			className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
				isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
			onClick={onClose}
			aria-hidden="true"
		/>
	);

	// Always render sidebar for animations to work
	return (
		<>
			{backdrop}
			<aside
				className={`bg-glass fixed md:relative left-0 top-0 h-full border-r border-gray-200 flex flex-col z-50 md:z-auto transition-all duration-300 ease-out shadow-xl md:shadow-none ${
					isOpen ? 'translate-x-0 w-full md:w-64' : '-translate-x-full md:translate-x-0 w-0 md:w-12'
				}`}
			>
				{!isOpen && (
					<div className="hidden md:flex flex-col h-full min-h-0">
						<button
							type="button"
							onClick={onToggle}
							className="p-3 hover:bg-gray-50 transition-colors"
							aria-label="Open sidebar"
						>
							<svg
								className="w-6 h-6 text-gray-600"
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
					</div>
				)}
				{isOpen && (
					<>
						<div className="p-4 border-b border-gray-200 relative">
							<button
								type="button"
								onClick={onToggle}
								className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors"
								aria-label="Close sidebar"
							>
								<svg
									className="w-5 h-5 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Navigation */}
						<nav className="flex-1 overflow-y-auto py-4">
							<div className="px-2 space-y-6">
								{/* Main Navigation */}
								<div>
									<p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Navigation
									</p>
									<div className="space-y-1">
										<Link
											to="/game-accounts"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/game-accounts')
													? 'bg-primary/10 text-primary'
													: 'text-gray-700 hover:bg-gray-50'
											}`}
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
												/>
											</svg>
											Game Accounts
										</Link>
									</div>
								</div>


								{/* Account */}
								<div>
									<p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Account
									</p>
									<div className="space-y-1">
										<Link
											to="/profile"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/profile')
													? 'bg-primary/10 text-primary'
													: 'text-gray-700 hover:bg-gray-50'
											}`}
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
											Profile
										</Link>
									</div>
								</div>
							</div>
						</nav>
					</>
				)}
			</aside>
		</>
	);
};
