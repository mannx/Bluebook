#syntax:docker/dockerfile:1

#
# Go Build Stage
#

FROM golang:1.21-alpine3.17 AS build

ENV GOPATH=/go/src
WORKDIR /go/src/github.com/mannx/Bluebook

# need CGO_ENABLED and build-base for sqlite to compile
ENV CGO_ENABLED=1
RUN apk add build-base git

# copy source files and directories (need separate COPY for directories?)
COPY backend/ ./
COPY .git .git

RUN go mod download
RUN go build -o /bluebook -ldflags="-X main.Commit=$(git rev-parse --short HEAD) -X main.Branch=$(git rev-parse --abbrev-ref HEAD)" .

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

FROM alpine:3.17

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

# copy and extract the initialization files
COPY ./init/init.bin /init/init.tar.gz
RUN tar -zxf /init/init.tar.gz -C /init && rm /init/init.tar.gz

EXPOSE 8080
ENTRYPOINT ["/scripts/run.sh"]
