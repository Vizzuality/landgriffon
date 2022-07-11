FROM node:16.13-alpine3.14
LABEL maintainer="hello@vizzuality.com"

ARG UID=5000
ARG GID=5000

ENV NAME landgriffon-api
ENV USER $NAME
ENV APP_HOME /opt/$NAME
ENV NODE_PATH src

RUN apk update \
  && apk add --virtual build-dependencies build-base \
  && apk add --no-cache python3 py3-pip

RUN addgroup -g $GID $USER &&  adduser -u $UID -D -G $USER $USER

WORKDIR $APP_HOME
RUN chown $USER:$USER $APP_HOME

USER $USER

COPY --chown=$USER:$USER package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=$USER:$USER entrypoint.sh tsconfig.json tsconfig.build.json ./
COPY --chown=$USER:$USER config ./config
COPY --chown=$USER:$USER src ./src
# @debt we should do this only for images used for tests
COPY --chown=$USER:$USER test ./test

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
