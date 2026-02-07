import type React from 'react';

interface NationIconProps {
	tribeId: string | null | undefined;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'w-6 h-6',
	md: 'w-8 h-8',
	lg: 'w-12 h-12',
};

export const NationIcon: React.FC<NationIconProps> = ({ tribeId, size = 'md', className = '' }) => {
	if (!tribeId) {
		return null;
	}

	const sizeClass = sizeClasses[size];

	return (
		<img
			src={`/icons/nation/${tribeId}.png`}
			alt={`Nation ${tribeId}`}
			className={`${sizeClass} object-contain ${className}`}
			onError={e => {
				// Hide image if it doesn't exist
				(e.target as HTMLImageElement).style.display = 'none';
			}}
		/>
	);
};
