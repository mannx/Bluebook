#!/bin/sh

# unpackage test data
# run tests
mkdir tmp
tar -zxvf tests.tar.gz --directory tmp
cd ../..
cargo test
