#!/bin/bash

set -euo pipefail

log() {
    local status="$1"
    local message="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $status: $message"
}

cleanup() {
    log "INFO" "Starting cleanup"
    if rm -f package-lock.json; then
        log "SUCCESS" "package-lock.json removed"
    else
        log "ERROR" "Failed to remove package-lock.json"
    fi

    if rm -rf node_modules; then
        log "SUCCESS" "node_modules removed"
    else
        log "ERROR" "Failed to remove node_modules"
    fi
}

npm_clean_install_update() {
    log "INFO" "Cleaning npm cache"
    if npm cache clean --force; then
        log "SUCCESS" "npm cache cleaned"
    else
        log "ERROR" "Failed to clean npm cache"
    fi

    log "INFO" "Installing npm packages"
    if npm install --legacy-peer-deps; then
        log "SUCCESS" "npm install successful"
    else
        log "ERROR" "npm install failed"
    fi

    log "INFO" "Updating npm packages"
    if npm update --legacy-peer-deps; then
        log "SUCCESS" "npm update successful"
    else
        log "ERROR" "npm update failed"
    fi
}

main() {
    cleanup
    npm_clean_install_update
}

main "$@"
