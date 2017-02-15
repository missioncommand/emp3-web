#!/bin/bash

set -o errexit

# config
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

# deploy
cd dist/devguide
git init
git add .
git commit -m "Deploy to GitHub Pages"
git push --force --quiet "https://${GITHUB_TOKEN}@$github.com/${GH_PAGES_REPO}.git" master:gh-pages > /dev/null 2>&1
