import type React from 'react';
import { useEffect } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	// Handle Escape key to close modal
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<>
			<button
				type="button"
				className="fixed inset-0 bg-black/50 z-30"
				onClick={onClose}
				aria-label="Close modal"
			/>
			<div className="fixed inset-0 flex items-center justify-center z-40 p-4">
				<div
					className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
					onClick={e => {
						e.stopPropagation();
					}}
					role="dialog"
					aria-modal="true"
					aria-labelledby={`modal-title-${title}`}
				>
					<h2 id={`modal-title-${title}`} className="text-xl font-bold text-mail-gray-900 mb-4">
						{title}
					</h2>
					{children}
				</div>
			</div>
		</>
	);
};
