FROM node:alpine

WORKDIR /usr/src/app

# copy package.json
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

# install pnpm
RUN npm i -g pnpm

# install package
RUN pnpm i

COPY apps/auth apps/event
COPY libs libs

RUN pnpm build event

# 커맨드 실행
CMD [ "pnpm", "start:dev", "event" ]