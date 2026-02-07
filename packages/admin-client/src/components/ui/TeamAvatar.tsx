interface TeamAvatarProps {
	name: string;
	image?: string | null;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const sizeClasses = {
	sm: 'w-8 h-8 text-xs',
	md: 'w-10 h-10 text-sm',
	lg: 'w-12 h-12 text-lg',
	xl: 'w-16 h-16 text-xl',
};

export const TeamAvatar = ({ name, image, size = 'md', className = '' }: TeamAvatarProps) => {
	const sizeClass = sizeClasses[size];
	const initial = name.charAt(0).toUpperCase();

	if (image) {
		return (
			<img
				src={image}
				alt={name}
				className={`${sizeClass} rounded object-cover border border-mail-gray-200 flex-shrink-0 ${className}`}
			/>
		);
	}

	return (
		<div
			className={`${sizeClass} rounded bg-mail-primary text-white flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
		>
			{initial}
		</div>
	);
};
