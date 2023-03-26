#!/bin/sh

#
# Script is used to build the docker image for the weather app

args_help() {
	echo "$0 [-t TAG] [-T] [-l]"
	echo "-t TAG	=>	Set the tag to TAG"
	echo "-T		=>	Set the tag to the version number being built"
	echo "-l		=>	Build a local image without namespace, otherwise uses namespace and pushes to repo"
	return
}

echo "Building bluebook..."

# set default paramaters
TAG=dev
LOCAL=0

# read in build flags, determine if we are building a local dev image, or pushing a full image and grab the tag if provided
while getopts "t:lT" opt; do
	case $opt in
		t)
			TAG=$OPTARG
			echo "-t was providing, save tag..."
			;;
		l)
			LOCAL=1
			echo "-l was provided, building local image..."
			;;
		T)
			echo "-T provided, retrieving build tag from go-build.sh ..."
			TAG=$(./go-build.sh -t)
			;;
		\?)
			echo "Invalid option: -$OPTARG"
			#args_help()
			exit 1
			;;
		:)
			echo "Option -$OPTARG requires an argument..."
			#args_help()
			exit 1
			;;
	esac
done

echo "Building docker image with tag: $TAG..."

if [ $LOCAL -eq 1 ]; then
	echo "Building local image..."
	# docker build -t bluebook:$TAG -t bluebook:latest  -f Dockerfile.Vite .
    docker buildx build --platform linux/amd64 -t bluebook:$TAG -t bluebook:latest -f Dockerfile.Vite .
else
	echo "Building repo image..."
	docker buildx build --platform linux/amd64 -t mannx/bluebook:$TAG -t mannx/bluebook:latest . --push
fi

echo "Docker build return with status $?"
