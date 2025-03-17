#syntax:docker/dockerfile:1

#
# Rust Build Stage
#
FROM rust:alpine AS build
WORKDIR /app

COPY backend-rust/ ./

# add missing deps
RUN apk add --no-cache musl-dev sqlite

# temp adjust certain source files for dockerization
RUN sed -i 's|src/imports||' src/imports/daily.rs
RUN sed -i 's|src/api||' src/api/export.rs
RUN cargo build --release

#
# React Build Stage
#

FROM node:alpine AS react

WORKDIR /app

COPY ./frontend2 .

# fix urls
RUN sed -i 's|http://localhost:8080||' src/components/URLs.jsx

RUN npm install 
RUN npm run build

#
# Deploy Stage
#

# FROM alpine:3.17
# FROM debian:bookworm-slim
FROM alpine:latest

# make sure required packages are installed
# poppler-utils required for pdf parsing 
RUN apk update
RUN apk add tzdata poppler-utils sqlite 
# RUN apt update && apt install sqlite3 -y

# FROM debian:bookworm-slim AS runtime
#
# # update and install required deps
# RUN apt update && apt install sqlite3 bash -y
WORKDIR /

COPY --from=build /app/target/release/backend-rust /bluebook
COPY --from=react /app/dist /dist

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json

# copy in import mapping files
COPY ./backend-rust/src/imports/id.ron /id.ron

# copy run and backup scripts
# COPY ./scripts /scripts

# copy and extract the initialization files
# COPY ./init/init.bin /init/init.tar.gz
# RUN tar -zxf /init/init.tar.gz -C /init && rm /init/init.tar.gz

EXPOSE 8080
ENTRYPOINT ["/bluebook"]
# ENTRYPOINT ["/scripts/run.sh"]
