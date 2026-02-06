import type React from 'react';
import { useEffect } from 'react';
import { Button } from './Button';

type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

const viewportConfigs: Record<ViewportMode, { width: string; height: string; label: string }> = {
	mobile: { width: '375px', height: '667px', label: 'Mobile' },
	tablet: { width: '768px', height: '1024px', label: 'Tablet' },
	desktop: { width: '1280px', height: '800px', label: 'Desktop' },
	fullscreen: { width: '100%', height: '800px', label: 'Fullscreen' },
};

interface EmailModalProps {
	isOpen: boolean;
	onClose: () => void;
	emailHtml: string | null | undefined;
	isLoadingHtml: boolean;
	viewportMode: ViewportMode;
	onViewportModeChange: (mode: ViewportMode) => void;
	onFullscreen: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
	isOpen,
	onClose,
	emailHtml,
	isLoadingHtml,
	viewportMode,
	onViewportModeChange,
	onFullscreen,
}) => {
	// Handle ESC key to close modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

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
					className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
					onClick={e => {
						e.stopPropagation();
					}}
					role="dialog"
					aria-modal="true"
					aria-labelledby="email-preview-title"
				>
					<h2 id="email-preview-title" className="text-xl font-bold text-gray-900 mb-4">
						Email Preview
					</h2>
					<div className="mb-4 flex items-center justify-between flex-wrap gap-2">
						<div className="flex gap-2 flex-wrap">
							{(['mobile', 'tablet', 'desktop', 'fullscreen'] as ViewportMode[]).map(mode => (
								<Button
									key={mode}
									type="button"
									variant={viewportMode === mode ? 'primary' : 'ghost'}
									size="sm"
									onClick={() => onViewportModeChange(mode)}
									className="text-xs"
								>
									{viewportConfigs[mode].label}
								</Button>
							))}
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={onFullscreen}
								disabled={!emailHtml}
							>
								Fullscreen
							</Button>
						</div>
					</div>
					<div className="space-y-4">
						{(() => {
							if (isLoadingHtml) {
								return (
									<div className="flex items-center justify-center py-8">
										<div className="text-gray-600">Loading email...</div>
									</div>
								);
							}
							if (emailHtml) {
								const config = viewportConfigs[viewportMode];
								const isFullscreenMode = viewportMode === 'fullscreen';

								return (
									<div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
										{!isFullscreenMode && (
											<div className="bg-gray-200 px-4 py-2 flex items-center justify-center border-b border-gray-300">
												<div className="flex items-center gap-2 text-xs text-gray-600">
													<span className="w-2 h-2 bg-red-500 rounded-full" />
													<span className="w-2 h-2 bg-yellow-500 rounded-full" />
													<span className="w-2 h-2 bg-green-500 rounded-full" />
													<span className="ml-2">
														{config.width} × {config.height}
													</span>
												</div>
											</div>
										)}
										<div
											className={`${isFullscreenMode ? 'w-full' : 'mx-auto'} bg-white`}
											style={
												!isFullscreenMode
													? {
															width: config.width,
															height: config.height,
															maxHeight: '70vh',
															overflow: 'auto',
														}
													: { height: '70vh' }
											}
										>
											<iframe
												srcDoc={emailHtml}
												title="Email Preview"
												className="w-full h-full border-0"
												style={{ minHeight: isFullscreenMode ? '70vh' : '100%' }}
												sandbox="allow-same-origin"
											/>
										</div>
									</div>
								);
							}
							return (
								<div className="text-center py-8 text-gray-600">
									<p>Email HTML not found in S3</p>
								</div>
							);
						})()}
						<div className="flex justify-end">
							<Button onClick={onClose}>Close</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
