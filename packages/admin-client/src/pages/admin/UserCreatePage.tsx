import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

export const UserCreatePage = () => {
	const navigate = useNavigate();

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
	const createMutation = trpc.adminUser.create.useMutation({
		onSuccess: () => {
			utils.adminUser.list.invalidate();
			navigate('/admin/users');
		},
	});

	const onSubmit = (data: UserFormData) => {
		createMutation.mutate({
			name: data.name,
			email: data.email,
			emailVerified: data.emailVerified,
			image: data.image,
		});
	};

	const breadcrumbItems = [
		{ label: 'Dashboard', href: '/admin' },
		{ label: 'Users', href: '/admin/users' },
		{ label: 'Create User' },
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
							<h1 className="text-2xl font-bold text-mail-gray-900">Create User</h1>
							<p className="text-sm text-mail-gray-600 mt-1">Create a new user</p>
						</div>

						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{createMutation.error && <ErrorMessage message={createMutation.error.message} />}

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
								<Button type="submit" disabled={createMutation.isPending}>
									{createMutation.isPending ? 'Creating...' : 'Create User'}
								</Button>
								<Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>
									Cancel
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
