import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Input } from '../components/ui/Input';
import { useSession } from '../utils/auth';
import { trpc } from '../utils/trpc';

export const ProfilePage = () => {
	const { data: session } = useSession();
	const [name, setName] = useState(session?.user?.name || '');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// Update name when session changes
	useEffect(() => {
		if (session?.user?.name) {
			setName(session.user.name);
		}
	}, [session?.user?.name]);

	const updateName = trpc.user.updateName.useMutation({
		onSuccess: () => {
			// Refresh session to get updated name
			window.location.reload();
		},
	});

	const changePassword = trpc.user.changePassword.useMutation({
		onSuccess: () => {
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		},
	});

	// Check if user has email/password account
	const hasEmailPassword = session?.user?.email !== null && session?.user?.email !== undefined;

	const handleUpdateName = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			return;
		}
		await updateName.mutateAsync({ name: name.trim() });
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			return;
		}
		await changePassword.mutateAsync({
			currentPassword,
			newPassword,
		});
	};

	return (
		<Layout>
			<div className="p-8 max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
					<p className="text-gray-600">Manage your account settings</p>
				</div>

			{/* Update Name */}
			<div className="mb-8">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Change Name</h2>
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<form onSubmit={handleUpdateName} className="space-y-4">
						<Input
							id="name"
							label="Name"
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Enter your name"
							required
							minLength={1}
							maxLength={100}
							disabled={updateName.isPending}
						/>
						{updateName.error && (
							<ErrorMessage message={updateName.error.message || 'Failed to update name'} />
						)}
						<Button
							type="submit"
							disabled={updateName.isPending || !name.trim() || name === session?.user?.name}
						>
							{updateName.isPending ? 'Updating...' : 'Update Name'}
						</Button>
					</form>
				</div>
			</div>

			{/* Change Password */}
			{hasEmailPassword && (
				<div className="mb-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<form onSubmit={handleChangePassword} className="space-y-4">
							<Input
								id="currentPassword"
								label="Current Password"
								type="password"
								value={currentPassword}
								onChange={e => setCurrentPassword(e.target.value)}
								placeholder="Enter current password"
								required
								disabled={changePassword.isPending}
							/>
							<Input
								id="newPassword"
								label="New Password"
								type="password"
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								placeholder="Enter new password (min 8 characters)"
								required
								minLength={8}
								disabled={changePassword.isPending}
							/>
							<Input
								id="confirmPassword"
								label="Confirm New Password"
								type="password"
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								required
								minLength={8}
								disabled={changePassword.isPending}
								error={
									confirmPassword && newPassword !== confirmPassword
										? 'Passwords do not match'
										: undefined
								}
							/>
							{changePassword.error && (
								<ErrorMessage message={changePassword.error.message || 'Failed to change password'} />
							)}
							<Button
								type="submit"
								disabled={
									changePassword.isPending ||
									!currentPassword ||
									!newPassword ||
									!confirmPassword ||
									newPassword !== confirmPassword ||
									newPassword.length < 8
								}
							>
								{changePassword.isPending ? 'Changing...' : 'Change Password'}
							</Button>
						</form>
					</div>
				</div>
			)}

			{!hasEmailPassword && (
				<div className="mb-8">
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
						<p className="text-gray-600">
							Password change is only available for accounts that were created with email and password.
						</p>
					</div>
				</div>
			)}
			</div>
		</Layout>
	);
};
