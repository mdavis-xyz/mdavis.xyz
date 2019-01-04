set -e
cd ~/Documents/Projects/software/abbott/git/abbottList
echo "starting git.sh"
git commit -a -m "shell script update"
echo "done git commit. About to do git push"
git push origin master -v
echo "ending git.sh"
