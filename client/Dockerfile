FROM node:14.17-alpine3.13
LABEL maintainer="hello@vizzuality.com"

ARG UID=5000
ARG GID=5000

ENV NAME landgriffon-client
ENV USER $NAME
ENV APP_HOME /opt/$NAME

RUN addgroup -g $GID $USER && adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# NextJS project folders
COPY --chown=$USER:$USER .storybook ./.storybook
COPY --chown=$USER:$USER components ./components
COPY --chown=$USER:$USER containers ./containers
COPY --chown=$USER:$USER cypress ./cypress
COPY --chown=$USER:$USER layouts ./layouts
COPY --chown=$USER:$USER lib ./lib
COPY --chown=$USER:$USER pages ./pages
COPY --chown=$USER:$USER public ./public
COPY --chown=$USER:$USER services ./services
COPY --chown=$USER:$USER store ./store
COPY --chown=$USER:$USER styles ./styles
COPY --chown=$USER:$USER svgs ./svgs

# NextJS config files
COPY --chown=$USER:$USER next.config.js next-env.d.ts now.json \
	postcss.config.js local.d.ts tailwind.config.js cypress.json entrypoint.sh \
	tsconfig.json .babelrc .browserlistrc ./

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
