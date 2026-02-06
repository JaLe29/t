import { isAuthed } from '../middleware';
import { t } from '../trpc';

export const gameworldRouter = t.router({
	getActive: t.procedure.use(isAuthed).query(async ({ ctx }) => {
		const gameworlds = await ctx.prisma.gameworld.findMany({
			where: {
				isActive: true,
			},
			orderBy: {
				name: 'asc',
			},
		});

		return gameworlds;
	}),
});
