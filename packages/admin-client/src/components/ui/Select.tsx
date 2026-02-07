import type React from 'react';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
	label?: string;
	error?: string;
	options: SelectOption[];
	placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, placeholder, id, className = '', ...props }) => {
	const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div>
			{label && (
				<label htmlFor={selectId} className="block text-sm font-medium text-mail-gray-700 mb-2">
					{label}
				</label>
			)}
			<select
				id={selectId}
				className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
				{...props}
			>
				{placeholder && <option value="">{placeholder}</option>}
				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
