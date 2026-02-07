import { useRef, useState } from 'react';

// 5MB limit for original image files
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// 7MB limit for base64 encoded images (approximately 5MB original file)
const MAX_BASE64_SIZE = 7 * 1024 * 1024;

interface ImageUploadProps {
	value: string | null;
	onChange: (value: string | null) => void;
	disabled?: boolean;
	label?: string;
}

export const ImageUpload = ({ value, onChange, disabled = false, label = 'Image' }: ImageUploadProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		setError(null);

		// Validace typu souboru
		if (!file.type.startsWith('image/')) {
			setError('Please select an image file (JPG, PNG, GIF, etc.)');
			if (e.target) {
				e.target.value = '';
			}
			return;
		}

		// Validace velikosti
		if (file.size > MAX_FILE_SIZE) {
			const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
			setError(
				`Image size must be less than ${maxSizeMB}MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
			);
			if (e.target) {
				e.target.value = '';
			}
			return;
		}

		const reader = new FileReader();
		reader.onload = event => {
			const result = event.target?.result;
			if (typeof result === 'string') {
				// Ověříme, že base64 string není příliš velký
				if (result.length > MAX_BASE64_SIZE) {
					const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
					setError(`Image is too large. Please select a smaller image (max ${maxSizeMB}MB).`);
					if (e.target) {
						e.target.value = '';
					}
					return;
				}
				onChange(result);
				setError(null);
			}
		};
		reader.onerror = () => {
			setError('Error reading image file. Please try again.');
			if (e.target) {
				e.target.value = '';
			}
		};
		reader.readAsDataURL(file);
	};

	const handleRemove = () => {
		onChange(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div>
			<label className="block text-sm font-medium text-mail-gray-700 mb-2">{label}</label>
			<div className="flex items-center gap-4">
				{value ? (
					<img
						src={value}
						alt="Team preview"
						className="w-16 h-16 rounded object-cover border border-mail-gray-300"
					/>
				) : (
					<div className="w-16 h-16 rounded bg-mail-gray-100 flex items-center justify-center text-mail-gray-400 text-xs">
						No image
					</div>
				)}
				<div className="flex-1">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileSelect}
						className="hidden"
						disabled={disabled}
					/>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={disabled}
							className="px-3 py-2 text-sm font-medium text-mail-primary hover:bg-mail-primary/10 rounded-lg transition-colors disabled:opacity-50"
						>
							{value ? 'Change Image' : 'Upload Image'}
						</button>
						{value && (
							<button
								type="button"
								onClick={handleRemove}
								disabled={disabled}
								className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
							>
								Remove
							</button>
						)}
					</div>
					{error && <p className="mt-2 text-xs text-red-600">{error}</p>}
				</div>
			</div>
		</div>
	);
};
