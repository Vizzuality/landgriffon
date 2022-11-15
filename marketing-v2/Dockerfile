FROM node:16.15-alpine3.15
LABEL maintainer="hello@vizzuality.com"

ARG UID=5000
ARG GID=5000

ENV NAME landgriffon-marketing-v2
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache libc6-compat git
RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER .yarn ./.yarn
COPY --chown=$USER:$USER package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# NextJS project folders
COPY --chown=$USER:$USER src ./src
COPY --chown=$USER:$USER public ./public
COPY --chown=$USER:$USER cypress ./cypress

# NextJS config files
COPY --chown=$USER:$USER next.config.js next-env.d.ts local.d.ts \
	postcss.config.js tailwind.config.js cypress.json entrypoint.sh \
	tsconfig.json .browserlistrc .eslintrc.js .prettierrc.json ./

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
