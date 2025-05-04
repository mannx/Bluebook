#syntax:docker/dockerfile:1

#
# Caching Stage
#

FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY backend-rust/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY backend-rust/ .
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
FROM debian:bookworm

# make sure required packages are installed
# poppler-utils required for pdf parsing 
# vim added for dev purpose only
RUN apt update && apt install sqlite3 poppler-utils vim -y

WORKDIR /

COPY --from=builder /app/target/release/backend-rust /bluebook
COPY --from=react /app/dist /dist

# copy in default config file for top5 api
# COPY ./backend/api/data.json /top5.json

# copy in import mapping files
COPY ./backend-rust/src/config/*.ron /config/

# copy in initial migration scripts (TODO: remove once we are sure we no longer need)
COPY ./backend-rust/scripts/*.sql /migrate/

# copy run and backup scripts
COPY ./scripts /scripts

# copy and extract the initialization files
# COPY ./init/init.bin /init/init.tar.gz
# RUN tar -zxf /init/init.tar.gz -C /init && rm /init/init.tar.gz

EXPOSE 8080
# ENTRYPOINT ["/bluebook"]
ENTRYPOINT ["/scripts/run.sh"]
