#syntax:docker/dockerfile:1

#
# Go Build Stage
#

# FROM golang:alpine AS build
FROM golang:bookworm AS build

# require gcc for some of the modules
# RUN apk add build-base

ENV GOPATH /go/src
WORKDIR /go/src/github.com/mannx/Bluebook

# copy source files and directories (need separate COPY for directories?)
COPY backend/ ./

RUN go mod download
RUN go build -o /bluebook .

#
# React Build Stage
#

FROM node:alpine as react

WORKDIR /app

COPY ./frontend2 .
RUN npm install 
RUN npm run build


#
# Deploy Stage
#

# FROM alpine
FROM debian:bookworm

# make sure required packages are installed
# poppler-utils required for pdf parsing 
# RUN apk update
# RUN apk add tzdata poppler-utils sqlite
RUN apt update
RUN apt install poppler-utils sqlite3

WORKDIR /

COPY --from=build /bluebook /bluebook
COPY --from=react /app/dist /static

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json
COPY ./backend/team-names.json /team-names.json

# copy run and backup scripts
COPY ./scripts /scripts

EXPOSE 8080

ENTRYPOINT ["/scripts/run.sh"]
