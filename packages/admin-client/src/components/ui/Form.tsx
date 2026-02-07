import type React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

interface FormProps<T extends FieldValues> {
	form: UseFormReturn<T>;
	onSubmit: (data: T) => void | Promise<void>;
	children: React.ReactNode;
	className?: string;
}

export function Form<T extends FieldValues>({ form, onSubmit, children, className }: FormProps<T>) {
	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className={className}>
			{children}
		</form>
	);
}
