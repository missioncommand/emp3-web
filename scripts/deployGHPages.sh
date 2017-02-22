#!/bin/bash

echo "kiss kiss"
echo '$0 = ' $0
echo 'KEY = ' $GITHUB_API_KEY
echo 'REPO' $GH_PAGES_REPO
echo 'THE_COW_SAYS' $THE_COW_SAYS
echo "bang bang"

set -o errexit -o nounset
#
## Config the git user
#git config --global user.name "missioncommandbot"
#git config --global user.email "missioncommandbot@missioncommandbot.org"
#
## Clone existing gh-pages to dist
#echo "Cloning Existing Repo"
#cd dist
#rm -rf ghpages
#git clone "https://github.com/${GH_PAGES_REPO}.git" ghpages
#
### Remove the old devguide and replace it
#echo ""
#echo "Updating devguide contents"
#rm -rf ghpages/docs/emp/web
#cp -a devguide/ ghpages/docs/emp/web
#
## Make the changes in git
#echo ""
#echo "Applying changes"
#cd ghpages
#git add -A docs/emp/web
#git commit -m "Deploying updated GitHub Pages"
#
#git remote add upstream "https://${GITHUB_API_KEY}@github.com/${GH_PAGES_REPO}.git"
#
## Deploy
#echo ""
#echo "Pushing changes"
#git push -q upstream HEAD:gh-pages

echo "this is where I would commit things, if I had any"
