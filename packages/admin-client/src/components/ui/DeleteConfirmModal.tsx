import type React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	isDeleting = false,
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="space-y-4">
				<p className="text-mail-gray-700">{message}</p>
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
