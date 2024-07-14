#syntax:docker/dockerfile:1

# docker file to build and test in a docker environment during development

FROM golang:1.21-alpine3.17 

WORKDIR /
# update and install all required base packages
# RUN apk update
# RUN apk add tzdata poppler-utils sqlite python3 bash

RUN apk update
RUN apk add bash build-base

# make sure CGO is enabled
ENV CGO_ENABLED 1

# install go watch
RUN go install github.com/mitranim/gow@latest

COPY backend-run.sh .
RUN chmod +x backend-run.sh

# export required ports
EXPOSE 8080

WORKDIR /src
ENTRYPOINT ["/backend-run.sh"]