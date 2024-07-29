#!/bin/sh

# this file is used to adjust several of the frontend files before building

# replace UrlGet body
sed -i 's|return "http://localhost:8080" +|return |' src/components/URLs.jsx