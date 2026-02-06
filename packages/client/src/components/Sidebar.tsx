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
				className={`fixed md:relative left-0 top-0 h-full bg-white border-r border-mail-gray-200 flex flex-col z-50 md:z-auto transition-all duration-300 ease-out shadow-xl md:shadow-none ${
					isOpen ? 'translate-x-0 w-full md:w-64' : '-translate-x-full md:translate-x-0 w-0 md:w-12'
				}${isLoading ? ' overflow-hidden' : ''}`}
			>
				{!isOpen && (
					<div className="hidden md:flex flex-col h-full min-h-0">
						<button
							type="button"
							onClick={onToggle}
							className="p-3 hover:bg-mail-gray-50 transition-colors"
							aria-label="Open sidebar"
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
					</div>
				)}
				{isOpen && (
					<>
						<div className="p-4 border-b border-mail-gray-200 relative">
							<button
								type="button"
								onClick={onToggle}
								className="absolute top-4 right-4 p-1 hover:bg-mail-gray-100 rounded transition-colors"
								aria-label="Close sidebar"
							>
								<svg
									className="w-5 h-5 text-mail-gray-600"
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
									<p className="px-3 text-xs font-semibold text-mail-gray-500 uppercase tracking-wider mb-2">
										Navigation
									</p>
									<div className="space-y-1">
										<Link
											to="/"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/')
													? 'bg-mail-primary/10 text-mail-primary'
													: 'text-mail-gray-700 hover:bg-mail-gray-50'
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
													d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
												/>
											</svg>
											Home
										</Link>
										<Link
											to="/companies"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/companies')
													? 'bg-mail-primary/10 text-mail-primary'
													: 'text-mail-gray-700 hover:bg-mail-gray-50'
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
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
												/>
											</svg>
											Companies
										</Link>
										<Link
											to="/subscriptions"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/subscriptions')
													? 'bg-mail-primary/10 text-mail-primary'
													: 'text-mail-gray-700 hover:bg-mail-gray-50'
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
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Subscriptions
										</Link>
										<Link
											to="/favorites"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/favorites')
													? 'bg-mail-primary/10 text-mail-primary'
													: 'text-mail-gray-700 hover:bg-mail-gray-50'
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
													d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
												/>
											</svg>
											Favorites
										</Link>
									</div>
								</div>


								{/* Account */}
								<div>
									<p className="px-3 text-xs font-semibold text-mail-gray-500 uppercase tracking-wider mb-2">
										Account
									</p>
									<div className="space-y-1">
										<Link
											to="/profile"
											className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
												isActive('/profile')
													? 'bg-mail-primary/10 text-mail-primary'
													: 'text-mail-gray-700 hover:bg-mail-gray-50'
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
