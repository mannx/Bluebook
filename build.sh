#!/bin/sh

Help() {
  echo "Build docker image"
  echo "build.sh [-r|d]"
  echo "options: "
  echo "-r   Release Version tagged 'latest'"
  echo "-d   Development version tagged 'dev'"
  echo
}

TAG="invalid"

while getopts ":rd" option; do
  case $option in
  r) TAG="latest" ;;
  d) TAG="dev" ;;
  \?)
    echo "invalid option"
    Help
    exit
    ;;
  esac
done

if [ "$TAG" = "invalid" ]; then
  echo "build option required"
  Help
  exit
fi

echo "Building container with tag: $TAG..."

docker buildx build -t bluebook:$TAG -f Cache.Dockerfile .
