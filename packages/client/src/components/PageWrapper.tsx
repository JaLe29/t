import type React from 'react';

interface PageWrapperProps {
	children: React.ReactNode;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	'2xl': 'max-w-2xl',
	'4xl': 'max-w-4xl',
	'6xl': 'max-w-6xl',
	'7xl': 'max-w-7xl',
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, maxWidth = '4xl' }) => {
	return <div className={`p-8 ${maxWidthClasses[maxWidth]}`}>{children}</div>;
};
