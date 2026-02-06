import { Navigate } from 'react-router-dom';
import { useSession } from '../utils/auth';

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center space-y-4">
					<div className="text-6xl animate-bounce">⚔️</div>
					<div className="text-xl text-mail-gray-700 font-semibold">Loading...</div>
				</div>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};
