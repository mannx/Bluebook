#syntax:docker/dockerfile:1

#
# Rust Build Stage
#
FROM rust AS build
WORKDIR /app

COPY backend-rust/ ./
RUN cargo build

#
# React Build Stage
#

FROM node:alpine AS react

WORKDIR /app

COPY ./frontend2 .

# fix urls for prod
RUN sed -i 's|http://localhost:8080||' src/components/URLs.jsx

RUN npm install 
RUN npm run build


#
# Deploy Stage
#

# FROM alpine:3.17
#
# # make sure required packages are installed
# # poppler-utils required for pdf parsing 
# RUN apk update
# RUN apk add tzdata poppler-utils sqlite 

FROM debian:bookworm-slim AS runtime

# update and install required deps
RUN apt update && apt install sqlite3 bash -y
WORKDIR /

COPY --from=build /app/target/debug/backend-rust /bluebook
COPY --from=react /app/dist /dist

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json

# copy run and backup scripts
# COPY ./scripts /scripts

# copy and extract the initialization files
# COPY ./init/init.bin /init/init.tar.gz
# RUN tar -zxf /init/init.tar.gz -C /init && rm /init/init.tar.gz

EXPOSE 8080
ENTRYPOINT ["/bluebook"]
# ENTRYPOINT ["/scripts/run.sh"]
