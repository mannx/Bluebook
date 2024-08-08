#!/bin/sh

# this file is used to adjust several of the frontend files before building

# update api  urls
sed -i 's|http://localhost:8080||' src/components/URLs.jsx

