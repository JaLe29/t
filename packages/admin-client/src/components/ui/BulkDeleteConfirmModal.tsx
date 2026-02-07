import type React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface BulkDeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	count: number;
	isDeleting?: boolean;
}

export const BulkDeleteConfirmModal: React.FC<BulkDeleteConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	count,
	isDeleting = false,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="space-y-4">
				<p className="text-mail-gray-700">{message}</p>
				<p className="text-sm font-medium text-mail-gray-900">
					You are about to delete <span className="text-red-600">{count}</span> item{count !== 1 ? 's' : ''}.
					This action cannot be undone.
				</p>
				<div className="flex justify-end gap-3 pt-4 border-t border-mail-gray-200">
					<Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
						Cancel
					</Button>
					<Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
