#!/bin/sh

# unpackage test data
# run tests
mkdir data
tar -zxvf tests.tar.gz --directory data
cd ../
cargo test
