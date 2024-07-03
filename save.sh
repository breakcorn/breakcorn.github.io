#!/bin/bash

set -e

IFS='.' read -r -a array <<< "$(cat version)"
array[2]="$((array[2] + 1))"
version="${array[0]}.${array[1]}.0"
echo version > version

git config --global user.name "breakcorn"
git config --global user.email "breakcorny@gmail.com"

git add .
git status
git commit -m "${version}"
git branch -M main
git push -u origin main
