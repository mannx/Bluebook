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
RUN apk update
RUN apk add tzdata poppler-utils sqlite python3

WORKDIR /

COPY --from=build /bluebook /bluebook
COPY --from=react /app/dist /static

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json

# copy run and backup scripts
COPY ./scripts /scripts

EXPOSE 8080
ENTRYPOINT ["/scripts/run.sh"]
