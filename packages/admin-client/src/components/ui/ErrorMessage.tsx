interface ErrorMessageProps {
	message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
	return (
		<div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{message}</div>
	);
};
