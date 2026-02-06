import { useState } from 'react';
import { getApiUrl } from '../utils/apiUrl';

interface UserAvatarProps {
	userId: string;
	userName: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const sizeClasses = {
	sm: 'w-6 h-6 text-xs',
	md: 'w-8 h-8 text-sm',
	lg: 'w-12 h-12 text-lg',
	xl: 'w-24 h-24 text-3xl',
};

export const UserAvatar = ({ userId, userName, size = 'md', className = '' }: UserAvatarProps) => {
	const [imageError, setImageError] = useState(false);
	const sizeClass = sizeClasses[size];
	const initial = userName.charAt(0).toUpperCase();

	return (
		<div className={`relative flex-shrink-0 ${className}`}>
			{!imageError ? (
				<img
					src={`${getApiUrl()}/image/user-photo/${userId}`}
					alt={userName}
					className={`${sizeClass} rounded-full object-cover border-2 border-gray-200`}
					onError={() => setImageError(true)}
				/>
			) : (
				<div
					className={`${sizeClass} bg-primary rounded-full flex items-center justify-center text-white font-semibold`}
				>
					{initial}
				</div>
			)}
		</div>
	);
};
