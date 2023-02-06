FROM node:16.19-bullseye
LABEL maintainer="hello@vizzuality.com"

ENV NEXT_TELEMETRY_DISABLED 1

RUN mkdir /opt/app

WORKDIR /opt/app

USER $USER

COPY .yarn ./.yarn
COPY src ./src
COPY public ./public
COPY cypress ./cypress
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY next.config.js next-env.d.ts local.d.ts \
	postcss.config.js tailwind.config.js cypress.json entrypoint.sh \
	tsconfig.json .browserlistrc .eslintrc.js .prettierrc.json ./

RUN yarn build

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
