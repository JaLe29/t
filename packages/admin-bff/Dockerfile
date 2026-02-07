### BUILD
FROM node:22-alpine AS build

WORKDIR /usr/app

COPY ./.yarn/cache													./.yarn/cache
COPY ./.yarn/releases												./.yarn/releases
COPY ./.yarnrc.yml													./
COPY ./package.json													./
COPY ./tsconfig.base.json											./
COPY ./yarn.lock													./

COPY ./packages/admin-bff 											./packages/admin-bff
COPY ./packages/admin-client										./packages/admin-client
COPY ./packages/backend-shared										./packages/backend-shared
COPY ./packages/db													./packages/db
COPY ./packages/shared												./packages/shared

ENV DATABASE_URL=dockerbuildisempty

RUN yarn install && \
	yarn workspace @t/db prisma:generate && \
	yarn workspace @t/admin-client build && \
	yarn workspace @t/admin-bff build && \
	yarn workspaces focus @t/admin-bff --production

# ### PRODUCTION
FROM node:22-alpine
WORKDIR /usr/app

COPY --from=build /usr/app/package.json								./package.json

COPY --from=build /usr/app/packages/admin-bff/package.json		./packages/admin-bff/package.json
COPY --from=build /usr/app/packages/admin-bff/dist					./packages/admin-bff/dist

COPY --from=build /usr/app/packages/backend-shared/package.json	./packages/backend-shared/package.json
COPY --from=build /usr/app/packages/backend-shared/dist			./packages/backend-shared/dist

COPY --from=build /usr/app/packages/shared/package.json			./packages/shared/package.json
COPY --from=build /usr/app/packages/shared/dist					./packages/shared/dist

COPY --from=build /usr/app/packages/admin-client/dist				./packages/admin-client/dist

COPY --from=build /usr/app/node_modules								./node_modules

ENV TZ=Europe/Prague
ENV NODE_ENV=production

RUN apk add --no-cache tzdata \
	&& ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

USER 1000:1000

CMD [ "sh", "-c", "node --enable-source-maps ./packages/admin-bff/dist/main.js" ]