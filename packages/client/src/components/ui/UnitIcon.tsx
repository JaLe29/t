import type React from 'react';

interface UnitIconProps {
	tribeId: string | null | undefined;
	unitIndex: number;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'w-6 h-6',
	md: 'w-8 h-8',
	lg: 'w-12 h-12',
};

const getUnitIconPath = (tribeId: string | null | undefined, unitIndex: number): string => {
	// Poslední jednotka (index 10) má vždy ikonu 10.png
	if (unitIndex === 10) {
		return '/icons/units/10.png';
	}
	// Ostatní jednotky mají ikony podle národa
	if (tribeId) {
		return `/icons/units/${tribeId}/${unitIndex}.png`;
	}
	// Fallback pokud není tribeId
	return `/icons/units/1/${unitIndex}.png`;
};

export const UnitIcon: React.FC<UnitIconProps> = ({ tribeId, unitIndex, size = 'md', className = '' }) => {
	const sizeClass = sizeClasses[size];
	const iconPath = getUnitIconPath(tribeId, unitIndex);

	return (
		<img
			src={iconPath}
			alt={`Unit ${unitIndex + 1}`}
			className={`${sizeClass} object-contain ${className}`}
			onError={e => {
				// Hide image if it doesn't exist
				(e.target as HTMLImageElement).style.display = 'none';
			}}
		/>
	);
};
