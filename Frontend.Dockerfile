FROM node:18.7.0
# FROM node:alpine

# RUN apt update && apt install -y nano

WORKDIR /src

COPY ./frontend2 .
COPY front-build.sh .