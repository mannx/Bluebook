# Docker file to build the backend during development

FROM rust

# RUN apt update && apt install bash

WORKDIR /src

COPY . .

RUN cargo build

EXPOSE 8080
ENTRYPOINT ["/src/target/debug/backend-rust"]
