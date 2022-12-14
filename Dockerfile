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
COPY *.go ./

COPY ./api ./api
COPY ./environ ./environ
COPY ./import ./import
COPY ./models ./models

COPY go-build.sh .

RUN ./go-build.sh

#
# React Build Stage
#

FROM node:alpine as react

WORKDIR /app
ENV NODE_ENV=production

COPY ["./frontend/package.json", "./frontend/package-lock.json", "./"]

RUN npm install --production

COPY ./frontend .

RUN npm run build


#
# Deploy Stage
#

FROM alpine

# make sure required packages are installed
# poppler-utils required for pdf parsing 
RUN apk update
RUN apk add tzdata poppler-utils

WORKDIR /

COPY --from=build /bluebook /bluebook
COPY --from=react /app/build /static

# copy in default config file for top5 api
COPY ./api/data.json /top5.json

# copy run and backup scripts
COPY ./run.sh /run.sh
COPY ./backup.sh /backup.sh

EXPOSE 8080

ENTRYPOINT ["/run.sh"]
