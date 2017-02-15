#!/bin/bash

set -o errexit

# Config the git user
git config --global user.email "nobody@nobody.org"
git config --global user.name "Travis CI"

# Clone existing gh-pages to dist
cd dist
rm -rf ghpages
git clone "https://github.com/${GH_PAGES_REPO}.git" ghpages

## Remove the old devguide and replace it
rm -rf ghpages/docs/emp/web
cp -a devguide/ ghpages/docs/emp/web

# Make the changes in git
cd ghpages
git add -A docs/emp/web
git commit -m "Deploying updated GitHub Pages"

# Deploy
#git push --quiet "https://${GITHUB_TOKEN}@$github.com/${GH_PAGES_REPO}.git" master:gh-pages > /dev/null 2>&1
