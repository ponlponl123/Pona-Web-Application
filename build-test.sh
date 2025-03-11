#!/bin/bash
if [ -d ./.next/ ]; then
    read -n 1 -p "You would like to remove .next directory? [y/n]:" rm_next_dir
    if [ $rm_next_dir = "y" ]; then
        rm -rf ./.next/
        echo \n
        echo .next directory has been removed!
    fi
    echo \n
fi
read -n 1 -p "You would like to use bun instead of node? [y/n]:" use_bun
if [ $use_bun = "y" ]; then
    npm run build
else
    npm run build
fi

cp -r ./.next/static/ ./.next/standalone/.next/
cp -r ./docs/ ./next/standalone/
cp -r ./public/ ./next/standalone/

echo \nNext.JS has been build successfully!\n
read -n 1 -p "You would like to start standalone server now? [y/n]:" run_next

if [ $run_next = "y" ]; then
    if [ $use_bun = "y" ]; then
        bun ./.next/standalone/server.js -H localhost
    else
        node ./.next/standalone/server.js -H localhost
    fi
fi