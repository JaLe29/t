import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { trpc } from '../../utils/trpc';

const gameworldSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
	startTime: z.string().min(1, 'Start time is required'),
	speed: z.string().min(1, 'Speed is required'),
	speedTroops: z.string().min(1, 'Speed troops is required'),
	version: z.string().min(1, 'Version is required').max(50, 'Version is too long'),
	isActive: z.boolean(),
});

type GameworldFormData = z.infer<typeof gameworldSchema>;

export const GameworldCreatePage = () => {
	const navigate = useNavigate();

	const form = useForm<GameworldFormData>({
		resolver: zodResolver(gameworldSchema),
		defaultValues: {
			name: '',
			startTime: dayjs().format('YYYY-MM-DDTHH:mm'),
			speed: '1',
			speedTroops: '1',
			version: '',
			isActive: false,
		},
	});

	const {
		control,
		formState: { errors },
	} = form;

	const utils = trpc.useUtils();
	const createMutation = trpc.adminGameworld.create.useMutation({
		onSuccess: () => {
			utils.adminGameworld.list.invalidate();
			navigate('/admin/gameworlds');
		},
	});

	const onSubmit = (data: GameworldFormData) => {
		// Convert datetime-local to Unix timestamp
		const startTimeUnix = dayjs(data.startTime).unix();

		createMutation.mutate({
			name: data.name,
			startTime: startTimeUnix,
			speed: Number.parseFloat(data.speed),
			speedTroops: Number.parseFloat(data.speedTroops),
			version: data.version,
			isActive: data.isActive,
		});
	};

	const breadcrumbItems = [
		{ label: 'Dashboard', href: '/admin' },
		{ label: 'Gameworlds', href: '/admin/gameworlds' },
		{ label: 'Create Gameworld' },
	];

	return (
		<div className="min-h-screen bg-mail-gray-50">
			<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<Breadcrumb items={breadcrumbItems} />
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-mail-gray-200">
					<div className="px-6 py-6">
						<div className="mb-6">
							<h1 className="text-2xl font-bold text-mail-gray-900">Create Gameworld</h1>
							<p className="text-sm text-mail-gray-600 mt-1">Create a new gameworld</p>
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
										placeholder="Enter gameworld name"
									/>
								)}
							/>

							<Controller
								control={control}
								name="version"
								render={({ field }) => (
									<Input
										label="Version"
										{...field}
										error={errors.version?.message}
										placeholder="Enter version (e.g., T4.5)"
									/>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Controller
									control={control}
									name="speed"
									render={({ field }) => (
										<Input
											label="Speed"
											type="number"
											step="0.1"
											min="0.1"
											max="100"
											{...field}
											error={errors.speed?.message}
											placeholder="1.0"
										/>
									)}
								/>

								<Controller
									control={control}
									name="speedTroops"
									render={({ field }) => (
										<Input
											label="Speed Troops"
											type="number"
											step="0.1"
											min="0.1"
											max="100"
											{...field}
											error={errors.speedTroops?.message}
											placeholder="1.0"
										/>
									)}
								/>
							</div>

							<Controller
								control={control}
								name="startTime"
								render={({ field }) => (
									<Input
										label="Start Time"
										type="datetime-local"
										{...field}
										error={errors.startTime?.message}
									/>
								)}
							/>

							<Controller
								control={control}
								name="isActive"
								render={({ field }) => (
									<Checkbox
										label="Active"
										checked={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										error={errors.isActive?.message}
									/>
								)}
							/>

							<div className="flex gap-3 pt-4">
								<Button type="submit" disabled={createMutation.isPending}>
									{createMutation.isPending ? 'Creating...' : 'Create Gameworld'}
								</Button>
								<Button type="button" variant="ghost" onClick={() => navigate('/admin/gameworlds')}>
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
