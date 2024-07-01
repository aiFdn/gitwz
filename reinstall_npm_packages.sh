#!/bin/bash

rm -f package-lock.json && echo "package-lock.json removed" || echo "Failed to remove package-lock.json"

rm -rf node_modules && echo "node_modules removed" || echo "Failed to remove node_modules"

npm cache clean --force && echo "npm cache cleaned" || echo "Failed to clean npm cache"

npm install --legacy-peer-deps && echo "npm install successful" || echo "npm install failed"

npm update --legacy-peer-deps && echo "npm update successful" || echo "npm update failed"
