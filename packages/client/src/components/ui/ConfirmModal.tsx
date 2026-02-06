import type React from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
	isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	confirmVariant = 'danger',
	isLoading = false,
}) => {
	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="space-y-4">
				<p className="text-gray-700">{message}</p>
				<div className="flex justify-end gap-3">
					<Button variant="ghost" onClick={onClose} disabled={isLoading}>
						{cancelText}
					</Button>
					<Button variant={confirmVariant} onClick={handleConfirm} disabled={isLoading}>
						{isLoading ? 'Processing...' : confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
