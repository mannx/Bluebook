#syntax:docker/dockerfile:1

#
# Rust Build Stage
#
FROM rust:latest AS build
WORKDIR /app


# add missing deps
RUN apt update && apt install sqlite3

COPY backend-rust/ ./
COPY .git/ .git

# temp adjust certain source files for dockerization
RUN cargo build --release

#
# React Build Stage
#

FROM node:alpine AS react

WORKDIR /app

COPY ./frontend2b .

# fix urls
RUN sed -i 's|http://localhost:8080||' src/components/URLs.jsx

RUN npm install 
RUN npm run build

#
# Deploy Stage
#

# FROM debian:bookworm-slim
FROM debian:bookworm-slim

# make sure required packages are installed
# poppler-utils required for pdf parsing 
RUN apt update && apt install sqlite3 poppler-utils -y

WORKDIR /

COPY --from=build /app/target/release/backend-rust /bluebook
COPY --from=react /app/dist /dist

# copy in default config file for top5 api
#COPY ./backend/api/data.json /top5.json

# copy in import mapping files
COPY ./backend-rust/src/config/*.ron /config/

# copy in initial migration scripts (TODO: remove once we are sure we no longer need)
COPY ./backend-rust/scripts/*.sql /migrate/

# copy run and backup scripts
COPY ./scripts /scripts

# copy and extract the initialization files
COPY ./init/init.bin /init/init.tar.gz
RUN tar -zxf /init/init.tar.gz -C /init && rm /init/init.tar.gz

ENV DATABASE_URL=/data/db.db

EXPOSE 8080
ENTRYPOINT ["/scripts/run.sh"]
