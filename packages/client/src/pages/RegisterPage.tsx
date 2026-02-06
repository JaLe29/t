import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../utils/auth';

export const RegisterPage = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({ email: '', password: '', name: '' });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const result = await signUp.email({
				email: formData.email,
				password: formData.password,
				name: formData.name,
			});

			// Check if there's an error in the result
			if (result.error) {
				setError(result.error.message || 'Failed to create account');
				setLoading(false);
				return;
			}

			// If successful, navigate to login
			if (result.data) {
				navigate('/login');
			}
		} catch (err) {
			// Handle thrown errors
			if (err instanceof Error) {
				setError(err.message);
			} else if (typeof err === 'object' && err !== null && 'message' in err) {
				setError(String(err.message));
			} else {
				setError('Failed to create account. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setLoading(true);
		setError(null);
		try {
			await signIn.social({
				provider: 'google',
				callbackURL: '/',
			});
		} catch (err) {
			// Handle thrown errors
			if (err instanceof Error) {
				setError(err.message);
			} else if (typeof err === 'object' && err !== null && 'message' in err) {
				setError(String(err.message));
			} else {
				setError('Failed to sign in with Google. Please try again.');
			}
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="card w-full max-w-md space-y-6">
				<div className="text-center space-y-2">
					<div className="text-5xl mb-2">⚔️</div>
					<h1 className="text-4xl font-bold text-travian-primary">Travian</h1>
					<h2 className="text-2xl font-semibold text-mail-gray-700">Register</h2>
					<p className="text-mail-gray-600">Create a new account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
							{error}
						</div>
					)}

					<div>
						<label htmlFor="name" className="block text-sm font-medium text-mail-gray-700 mb-2">
							Name
						</label>
						<input
							id="name"
							type="text"
							required
							disabled={loading}
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="Enter your name"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-mail-gray-700 mb-2">
							Email
						</label>
						<input
							id="email"
							type="email"
							required
							disabled={loading}
							value={formData.email}
							onChange={e => setFormData({ ...formData, email: e.target.value })}
							className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-mail-gray-700 mb-2">
							Password
						</label>
						<input
							id="password"
							type="password"
							required
							minLength={6}
							disabled={loading}
							value={formData.password}
							onChange={e => setFormData({ ...formData, password: e.target.value })}
							className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
							placeholder="Enter your password (min. 6 characters)"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="btn-primary w-full flex items-center justify-center gap-2"
					>
						{loading && (
							<svg
								className="animate-spin h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								aria-label="Loading"
							>
								<title>Loading</title>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						)}
						{loading ? 'Creating account...' : 'Sign Up'}
					</button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-mail-gray-300" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-mail-gray-500">Or continue with</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={loading}
					className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-mail-gray-300 rounded-lg hover:bg-mail-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google">
						<title>Google</title>
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					<span className="text-mail-gray-700 font-medium">Continue with Google</span>
				</button>

				<div className="text-center text-mail-gray-600">
					Already have an account?{' '}
					<button
						type="button"
						onClick={() => navigate('/login')}
						className="text-travian-primary font-semibold underline"
					>
						Sign in
					</button>
				</div>
			</div>
		</div>
	);
};
