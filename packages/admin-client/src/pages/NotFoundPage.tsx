import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-mail-gray-50">
			<div className="text-center max-w-md w-full">
				<div className="mb-8">
					<h1 className="text-9xl font-bold text-mail-primary/20 mb-4">404</h1>
					<h2 className="text-3xl font-bold text-mail-gray-900 mb-4">Page Not Found</h2>
					<p className="text-mail-gray-600 mb-8">
						The page you're looking for doesn't exist or has been moved.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link to="/">
						<Button>Go Home</Button>
					</Link>
					<button
						type="button"
						onClick={() => window.history.back()}
						className="px-4 py-2 text-sm font-medium text-mail-gray-700 hover:bg-mail-gray-100 rounded-lg transition-colors"
					>
						Go Back
					</button>
				</div>
			</div>
		</div>
	);
};
