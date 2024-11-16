#!/bin/bash

# Remove source maps
find ./build -name "*.map" -type f -delete

# Remove unnecessary files
rm -rf build/static/js/*.txt
rm -rf build/static/css/*.txt

# Clear npm cache
npm cache clean --force

# Remove development files
rm -rf .cache
rm -rf coverage
rm -rf build/static/js/*.chunk.js