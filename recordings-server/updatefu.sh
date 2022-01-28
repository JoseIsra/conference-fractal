#!/bin/bash

print_usage() {
    printf "Usage: -all for update all the files and -server for update just server.js"
}

case "${1}" in
--all|-all) scp -r ./src/ fup4ms@40.117.182.253:./antmedia/server-webhook/src/ && scp package.json fup4ms@40.117.182.253:./antmedia/server-webhook/package.json && scp .eslintrc.json fup4ms@40.117.182.253:./antmedia/server-webhook/eslintrc.json && scp tsconfig.json fup4ms@40.117.182.253:./antmedia/server-webhook/tsconfig.json && scp .gitignore fup4ms@40.117.182.253:./antmedia/server-webhook/.gitignore && scp .eslintignore fup4ms@40.117.182.253:./antmedia/server-webhook/.eslintignore && scp babel.config.js fup4ms@40.117.182.253:./antmedia/server-webhook/babel.config.js ;; 
--server|-server) scp ./src/server.ts fup4ms@40.117.182.253:./antmedia/server-webhook/server.ts ;;    
*) print_usage
    exit 1 ;;
esac
