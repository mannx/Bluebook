#syntax:docker/dockerfile:1

#
# Go Build Stage
#

FROM golang:1.21-alpine3.17 as Build

ENV GOPATH /go/src
WORKDIR /go/src/github.com/mannx/Bluebook

# need CGO_ENABLED and build-base for sqlite to compile
ENV CGO_ENABLED=1
RUN apk add build-base

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

FROM alpine:3.17

# make sure required packages are installed
# poppler-utils required for pdf parsing 
# python3 required for some python scripts found in /scripts
# bash required for init scripts
RUN apk update
RUN apk add tzdata poppler-utils sqlite python3 bash

WORKDIR /

COPY --from=build /bluebook /bluebook
COPY --from=react /app/dist /static

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json

# copy run and backup scripts
COPY ./scripts /scripts

# copy initialization data and scripts
COPY ./init/init.bin /init/init.bin
COPY ./init/init.sh /scripts

# make sure init script is runnable -- todo: fix before here
RUN chmod +x /scripts/init.sh

EXPOSE 8080
ENTRYPOINT ["/scripts/run.sh"]
