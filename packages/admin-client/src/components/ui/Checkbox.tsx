import type React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, error, id, className = '', ...props }) => {
	const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div>
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id={checkboxId}
					className={`h-4 w-4 text-mail-primary focus:ring-mail-primary border-mail-gray-300 rounded ${className}`}
					{...props}
				/>
				{label && (
					<label htmlFor={checkboxId} className="text-sm font-medium text-mail-gray-700 cursor-pointer">
						{label}
					</label>
				)}
			</div>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
