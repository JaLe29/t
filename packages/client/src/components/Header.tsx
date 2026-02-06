import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/apiUrl';
import { signOut, useSession } from '../utils/auth';

interface HeaderProps {
	onMenuToggle?: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
	const { data: session } = useSession();
	const navigate = useNavigate();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [photoError, setPhotoError] = useState(false);

	const handleSignOut = async () => {
		await signOut();
		navigate('/login');
	};

	return (
		<header className="bg-white shadow-sm border-b border-mail-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo and Mobile Menu Button */}
					<div className="flex items-center space-x-4">
						{session && (
							<button
								type="button"
								onClick={onMenuToggle}
								className="md:hidden p-2 rounded-lg text-mail-gray-700 hover:bg-mail-gray-100 transition-colors"
								aria-label="Toggle menu"
							>
								<svg
									className="w-6 h-6"
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
						)}
						<Link to="/" className="flex items-center space-x-2">
							<span className="text-2xl">⚔️</span>
							<span className="text-xl font-bold text-travian-primary">Travian</span>
						</Link>
					</div>

					{/* User Menu */}
					<div className="flex items-center space-x-4">
						{session && (
							<div className="relative">
								<button
									type="button"
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-mail-gray-100 transition-colors"
								>
									{session.user.id && !photoError ? (
										<img
											src={`${getApiUrl()}/image/user-photo/${session.user.id}`}
											alt={`${session.user.name || session.user.email || 'User'} profile`}
											className="w-8 h-8 rounded-full object-cover border-2 border-mail-gray-200"
											onError={() => setPhotoError(true)}
										/>
									) : (
										<div className="w-8 h-8 bg-travian-primary rounded-full flex items-center justify-center text-white font-semibold">
											{(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
										</div>
									)}
									<span className="hidden sm:block text-mail-gray-700 font-medium">
										{session.user.name || session.user.email}
									</span>
									<svg
										className={`w-4 h-4 text-mail-gray-600 transition-transform ${
											isUserMenuOpen ? 'rotate-180' : ''
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
										aria-label="Toggle user menu"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{/* Dropdown Menu */}
								{isUserMenuOpen && (
									<>
										<button
											type="button"
											className="fixed inset-0 z-10"
											onClick={() => setIsUserMenuOpen(false)}
											aria-label="Close user menu"
										/>
										<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-mail-gray-200 z-20">
											<div className="py-1">
												<div className="px-4 py-2 border-b border-mail-gray-200">
													<p className="text-sm font-semibold text-mail-gray-900">
														{session.user.name || 'User'}
													</p>
													<p className="text-xs text-mail-gray-500 truncate">
														{session.user.email}
													</p>
												</div>
												<button
													type="button"
													onClick={handleSignOut}
													className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
												>
													Odhlásit se
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
