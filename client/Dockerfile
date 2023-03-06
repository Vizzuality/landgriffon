FROM node:18.13-bullseye-slim

ARG UID=5000
ARG GID=5000
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_MAPBOX_API_TOKEN
ARG NEXT_PUBLIC_API_URL
ARG CYPRESS_USERNAME
ARG CYPRESS_PASSWORD

ENV NAME landgriffon-client
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV NEXTAUTH_URL $NEXTAUTH_URL
ENV NEXTAUTH_SECRET $NEXTAUTH_SECRET
ENV NEXT_PUBLIC_MAPBOX_API_TOKEN $NEXT_PUBLIC_MAPBOX_API_TOKEN
ENV NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED 1
ENV CYPRESS_USERNAME $CYPRESS_USERNAME
ENV CYPRESS_PASSWORD $CYPRESS_PASSWORD
ENV CYPRESS_API_URL $NEXT_PUBLIC_API_URL

RUN groupadd -g $GID $USER && adduser --uid $UID --gid $GID $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER .yarn ./.yarn
COPY --chown=$USER:$USER package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# NextJS project folders
COPY --chown=$USER:$USER src ./src
COPY --chown=$USER:$USER public ./public

# NextJS required files
COPY --chown=$USER:$USER next.config.js next-env.d.ts local.d.ts \
	postcss.config.js tailwind.config.js entrypoint.sh \
	tsconfig.json .browserlistrc .eslintrc.js .prettierrc.json ./

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
