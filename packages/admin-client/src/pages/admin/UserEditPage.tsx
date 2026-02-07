import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { Input } from '../../components/ui/Input';
import { trpc } from '../../utils/trpc';

const userSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	email: z.string().email('Invalid email address').optional().nullable(),
	emailVerified: z.boolean(),
	image: z.string().optional().nullable(),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserEditPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: user, isLoading } = trpc.adminUser.get.useQuery(
		{ id: id || '' },
		{ enabled: !!id },
	);

	const form = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: '',
			email: null,
			emailVerified: false,
			image: null,
		},
	});

	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const imageValue = watch('image');

	const utils = trpc.useUtils();
	const updateMutation = trpc.adminUser.update.useMutation({
		onSuccess: () => {
			utils.adminUser.list.invalidate();
			navigate('/admin/users');
		},
	});

	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const setPasswordMutation = trpc.adminUser.setPassword.useMutation({
		onSuccess: () => {
			setNewPassword('');
			setConfirmPassword('');
			alert('Password has been set successfully');
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				emailVerified: user.emailVerified,
				image: user.image,
			});
		}
	}, [user, form]);

	const onSubmit = (data: UserFormData) => {
		if (!id) {
			return;
		}

		updateMutation.mutate({
			id,
			name: data.name,
			email: data.email,
			emailVerified: data.emailVerified,
			image: data.image,
		});
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="h-8 bg-mail-gray-200 animate-pulse rounded w-48 mb-4" />
				<div className="h-20 bg-mail-gray-200 animate-pulse rounded" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-6">
				<p className="text-red-600">User not found</p>
			</div>
		);
	}

	const breadcrumbItems = [
		{ label: 'Dashboard', href: '/admin' },
		{ label: 'Users', href: '/admin/users' },
		{ label: `Edit: ${user?.name || 'Loading...'}` },
	];

	return (
		<div className="min-h-screen bg-mail-gray-50">
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				{/* Breadcrumb */}
				<div className="mb-6">
					<Breadcrumb items={breadcrumbItems} />
				</div>

				{/* Main Content Card */}
				<div className="bg-white rounded-lg shadow-sm border border-mail-gray-200">
					<div className="px-6 py-6">
						<div className="mb-6">
							<h1 className="text-2xl font-bold text-mail-gray-900">Edit User</h1>
							<p className="text-sm text-mail-gray-600 mt-1">Update user details</p>
						</div>

						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{updateMutation.error && <ErrorMessage message={updateMutation.error.message} />}

							<Controller
								control={control}
								name="name"
								render={({ field }) => (
									<Input
										label="Name"
										{...field}
										error={errors.name?.message}
										placeholder="Enter user name"
									/>
								)}
							/>
							<Controller
								control={control}
								name="email"
								render={({ field }) => (
									<Input
										label="Email"
										type="email"
										{...field}
										value={field.value || ''}
										error={errors.email?.message}
										placeholder="Enter email address (optional)"
									/>
								)}
							/>
							<Controller
								control={control}
								name="emailVerified"
								render={({ field }) => (
									<Checkbox
										label="Email Verified"
										checked={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										error={errors.emailVerified?.message}
									/>
								)}
							/>
							<ImageUpload
								label="Profile Image"
								value={imageValue || ''}
								onChange={value => setValue('image', value)}
							/>

							<div className="flex gap-3 pt-4">
								<Button type="submit" disabled={updateMutation.isPending}>
									{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
								</Button>
								<Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>
									Cancel
								</Button>
							</div>
						</form>
					</div>
				</div>

				{/* Password Setting Section */}
				<div className="bg-white rounded-lg shadow-sm border border-mail-gray-200 mt-6">
					<div className="px-6 py-6">
						<div className="mb-6">
							<h2 className="text-xl font-bold text-mail-gray-900">Set New Password</h2>
							<p className="text-sm text-mail-gray-600 mt-1">Set a new password for this user</p>
						</div>

						<form
							onSubmit={e => {
								e.preventDefault();
								if (!id) {
									return;
								}
								if (newPassword !== confirmPassword) {
									return;
								}
								setPasswordMutation.mutate({
									userId: id,
									newPassword,
								});
							}}
							className="space-y-6"
						>
							{setPasswordMutation.error && (
								<ErrorMessage message={setPasswordMutation.error.message} />
							)}

							<Input
								label="New Password"
								type="password"
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								placeholder="Enter new password (min 8 characters)"
								minLength={8}
								disabled={setPasswordMutation.isPending}
							/>
							<Input
								label="Confirm New Password"
								type="password"
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								placeholder="Confirm new password"
								minLength={8}
								disabled={setPasswordMutation.isPending}
								error={
									confirmPassword && newPassword !== confirmPassword
										? 'Passwords do not match'
										: undefined
								}
							/>

							<div className="flex gap-3 pt-4">
								<Button
									type="submit"
									disabled={
										setPasswordMutation.isPending ||
										!newPassword ||
										!confirmPassword ||
										newPassword !== confirmPassword ||
										newPassword.length < 8
									}
								>
									{setPasswordMutation.isPending ? 'Setting Password...' : 'Set Password'}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
