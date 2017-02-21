#!/bin/bash

set -o errexit -o nounset

# Config the git user
git config --global user.name "${GH_PAGES_USER}"

# Clone existing gh-pages to dist
echo "Cloning Existing Repo"
cd dist
rm -rf ghpages
git clone "https://github.com/${GH_PAGES_REPO}.git" ghpages

exit 2

## Remove the old devguide and replace it
echo ""
echo "Updating devguide contents"
rm -rf ghpages/docs/emp/web
cp -a devguide/ ghpages/docs/emp/web

exit 3
# Make the changes in git
echo ""
echo "Applying changes"
cd ghpages
git add -A docs/emp/web
git commit -m "Deploying updated GitHub Pages"

git remote add upstream "https://${GITHUB_API_KEY}@github.com/${GH_PAGES_REPO}.git"

exit 4

# Deploy
echo ""
echo "Pushing changes"
git push -q upstream HEAD:gh-pages

exit 5