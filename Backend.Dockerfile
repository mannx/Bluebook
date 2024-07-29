#syntax:docker/dockerfile:1

# docker file to build and test in a docker environment during development

FROM golang:1.21-alpine3.17 

RUN apk update
RUN apk add bash build-base

# make sure CGO is enabled
ENV CGO_ENABLED=1


# setup default dev environment variables
ENV BLUEBOOK_IMPORT_PATH=./data/downloads
ENV BLUEBOOK_OUTPUT_PATH=./data/downloads
ENV BLUEBOOK_DATA_PATH=./data
ENV BLUEBOOK_LOG_LEVEL=Debug
ENV BLUEBOOK_IGNORE=True
ENV BLUEBOOK_SCRIPTS_PATH=./scripts
ENV BLUEBOOK_BACKUP_PATH=./data/downloads

# export required ports
EXPOSE 8080

# install go watch
RUN go install github.com/mitranim/gow@latest

WORKDIR /src
# ENTRYPOINT ["backend-run.sh"]
ENTRYPOINT ["gow","run", "."]