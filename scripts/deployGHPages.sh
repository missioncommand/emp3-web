#!/bin/bash

set -o errexit -o nounset

# Config the git user
git config --global user.name "missioncommandbot"
git config --global user.email "missioncommandbot@missioncommandbot.org"

# Clone existing gh-pages to dist
echo "Cloning Existing Repo"
cd dist
rm -rf ghpages
git clone "https://github.com/missioncommand/missioncommand.github.io.git" ghpages

## Remove the old devguide and replace it
echo ""
echo "Updating devguide contents"
rm -rf ghpages/docs/emp/web
cp -a devguide/ ghpages/docs/emp/web

# Make the changes in git
echo ""
echo "Applying changes"
cd ghpages
git add -A docs/emp/web
git commit -m "Deploying updated GitHub Pages"

git remote add upstream "https://${GH_PAGES_REPO}@github.com/missioncommand/missioncommand.github.io.git"

# Deploy
echo ""
echo "Pushing changes"
git push -q upstream HEAD:gh-pages
