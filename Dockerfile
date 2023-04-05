#syntax:docker/dockerfile:1

#
# Go Build Stage
#

FROM golang:alpine AS build

# require gcc for some of the modules
RUN apk add build-base

ENV GOPATH /go/src
WORKDIR /go/src/github.com/mannx/Bluebook

# copy in go.mod and go.sum files
COPY go.* ./

RUN go mod download

# copy source files and directories (need separate COPY for directories?)
COPY backend/ ./
RUN go build -o /bluebook .

#
# React Build Stage
#

FROM node:alpine as react

WORKDIR /app

COPY ./frontend .
RUN npm install 
RUN npm run build


#
# Deploy Stage
#

FROM alpine

# make sure required packages are installed
# poppler-utils required for pdf parsing 
RUN apk update
RUN apk add tzdata poppler-utils sqlite

WORKDIR /

COPY --from=build /bluebook /bluebook
COPY --from=react /app/dist /static

# copy in default config file for top5 api
COPY ./backend/api/data.json /top5.json

# copy run and backup scripts
COPY ./scripts /scripts

EXPOSE 8080

ENTRYPOINT ["/scripts/run.sh"]
