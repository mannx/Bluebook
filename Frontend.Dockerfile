FROM node:18.7.0
# FROM node:alpine

RUN apt update && apt install -y nano

WORKDIR /src
# COPY frontend-run.sh /frontend-run.sh

# EXPOSE 9173

# ENTRYPOINT ["/frontend-run.sh"]