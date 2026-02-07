import type React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { Button } from './Button';
import { Form } from './Form';
import { Modal } from './Modal';

interface FormModalProps<T extends FieldValues> {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	form: UseFormReturn<T>;
	onSubmit: (data: T) => void | Promise<void>;
	submitLabel?: string;
	isSubmitting?: boolean;
}

export function FormModal<T extends FieldValues>({
	isOpen,
	onClose,
	title,
	children,
	form,
	onSubmit,
	submitLabel = 'Save',
	isSubmitting = false,
}: FormModalProps<T>) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<Form form={form} onSubmit={onSubmit} className="space-y-4">
				{children}
				<div className="flex justify-end gap-3 pt-4 border-t border-mail-gray-200">
					<Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : submitLabel}
					</Button>
				</div>
			</Form>
		</Modal>
	);
}
