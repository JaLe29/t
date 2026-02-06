import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	children: React.ReactNode;
}

const variantClasses = {
	primary: 'btn-primary',
	secondary: 'btn-secondary',
	danger: 'btn-danger',
	ghost: 'text-mail-gray-700 hover:bg-mail-gray-100',
};

const sizeClasses = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-6 py-2.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	className = '',
	disabled,
	children,
	...props
}) => {
	const baseClasses = 'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
	const variantClass = variantClasses[variant];
	const sizeClass = sizeClasses[size];

	return (
		<button
			type="button"
			className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};
