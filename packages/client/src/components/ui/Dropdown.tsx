import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
	value: string;
	label: string;
}

interface DropdownProps {
	label?: string;
	error?: string;
	options: DropdownOption[];
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	isLoading?: boolean;
	required?: boolean;
	id?: string;
	className?: string;
	searchable?: boolean;
	searchPlaceholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
	label,
	error,
	options,
	value,
	onChange,
	placeholder = '-- Select --',
	disabled = false,
	isLoading = false,
	id,
	className = '',
	searchable = false,
	searchPlaceholder = 'Search...',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;

	const selectedOption = options.find(option => option.value === value);

	// Filter options based on search query
	const filteredOptions = searchable
		? options.filter(option =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: options;

	// Reset search when dropdown closes
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
		}
	}, [isOpen]);

	// Focus search input when dropdown opens and searchable is enabled
	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen, searchable]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Handle ESC key to close dropdown
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen]);

	const handleToggle = () => {
		if (!disabled && !isLoading) {
			setIsOpen(!isOpen);
		}
	};

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	return (
		<div className={className}>
			{label && (
				<label htmlFor={dropdownId} className="block text-sm font-medium text-gray-700 mb-2">
					{label}
				</label>
			)}
			<div ref={dropdownRef} className="relative">
				<button
					type="button"
					id={dropdownId}
					onClick={handleToggle}
					disabled={disabled || isLoading}
					className={`input-field w-full text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
						error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''
					} ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<svg
						className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{isLoading && (
					<p className="mt-1 text-sm text-gray-500">Loading...</p>
				)}

				{/* Dropdown Menu */}
				{isOpen && !isLoading && (
					<div className="absolute z-10 w-full mt-1 bg-glass-strong border border-gray-300 rounded-lg shadow-lg max-h-60 flex flex-col">
						{searchable && (
							<div className="p-2 border-b border-gray-200">
								<input
									ref={searchInputRef}
									type="text"
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									onClick={e => e.stopPropagation()}
									onKeyDown={e => {
										if (e.key === 'Escape') {
											setIsOpen(false);
										}
										e.stopPropagation();
									}}
									placeholder={searchPlaceholder}
									className="input-field w-full text-sm"
								/>
							</div>
						)}
						<div className="overflow-y-auto max-h-60" role="listbox">
							{filteredOptions.length > 0 ? (
								<div className="py-1">
									{filteredOptions.map(option => (
										<button
											type="button"
											key={option.value}
											className={`w-full text-left px-4 py-2 cursor-pointer transition-colors ${
												value === option.value
													? 'bg-primary/10 text-primary font-medium'
													: 'text-gray-700 hover:bg-gray-100'
											}`}
											onClick={e => {
												e.preventDefault();
												handleSelect(option.value);
											}}
										>
											{option.label}
										</button>
									))}
								</div>
							) : (
								<div className="p-3 text-sm text-gray-500">
									{searchable && searchQuery
										? 'No results found'
										: 'No options available'}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	);
};
