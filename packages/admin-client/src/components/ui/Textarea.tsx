import type React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, id, className = '', ...props }) => {
	const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div>
			{label && (
				<label htmlFor={textareaId} className="block text-sm font-medium text-mail-gray-700 mb-2">
					{label}
				</label>
			)}
			<textarea
				id={textareaId}
				className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
